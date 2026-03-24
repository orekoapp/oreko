'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { prisma, type Prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import type {
  InvoiceDocument,
  InvoiceListItem,
  InvoiceStatus,
  CreateInvoiceData,
  UpdateInvoiceData,
} from './types';
import { sendTemplatedEmail } from '@/lib/email/actions';
import { createNotification } from '@/lib/notifications/internal';
import { logger } from '@/lib/logger';
import { formatCurrency, toNumber, getBaseUrl } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { generateInvoiceNumber } from './internal';
import { domainEvents } from '@/lib/events/emitter';

/** Generate a cryptographically secure access token (64 hex chars = 256 bits) */
function generateAccessToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Get the current user's active workspace with full workspace data
 */
async function getActiveWorkspace() {
  const { workspaceId, userId } = await getCurrentUserWorkspace();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  return {
    userId,
    workspace,
  };
}

/**
 * Calculate totals from line items, applying discount before tax total
 */
function calculateTotals(
  lineItems: Array<{ quantity: number; rate: number; taxRate?: number }>,
  discount?: { type?: 'percentage' | 'fixed' | null; value?: number | null }
) {
  let subtotal = 0;
  let taxTotal = 0;

  for (const item of lineItems) {
    const amount = item.quantity * item.rate;
    subtotal += amount;
    if (item.taxRate) {
      taxTotal += amount * (item.taxRate / 100);
    }
  }

  subtotal = Math.round(subtotal * 100) / 100;
  taxTotal = Math.round(taxTotal * 100) / 100;

  // Calculate discount amount
  let discountAmount = 0;
  if (discount?.type && discount.value != null && discount.value > 0) {
    if (discount.type === 'percentage') {
      discountAmount = subtotal * (discount.value / 100);
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
    }
  }

  // Clamp: discount cannot exceed subtotal (prevents negative total before tax)
  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    subtotal,
    taxTotal,
    discountAmount,
    total: Math.round((subtotal + taxTotal - discountAmount) * 100) / 100,
  };
}

/**
 * Create a new invoice
 */
