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
    const validTransitions: Record<string, string[]> = {
      draft: ['sent'],
      sent: ['viewed', 'accepted', 'declined', 'expired'],
      viewed: ['accepted', 'declined', 'expired'],
      accepted: [],
      declined: ['draft'],
      expired: ['draft'],
    };
    const allowed = validTransitions[quote.status];
    if (!allowed || !allowed.includes(status)) {
      return apiError(`Cannot transition from '${quote.status}' to '${status}'`, 400);
    }
    updateData.status = status;
    if (status === 'accepted') updateData.acceptedAt = new Date();
    if (status === 'declined') updateData.declinedAt = new Date();
    if (status === 'sent') updateData.sentAt = new Date();
  }

  // If line items provided, validate and recalculate totals
  if (lineItems) {
    for (const item of lineItems) {
      if (!Number.isFinite(item.quantity) || !Number.isFinite(item.rate)) {
        return apiError('Line item quantity and rate must be valid numbers', 400);
      }
      if (item.quantity < 0) return apiError('Line item quantity cannot be negative', 400);
      if (item.taxRate !== undefined && item.taxRate !== null && !Number.isFinite(item.taxRate)) {
        return apiError('Line item taxRate must be a valid number', 400);
      }
    }

    // Block financial changes on accepted quotes
    if (quote.status === 'accepted') {
      return apiError('Cannot modify line items on an accepted quote', 400);
    }

    let subtotal = 0;
    let taxTotal = 0;
    const processed = lineItems.map((item, i) => {
      const amount = Math.round(item.quantity * item.rate * 100) / 100;
      const taxAmount = item.taxRate ? Math.round(amount * (item.taxRate / 100) * 100) / 100 : 0;
      subtotal += amount;
      taxTotal += taxAmount;
      return {
        quoteId: id,
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
    const discountType = quote.discountType as string | null;
    const discountValue = quote.discountValue ? toNumber(quote.discountValue) : 0;
    if (discountType === 'percentage' && discountValue > 0) {
      discountAmount = Math.round(subtotal * (discountValue / 100) * 100) / 100;
    } else if (discountType === 'fixed' && discountValue > 0) {
      discountAmount = Math.min(discountValue, subtotal);
    }

    updateData.subtotal = subtotal;
    updateData.taxTotal = taxTotal;
    updateData.discountAmount = discountAmount;
    updateData.total = subtotal - discountAmount + taxTotal;

    // Include line item replacement inside the same transaction as totals update
    const updated = await prisma.$transaction(async (tx) => {
      await tx.quoteLineItem.deleteMany({ where: { quoteId: id } });
      await tx.quoteLineItem.createMany({ data: processed });
      return tx.quote.update({
        where: { id },
        data: updateData,
        include: {
          client: { select: { id: true, name: true, email: true, company: true } },
          lineItems: { orderBy: { sortOrder: 'asc' } },
        },
      });
    });

    return apiSuccess(formatQuote(updated));
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
