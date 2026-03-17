'use server';

import { prisma } from '@quotecraft/database';
import { headers } from 'next/headers';
import type { InvoiceLineItem } from './types';
import { toNumber } from '@/lib/utils';
import { notifyWorkspaceMembers } from '@/lib/notifications/internal';

/**
 * Public invoice data for client portal (subset of full invoice)
 */
export interface PublicInvoiceData {
  id: string;
  invoiceNumber: string;
  status: string;
  title: string;
  issueDate: string;
  dueDate: string;
  isOverdue: boolean;
  daysOverdue: number;
  totals: {
    subtotal: number;
    discountAmount: number;
    taxTotal: number;
    total: number;
    amountPaid: number;
    amountDue: number;
  };
  settings: {
    currency: string;
    showLineItemPrices: boolean;
  };
  notes: string;
  terms: string;
  client: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
  business: {
    name: string;
    email: string | null;
    phone: string | null;
    logoUrl: string | null;
    address: unknown;
  };
  branding: {
    primaryColor: string | null;
    accentColor: string | null;
    logoUrl: string | null;
  } | null;
  lineItems: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    rate: number;
    amount: number;
    taxRate: number | null;
    taxAmount: number;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    processedAt: string | null;
  }>;
  canPay: boolean;
  paymentConfigured: boolean;
}

/**
 * Get request metadata for logging
 */
async function getRequestMetadata() {
  const headersList = await headers();
  return {
    ipAddress:
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      'unknown',
    userAgent: headersList.get('user-agent') || 'unknown',
  };
}

/**
 * Get an invoice by its public access token
 * This does not require authentication
 */
