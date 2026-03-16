import { NextRequest } from 'next/server';
import { prisma } from '@quotecraft/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';
import { toNumber } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function formatInvoice(inv: any) {
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    title: inv.title,
    status: inv.status,
    client: inv.client,
    currency: inv.currency,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    subtotal: toNumber(inv.subtotal),
    discountType: inv.discountType,
    discountValue: inv.discountValue ? toNumber(inv.discountValue) : null,
    discountAmount: toNumber(inv.discountAmount),
    taxTotal: toNumber(inv.taxTotal),
    total: toNumber(inv.total),
    amountPaid: toNumber(inv.amountPaid),
    amountDue: toNumber(inv.amountDue),
    notes: inv.notes,
    terms: inv.terms,
    accessToken: inv.accessToken,
    sentAt: inv.sentAt,
    paidAt: inv.paidAt,
    voidedAt: inv.voidedAt,
    lineItems: inv.lineItems?.map((li: any) => ({
      id: li.id,
      name: li.name,
      description: li.description,
      quantity: toNumber(li.quantity),
      rate: toNumber(li.rate),
      amount: toNumber(li.amount),
      taxRate: li.taxRate ? toNumber(li.taxRate) : null,
      taxAmount: toNumber(li.taxAmount),
    })),
    createdAt: inv.createdAt,
    updatedAt: inv.updatedAt,
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
  if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
  if (status !== undefined) {
    const validStatuses = ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'voided'];
    if (!validStatuses.includes(status)) return apiError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    updateData.status = status;
    if (status === 'paid') updateData.paidAt = new Date();
    if (status === 'voided') updateData.voidedAt = new Date();
    if (status === 'sent') updateData.sentAt = new Date();
  }

  if (lineItems) {
    await prisma.invoiceLineItem.deleteMany({ where: { invoiceId: id } });

    let subtotal = 0;
    let taxTotal = 0;
    const processed = lineItems.map((item, i) => {
      const amount = item.quantity * item.rate;
      const taxAmount = item.taxRate ? amount * (item.taxRate / 100) : 0;
      subtotal += amount;
      taxTotal += taxAmount;
      return {
        invoiceId: id,
        name: item.name,
        description: item.description || null,
        quantity: item.quantity,
        rate: item.rate,
        amount,
        taxRate: item.taxRate || null,
        taxAmount,
        sortOrder: i,
      };
    });

    await prisma.invoiceLineItem.createMany({ data: processed });
    const total = subtotal + taxTotal;
    updateData.subtotal = subtotal;
    updateData.taxTotal = taxTotal;
    updateData.total = total;
    updateData.amountDue = Math.max(0, total - toNumber(invoice.amountPaid));
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

  await prisma.invoice.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return apiSuccess({ message: 'Invoice deleted' });
}
