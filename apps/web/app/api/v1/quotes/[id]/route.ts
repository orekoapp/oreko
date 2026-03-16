import { NextRequest } from 'next/server';
import { prisma } from '@quotecraft/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';
import { toNumber } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function formatQuote(q: any) {
  return {
    id: q.id,
    quoteNumber: q.quoteNumber,
    title: q.title,
    status: q.status,
    client: q.client,
    currency: q.currency,
    subtotal: toNumber(q.subtotal),
    discountType: q.discountType,
    discountValue: q.discountValue ? toNumber(q.discountValue) : null,
    discountAmount: toNumber(q.discountAmount),
    taxTotal: toNumber(q.taxTotal),
    total: toNumber(q.total),
    notes: q.notes,
    terms: q.terms,
    issueDate: q.issueDate,
    expirationDate: q.expirationDate,
    sentAt: q.sentAt,
    acceptedAt: q.acceptedAt,
    declinedAt: q.declinedAt,
    accessToken: q.accessToken,
    lineItems: q.lineItems?.map((li: any) => ({
      id: li.id,
      name: li.name,
      description: li.description,
      quantity: toNumber(li.quantity),
      rate: toNumber(li.rate),
      amount: toNumber(li.amount),
      taxRate: li.taxRate ? toNumber(li.taxRate) : null,
      taxAmount: toNumber(li.taxAmount),
    })),
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
}

// GET /api/v1/quotes/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;
  const { id } = await params;

  const quote = await prisma.quote.findFirst({
    where: { id, workspaceId, deletedAt: null },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      lineItems: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!quote) return apiError('Quote not found', 404);
  return apiSuccess(formatQuote(quote));
}

// PATCH /api/v1/quotes/:id
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;
  const { id } = await params;

  const quote = await prisma.quote.findFirst({
    where: { id, workspaceId, deletedAt: null },
  });
  if (!quote) return apiError('Quote not found', 404);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const { title, notes, terms, status, lineItems } = body as {
    title?: string;
    notes?: string;
    terms?: string;
    status?: string;
    lineItems?: Array<{ name: string; description?: string; quantity: number; rate: number; taxRate?: number }>;
  };

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (notes !== undefined) updateData.notes = notes;
  if (terms !== undefined) updateData.terms = terms;
  if (status !== undefined) {
    const validStatuses = ['draft', 'sent', 'accepted', 'declined', 'expired'];
    if (!validStatuses.includes(status)) return apiError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    updateData.status = status;
    if (status === 'accepted') updateData.acceptedAt = new Date();
    if (status === 'declined') updateData.declinedAt = new Date();
    if (status === 'sent') updateData.sentAt = new Date();
  }

  // If line items provided, recalculate totals
  if (lineItems) {
    await prisma.quoteLineItem.deleteMany({ where: { quoteId: id } });

    let subtotal = 0;
    let taxTotal = 0;
    const processed = lineItems.map((item, i) => {
      const amount = item.quantity * item.rate;
      const taxAmount = item.taxRate ? amount * (item.taxRate / 100) : 0;
      subtotal += amount;
      taxTotal += taxAmount;
      return {
        quoteId: id,
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

    await prisma.quoteLineItem.createMany({ data: processed });
    updateData.subtotal = subtotal;
    updateData.taxTotal = taxTotal;
    updateData.total = subtotal + taxTotal;
  }

  const updated = await prisma.quote.update({
    where: { id },
    data: updateData,
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      lineItems: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return apiSuccess(formatQuote(updated));
}

// DELETE /api/v1/quotes/:id
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;
  const { id } = await params;

  const quote = await prisma.quote.findFirst({
    where: { id, workspaceId, deletedAt: null },
  });
  if (!quote) return apiError('Quote not found', 404);

  await prisma.quote.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return apiSuccess({ message: 'Quote deleted' });
}
