'use server';

import { prisma } from '@quotecraft/database';
import { revalidatePath } from 'next/cache';
import {
  stripe,
  isStripeEnabled,
  createPaymentIntent,
  getOrCreateCustomer,
} from '@/lib/services/stripe';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import type {
  PaymentListItem,
  PaymentDetail,
  PaymentSettingsData,
  PaymentIntentResult,
  StripeOnboardingResult,
} from './types';

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
    return { success: false, error: 'Failed to update payment settings' };
  }
}

/**
 * Create Stripe Connect onboarding link
 */
export async function createStripeOnboardingLink(): Promise<StripeOnboardingResult> {
  if (!stripe || !isStripeEnabled()) {
    return { success: false, error: 'Stripe is not configured' };
  }

  const { workspaceId } = await getCurrentUserWorkspace();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
      refresh_url: `${baseUrl}/settings/payments?refresh=true`,
      return_url: `${baseUrl}/settings/payments?success=true`,
      type: 'account_onboarding',
    });

    return { success: true, url: accountLink.url };
  } catch (error) {
    console.error('Failed to create Stripe onboarding link:', error);
    return { success: false, error: 'Failed to create onboarding link' };
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

/**
 * Create payment intent for invoice (client-facing)
 */
export async function createInvoicePaymentIntent(
  invoiceId: string,
  amount?: number,
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

    const invoiceAmountDue = Number(invoice.amountDue);
    const amountToPay = amount ?? invoiceAmountDue;
    if (amountToPay <= 0) {
      return { success: false, error: 'Invalid payment amount' };
    }
    // Prevent underpayment attacks - amount must not exceed what's owed
    if (amountToPay > invoiceAmountDue) {
      return { success: false, error: 'Payment amount exceeds amount due' };
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

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: Math.round(amountToPay * 100), // Convert to cents
      currency,
      invoiceId: invoice.id,
      customerId: customer?.id,
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
    amount: Number(p.amount),
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
    amount: Number(payment.amount),
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
 * Process Stripe webhook for payment completion
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
      const currentAmountPaid = Number(payment.invoice.amountPaid);
      const newAmountPaid = currentAmountPaid + Number(payment.amount);
      const total = Number(payment.invoice.total);
      const newAmountDue = total - newAmountPaid;

      // Determine new status
      const newInvoiceStatus = newAmountPaid >= total ? 'paid' : 'partial';

      await prisma.$transaction([
        // Update payment
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'completed',
            processedAt: new Date(),
            stripeChargeId: chargeId,
            stripeReceiptUrl: receiptUrl,
          },
        }),
        // Update invoice
        prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            amountPaid: newAmountPaid,
            amountDue: Math.max(0, newAmountDue),
            status: newInvoiceStatus,
            ...(newInvoiceStatus === 'paid' && { paidAt: new Date() }),
          },
        }),
        // Create event
        prisma.invoiceEvent.create({
          data: {
            invoiceId: payment.invoiceId,
            eventType: 'payment_received',
            actorType: 'system',
            metadata: {
              paymentId: payment.id,
              amount: Number(payment.amount),
              method: 'stripe',
            },
          },
        }),
      ]);
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
