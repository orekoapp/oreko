import { NextRequest, NextResponse } from 'next/server';
import { createInvoicePaymentIntent } from '@/lib/payments/internal';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { validateRequestOrigin } from '@/lib/csrf';

/**
 * POST /api/checkout/invoice/[invoiceId]
 * Create a payment intent for invoice checkout
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    // Bug #14: CSRF origin validation
    if (!validateRequestOrigin(request)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }

    // Rate limit: 10 checkout attempts per minute per IP
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = await checkRateLimit(`checkout:${clientIp}`, { limit: 10, windowMs: 60000 });
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const { invoiceId } = await params;
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const accessToken = body.accessToken as string | undefined;

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    // Amount is determined server-side from the invoice record, not client input
    const result = await createInvoicePaymentIntent(invoiceId, accessToken);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
