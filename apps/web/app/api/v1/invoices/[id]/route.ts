import { NextRequest } from 'next/server';
import { prisma } from '@quotecraft/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';
import { toNumber } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatInvoice(inv: Record<string, any>) {
  return {
    id: inv.id as string,
    invoiceNumber: inv.invoiceNumber as string,
    title: inv.title as string,
    status: inv.status as string,
    client: inv.client as { id: string; name: string; email: string; company: string | null } | null,
    currency: inv.currency as string,
    issueDate: inv.issueDate as Date,
    dueDate: inv.dueDate as Date,
    subtotal: toNumber(inv.subtotal),
    discountType: inv.discountType as string | null,
    discountValue: inv.discountValue ? toNumber(inv.discountValue) : null,
    discountAmount: toNumber(inv.discountAmount),
    taxTotal: toNumber(inv.taxTotal),
    total: toNumber(inv.total),
    amountPaid: toNumber(inv.amountPaid),
    amountDue: toNumber(inv.amountDue),
    notes: inv.notes as string | null,
    terms: inv.terms as string | null,
    sentAt: inv.sentAt as Date | null,
    paidAt: inv.paidAt as Date | null,
    voidedAt: inv.voidedAt as Date | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lineItems: inv.lineItems?.map((li: any) => ({
      id: li.id as string,
      name: li.name as string,
      description: li.description as string | null,
      quantity: toNumber(li.quantity),
      rate: toNumber(li.rate),
      amount: toNumber(li.amount),
      taxRate: li.taxRate ? toNumber(li.taxRate) : null,
      taxAmount: toNumber(li.taxAmount),
    })),
    createdAt: inv.createdAt as Date,
    updatedAt: inv.updatedAt as Date,
  };
}

// GET /api/v1/invoices/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;
  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      lineItems: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!invoice) return apiError('Invoice not found', 404);
  return apiSuccess(formatInvoice(invoice));
}

