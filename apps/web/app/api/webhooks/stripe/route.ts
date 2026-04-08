import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, isStripeEnabled } from '@/lib/services/stripe';
import { processPaymentWebhook, processAccountUpdate, processRefundWebhook } from '@/lib/payments/internal';
import { prisma } from '@oreko/database';
import type Stripe from 'stripe';
import { logger } from '@/lib/logger';

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
    logger.error({ err: error }, 'Webhook signature verification failed');
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
          logger.warn({ eventId: event.id }, '[stripe-webhook] Orphaned refund event: charge.payment_intent is null. Refund processed by Stripe but no matching payment in Oreko.');
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await processAccountUpdate(account);
        break;
      }

      default:
        logger.debug({ eventType: event.type }, 'Unhandled Stripe event type');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error({ err: error }, 'Error processing webhook');
    // Permanent business logic errors (not found, invalid data) → 200 so Stripe stops retrying
    const message = error instanceof Error ? error.message : '';
    const isPermanent = message.includes('not found') || message.includes('invalid') || message.includes('already');
    if (isPermanent) {
      return NextResponse.json({ received: true, error: 'Permanent failure — will not retry' }, { status: 200 });
    }
    // Transient errors (DB timeout, network) → 500 so Stripe retries with exponential backoff
    // Idempotency guard prevents duplicate processing on successful retry
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
