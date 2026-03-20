'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { prisma, type Prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { generateInvoiceNumber } from './internal';
import { ROUTES } from '@/lib/routes';
import { domainEvents } from '@/lib/events/emitter';

/** Generate a cryptographically secure access token */
function generateAccessToken(): string {
  return randomBytes(32).toString('hex');
}

export interface RecurringSettingsInput {
  enabled: boolean;
  frequency: string; // weekly, biweekly, monthly, quarterly, yearly
  startDate: string; // ISO date string
  endDate: string | null; // ISO date string or null
  autoSend: boolean;
}

const VALID_INTERVALS = ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'];

/**
 * Calculate the next recurring date from a given date and interval.
 */
function calculateNextDate(fromDate: Date, interval: string): Date {
  const next = new Date(fromDate);
  switch (interval) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
}

/**
 * Calculate payment term days from the difference between issue and due dates of a parent invoice.
 */
function getPaymentTermDays(issueDate: Date, dueDate: Date): number {
  const diff = dueDate.getTime() - issueDate.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 30;
}

/**
 * Update recurring settings for an invoice.
 * Saves the recurring configuration to the invoice record in the database.
 */
export async function updateRecurringSettings(
  invoiceId: string,
  settings: RecurringSettingsInput
): Promise<{ success: boolean; error?: string }> {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions' };
  }

  if (!invoiceId || typeof invoiceId !== 'string') {
    return { success: false, error: 'Invoice ID is required' };
  }

  // Validate interval
  if (settings.enabled && !VALID_INTERVALS.includes(settings.frequency)) {
    return { success: false, error: `Invalid frequency. Must be one of: ${VALID_INTERVALS.join(', ')}` };
  }

  // Find the invoice and verify ownership
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, workspaceId, deletedAt: null },
  });

  if (!invoice) {
    return { success: false, error: 'Invoice not found' };
  }

  // Calculate next recurring date
  let nextRecurringDate: Date | null = null;
  if (settings.enabled) {
    const startDate = new Date(settings.startDate);
    const now = new Date();
    // If start date is in the future, use it. Otherwise calculate the next one from now.
    if (startDate > now) {
      nextRecurringDate = startDate;
    } else {
      nextRecurringDate = calculateNextDate(now, settings.frequency);
    }

    // If there's an end date and nextRecurringDate exceeds it, don't set it
    if (settings.endDate) {
      const endDate = new Date(settings.endDate);
      if (nextRecurringDate > endDate) {
        nextRecurringDate = null;
      }
    }
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      isRecurring: settings.enabled,
      recurringInterval: settings.enabled ? settings.frequency : null,
      recurringStartDate: settings.enabled ? new Date(settings.startDate) : null,
      recurringEndDate: settings.enabled && settings.endDate ? new Date(settings.endDate) : null,
      recurringAutoSend: settings.enabled ? settings.autoSend : false,
      nextRecurringDate,
    },
  });

  revalidatePath(ROUTES.invoices);
  revalidatePath(`/invoices/${invoiceId}`);

  return { success: true };
}

/**
 * Get recurring settings for an invoice.
 */
export async function getRecurringSettings(
  invoiceId: string
): Promise<{
  enabled: boolean;
  frequency: string;
  startDate: string;
  endDate: string | null;
  noEndDate: boolean;
  autoSend: boolean;
  nextRecurringDate: string | null;
} | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, workspaceId, deletedAt: null },
    select: {
      isRecurring: true,
      recurringInterval: true,
      recurringStartDate: true,
      recurringEndDate: true,
      recurringAutoSend: true,
      nextRecurringDate: true,
    },
  });

  if (!invoice) {
    return null;
  }

  return {
    enabled: invoice.isRecurring,
    frequency: invoice.recurringInterval || 'monthly',
    startDate: invoice.recurringStartDate?.toISOString() || new Date().toISOString(),
    endDate: invoice.recurringEndDate?.toISOString() || null,
    noEndDate: !invoice.recurringEndDate,
    autoSend: invoice.recurringAutoSend,
    nextRecurringDate: invoice.nextRecurringDate?.toISOString() || null,
  };
}

/**
 * Generate a new invoice from a recurring parent invoice.
 * Copies the parent's line items, client, project, currency, notes, terms.
 * Sets issue date to today, calculates due date from parent's payment terms.
 */