export async function getInvoiceByAccessToken(
  accessToken: string
): Promise<{ success: true; invoice: PublicInvoiceData } | { success: false; error: string }> {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        accessToken,
        deletedAt: null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        workspace: {
          include: {
            businessProfile: true,
            brandingSettings: true,
            paymentSettings: { select: { stripeOnboardingComplete: true } },
          },
        },
        lineItems: {
          orderBy: { sortOrder: 'asc' },
        },
        payments: {
          where: { status: 'completed' },
          orderBy: { processedAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    // Bug #22: Reject access to invoices created more than 365 days ago (general expiration)
    const daysSinceCreated = Math.ceil(
      (new Date().getTime() - new Date(invoice.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreated > 365 && invoice.status !== 'sent' && invoice.status !== 'viewed') {
      return { success: false, error: 'This invoice link has expired' };
    }

    // Reject access to voided invoices
    if (invoice.status === 'voided') {
      return { success: false, error: 'This invoice has been voided' };
    }

    // Reject access to paid invoices older than 90 days (grace period for receipts)
    if (invoice.status === 'paid') {
      const paidAt = invoice.paidAt || invoice.updatedAt;
      const daysSincePaid = Math.ceil(
        (new Date().getTime() - new Date(paidAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePaid > 90) {
        return { success: false, error: 'This invoice link has expired' };
      }
    }

    // Calculate overdue status
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const isOverdue =
      invoice.status !== 'paid' &&
      invoice.status !== 'voided' &&
      dueDate < now;
    const daysOverdue = isOverdue
      ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Parse settings from JSON
    const settings = invoice.settings as Record<string, unknown>;

    // Voided invoices owe nothing regardless of DB value
    const amountDue = invoice.status === 'voided' ? 0 : toNumber(invoice.amountDue);

    // Determine if online payment is possible
    const paymentConfigured = !!invoice.workspace.paymentSettings?.stripeOnboardingComplete;
    const canPay =
      invoice.status !== 'paid' &&
      invoice.status !== 'voided' &&
      amountDue > 0 &&
      paymentConfigured;

    const publicInvoice: PublicInvoiceData = {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: isOverdue ? 'overdue' : invoice.status,
      title: invoice.title || 'Invoice',
      issueDate: invoice.issueDate.toISOString().split('T')[0] ?? '',
      dueDate: invoice.dueDate.toISOString().split('T')[0] ?? '',
      isOverdue,
      daysOverdue,
      totals: {
        subtotal: toNumber(invoice.subtotal),
        discountAmount: toNumber(invoice.discountAmount),
        taxTotal: toNumber(invoice.taxTotal),
        total: toNumber(invoice.total),
        amountPaid: toNumber(invoice.amountPaid),
        amountDue,
      },
      settings: {
        currency: (settings.currency as string) ?? 'USD',
        showLineItemPrices: (settings.showLineItemPrices as boolean) ?? true,
      },
      notes: invoice.notes || '',
      terms: invoice.terms || '',
      client: {
        id: invoice.client.id,
        name: invoice.client.name,
        email: invoice.client.email,
        company: invoice.client.company,
      },
      business: {
        name: invoice.workspace.businessProfile?.businessName || invoice.workspace.name,
        email: invoice.workspace.businessProfile?.email || null,
        phone: invoice.workspace.businessProfile?.phone || null,
        logoUrl: invoice.workspace.businessProfile?.logoUrl || null,
        address: invoice.workspace.businessProfile?.address || null,
      },
      branding: invoice.workspace.brandingSettings
        ? {
            primaryColor: invoice.workspace.brandingSettings.primaryColor,
            accentColor: invoice.workspace.brandingSettings.accentColor,
            logoUrl: invoice.workspace.brandingSettings.logoUrl,
          }
        : null,
      lineItems: invoice.lineItems.map((item: (typeof invoice.lineItems)[number]) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: toNumber(item.quantity),
        rate: toNumber(item.rate),
        amount: toNumber(item.amount),
        taxRate: item.taxRate ? Number(item.taxRate) : null,
        taxAmount: toNumber(item.taxAmount),
      })),
      payments: invoice.payments.map((payment: (typeof invoice.payments)[number]) => ({
        id: payment.id,
        amount: toNumber(payment.amount),
        paymentMethod: payment.paymentMethod,
        processedAt: payment.processedAt?.toISOString() || null,
      })),
      canPay,
      paymentConfigured,
    };

    return { success: true, invoice: publicInvoice };
  } catch (error) {
    console.error('Error fetching invoice by access token:', error);
    return { success: false, error: 'Failed to load invoice' };
  }
}

/**
 * Track when a client views an invoice
 */
export async function trackInvoiceView(accessToken: string): Promise<void> {
  try {
    const { ipAddress, userAgent } = await getRequestMetadata();

    const invoice = await prisma.invoice.findUnique({
      where: { accessToken },
      select: { id: true, status: true, viewedAt: true, workspaceId: true, invoiceNumber: true },
    });

    if (!invoice) return;

    const isFirstView = invoice.viewedAt === null;

    // Update view count and first view timestamp
    await prisma.$transaction([
      prisma.invoice.update({
        where: { accessToken },
        data: {
          viewCount: { increment: 1 },
          ...(isFirstView && { viewedAt: new Date() }),
          ...(invoice.status === 'sent' && { status: 'viewed' }),
        },
      }),
      prisma.invoiceEvent.create({
        data: {
          invoiceId: invoice.id,
          eventType: 'viewed',
          actorType: 'client',
          metadata: {},
          ipAddress,
          userAgent,
        },
      }),
    ]);

    // Notify workspace members on first view
    if (isFirstView) {
      await notifyWorkspaceMembers({
        workspaceId: invoice.workspaceId,
        type: 'invoice_viewed',
        title: `Invoice ${invoice.invoiceNumber} was viewed`,
        message: 'Your client has opened the invoice.',
        entityType: 'invoice',
        entityId: invoice.id,
        link: `/invoices/${invoice.id}`,
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Error tracking invoice view:', error);
    // Don't throw - view tracking should not break the page
  }
}
