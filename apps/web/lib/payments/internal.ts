/**
 * Internal payment operations that should NOT be exposed as server actions.
 * This file intentionally does NOT have 'use server' directive.
 *
 * These functions are called from webhook handlers and API routes only.
 */

import { prisma } from '@quotecraft/database';
import {
  stripe,
  isStripeEnabled,
  createPaymentIntent,
  getOrCreateCustomer,
} from '@/lib/services/stripe';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import type { PaymentIntentResult } from './types';

/**
 * Create payment intent for invoice (called from checkout API route).
 * Amount is always determined server-side from the invoice record.
 */
export async function createInvoicePaymentIntent(
  invoiceId: string,
  accessToken?: string
): Promise<PaymentIntentResult> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Stripe payments are not available' };
  }

  try {
    // Use accessToken for public checkout (unauthenticated), or workspace-scoped query for authenticated users
    let invoice;
    if (accessToken) {
      invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, accessToken, deletedAt: null },
        include: {
          client: true,
          workspace: { include: { paymentSettings: true } },
        },
      });
    } else {
      // Authenticated path: require workspace scope
      const { workspaceId } = await getCurrentUserWorkspace();
      invoice = await prisma.invoice.findFirst({
        where: { id: invoiceId, workspaceId, deletedAt: null },
        include: {
          client: true,
          workspace: { include: { paymentSettings: true } },
        },
      });
    }

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    if (invoice.status === 'paid') {
      return { success: false, error: 'Invoice is already paid' };
    }

    if (invoice.status === 'voided') {
      return { success: false, error: 'Invoice has been voided' };
    }

    // Verify workspace has a connected Stripe account with charges enabled
    const paymentSettings = invoice.workspace.paymentSettings;
    if (!paymentSettings?.stripeAccountId) {
      return { success: false, error: 'Payment processing is not configured. Please complete Stripe onboarding.' };
    }
    if (!paymentSettings.stripeOnboardingComplete) {
      return { success: false, error: 'Stripe account setup is incomplete. Please complete onboarding first.' };
    }

    const amountToPay = Number(invoice.amountDue);
    if (amountToPay <= 0) {
      return { success: false, error: 'No amount due on this invoice' };
    }

    // Check for existing pending payment intent to prevent duplicates
    const existingPayment = await prisma.payment.findFirst({
      where: {
        invoiceId: invoice.id,
        status: 'pending',
        stripePaymentIntentId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingPayment?.stripePaymentIntentId) {
      // Retrieve the existing payment intent from Stripe to get a fresh client secret
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(
          existingPayment.stripePaymentIntentId
        );
        // If the intent is still usable, verify amount matches current amountDue
        if (existingIntent.status === 'requires_payment_method' || existingIntent.status === 'requires_confirmation') {
          const expectedAmountCents = Math.round(amountToPay * 100);
          if (existingIntent.amount === expectedAmountCents) {
            return {
              success: true,
              clientSecret: existingIntent.client_secret ?? undefined,
              paymentIntentId: existingIntent.id,
            };
          }
          // Amount changed — cancel stale intent and create a fresh one
          await stripe.paymentIntents.cancel(existingIntent.id);
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: { status: 'failed' },
          });
        }
        // If intent is in a terminal state, clean up the stale record
        if (['canceled', 'succeeded'].includes(existingIntent.status)) {
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: { status: existingIntent.status === 'succeeded' ? 'completed' : 'failed' },
          });
        }
      } catch {
        // Stripe retrieval failed — mark stale and create a new one
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: { status: 'failed' },
        });
      }
    }

    // Get currency from invoice settings
    const settings = invoice.settings as Record<string, unknown>;
    const currency = (settings?.currency as string) ?? 'USD';

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer({
      email: invoice.client.email,
      name: invoice.client.company || invoice.client.name,
      metadata: {
        clientId: invoice.client.id,
        workspaceId: invoice.workspaceId,
      },
    });

    // Create payment intent (route funds to connected Stripe account)
    const paymentIntent = await createPaymentIntent({
      amount: Math.round(amountToPay * 100), // Convert to cents
      currency,
      invoiceId: invoice.id,
      customerId: customer?.id,
      stripeAccountId: paymentSettings.stripeAccountId,
      metadata: {
        workspaceId: invoice.workspaceId,
        invoiceNumber: invoice.invoiceNumber,
        clientId: invoice.clientId,
      },
    });

    if (!paymentIntent) {
      return { success: false, error: 'Failed to create payment intent' };
    }

    // Create pending payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: amountToPay,
        currency,
        paymentMethod: 'card',
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret ?? undefined,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Failed to create payment intent:', error);
    return { success: false, error: 'Failed to create payment' };
  }
}

/**
 * Process Stripe Connect account.updated webhook.
 * Updates local PaymentSettings when Stripe notifies us of account changes.
 *
 * NOT a server action - only callable from server-side webhook handler.
 */