// Low #57: Both calls are cached via React.cache() — no actual redundant DB query
export async function createInvoice(data: CreateInvoiceData) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  // Bug #456: RBAC — viewers cannot create invoices
  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot create invoices' };
  }

  // MEDIUM #13: Basic input validation
  if (!data.clientId || typeof data.clientId !== 'string') {
    return { success: false, error: 'Client is required' };
  }
  if (!data.lineItems || !Array.isArray(data.lineItems) || data.lineItems.length === 0) {
    return { success: false, error: 'At least one line item is required' };
  }

  // Verify client belongs to workspace
  const client = await prisma.client.findFirst({
    where: { id: data.clientId, workspaceId: workspace.id, deletedAt: null },
  });
  if (!client) {
    return { success: false, error: 'Client not found' };
  }

  // Use custom invoice number if provided, otherwise auto-generate
  let invoiceNumber: string;
  if (data.invoiceNumber) {
    // Check uniqueness
    const existing = await prisma.invoice.findFirst({
      where: { workspaceId: workspace.id, invoiceNumber: data.invoiceNumber },
    });
    if (existing) {
      return { success: false, error: 'Invoice number already exists' };
    }
    invoiceNumber = data.invoiceNumber;
  } else {
    invoiceNumber = await generateInvoiceNumber(workspace.id);
  }

  // Determine currency: use provided value, or fall back to workspace BusinessProfile, then 'USD'
  let currency = data.currency || 'USD';
  if (!data.currency) {
    const profile = await prisma.businessProfile.findUnique({
      where: { workspaceId: workspace.id },
      select: { currency: true },
    });
    currency = profile?.currency || 'USD';
  }

  // Validate line item values
  for (const item of data.lineItems) {
    if (item.rate < 0) {
      return { success: false, error: 'Line item rate cannot be negative' };
    }
    if (item.quantity < 0) {
      return { success: false, error: 'Line item quantity cannot be negative' };
    }
  }

  // Bug #17: Validate discount values before calculating totals
  if (data.discountType === 'percentage' && data.discountValue != null) {
    if (data.discountValue < 0 || data.discountValue > 100) {
      return { success: false, error: 'Discount percentage must be between 0 and 100' };
    }
  }
  if (data.discountType === 'fixed' && data.discountValue != null) {
    if (data.discountValue < 0) {
      return { success: false, error: 'Discount amount cannot be negative' };
    }
    // Cap fixed discount at subtotal (calculateTotals also clamps, but reject early for clarity)
    const preliminarySubtotal = data.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    if (data.discountValue > preliminarySubtotal) {
      data.discountValue = preliminarySubtotal;
    }
  }

  const { subtotal, taxTotal, discountAmount, total } = calculateTotals(
    data.lineItems,
    { type: data.discountType, value: data.discountValue }
  );

  const lineItems = data.lineItems.map((item, index) => ({
    name: item.name,
    description: item.description || null,
    quantity: Math.round(item.quantity * 100) / 100,
    rate: item.rate,
    amount: Math.round(item.quantity * item.rate * 100) / 100,
    taxRate: item.taxRate || null,
    taxAmount: item.taxRate
      ? Math.round(item.quantity * item.rate * (item.taxRate / 100) * 100) / 100
      : 0,
    sortOrder: index,
  }));

  const invoice = await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      clientId: data.clientId,
      projectId: data.projectId || null,
      invoiceNumber,
      title: data.title,
      status: data.isDraft !== false ? 'draft' : 'sent',
      currency,
      accessToken: generateAccessToken(),
      issueDate: new Date(),
      dueDate: new Date(data.dueDate),
      subtotal,
      discountType: data.discountType || null,
      discountValue: data.discountValue ?? null,
      discountAmount,
      taxTotal,
      total,
      amountDue: total,
      notes: data.notes || null,
      terms: data.terms || null,
      internalNotes: data.internalNotes || null,
      settings: {} as unknown as Prisma.InputJsonValue,
      lineItems: {
        create: lineItems,
      },
    },
    include: {
      lineItems: true,
      client: true,
      project: true,
    },
  });

  // H01 fix: Create activity event on invoice creation
  await prisma.invoiceEvent.create({
    data: {
      invoiceId: invoice.id,
      eventType: 'created',
      actorId: userId,
      actorType: 'user',
      metadata: {},
    },
  });

  revalidatePath(ROUTES.invoices);

  try {
    domainEvents.emit({ type: 'invoice.created', payload: { invoiceId: invoice.id, workspaceId: workspace.id } });
  } catch {}

  return {
    success: true,
    invoice: {
      ...invoice,
      subtotal: toNumber(invoice.subtotal),
      discountValue: invoice.discountValue ? Number(invoice.discountValue) : null,
      discountAmount: toNumber(invoice.discountAmount),
      taxTotal: toNumber(invoice.taxTotal),
      total: toNumber(invoice.total),
      amountPaid: toNumber(invoice.amountPaid),
      amountDue: toNumber(invoice.amountDue),
      lineItems: invoice.lineItems.map((li) => ({
        ...li,
        quantity: toNumber(li.quantity),
        rate: toNumber(li.rate),
        amount: toNumber(li.amount),
        taxRate: li.taxRate ? Number(li.taxRate) : null,
        taxAmount: toNumber(li.taxAmount),
      })),
    },
  };
}

/**
 * Create invoice from an accepted quote
 */
