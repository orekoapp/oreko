import { NextRequest } from 'next/server';
import { prisma } from '@quotecraft/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';
import { toNumber } from '@/lib/utils';

// GET /api/v1/invoices — List invoices
export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if ('error' in auth) return auth.error;
  const { workspaceId } = auth.context;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));
  const status = searchParams.get('status') || undefined;
  const clientId = searchParams.get('clientId') || undefined;
  const search = searchParams.get('search') || undefined;

  const where: Record<string, unknown> = { workspaceId, deletedAt: null };
  const validInvoiceStatuses = ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'voided'];
  if (status) {
    if (!validInvoiceStatuses.includes(status)) return apiError(`Invalid status: ${status}`, 400);
    where.status = status;
  }
  if (clientId) where.clientId = clientId;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  const data = invoices.map((inv) => ({
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
    sentAt: inv.sentAt,
    paidAt: inv.paidAt,
    lineItems: inv.lineItems.map((li) => ({
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
  }));

  return apiSuccess({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// POST /api/v1/invoices — Create an invoice
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

  const { title, clientId, projectId, currency, dueDate, lineItems, notes, terms } = body as {
    title?: string;
    clientId?: string;
    projectId?: string;
    currency?: string;
    dueDate?: string;
    lineItems?: Array<{ name: string; description?: string; quantity: number; rate: number; taxRate?: number }>;
    notes?: string;
    terms?: string;
  };

  if (!clientId) return apiError('clientId is required', 400);
  if (!title) return apiError('title is required', 400);
  if (!dueDate) return apiError('dueDate is required', 400);

  // Validate currency code if provided
  if (currency && (currency.length !== 3 || !/^[A-Z]{3}$/.test(currency.toUpperCase()))) {
    return apiError('Currency must be a valid 3-letter ISO code (e.g., USD, EUR)', 400);
  }

  // Validate dueDate is a valid date
  const parsedDueDate = new Date(dueDate);
  if (isNaN(parsedDueDate.getTime())) {
    return apiError('dueDate must be a valid date', 400);
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, workspaceId, deletedAt: null },
  });
  if (!client) return apiError('Client not found', 404);

  // Generate invoice number in a serializable transaction to prevent duplicates
  const seq = await prisma.$transaction(async (tx) => {
    return tx.numberSequence.upsert({
      where: { workspaceId_type: { workspaceId, type: 'invoice' } },
      update: { currentValue: { increment: 1 } },
      create: { workspaceId, type: 'invoice', prefix: 'INV-', currentValue: 1, padding: 4 },
    });
  }, { isolationLevel: 'Serializable' });
  const invoiceNumber = `${seq.prefix || 'INV-'}${String(seq.currentValue).padStart(seq.padding, '0')}`;

  const items = lineItems || [];

  // Validate line item values
  for (const item of items) {
    if (!Number.isFinite(item.quantity) || !Number.isFinite(item.rate)) {
      return apiError('Line item quantity and rate must be valid numbers', 400);
    }
    if (item.quantity < 0) return apiError('Line item quantity cannot be negative', 400);
    if (item.rate < 0) return apiError('Line item rate cannot be negative', 400);
    if (item.taxRate !== undefined && item.taxRate !== null && !Number.isFinite(item.taxRate)) {
      return apiError('Line item taxRate must be a valid number', 400);
    }
  }

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
      taxRate: item.taxRate != null ? item.taxRate : null,
      taxAmount,
      sortOrder: i,
    };
  });

  const total = subtotal + taxTotal;

  const invoice = await prisma.invoice.create({
    data: {
      workspaceId,
      clientId,
      projectId: projectId || null,
      invoiceNumber,
      title,
      currency: currency || (await prisma.businessProfile.findUnique({ where: { workspaceId }, select: { currency: true } }))?.currency || 'USD',
      dueDate: parsedDueDate,
      subtotal,
      taxTotal,
      total,
      amountDue: total,
      notes: notes || null,
      terms: terms || null,
      settings: {},
      lineItems: { create: processedItems },
    },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
      lineItems: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return apiSuccess({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    title: invoice.title,
    status: invoice.status,
    client: invoice.client,
    currency: invoice.currency,
    dueDate: invoice.dueDate,
    subtotal: toNumber(invoice.subtotal),
    taxTotal: toNumber(invoice.taxTotal),
    total: toNumber(invoice.total),
    amountPaid: 0,
    amountDue: toNumber(invoice.amountDue),
    lineItems: invoice.lineItems.map((li) => ({
      id: li.id,
      name: li.name,
      description: li.description,
      quantity: toNumber(li.quantity),
      rate: toNumber(li.rate),
      amount: toNumber(li.amount),
    })),
    createdAt: invoice.createdAt,
  }, 201);
}