export async function processAccountUpdate(account: {
  id: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  details_submitted?: boolean;
  requirements?: {
    currently_due?: string[] | null;
    past_due?: string[] | null;
  } | null;
}): Promise<void> {
  const paymentSettings = await prisma.paymentSettings.findFirst({
    where: { stripeAccountId: account.id },
  });

  if (!paymentSettings) {
    console.warn('No workspace found for Stripe account:', account.id);
    return;
  }

  const chargesEnabled = account.charges_enabled ?? false;
  const payoutsEnabled = account.payouts_enabled ?? false;
  const onboardingComplete = chargesEnabled && payoutsEnabled;

  let status = 'pending';
  if (onboardingComplete) {
    status = 'active';
  } else if (account.requirements?.past_due?.length) {
    status = 'past_due';
  } else if (account.requirements?.currently_due?.length) {
    status = 'incomplete';
  }

  await prisma.paymentSettings.update({
    where: { workspaceId: paymentSettings.workspaceId },
    data: {
      stripeAccountStatus: status,
      stripeOnboardingComplete: onboardingComplete,
      chargesEnabled,
      payoutsEnabled,
    },
  });
}

/**
 * Process Stripe charge.refunded webhook.
 *
 * NOT a server action - only callable from server-side webhook handler.
 */
export async function processRefundWebhook(
  paymentIntentId: string,
  amountRefundedCents: number
): Promise<{ success: boolean }> {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId, status: 'completed' },
      include: { invoice: true },
    });

    if (!payment) {
      console.warn('Completed payment not found for refund:', paymentIntentId);
      return { success: false };
    }

    const refundAmount = amountRefundedCents / 100; // Convert cents to dollars
    const isFullRefund = refundAmount >= Number(payment.amount);

    await prisma.$transaction(async (tx) => {
      // Update payment with refund info
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isFullRefund ? 'refunded' : 'completed',
          refundedAt: new Date(),
          refundAmount,
          refundReason: 'Refunded via Stripe',
        },
      });

      // Recalculate invoice amounts
      const invoiceTotal = Number(payment.invoice.total);
      const currentAmountPaid = Number(payment.invoice.amountPaid);
      const newAmountPaid = Math.max(0, currentAmountPaid - refundAmount);
      const newAmountDue = Math.max(0, invoiceTotal - newAmountPaid);

      let newStatus = payment.invoice.status;
      if (newAmountPaid <= 0) {
        newStatus = 'sent'; // Fully refunded, back to sent
      } else if (newAmountPaid < invoiceTotal) {
        newStatus = 'partial';
      }

      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status: newStatus,
          ...(newAmountPaid <= 0 && { paidAt: null }),
        },
      });

      // Create audit event
      await tx.invoiceEvent.create({
        data: {
          invoiceId: payment.invoiceId,
          eventType: 'payment_refunded',
          actorType: 'system',
          metadata: {
            paymentId: payment.id,
            refundAmount,
            isFullRefund,
          },
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to process refund webhook:', error);
    return { success: false };
  }
}

/**
 * Process Stripe webhook for payment completion.
 *
 * NOT a server action - only callable from server-side webhook handler.
 */
export async function processPaymentWebhook(
  paymentIntentId: string,
  status: 'succeeded' | 'failed',
  chargeId?: string,
  receiptUrl?: string
): Promise<{ success: boolean }> {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
      include: { invoice: true },
    });

    if (!payment) {
      console.warn('Payment not found for payment intent:', paymentIntentId);
      return { success: false };
    }

    // Prevent duplicate webhook processing - skip if already completed or failed
    if (payment.status === 'completed' || payment.status === 'failed') {
      console.info('Payment already processed, skipping duplicate webhook:', paymentIntentId);
      return { success: true };
    }

    if (status === 'succeeded') {
      const paymentAmount = Number(payment.amount);
      const total = Number(payment.invoice.total);

      // Use interactive transaction with serializable isolation to prevent
      // concurrent webhooks from double-crediting amountPaid
      await prisma.$transaction(async (tx) => {
        // Mark payment as completed
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            processedAt: new Date(),
            stripeChargeId: chargeId,
            stripeReceiptUrl: receiptUrl,
          },
        });

        // Atomically increment amountPaid and recalculate amountDue
        const updatedInvoice = await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            amountPaid: { increment: paymentAmount },
          },
        });

        const newAmountPaid = Number(updatedInvoice.amountPaid);
        const newAmountDue = Math.max(0, total - newAmountPaid);
        const newInvoiceStatus = newAmountPaid >= total ? 'paid' : 'partial';

        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            amountDue: newAmountDue,
            status: newInvoiceStatus,
            ...(newInvoiceStatus === 'paid' && { paidAt: new Date() }),
          },
        });

        // Create event
        await tx.invoiceEvent.create({
          data: {
            invoiceId: payment.invoiceId,
            eventType: 'payment_received',
            actorType: 'system',
            metadata: {
              paymentId: payment.id,
              amount: paymentAmount,
              method: 'stripe',
            },
          },
        });
      });
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to process payment webhook:', error);
    return { success: false };
  }
}