export async function createInvoiceFromQuote(quoteId: string, options?: { dueDays?: number }) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  // Bug #456: RBAC — viewers cannot convert quotes to invoices
  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot create invoices' };
  }

  // Get the quote with line items
  const quote = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
      client: true,
    },
  });

  if (!quote) {
    return { success: false, error: 'Quote not found' };
  }

  // Bug #123: Validate discount values from source quote
  const discountValue = toNumber(quote.discountValue) || 0;
  let discountAmount = toNumber(quote.discountAmount) || 0;
  const subtotal = toNumber(quote.subtotal);

  // Bug #13: Recalculate discount during quote-to-invoice conversion
  // Recalculate subtotal from actual line items to ensure discount doesn't exceed it
  const lineItemSubtotal = quote.lineItems.reduce(
    (sum, item) => sum + toNumber(item.amount),
    0
  );

  if (quote.discountType === 'percentage') {
    if (discountValue < 0 || discountValue > 100) {
      return { success: false, error: 'Discount percentage must be between 0 and 100' };
    }
    // Recalculate percentage-based discount amount from actual line item subtotal
    discountAmount = Math.round(lineItemSubtotal * (discountValue / 100) * 100) / 100;
  } else {
    // For fixed amount discounts, cap at the actual subtotal
    if (discountAmount < 0) {
      return { success: false, error: 'Discount amount cannot be negative' };
    }
    if (discountAmount > lineItemSubtotal) {
      discountAmount = lineItemSubtotal;
    }
  }

  // Calculate due date (configurable, default: 30 days from now)
  const dueDays = options?.dueDays ?? 30;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueDays);

  let invoice;
  try {
  invoice = await prisma.$transaction(async (tx) => {
    // Bug #7: Check for existing invoice INSIDE transaction to prevent race condition
    const existingInvoice = await tx.invoice.findFirst({
      where: { quoteId: quote.id },
    });

    if (existingInvoice) {
      throw new Error('DUPLICATE_INVOICE');
    }

    const invoiceNumber = await generateInvoiceNumber(workspace.id);

    // Create the invoice
    const newInvoice = await tx.invoice.create({
      data: {
        workspaceId: workspace.id,
        clientId: quote.clientId,
        projectId: quote.projectId,
        quoteId: quote.id,
        invoiceNumber,
        title: quote.title || 'Invoice',
        status: 'draft',
        currency: quote.currency,
        issueDate: new Date(),
        dueDate,
        subtotal: lineItemSubtotal,
        discountType: quote.discountType,
        discountValue: quote.discountValue,
        discountAmount: discountAmount,
        taxTotal: quote.taxTotal,
        total: lineItemSubtotal - discountAmount + toNumber(quote.taxTotal),
        amountDue: lineItemSubtotal - discountAmount + toNumber(quote.taxTotal),
        notes: quote.notes,
        terms: quote.terms,
        settings: {} as unknown as Prisma.InputJsonValue,
        lineItems: {
          create: quote.lineItems.map((item: (typeof quote.lineItems)[number]) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            sortOrder: item.sortOrder,
          })),
        },
      },
      include: {
        lineItems: true,
        client: true,
        project: true,
      },
    });

    // Update quote status to converted
    await tx.quote.update({
      where: { id: quote.id },
      data: { status: 'converted' },
    });

    // Log the conversion event on the quote
    await tx.quoteEvent.create({
      data: {
        quoteId: quote.id,
        eventType: 'converted_to_invoice',
        actorId: userId,
        actorType: 'user',
        metadata: { invoiceId: newInvoice.id },
      },
    });

    // H01 fix: Create activity event on the new invoice
    await tx.invoiceEvent.create({
      data: {
        invoiceId: newInvoice.id,
        eventType: 'created',
        actorId: userId,
        actorType: 'user',
        metadata: { fromQuoteId: quote.id },
      },
    });

    return newInvoice;
  });
  } catch (err) {
    if (err instanceof Error && err.message === 'DUPLICATE_INVOICE') {
      return { success: false, error: 'Invoice already exists for this quote' };
    }
    throw err;
  }

  revalidatePath(ROUTES.invoices);
  revalidatePath(ROUTES.quotes);
  revalidatePath(ROUTES.quoteDetail(quoteId));

  try {
    domainEvents.emit({ type: 'invoice.created', payload: { invoiceId: invoice.id, workspaceId: workspace.id } });
  } catch {}

  return {
    success: true,
    invoice: {
      ...invoice,
      subtotal: toNumber(invoice.subtotal),
      discountValue: invoice.discountValue ? Number(invoice.discountValue) : null,
      discountAmount: toNumber(invoice.discountAmount),
      taxTotal: toNumber(invoice.taxTotal),
      total: toNumber(invoice.total),
      amountPaid: toNumber(invoice.amountPaid),
      amountDue: toNumber(invoice.amountDue),
      lineItems: invoice.lineItems.map((li) => ({
        ...li,
        quantity: toNumber(li.quantity),
        rate: toNumber(li.rate),
        amount: toNumber(li.amount),
        taxRate: li.taxRate ? Number(li.taxRate) : null,
        taxAmount: toNumber(li.taxAmount),
      })),
    },
  };
}


/**
 * Update an existing invoice
 */
