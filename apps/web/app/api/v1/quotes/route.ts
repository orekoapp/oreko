import { NextRequest } from 'next/server';
import { prisma } from '@quotecraft/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';
import { toNumber } from '@/lib/utils';

// GET /api/v1/quotes — List quotes
export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;

  const where: Record<string, unknown> = { workspaceId, deletedAt: null };
  if (status) where.status = status;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.quote.count({ where }),
  ]);

  const data = quotes.map((q) => ({
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
    lineItems: q.lineItems.map((li) => ({
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
  }));

  return apiSuccess({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/v1/quotes — Create a quote
export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  const { title, clientId, projectId, currency, lineItems } = body as {
    title?: string;
    clientId?: string;
    projectId?: string;
    currency?: string;
    lineItems?: Array<{ name: string; description?: string; quantity: number; rate: number; taxRate?: number }>;
  };

  if (!clientId) return apiError('clientId is required', 400);
  if (!title) return apiError('title is required', 400);

  // Verify client belongs to workspace
  const client = await prisma.client.findFirst({
    where: { id: clientId, workspaceId, deletedAt: null },
  });
  if (!client) return apiError('Client not found', 404);

  // Generate quote number
  const seq = await prisma.numberSequence.upsert({
    where: { workspaceId_type: { workspaceId, type: 'quote' } },
    update: { currentValue: { increment: 1 } },
    create: { workspaceId, type: 'quote', prefix: 'Q-', currentValue: 1, padding: 4 },
  });
  const quoteNumber = `${seq.prefix || 'Q-'}${String(seq.currentValue).padStart(seq.padding, '0')}`;

  // CR #5: Validate line item values — reject Infinity/NaN
  const items = lineItems || [];
  for (const item of items) {
    if (!Number.isFinite(item.quantity) || !Number.isFinite(item.rate)) {
      return apiError('Line item quantity and rate must be valid numbers', 400);
    }
    if (item.quantity < 0 || item.rate < 0) {
      return apiError('Line item quantity and rate cannot be negative', 400);
    }
    if (item.taxRate !== undefined && (!Number.isFinite(item.taxRate) || item.taxRate < 0 || item.taxRate > 100)) {
      return apiError('Tax rate must be between 0 and 100', 400);
    }
  }

  // Calculate totals
  let subtotal = 0;
  let taxTotal = 0;
  const processedItems = items.map((item, i) => {
    const amount = Math.round(item.quantity * item.rate * 100) / 100;
    const taxAmount = item.taxRate ? Math.round(amount * (item.taxRate / 100) * 100) / 100 : 0;
    subtotal += amount;
    taxTotal += taxAmount;
    return {
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

  const quote = await prisma.quote.create({
    data: {
      workspaceId,
      clientId,
      projectId: projectId || null,
      quoteNumber,
      title,
      currency: currency || 'USD',
      subtotal,
      taxTotal,
      total: subtotal + taxTotal,
      settings: {},
      lineItems: { create: processedItems },
    },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      lineItems: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return apiSuccess({
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    title: quote.title,
    status: quote.status,
    client: quote.client,
    currency: quote.currency,
    subtotal: toNumber(quote.subtotal),
    taxTotal: toNumber(quote.taxTotal),
    total: toNumber(quote.total),
    lineItems: quote.lineItems.map((li) => ({
      id: li.id,
      name: li.name,
      description: li.description,
      quantity: toNumber(li.quantity),
      rate: toNumber(li.rate),
      amount: toNumber(li.amount),
    })),
    createdAt: quote.createdAt,
  }, 201);
}
