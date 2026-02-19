import { NextRequest, NextResponse } from 'next/server';
import { createInvoicePaymentIntent } from '@/lib/payments/actions';

/**
 * POST /api/checkout/invoice/[invoiceId]
 * Create a payment intent for invoice checkout
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { invoiceId } = await params;
    const body = await request.json().catch(() => ({}));
    const amount = body.amount ? Number(body.amount) : undefined;
    const accessToken = body.accessToken as string | undefined;

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    const result = await createInvoicePaymentIntent(invoiceId, amount, accessToken);

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