export async function updateInvoice(invoiceId: string, data: UpdateInvoiceData) {
  const { workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  // Bug #456: RBAC — viewers cannot update invoices
  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot edit invoices' };
  }

  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: { lineItems: true },
  });

  if (!existingInvoice) {
    return { success: false, error: 'Invoice not found' };
  }

  // Can only update draft invoices
  if (existingInvoice.status !== 'draft') {
    return { success: false, error: 'Can only edit draft invoices' };
  }

  let subtotal = toNumber(existingInvoice.subtotal);
  let taxTotal = toNumber(existingInvoice.taxTotal);
  let discountAmount = toNumber(existingInvoice.discountAmount);
  let total = toNumber(existingInvoice.total);

  // Resolve discount: use provided values, fall back to existing invoice values
  const discountType = data.discountType !== undefined
    ? data.discountType
    : (existingInvoice.discountType as 'percentage' | 'fixed' | null);
  const discountValue = data.discountValue !== undefined
    ? data.discountValue
    : (existingInvoice.discountValue ? Number(existingInvoice.discountValue) : null);

  if (data.lineItems) {
    for (const item of data.lineItems) {
      if (item.rate < 0) {
        return { success: false, error: 'Line item rate cannot be negative' };
      }
      if (item.quantity < 0) {
        return { success: false, error: 'Line item quantity cannot be negative' };
      }
    }
    const totals = calculateTotals(data.lineItems, { type: discountType, value: discountValue });
    subtotal = totals.subtotal;
    taxTotal = totals.taxTotal;
    discountAmount = totals.discountAmount;
    total = totals.total;
  } else if (data.discountType !== undefined || data.discountValue !== undefined) {
    // Line items didn't change but discount did — recalculate with existing line items
    const existingItems = existingInvoice.lineItems.map((li) => ({
      quantity: toNumber(li.quantity),
      rate: toNumber(li.rate),
      taxRate: li.taxRate ? Number(li.taxRate) : undefined,
    }));
    const totals = calculateTotals(existingItems, { type: discountType, value: discountValue });
    subtotal = totals.subtotal;
    taxTotal = totals.taxTotal;
    discountAmount = totals.discountAmount;
    total = totals.total;
  }

  const invoice = await prisma.$transaction(async (tx) => {
    // Delete existing line items if updating
    if (data.lineItems) {
      await tx.invoiceLineItem.deleteMany({
        where: { invoiceId },
      });
    }

    return tx.invoice.update({
      where: { id: invoiceId },
      data: {
        projectId: data.projectId !== undefined ? data.projectId : undefined,
        title: data.title,
        currency: data.currency,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        notes: data.notes,
        terms: data.terms,
        internalNotes: data.internalNotes,
        // Always persist discount fields if they changed
        ...(data.discountType !== undefined && { discountType: data.discountType || null }),
        ...(data.discountValue !== undefined && { discountValue: data.discountValue ?? null }),
        ...((data.lineItems || data.discountType !== undefined || data.discountValue !== undefined) && {
          subtotal,
          discountAmount,
          taxTotal,
          total,
          amountDue: Math.max(0, total - toNumber(existingInvoice.amountPaid)),
        }),
        ...(data.lineItems && {
          lineItems: {
            create: data.lineItems.map((item, index) => ({
              name: item.name,
              description: item.description || null,
              quantity: item.quantity,
              rate: item.rate,
              amount: Math.round(item.quantity * item.rate * 100) / 100,
              taxRate: item.taxRate || null,
              taxAmount: item.taxRate
                ? Math.round(item.quantity * item.rate * (item.taxRate / 100) * 100) / 100
                : 0,
              sortOrder: index,
            })),
          },
        }),
      },
      include: {
        lineItems: true,
        client: true,
      },
    });
  });

  revalidatePath(ROUTES.invoices);
  revalidatePath(ROUTES.invoiceDetail(invoiceId));

  return { success: true, invoice };
}

/**
 * Get a single invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceDocument | null> {
  const { workspace } = await getActiveWorkspace();

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
      client: true,
      project: true,
      payments: true,
    },
  });

  if (!invoice) {
    return null;
  }

  const settings = invoice.settings as Record<string, unknown>;

  return {
    id: invoice.id,
    workspaceId: invoice.workspaceId,
    clientId: invoice.clientId,
    projectId: invoice.projectId,
    quoteId: invoice.quoteId,
    invoiceNumber: invoice.invoiceNumber,
    accessToken: invoice.accessToken,
    status: invoice.status as InvoiceStatus,
    title: invoice.title || 'Invoice',
    currency: invoice.currency,
    issueDate: invoice.issueDate.toISOString().split('T')[0] ?? '',
    dueDate: invoice.dueDate.toISOString().split('T')[0] ?? '',
    lineItems: invoice.lineItems.map((item: (typeof invoice.lineItems)[number]) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: toNumber(item.quantity),
      rate: toNumber(item.rate),
      amount: toNumber(item.amount),
      taxRate: item.taxRate ? Number(item.taxRate) : null,
      taxAmount: toNumber(item.taxAmount),
      sortOrder: item.sortOrder,
    })),
    settings: {
      currency: (settings.currency as string) ?? 'USD',
      showLineItemPrices: (settings.showLineItemPrices as boolean) ?? true,
      paymentTerms: (settings.paymentTerms as string) ?? 'net30',
      lateFeeEnabled: (settings.lateFeeEnabled as boolean) ?? false,
      lateFeeType: (settings.lateFeeType as 'percentage' | 'fixed') ?? 'percentage',
      lateFeeValue: (settings.lateFeeValue as number) ?? 0,
      reminderEnabled: (settings.reminderEnabled as boolean) ?? true,
      reminderDays: (settings.reminderDays as number[]) ?? [7, 3, 1],
    },
    totals: {
      subtotal: toNumber(invoice.subtotal),
      discountType: invoice.discountType as 'percentage' | 'fixed' | null,
      discountValue: invoice.discountValue ? Number(invoice.discountValue) : null,
      discountAmount: toNumber(invoice.discountAmount),
      taxTotal: toNumber(invoice.taxTotal),
      total: toNumber(invoice.total),
      amountPaid: toNumber(invoice.amountPaid),
      amountDue: toNumber(invoice.amountDue),
    },
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    internalNotes: invoice.internalNotes || '',
    client: invoice.client
      ? {
          id: invoice.client.id,
          name: invoice.client.name,
          email: invoice.client.email,
          company: invoice.client.company,
        }
      : null,
  };
}

/**
 * Get all invoices for the current workspace
 */
