import type { PaymentProvider, CheckoutParams, CheckoutResult, WebhookResult, RefundResult } from './payment';
import {
  stripe,
  isStripeEnabled,
  constructWebhookEvent,
  createRefund,
} from '@/lib/services/stripe';
import type Stripe from 'stripe';

export class StripeProvider implements PaymentProvider {
  name = 'stripe';

  isEnabled(): boolean {
    return isStripeEnabled();
  }

  async createCheckoutSession(params: CheckoutParams): Promise<CheckoutResult> {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: params.description,
            },
            unit_amount: Math.round(params.amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: params.customerEmail,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        invoiceId: params.invoiceId,
      },
    });

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  }

  async processWebhook(request: Request): Promise<WebhookResult> {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('Missing Stripe signature');
    }

    const event = constructWebhookEvent(body, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        return {
          eventType: 'payment.succeeded',
          invoiceId: pi.metadata.invoiceId,
          paymentId: pi.id,
          amount: pi.amount / 100,
        };
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        return {
          eventType: 'payment.failed',
          invoiceId: pi.metadata.invoiceId,
          paymentId: pi.id,
        };
      }
      default:
        return { eventType: event.type };
    }
  }

  async refund(paymentId: string, amount?: number): Promise<RefundResult> {
    const refund = await createRefund({
      paymentIntentId: paymentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    if (!refund) {
      throw new Error('Failed to create refund');
    }

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status || 'pending',
    };
  }
}
