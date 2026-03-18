import { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma, Prisma } from '@quotecraft/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';
import { toNumber } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function generateAccessToken(): string {
  return randomBytes(32).toString('hex');
}

// POST /api/v1/quotes/:id/duplicate — Duplicate a quote
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateApiRequest(request);
    if ('error' in auth) return auth.error;
    const { workspaceId } = auth.context;
    const { id } = await params;

    // Fetch original quote with line items
    const original = await prisma.quote.findFirst({
      where: { id: id, workspaceId, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!original) return apiError('Quote not found', 404);

    // Generate new quote number
    const seq = await prisma.numberSequence.upsert({
      where: { workspaceId_type: { workspaceId, type: 'quote' } },
      update: { currentValue: { increment: 1 } },
      create: { workspaceId, type: 'quote', prefix: 'Q-', currentValue: 1, padding: 4 },
    });
    const quoteNumber = `${seq.prefix || 'Q-'}${String(seq.currentValue).padStart(seq.padding, '0')}`;

    // Create duplicate
    const duplicate = await prisma.quote.create({
      data: {
        workspaceId,
        clientId: original.clientId,
        projectId: original.projectId,
        quoteNumber,
        title: `${original.title || 'Untitled'} (Copy)`,
        status: 'draft',
        currency: original.currency,
        accessToken: generateAccessToken(),
        subtotal: original.subtotal,
        discountType: original.discountType,
        discountValue: original.discountValue,
        discountAmount: original.discountAmount,
        taxTotal: original.taxTotal,
        total: original.total,
        notes: original.notes,
        terms: original.terms,
        settings: original.settings as Prisma.InputJsonValue,
        lineItems: {
          create: original.lineItems.map((item) => ({
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
        client: { select: { id: true, name: true, email: true, company: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return apiSuccess({
      id: duplicate.id,
      quoteNumber: duplicate.quoteNumber,
      title: duplicate.title,
      status: duplicate.status,
      client: duplicate.client,
      currency: duplicate.currency,
      subtotal: toNumber(duplicate.subtotal),
      discountType: duplicate.discountType,
      discountValue: duplicate.discountValue ? toNumber(duplicate.discountValue) : null,
      discountAmount: toNumber(duplicate.discountAmount),
      taxTotal: toNumber(duplicate.taxTotal),
      total: toNumber(duplicate.total),
      lineItems: duplicate.lineItems.map((li) => ({
        id: li.id,
        name: li.name,
        description: li.description,
        quantity: toNumber(li.quantity),
        rate: toNumber(li.rate),
        amount: toNumber(li.amount),
        taxRate: li.taxRate ? toNumber(li.taxRate) : null,
        taxAmount: toNumber(li.taxAmount),
      })),
      createdAt: duplicate.createdAt,
    }, 201);
  } catch (err) {
    console.error('Duplicate quote API error:', err);
    return apiError('Internal server error', 500);
  }
}