export async function getInvoices(filters?: {
  status?: InvoiceStatus;
  clientId?: string;
  search?: string;
}): Promise<InvoiceListItem[]> {
  const { workspace } = await getActiveWorkspace();

  const where: Prisma.InvoiceWhereInput = {
    workspaceId: workspace.id,
    deletedAt: null,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.clientId && { clientId: filters.clientId }),
    ...(filters?.search && {
      OR: [
        { invoiceNumber: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { client: { name: { contains: filters.search, mode: 'insensitive' } } },
      ],
    }),
  };

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
        },
      },
    },
  });

  const now = new Date();

  return invoices.map((invoice) => {
    const dueDate = new Date(invoice.dueDate);
    const isOverdue =
      invoice.status !== 'paid' &&
      invoice.status !== 'voided' &&
      invoice.status !== 'draft' &&
      dueDate < now;

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      // Bug #176: Partially-paid overdue invoices should also show as overdue
      status: (isOverdue ? 'overdue' : invoice.status) as InvoiceStatus,
      title: invoice.title || 'Invoice',
      currency: invoice.currency,
      issueDate: invoice.issueDate.toISOString().split('T')[0] ?? '',
      dueDate: invoice.dueDate.toISOString().split('T')[0] ?? '',
      total: toNumber(invoice.total),
      amountPaid: toNumber(invoice.amountPaid),
      amountDue: toNumber(invoice.amountDue),
      accessToken: invoice.accessToken ?? null,
      client: {
        id: invoice.client?.id ?? '',
        name: invoice.client?.name ?? 'Unknown Client',
        email: invoice.client?.email ?? null,
        company: invoice.client?.company ?? null,
      },
      isOverdue,
      isRecurring: invoice.isRecurring,
    };
  });
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceStatus
) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  // Bug #456: RBAC — viewers cannot change invoice status
  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot change invoice status' };
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
  });

  if (!invoice) {
    return { success: false, error: 'Invoice not found' };
  }

  // Validate status transitions
  const allowedTransitions: Record<string, string[]> = {
    draft: ['sent', 'voided'],
    sent: ['viewed', 'paid', 'partial', 'voided'],
    viewed: ['paid', 'partial', 'voided'],
    partial: ['paid', 'voided'],
    paid: ['voided'],
    overdue: ['paid', 'partial', 'voided'],
    voided: [],
  };

  const allowed = allowedTransitions[invoice.status];
  if (allowed && !allowed.includes(status)) {
    return {
      success: false,
      error: `Cannot transition from '${invoice.status}' to '${status}'`,
    };
  }

  // Enforce payment constraints for payment-related statuses
  const amountPaid = toNumber(invoice.amountPaid);
  const total = toNumber(invoice.total);
  if (status === 'paid' && amountPaid < total) {
    return {
      success: false,
      error: `Cannot mark as paid: amount paid ($${amountPaid.toFixed(2)}) is less than total ($${total.toFixed(2)})`,
    };
  }
  if (status === 'partial' && (amountPaid <= 0 || amountPaid >= total)) {
    return {
      success: false,
      error: 'Cannot mark as partial: amount paid must be between $0 and the total',
    };
  }

  const updateData: Prisma.InvoiceUpdateInput = {
    status,
  };

  // Set timestamps based on status
  if (status === 'sent' && !invoice.sentAt) {
    updateData.sentAt = new Date();
  } else if (status === 'paid' || status === 'partial') {
    if (!invoice.paidAt) updateData.paidAt = new Date();
    if (status === 'paid') {
      // Bug #16: Only override amountPaid if it doesn't already match total
      // This preserves the payment ledger when payments were recorded incrementally
      if (Math.abs(amountPaid - total) > 0.01) {
        updateData.amountPaid = invoice.total;
      }
      updateData.amountDue = 0;
    }
  } else if (status === 'voided') {
    updateData.voidedAt = new Date();
    updateData.amountDue = 0;
  }

  await prisma.$transaction([
    prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
    }),
    prisma.invoiceEvent.create({
      data: {
        invoiceId,
        eventType: `status_changed_to_${status}`,
        actorId: userId,
        actorType: 'user',
        metadata: { previousStatus: invoice.status },
      },
    }),
  ]);

  revalidatePath(ROUTES.invoices);
  revalidatePath(ROUTES.invoiceDetail(invoiceId));

  try {
    if (status === 'paid') {
      domainEvents.emit({ type: 'invoice.paid', payload: { invoiceId, amount: toNumber(invoice.total) } });
    } else if (status === 'voided') {
      domainEvents.emit({ type: 'invoice.voided', payload: { invoiceId } });
    }
  } catch {}

  return { success: true };
}

