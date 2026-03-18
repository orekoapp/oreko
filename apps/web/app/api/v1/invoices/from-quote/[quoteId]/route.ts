import { NextRequest } from 'next/server';
import { prisma } from '@quotecraft/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';
import { toNumber } from '@/lib/utils';
import { createInvoiceFromQuoteInternal } from '@/lib/invoices/internal';

interface RouteParams {
  params: Promise<{ quoteId: string }>;
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

// POST /api/v1/invoices/from-quote/:quoteId — Create an invoice from an accepted quote
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateApiRequest(request);
    if ('error' in auth) return auth.error;
    const { workspaceId } = auth.context;
    const { quoteId } = await params;

    // Parse optional body for dueDays
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const { dueDays } = body as { dueDays?: number };

    // Validate dueDays if provided
    if (dueDays !== undefined) {
      if (!Number.isFinite(dueDays) || dueDays < 0 || dueDays > 365) {
        return apiError('dueDays must be a number between 0 and 365', 400);
      }
    }

    // Use the internal function that doesn't depend on session auth
    const result = await createInvoiceFromQuoteInternal(quoteId, workspaceId, {
      dueDays: dueDays ?? 30,
    });

    if (!result.success) {
      const status = result.error === 'Quote not found' ? 404 : 400;
      return apiError(result.error || 'Failed to create invoice from quote', status);
    }

    // Fetch the full invoice for the response
    const invoice = await prisma.invoice.findUnique({
      where: { id: result.invoice!.id },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!invoice) return apiError('Invoice created but not found', 500);

    return apiSuccess(formatInvoice(invoice), 201);
  } catch (err) {
    console.error('Create invoice from quote API error:', err);
    return apiError('Internal server error', 500);
  }
}
