'use server';

import { revalidatePath } from 'next/cache';
import { prisma, type Prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import type {
  InvoiceDocument,
  InvoiceListItem,
  InvoiceStatus,
  CreateInvoiceData,
  UpdateInvoiceData,
  DEFAULT_INVOICE_SETTINGS,
} from './types';
import { sendInvoiceSentEmail } from '@/lib/services/email';
import { createNotification } from '@/lib/notifications/actions';
import { formatCurrency } from '@/lib/utils';

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
 * Generate the next invoice number for a workspace
 * Uses atomic increment on NumberSequence table to prevent race conditions
 */
async function generateInvoiceNumber(workspaceId: string): Promise<string> {
  // Use upsert to atomically create or increment the sequence (race-condition safe)
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.numberSequence.upsert({
      where: { workspaceId_type: { workspaceId, type: 'invoice' } },
      update: { currentValue: { increment: 1 } },
      create: {
        workspaceId,
        type: 'invoice',
        prefix: 'INV',
        currentValue: 1,
        padding: 4,
      },
    });
    return {
      prefix: updated.prefix || 'INV',
      suffix: updated.suffix,
      value: updated.currentValue,
      padding: updated.padding,
    };
  });

  const paddedValue = String(result.value).padStart(result.padding, '0');
  const prefix = result.prefix.replace(/-$/, '');
  const parts = [prefix, paddedValue];
  if (result.suffix) {
    parts.push(result.suffix);
  }
  return parts.join('-');
}

/**
 * Calculate totals from line items
 */
function calculateTotals(
  lineItems: Array<{ quantity: number; rate: number; taxRate?: number }>
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

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxTotal: Math.round(taxTotal * 100) / 100,
    total: Math.round((subtotal + taxTotal) * 100) / 100,
  };
}

/**
 * Create a new invoice
 */
