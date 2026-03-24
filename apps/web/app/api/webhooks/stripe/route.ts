import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, isStripeEnabled } from '@/lib/services/stripe';
import { processPaymentWebhook, processAccountUpdate, processRefundWebhook } from '@/lib/payments/internal';
import { prisma } from '@quotecraft/database';
import type Stripe from 'stripe';

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  if (!isStripeEnabled()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 501 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // Idempotency check: atomically insert the event record.
    // If a concurrent webhook already inserted it, the unique constraint
    // violation is caught and we skip processing (prevents race condition
    // where two concurrent requests both pass a findUnique check).
    try {
      await prisma.stripeWebhookEvent.create({
        data: { id: event.id, type: event.type },
      });
    } catch (err: unknown) {
      // P2002 = Prisma unique constraint violation — event already processed
      if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
        return NextResponse.json({ received: true, duplicate: true });
      }
      throw err; // Re-throw unexpected errors
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const charge = paymentIntent.latest_charge as Stripe.Charge | string | null;
        const chargeId = typeof charge === 'string' ? charge : charge?.id;
        const receiptUrl = typeof charge === 'object' ? charge?.receipt_url : undefined;

        await processPaymentWebhook(
          paymentIntent.id,
          'succeeded',
          chargeId ?? undefined,
          receiptUrl ?? undefined
        );
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await processPaymentWebhook(paymentIntent.id, 'failed');
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;
        if (paymentIntentId) {
          await processRefundWebhook(paymentIntentId, charge.amount_refunded);
        } else {
          console.warn(`[stripe-webhook] Orphaned refund event ${event.id}: charge.payment_intent is null. Refund processed by Stripe but no matching payment in QuoteCraft.`);
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await processAccountUpdate(account);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Return 200 to prevent Stripe from retrying permanently-failed events
    // Stripe retries 5xx responses, which creates infinite loops for non-transient errors
    return NextResponse.json({ received: true, error: 'Processing failed — will not retry' }, { status: 200 });
  }
}