/**
 * Send invoice to client
 */
// Bug #105: Accept optional email customization from SendEmailDialog
interface SendEmailOptions {
  recipients?: string[];
  subject?: string;
  message?: string;
}

export async function sendInvoice(invoiceId: string, emailOptions?: SendEmailOptions) {
  // Fetch invoice with client for email first
  const { workspace } = await getActiveWorkspace();
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, workspaceId: workspace.id },
    include: { client: true },
  });

  if (!invoice) {
    return { success: false, error: 'Invoice not found', emailSent: false };
  }

  if (!invoice.client?.email) {
    return { success: false, error: 'Client has no email address', emailSent: false };
  }

  // Try sending email FIRST — only update status if email succeeds
  const baseUrl = getBaseUrl();
  const invoiceUrl = `${baseUrl}/i/${invoice.accessToken}`;

  // Bug #105: Use custom recipients from dialog if provided
  const emailRecipients = emailOptions?.recipients?.length
    ? emailOptions.recipients
    : [invoice.client.email];

  let emailSent = false;
  try {
    const emailResult = await sendTemplatedEmail({
      type: 'invoice_sent',
      to: emailRecipients,
      variables: {
        businessName: workspace.name,
        businessEmail: (await prisma.businessProfile.findUnique({ where: { workspaceId: workspace.id }, select: { email: true } }))?.email || '',
        clientName: invoice.client.name,
        clientEmail: invoice.client.email,
        invoiceNumber: invoice.invoiceNumber,
        invoiceUrl,
        invoiceTotal: formatCurrency(toNumber(invoice.total), invoice.currency),
        amountDue: formatCurrency(toNumber(invoice.amountDue), invoice.currency),
        amountPaid: formatCurrency(toNumber(invoice.amountPaid), invoice.currency),
        invoiceDueDate: invoice.dueDate ? invoice.dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined,
        message: emailOptions?.message || undefined,
      },
      customSubject: emailOptions?.subject || undefined,
    });
    emailSent = emailResult.success;
    if (!emailResult.success) {
      logger.error({ err: emailResult.error }, 'Failed to send invoice email');
      return { success: false, error: 'Email could not be sent. Please check your email settings.', emailSent: false };
    }
  } catch (err) {
    logger.error({ err }, 'Failed to send invoice email');
    return { success: false, error: 'Email could not be sent. Please check your email settings.', emailSent: false };
  }

  // Email sent successfully — update status to 'sent' (skip if already sent)
  if (invoice.status !== 'sent' && invoice.status !== 'viewed') {
    const result = await updateInvoiceStatus(invoiceId, 'sent');
    if (!result.success) {
      return { ...result, emailSent: true };
    }
  }

  // Create notification for sender
  const { userId } = await getCurrentUserWorkspace();
  createNotification({
    userId,
    workspaceId: workspace.id,
    type: 'invoice_sent',
    title: `Invoice ${invoice.invoiceNumber} sent`,
    message: `Sent to ${invoice.client.email}`,
    entityType: 'invoice',
    entityId: invoiceId,
    link: `/invoices/${invoiceId}`,
  }).catch(() => {});

  try {
    domainEvents.emit({ type: 'invoice.sent', payload: { invoiceId, clientEmail: invoice.client.email } });
  } catch {}

  return { success: true, emailSent: true };
}

/**
 * Delete (soft delete) an invoice
 */
