'use server';

import { prisma } from '@quotecraft/database';
import { revalidatePath } from 'next/cache';
import {
  stripe,
  isStripeEnabled,
  createRefund,
} from '@/lib/services/stripe';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { toNumber } from '@/lib/utils';
import type {
  PaymentListItem,
  PaymentDetail,
  PaymentSettingsData,
  StripeOnboardingResult,
} from './types';

/**
 * Bug #85: Sanitize Stripe errors — never expose raw Stripe messages to end users.
 * Returns a user-friendly message while logging the full error server-side.
 */
function sanitizeStripeError(error: unknown): string {
  if (error && typeof error === 'object' && 'type' in error) {
    const stripeError = error as { type: string; code?: string };
    switch (stripeError.type) {
      case 'StripeCardError':
        return 'The payment card was declined. Please try a different payment method.';
      case 'StripeRateLimitError':
        return 'Too many requests. Please try again in a moment.';
      case 'StripeInvalidRequestError':
        return 'The payment request was invalid. Please contact support.';
      case 'StripeAuthenticationError':
        return 'Payment service configuration error. Please contact the site administrator.';
      case 'StripeConnectionError':
        return 'Unable to connect to payment service. Please try again.';
      default:
        return 'A payment error occurred. Please try again or contact support.';
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get payment settings for workspace
 */
export async function getPaymentSettings(): Promise<PaymentSettingsData | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const settings = await prisma.paymentSettings.findUnique({
    where: { workspaceId },
  });

  if (!settings) {
    return {
      stripeAccountId: null,
      stripeAccountStatus: null,
      stripeOnboardingComplete: false,
      enabledPaymentMethods: ['card'],
      passProcessingFees: false,
      defaultPaymentTerms: 30,
    };
  }

  return {
    stripeAccountId: settings.stripeAccountId,
    stripeAccountStatus: settings.stripeAccountStatus,
    stripeOnboardingComplete: settings.stripeOnboardingComplete,
    enabledPaymentMethods: settings.enabledPaymentMethods as string[],
    passProcessingFees: settings.passProcessingFees,
    defaultPaymentTerms: settings.defaultPaymentTerms,
  };
}

/**
 * Update payment settings
 */
export async function updatePaymentSettings(data: {
  enabledPaymentMethods?: string[];
  passProcessingFees?: boolean;
  defaultPaymentTerms?: number;
}): Promise<{ success: boolean; error?: string }> {
  const { workspaceId } = await getCurrentUserWorkspace();

  try {
    await prisma.paymentSettings.upsert({
      where: { workspaceId },
      update: {
        ...(data.enabledPaymentMethods && { enabledPaymentMethods: data.enabledPaymentMethods }),
        ...(data.passProcessingFees !== undefined && { passProcessingFees: data.passProcessingFees }),
        ...(data.defaultPaymentTerms !== undefined && { defaultPaymentTerms: data.defaultPaymentTerms }),
      },
      create: {
        workspaceId,
        enabledPaymentMethods: data.enabledPaymentMethods ?? ['card'],
        passProcessingFees: data.passProcessingFees ?? false,
        defaultPaymentTerms: data.defaultPaymentTerms ?? 30,
      },
    });

    revalidatePath('/settings/payments');
    return { success: true };
  } catch (error) {
    console.error('Failed to update payment settings:', error);
    return { success: false, error: sanitizeStripeError(error) };
  }
}

/**
 * Create Stripe Connect onboarding link
 * Bug #10: Support returnTo param so onboarding wizard returns to /onboarding
 */
export async function createStripeOnboardingLink(options?: {
  returnTo?: 'settings' | 'onboarding';
}): Promise<StripeOnboardingResult> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Stripe is not configured' };
  }

  const { workspaceId } = await getCurrentUserWorkspace();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const returnPath = options?.returnTo === 'onboarding'
    ? '/onboarding?stripe=success'
    : '/settings/payments?success=true';
  const refreshPath = options?.returnTo === 'onboarding'
    ? '/onboarding?stripe=refresh'
    : '/settings/payments?refresh=true';

  try {
    // Get or create payment settings
    let settings = await prisma.paymentSettings.findUnique({
      where: { workspaceId },
    });

    let accountId = settings?.stripeAccountId;

    // Create a new Stripe Connect account if one doesn't exist
    if (!accountId) {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { businessProfile: true },
      });

      const account = await stripe.accounts.create({
        type: 'standard',
        country: 'US',
        email: workspace?.businessProfile?.email || undefined,
        business_profile: {
          name: workspace?.businessProfile?.businessName || workspace?.name,
        },
        metadata: {
          workspaceId,
        },
      });

      accountId = account.id;

      // Save the account ID
      await prisma.paymentSettings.upsert({
        where: { workspaceId },
        update: { stripeAccountId: accountId },
        create: {
          workspaceId,
          stripeAccountId: accountId,
        },
      });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}${refreshPath}`,
      return_url: `${baseUrl}${returnPath}`,
      type: 'account_onboarding',
    });

    return { success: true, url: accountLink.url };
  } catch (error) {
    console.error('Failed to create Stripe onboarding link:', error);
    return { success: false, error: sanitizeStripeError(error) };
  }
}

/**
 * Check Stripe Connect account status
 */
export async function checkStripeAccountStatus(): Promise<{
  connected: boolean;
  status: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}> {
  if (!stripe || !isStripeEnabled()) {
    return { connected: false, status: null, chargesEnabled: false, payoutsEnabled: false };
  }

  const { workspaceId } = await getCurrentUserWorkspace();

  try {
    const settings = await prisma.paymentSettings.findUnique({
      where: { workspaceId },
    });

    if (!settings?.stripeAccountId) {
      return { connected: false, status: null, chargesEnabled: false, payoutsEnabled: false };
    }

    const account = await stripe.accounts.retrieve(settings.stripeAccountId);

    // Update status in database
    const status = account.details_submitted ? 'active' : 'pending';
    const onboardingComplete = account.charges_enabled && account.payouts_enabled;

    await prisma.paymentSettings.update({
      where: { workspaceId },
      data: {
        stripeAccountStatus: status,
        stripeOnboardingComplete: onboardingComplete,
        chargesEnabled: account.charges_enabled ?? false,
        payoutsEnabled: account.payouts_enabled ?? false,
      },
    });

    return {
      connected: true,
      status,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
    };
  } catch (error) {
    console.error('Failed to check Stripe account status:', error);
    return { connected: false, status: 'error', chargesEnabled: false, payoutsEnabled: false };
  }
}

// createInvoicePaymentIntent moved to ./internal.ts (not a server action)

/**
 * Get payments for workspace
 */
export async function getPayments(filter?: {
  invoiceId?: string;
  status?: string;
  limit?: number;
}): Promise<PaymentListItem[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const payments = await prisma.payment.findMany({
    where: {
      invoice: {
        workspaceId,
        ...(filter?.invoiceId && { id: filter.invoiceId }),
      },
      ...(filter?.status && { status: filter.status }),
    },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          client: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: filter?.limit ?? 50,
  });

  return payments.map((p) => ({
    id: p.id,
    invoiceId: p.invoiceId,
    amount: toNumber(p.amount),
    currency: p.currency,
    paymentMethod: p.paymentMethod as PaymentListItem['paymentMethod'],
    status: p.status as PaymentListItem['status'],
    referenceNumber: p.referenceNumber,
    stripePaymentIntentId: p.stripePaymentIntentId,
    processedAt: p.processedAt,
    createdAt: p.createdAt,
    invoice: {
      invoiceNumber: p.invoice.invoiceNumber,
      client: {
        name: p.invoice.client.name,
        company: p.invoice.client.company,
      },
    },
  }));
}

/**
 * Get payment by ID
 */
export async function getPaymentById(paymentId: string): Promise<PaymentDetail | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      invoice: { workspaceId },
    },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          client: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    return null;
  }

  return {
    id: payment.id,
    invoiceId: payment.invoiceId,
    amount: toNumber(payment.amount),
    currency: payment.currency,
    paymentMethod: payment.paymentMethod as PaymentDetail['paymentMethod'],
    status: payment.status as PaymentDetail['status'],
    referenceNumber: payment.referenceNumber,
    stripePaymentIntentId: payment.stripePaymentIntentId,
    stripeChargeId: payment.stripeChargeId,
    stripeReceiptUrl: payment.stripeReceiptUrl,
    processedAt: payment.processedAt,
    createdAt: payment.createdAt,
    notes: payment.notes,
    refundedAt: payment.refundedAt,
    refundAmount: payment.refundAmount ? Number(payment.refundAmount) : null,
    refundReason: payment.refundReason,
    invoice: {
      invoiceNumber: payment.invoice.invoiceNumber,
      client: {
        name: payment.invoice.client.name,
        company: payment.invoice.client.company,
      },
    },
  };
}

/**
 * Refund a payment via Stripe
 */
export async function refundPayment(
  paymentId: string,
  params?: { amount?: number; reason?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Stripe is not configured' };
  }

  const { workspaceId } = await getCurrentUserWorkspace();

  try {
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        status: 'completed',
        invoice: { workspaceId },
      },
      include: { invoice: true },
    });

    if (!payment) {
      return { success: false, error: 'Completed payment not found' };
    }

    if (!payment.stripePaymentIntentId) {
      return { success: false, error: 'No Stripe payment intent linked to this payment' };
    }

    // Amount in cents for Stripe (DB stores dollars)
    const refundAmountCents = params?.amount
      ? Math.round(params.amount * 100)
      : undefined; // undefined = full refund

    await createRefund({
      paymentIntentId: payment.stripePaymentIntentId,
      amount: refundAmountCents,
      reason: 'requested_by_customer',
    });

    // The actual DB update happens via the charge.refunded webhook (processRefundWebhook)
    // but we can revalidate proactively
    revalidatePath('/invoices');
    revalidatePath(`/invoices/${payment.invoiceId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to refund payment:', error);
    return { success: false, error: sanitizeStripeError(error) };
  }
}