export async function generateRecurringInvoice(
  parentInvoiceId: string
): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
  const parent = await prisma.invoice.findFirst({
    where: {
      id: parentInvoiceId,
      isRecurring: true,
      deletedAt: null,
    },
    include: {
      lineItems: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!parent) {
    return { success: false, error: 'Parent recurring invoice not found' };
  }

  // Check if end date has passed
  if (parent.recurringEndDate && new Date() > parent.recurringEndDate) {
    // Disable recurring — end date passed
    await prisma.invoice.update({
      where: { id: parentInvoiceId },
      data: { isRecurring: false, nextRecurringDate: null },
    });
    return { success: false, error: 'Recurring end date has passed' };
  }

  const invoiceNumber = await generateInvoiceNumber(parent.workspaceId);

  // Calculate due date based on the parent's issue-to-due gap
  const paymentTermDays = getPaymentTermDays(parent.issueDate, parent.dueDate);
  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + paymentTermDays);

  const status = parent.recurringAutoSend ? 'sent' : 'draft';

  const newInvoice = await prisma.$transaction(async (tx) => {
    const created = await tx.invoice.create({
      data: {
        workspaceId: parent.workspaceId,
        clientId: parent.clientId,
        projectId: parent.projectId,
        parentInvoiceId: parent.id,
        invoiceNumber,
        title: parent.title || 'Invoice',
        status,
        currency: parent.currency,
        accessToken: generateAccessToken(),
        issueDate,
        dueDate,
        subtotal: parent.subtotal,
        discountType: parent.discountType,
        discountValue: parent.discountValue,
        discountAmount: parent.discountAmount,
        taxTotal: parent.taxTotal,
        total: parent.total,
        amountDue: parent.total,
        amountPaid: 0,
        notes: parent.notes,
        terms: parent.terms,
        settings: parent.settings as Prisma.InputJsonValue,
        sentAt: parent.recurringAutoSend ? new Date() : null,
        lineItems: {
          create: parent.lineItems.map((item, idx) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            sortOrder: idx,
          })),
        },
      },
      select: { id: true },
    });

    // Log event on the new invoice
    await tx.invoiceEvent.create({
      data: {
        invoiceId: created.id,
        eventType: 'created',
        actorType: 'system',
        metadata: {
          trigger: 'recurring',
          parentInvoiceId: parent.id,
        },
      },
    });

    if (parent.recurringAutoSend) {
      await tx.invoiceEvent.create({
        data: {
          invoiceId: created.id,
          eventType: 'sent',
          actorType: 'system',
          metadata: { trigger: 'recurring_auto_send' },
        },
      });
    }

    // Update parent's nextRecurringDate
    const interval = parent.recurringInterval || 'monthly';
    const nextDate = calculateNextDate(new Date(), interval);

    // Check if next date exceeds end date
    let newNextDate: Date | null = nextDate;
    if (parent.recurringEndDate && nextDate > parent.recurringEndDate) {
      newNextDate = null;
      // Also disable recurring since we've passed the end date
      await tx.invoice.update({
        where: { id: parent.id },
        data: { nextRecurringDate: null, isRecurring: false },
      });
    } else {
      await tx.invoice.update({
        where: { id: parent.id },
        data: { nextRecurringDate: newNextDate },
      });
    }

    return created;
  });

  try {
    domainEvents.emit({
      type: 'invoice.created',
      payload: { invoiceId: newInvoice.id, workspaceId: parent.workspaceId },
    });
  } catch {
    // Domain event emission is best-effort
  }

  return { success: true, invoiceId: newInvoice.id };
}

/**
 * Get all invoices where nextRecurringDate <= today.
 * Used by the cron job to find invoices that need new instances generated.
 */
export async function getUpcomingRecurringInvoices(): Promise<
  Array<{ id: string; workspaceId: string; invoiceNumber: string }>
> {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Include all of today

  const invoices = await prisma.invoice.findMany({
    where: {
      isRecurring: true,
      nextRecurringDate: { lte: today },
      deletedAt: null,
    },
    select: {
      id: true,
      workspaceId: true,
      invoiceNumber: true,
    },
  });

  return invoices;
}

/**
 * Get IDs of all recurring invoices in a workspace.
 * Used by the invoice list to show recurring badges.
 */
export async function getRecurringInvoiceIds(workspaceId: string): Promise<string[]> {
  const invoices = await prisma.invoice.findMany({
    where: {
      workspaceId,
      isRecurring: true,
      deletedAt: null,
    },
    select: { id: true },
  });
  return invoices.map((i) => i.id);
}