export async function deleteInvoice(invoiceId: string) {
  const { workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot delete invoices' };
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
  });

  if (!invoice) {
    return { success: false, error: 'Invoice not found' };
  }

  // Can only delete draft invoices
  if (invoice.status !== 'draft') {
    return { success: false, error: 'Can only delete draft invoices. Use void for sent invoices.' };
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { deletedAt: new Date() },
  });

  revalidatePath(ROUTES.invoices);

  return { success: true };
}

/**
 * Record a payment for an invoice
 */
export async function recordPayment(
  invoiceId: string,
  data: {
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }
) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  // Bug #456: RBAC — viewers cannot record payments
  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot record payments' };
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
  });

  if (!invoice) {
    return { success: false, error: 'Invoice not found' };
  }

  if (invoice.status === 'voided') {
    return { success: false, error: 'Cannot record payment for voided invoice' };
  }

  // Bug #125: Prevent payment on already-paid invoices
  if (invoice.status === 'paid') {
    return { success: false, error: 'This invoice is already fully paid' };
  }

  if (data.amount <= 0) {
    return { success: false, error: 'Payment amount must be greater than zero' };
  }

  // Bug #130: Validate amount is a finite number (prevents NaN, Infinity)
  if (!Number.isFinite(data.amount)) {
    return { success: false, error: 'Payment amount must be a valid number' };
  }

  // Bug #125: Prevent overpayment
  const currentAmountPaid = toNumber(invoice.amountPaid);
  const total = toNumber(invoice.total);
  const maxPayable = total - currentAmountPaid;
  if (data.amount > maxPayable) {
    return { success: false, error: `Payment exceeds remaining balance. Maximum payable: $${maxPayable.toFixed(2)}` };
  }

  // Bug #67: Use interactive transaction with atomic increment to prevent race conditions
  const result = await prisma.$transaction(async (tx) => {
    // Atomically increment amountPaid
    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: { increment: data.amount },
      },
      select: { amountPaid: true },
    });

    const newAmountPaid = toNumber(updated.amountPaid);
    const newAmountDue = total - newAmountPaid;

    // Determine new status
    let newStatus: InvoiceStatus;
    if (newAmountPaid >= total) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partial';
    } else {
      newStatus = invoice.status as InvoiceStatus;
    }

    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        status: 'completed',
        referenceNumber: data.referenceNumber || null,
        notes: data.notes || null,
        processedAt: new Date(),
      },
    });

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        amountDue: Math.max(0, newAmountDue),
        status: newStatus,
        ...(!invoice.paidAt && { paidAt: new Date() }),
      },
    });

    await tx.invoiceEvent.create({
      data: {
        invoiceId,
        eventType: 'payment_recorded',
        actorId: userId,
        actorType: 'user',
        metadata: {
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          newAmountPaid,
          newAmountDue,
        },
      },
    });

    return { paymentId: payment.id, newAmountPaid, newAmountDue, newStatus };
  });

  revalidatePath(ROUTES.invoices);
  revalidatePath(ROUTES.invoiceDetail(invoiceId));

  domainEvents.emit({ type: 'payment.received', payload: { paymentId: result.paymentId, invoiceId, amount: data.amount } });

  return { success: true };
}

/**
 * Duplicate an invoice
 */
export async function duplicateInvoice(invoiceId: string) {
  const { workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  // Bug #456: RBAC — viewers cannot duplicate invoices
  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot duplicate invoices' };
  }

  const original = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!original) {
    return { success: false, error: 'Invoice not found' };
  }

  const invoiceNumber = await generateInvoiceNumber(workspace.id);

  // Set new due date 30 days from now
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const duplicate = await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      clientId: original.clientId,
      projectId: original.projectId,
      invoiceNumber,
      title: `${original.title || 'Invoice'} (Copy)`,
      status: 'draft',
      currency: original.currency,
      accessToken: generateAccessToken(),
      issueDate: new Date(),
      dueDate,
      subtotal: original.subtotal,
      discountType: original.discountType,
      discountValue: original.discountValue,
      discountAmount: original.discountAmount,
      taxTotal: original.taxTotal,
      total: original.total,
      amountDue: original.total,
      amountPaid: 0,
      notes: original.notes,
      terms: original.terms,
      settings: original.settings as Prisma.InputJsonValue,
      lineItems: {
        create: original.lineItems.map((item: typeof original.lineItems[number]) => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          sortOrder: item.sortOrder,
        })),
      },
    },
  });

  revalidatePath(ROUTES.invoices);

  return { success: true, invoiceId: duplicate.id };
}

// ============================================
// INVOICE TEMPLATES
// ============================================