export async function createInvoice(data: CreateInvoiceData) {
  const { userId, workspace } = await getActiveWorkspace();

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

  const { subtotal, taxTotal, total } = calculateTotals(data.lineItems);

  const lineItems = data.lineItems.map((item, index) => ({
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
  }));

  const invoice = await prisma.invoice.create({
    data: {
      workspaceId: workspace.id,
      clientId: data.clientId,
      projectId: data.projectId || null,
      invoiceNumber,
      title: data.title,
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(data.dueDate),
      subtotal,
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

  revalidatePath('/invoices');

  return { success: true, invoice };
}

/**
 * Create invoice from an accepted quote
 */
export async function createInvoiceFromQuote(quoteId: string, options?: { dueDays?: number }) {
  const { userId, workspace } = await getActiveWorkspace();

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

  // Check if an invoice already exists for this quote
  const existingInvoice = await prisma.invoice.findFirst({
    where: { quoteId: quote.id },
  });

  if (existingInvoice) {
    return { success: false, error: 'Invoice already exists for this quote' };
  }

  const invoiceNumber = await generateInvoiceNumber(workspace.id);

  // Calculate due date (configurable, default: 30 days from now)
  const dueDays = options?.dueDays ?? 30;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueDays);

  const invoice = await prisma.$transaction(async (tx) => {
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
        issueDate: new Date(),
        dueDate,
        subtotal: quote.subtotal,
        discountType: quote.discountType,
        discountValue: quote.discountValue,
        discountAmount: quote.discountAmount,
        taxTotal: quote.taxTotal,
        total: quote.total,
        amountDue: quote.total,
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

  revalidatePath('/invoices');
  revalidatePath('/quotes');
  revalidatePath(`/quotes/${quoteId}`);

  return { success: true, invoice };
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(invoiceId: string, data: UpdateInvoiceData) {
  const { userId, workspace } = await getActiveWorkspace();

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

  let subtotal = Number(existingInvoice.subtotal);
  let taxTotal = Number(existingInvoice.taxTotal);
  let total = Number(existingInvoice.total);

  if (data.lineItems) {
    const totals = calculateTotals(data.lineItems);
    subtotal = totals.subtotal;
    taxTotal = totals.taxTotal;
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
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        notes: data.notes,
        terms: data.terms,
        internalNotes: data.internalNotes,
        ...(data.lineItems && {
          subtotal,
          taxTotal,
          total,
          amountDue: Math.max(0, total - Number(existingInvoice.amountPaid)),
          lineItems: {
            create: data.lineItems.map((item, index) => ({
              name: item.name,
              description: item.description || null,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.quantity * item.rate,
              taxRate: item.taxRate || null,
              taxAmount: item.taxRate
                ? item.quantity * item.rate * (item.taxRate / 100)
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

  revalidatePath('/invoices');
  revalidatePath(`/invoices/${invoiceId}`);

  return { success: true, invoice };
}

/**
 * Get a single invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<InvoiceDocument | null> {
  const { userId, workspace } = await getActiveWorkspace();

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
    issueDate: invoice.issueDate.toISOString().split('T')[0] ?? '',
    dueDate: invoice.dueDate.toISOString().split('T')[0] ?? '',
    lineItems: invoice.lineItems.map((item: (typeof invoice.lineItems)[number]) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount),
      taxRate: item.taxRate ? Number(item.taxRate) : null,
      taxAmount: Number(item.taxAmount),
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
      subtotal: Number(invoice.subtotal),
      discountType: invoice.discountType as 'percentage' | 'fixed' | null,
      discountValue: invoice.discountValue ? Number(invoice.discountValue) : null,
      discountAmount: Number(invoice.discountAmount),
      taxTotal: Number(invoice.taxTotal),
      total: Number(invoice.total),
      amountPaid: Number(invoice.amountPaid),
      amountDue: Number(invoice.amountDue),
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
  const { userId, workspace } = await getActiveWorkspace();

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
      status: (isOverdue && invoice.status !== 'partial' ? 'overdue' : invoice.status) as InvoiceStatus,
      title: invoice.title || 'Invoice',
      issueDate: invoice.issueDate.toISOString().split('T')[0] ?? '',
      dueDate: invoice.dueDate.toISOString().split('T')[0] ?? '',
      total: Number(invoice.total),
      amountPaid: Number(invoice.amountPaid),
      amountDue: Number(invoice.amountDue),
      client: {
        id: invoice.client?.id ?? '',
        name: invoice.client?.name ?? 'Unknown Client',
        email: invoice.client?.email ?? null,
        company: invoice.client?.company ?? null,
      },
      isOverdue,
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
    sent: ['paid', 'partial', 'voided', 'draft'],
    partial: ['paid', 'voided'],
    paid: ['voided'],
    overdue: ['paid', 'partial', 'voided'],
    voided: ['draft'],
  };

  const allowed = allowedTransitions[invoice.status];
  if (allowed && !allowed.includes(status)) {
    return {
      success: false,
      error: `Cannot transition from '${invoice.status}' to '${status}'`,
    };
  }

  const updateData: Prisma.InvoiceUpdateInput = {
    status,
  };

  // Set timestamps based on status
  if (status === 'sent' && !invoice.sentAt) {
    updateData.sentAt = new Date();
  } else if (status === 'paid') {
    updateData.paidAt = new Date();
    // Only set amountPaid to total if no partial payments exist
    const currentPaid = Number(invoice.amountPaid ?? 0);
    updateData.amountPaid = currentPaid > 0 ? currentPaid : invoice.total;
    updateData.amountDue = 0;
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

  revalidatePath('/invoices');
  revalidatePath(`/invoices/${invoiceId}`);

  return { success: true };
}

/**
 * Send invoice to client
 */
export async function sendInvoice(invoiceId: string) {
  const result = await updateInvoiceStatus(invoiceId, 'sent');

  if (!result.success) {
    return { ...result, emailSent: false };
  }

  // Fetch invoice with client for email
  const { workspace } = await getActiveWorkspace();
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, workspaceId: workspace.id },
    include: { client: true },
  });

  let emailSent = false;

  if (invoice?.client?.email) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const invoiceUrl = `${baseUrl}/i/${invoice.accessToken}`;

    try {
      const emailResult = await sendInvoiceSentEmail({
        to: invoice.client.email,
        clientName: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        invoiceUrl,
        businessName: workspace.name,
        amount: formatCurrency(Number(invoice.total)),
        dueDate: invoice.dueDate,
      });
      emailSent = emailResult.success;
      if (!emailResult.success) {
        console.error('Failed to send invoice email:', emailResult.error);
      }
    } catch (err) {
      console.error('Failed to send invoice email:', err);
    }
  }

  // Create notification for sender
  if (invoice) {
    const { userId } = await getCurrentUserWorkspace();
    createNotification({
      userId,
      workspaceId: workspace.id,
      type: 'invoice_sent',
      title: `Invoice ${invoice.invoiceNumber} sent`,
      message: invoice.client?.email ? `Sent to ${invoice.client.email}` : undefined,
      entityType: 'invoice',
      entityId: invoiceId,
      link: `/invoices/${invoiceId}`,
    }).catch(() => {});
  }

  return { success: true, emailSent };
}

/**
 * Delete (soft delete) an invoice
 */
export async function deleteInvoice(invoiceId: string) {
  const { userId, workspace } = await getActiveWorkspace();

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

  revalidatePath('/invoices');

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

  if (data.amount <= 0) {
    return { success: false, error: 'Payment amount must be greater than zero' };
  }

  const currentAmountPaid = Number(invoice.amountPaid);
  const total = Number(invoice.total);
  const newAmountPaid = currentAmountPaid + data.amount;
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

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        invoiceId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        status: 'completed',
        referenceNumber: data.referenceNumber || null,
        notes: data.notes || null,
        processedAt: new Date(),
      },
    }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newAmountPaid,
        amountDue: Math.max(0, newAmountDue),
        status: newStatus,
        ...(newStatus === 'paid' && { paidAt: new Date() }),
      },
    }),
    prisma.invoiceEvent.create({
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
    }),
  ]);

  revalidatePath('/invoices');
  revalidatePath(`/invoices/${invoiceId}`);

  return { success: true };
}

/**
 * Duplicate an invoice
 */
export async function duplicateInvoice(invoiceId: string) {
  const { userId, workspace } = await getActiveWorkspace();

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

  revalidatePath('/invoices');

  return { success: true, invoiceId: duplicate.id };
}