// PATCH /api/v1/invoices/:id
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;
  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, workspaceId, deletedAt: null },
  });
  if (!invoice) return apiError('Invoice not found', 404);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  // Strip potentially dangerous fields that should never be user-controlled
  delete body.id;
  delete body.workspaceId;
  delete body.deletedAt;
  delete body.createdAt;
  delete body.updatedAt;

  const { title, notes, terms, dueDate, status, lineItems } = body as {
    title?: string;
    notes?: string;
    terms?: string;
    dueDate?: string;
    status?: string;
    lineItems?: Array<{ name: string; description?: string; quantity: number; rate: number; taxRate?: number }>;
  };

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (notes !== undefined) updateData.notes = notes;
  if (terms !== undefined) updateData.terms = terms;
  if (dueDate !== undefined) {
    if (isNaN(new Date(dueDate).getTime())) return apiError('Invalid due date', 400);
    updateData.dueDate = new Date(dueDate);
  }

  // Bug #30: Paid/voided invoices should not allow ANY changes (except status transitions)
  const immutableStatuses = ['paid', 'voided'];
  const hasNonStatusChanges = title !== undefined || notes !== undefined || terms !== undefined || dueDate !== undefined || lineItems !== undefined;
  if (immutableStatuses.includes(invoice.status) && hasNonStatusChanges) {
    return apiError('Cannot modify a paid or voided invoice', 400);
  }

  if (status !== undefined) {
    const validTransitions: Record<string, string[]> = {
      draft: ['sent'],
      sent: ['viewed', 'partial', 'paid', 'overdue', 'voided'],
      viewed: ['partial', 'paid', 'overdue', 'voided'],
      partial: ['paid', 'voided'],
      paid: ['voided'],
      overdue: ['paid', 'partial', 'voided'],
      voided: [],
    };
    const allowed = validTransitions[invoice.status];
    if (!allowed || !allowed.includes(status)) {
      return apiError(`Cannot transition from '${invoice.status}' to '${status}'`, 400);
    }
    updateData.status = status;
    if ((status === 'paid' || status === 'partial') && !invoice.paidAt) updateData.paidAt = new Date();
    if (status === 'voided') updateData.voidedAt = new Date();
    if (status === 'sent') updateData.sentAt = new Date();
  }

  if (lineItems) {
    // Block financial changes on paid/voided invoices
    if (['paid', 'voided'].includes(invoice.status)) {
      return apiError(`Cannot modify line items on a ${invoice.status} invoice`, 400);
    }

    // Bug #36: Limit line item count
    if (lineItems.length > 100) {
      return apiError('Maximum 100 line items allowed', 400);
    }

    for (const item of lineItems) {
      // Bug #41: Validate line item name is non-empty
      if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
        return apiError('Line item name is required', 400);
      }
      if (!Number.isFinite(item.quantity) || !Number.isFinite(item.rate)) {
        return apiError('Line item quantity and rate must be valid numbers', 400);
      }
      if (item.quantity < 0) return apiError('Line item quantity cannot be negative', 400);
      // Bug #40: Upper bound on rate and quantity
      if (item.quantity > 1_000_000) return apiError('Line item quantity must be at most 1,000,000', 400);
      if (item.rate > 1_000_000) return apiError('Line item rate must be at most 1,000,000', 400);
      if (item.taxRate !== undefined && item.taxRate !== null && !Number.isFinite(item.taxRate)) {
        return apiError('Line item taxRate must be a valid number', 400);
      }
    }

    let subtotal = 0;
    let taxTotal = 0;
    const processed = lineItems.map((item, i) => {
      const amount = Math.round(item.quantity * item.rate * 100) / 100;
      const taxAmount = item.taxRate ? Math.round(amount * (item.taxRate / 100) * 100) / 100 : 0;
      subtotal += amount;
      taxTotal += taxAmount;
      return {
        invoiceId: id,
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        rate: item.rate,
        amount,
        taxRate: item.taxRate != null ? item.taxRate : null,
        taxAmount,
        sortOrder: i,
      };
    });

    // Recalculate with existing discount fields
    let discountAmount = 0;
    const discountType = invoice.discountType as string | null;
    const discountValue = invoice.discountValue ? toNumber(invoice.discountValue) : 0;
    if (discountType === 'percentage' && discountValue > 0) {
      discountAmount = Math.round(subtotal * (discountValue / 100) * 100) / 100;
    } else if (discountType === 'fixed' && discountValue > 0) {
      discountAmount = Math.min(discountValue, subtotal);
    }

    const total = subtotal - discountAmount + taxTotal;
    updateData.subtotal = subtotal;
    updateData.taxTotal = taxTotal;
    updateData.discountAmount = discountAmount;
    updateData.total = total;
    // Use fresh amountPaid from DB to avoid stale data
    const freshInvoice = await prisma.invoice.findUnique({ where: { id }, select: { amountPaid: true } });
    updateData.amountDue = Math.max(0, total - toNumber(freshInvoice?.amountPaid));

    // Include line item replacement and totals update in same transaction
    const updated = await prisma.$transaction(async (tx) => {
      await tx.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
      await tx.invoiceLineItem.createMany({ data: processed });
      return tx.invoice.update({
        where: { id },
        data: updateData,
        include: {
          client: { select: { id: true, name: true, email: true, company: true } },
          lineItems: { orderBy: { sortOrder: 'asc' } },
        },
      });
    });

    return apiSuccess(formatInvoice(updated));
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: updateData,
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      lineItems: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return apiSuccess(formatInvoice(updated));
}

// DELETE /api/v1/invoices/:id
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;
  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, workspaceId, deletedAt: null },
  });
  if (!invoice) return apiError('Invoice not found', 404);

  // Prevent deletion of paid or partially paid invoices
  if (['paid', 'partial'].includes(invoice.status)) {
    return apiError(`Cannot delete a ${invoice.status} invoice. Void it instead.`, 400);
  }

  await prisma.invoice.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return apiSuccess({ message: 'Invoice deleted' });
}