export interface InvoiceTemplateLineItem {
  id: string;
  name: string;
  description: string;
  rate: number;
  qty: number;
  taxable: boolean;
}

export interface InvoiceTemplateListItem {
  id: string;
  name: string;
  description: string;
  paymentTerms: string;
  currency: string;
  lineItems: InvoiceTemplateLineItem[];
  notes: string;
  terms: string;
  usageCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getInvoiceTemplates(filter?: { search?: string; page?: number }) {
  const { workspace } = await getActiveWorkspace();

  const page = filter?.page ?? 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const where = {
    workspaceId: workspace.id,
    deletedAt: null,
    ...(filter?.search ? { name: { contains: filter.search, mode: 'insensitive' as const } } : {}),
  };

  const [templates, total] = await Promise.all([
    prisma.invoiceTemplate.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.invoiceTemplate.count({ where }),
  ]);

  const data: InvoiceTemplateListItem[] = templates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description ?? '',
    paymentTerms: t.paymentTerms,
    currency: t.currency,
    lineItems: (typeof t.lineItems === 'string' ? JSON.parse(t.lineItems) : t.lineItems) as InvoiceTemplateLineItem[] ?? [],
    notes: t.notes ?? '',
    terms: t.terms ?? '',
    usageCount: t.usageCount,
    isDefault: t.isDefault,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function createInvoiceTemplate(data: {
  name: string;
  description?: string;
  paymentTerms?: string;
  currency?: string;
  lineItems?: InvoiceTemplateLineItem[];
  notes?: string;
  terms?: string;
  isDefault?: boolean;
}) {
  const { workspace } = await getActiveWorkspace();

  if (!data.name?.trim()) {
    return { success: false, error: 'Template name is required' };
  }

  // If setting as default, unset any existing default
  if (data.isDefault) {
    await prisma.invoiceTemplate.updateMany({
      where: { workspaceId: workspace.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const template = await prisma.invoiceTemplate.create({
    data: {
      workspaceId: workspace.id,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      paymentTerms: data.paymentTerms || 'net30',
      currency: data.currency || 'USD',
      lineItems: (data.lineItems ?? []) as unknown as any,
      notes: data.notes?.trim() || null,
      terms: data.terms?.trim() || null,
      isDefault: data.isDefault ?? false,
    },
  });

  revalidatePath('/templates/invoices');
  return { success: true, id: template.id };
}

export async function updateInvoiceTemplate(data: {
  id: string;
  name: string;
  description?: string;
  paymentTerms: string;
  currency: string;
  lineItems?: InvoiceTemplateLineItem[];
  notes?: string;
  terms?: string;
  isDefault: boolean;
}) {
  const { workspace } = await getActiveWorkspace();

  const template = await prisma.invoiceTemplate.findFirst({
    where: { id: data.id, workspaceId: workspace.id, deletedAt: null },
  });

  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  if (!data.name?.trim()) {
    return { success: false, error: 'Template name is required' };
  }

  // If setting as default, unset any existing default
  if (data.isDefault && !template.isDefault) {
    await prisma.invoiceTemplate.updateMany({
      where: { workspaceId: workspace.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  await prisma.invoiceTemplate.update({
    where: { id: data.id },
    data: {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      paymentTerms: data.paymentTerms,
      currency: data.currency,
      lineItems: (data.lineItems ?? template.lineItems) as unknown as any,
      notes: data.notes?.trim() ?? template.notes,
      terms: data.terms?.trim() ?? template.terms,
      isDefault: data.isDefault,
    },
  });

  revalidatePath('/templates/invoices');
  return { success: true };
}

export async function deleteInvoiceTemplate(id: string) {
  const { workspace } = await getActiveWorkspace();

  const template = await prisma.invoiceTemplate.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
  });

  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  await prisma.invoiceTemplate.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/templates/invoices');
  return { success: true };
}

export async function duplicateInvoiceTemplate(id: string) {
  const { workspace } = await getActiveWorkspace();

  const template = await prisma.invoiceTemplate.findFirst({
    where: { id, workspaceId: workspace.id, deletedAt: null },
  });

  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  const duplicate = await prisma.invoiceTemplate.create({
    data: {
      workspaceId: workspace.id,
      name: `${template.name} (Copy)`,
      description: template.description,
      paymentTerms: template.paymentTerms,
      currency: template.currency,
      lineItems: (template.lineItems ?? []) as unknown as any,
      notes: template.notes,
      terms: template.terms,
      isDefault: false,
    },
  });

  revalidatePath('/templates/invoices');
  return { success: true, id: duplicate.id };
}
