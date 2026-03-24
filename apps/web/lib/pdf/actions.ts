'use server';

import { prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { toNumber } from '@/lib/utils';
import type { QuotePdfData, InvoicePdfData } from './types';

/**
 * Get quote data for PDF generation (authenticated)
 */
export async function getQuotePdfData(quoteId: string): Promise<QuotePdfData | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const quote = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      workspaceId,
      deletedAt: null,
    },
    include: {
      client: true,
      workspace: {
        include: {
          businessProfile: true,
          brandingSettings: true,
        },
      },
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!quote) {
    return null;
  }

  const settings = quote.settings as Record<string, unknown>;
  const signatureData = quote.signatureData as Record<string, unknown> | null;

  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    title: quote.title || 'Quote',
    status: quote.status,
    issueDate: quote.issueDate.toISOString().split('T')[0] ?? '',
    expirationDate: quote.expirationDate?.toISOString().split('T')[0] ?? null,
    totals: {
      subtotal: toNumber(quote.subtotal),
      discountAmount: toNumber(quote.discountAmount),
      taxTotal: toNumber(quote.taxTotal),
      total: toNumber(quote.total),
    },
    notes: quote.notes,
    terms: quote.terms,
    client: {
      name: quote.client.name,
      email: quote.client.email,
      company: quote.client.company,
      phone: quote.client.phone,
      address: quote.client.address,
    },
    business: {
      name: quote.workspace.businessProfile?.businessName || quote.workspace.name,
      email: quote.workspace.businessProfile?.email || null,
      phone: quote.workspace.businessProfile?.phone || null,
      logoUrl: quote.workspace.businessProfile?.logoUrl || null,
      address: quote.workspace.businessProfile?.address || null,
    },
    branding: quote.workspace.brandingSettings
      ? {
          primaryColor: quote.workspace.brandingSettings.primaryColor,
          accentColor: quote.workspace.brandingSettings.accentColor,
        }
      : null,
    lineItems: quote.lineItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: toNumber(item.quantity),
      rate: toNumber(item.rate),
      amount: toNumber(item.amount),
      taxRate: item.taxRate ? Number(item.taxRate) : null,
      taxAmount: toNumber(item.taxAmount),
    })),
    currency: quote.currency || (settings?.currency as string) || 'USD',
    signature: signatureData
      ? {
          signerName: signatureData.signerName as string,
          signedAt: signatureData.signedAt as string,
          data: signatureData.data as string,
        }
      : null,
  };
}

/**
 * Get quote data for PDF generation by access token (public)
 */
export async function getQuotePdfDataByToken(accessToken: string): Promise<QuotePdfData | null> {
  // MEDIUM #30: Rate limit public PDF endpoints to prevent abuse
  const { checkRateLimit } = await import('@/lib/rate-limit');
  const rateLimitResult = await checkRateLimit(`pdf-quote:${accessToken}`, { limit: 20, windowMs: 60000 });
  if (rateLimitResult.limited) {
    return null;
  }

  const quote = await prisma.quote.findFirst({
    where: {
      accessToken,
      deletedAt: null,
    },
    include: {
      client: true,
      workspace: {
        include: {
          businessProfile: true,
          brandingSettings: true,
        },
      },
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!quote) {
    return null;
  }

  // HIGH #16: Reject voided/expired quotes from public PDF access
  if (quote.status === 'voided' || quote.status === 'expired') {
    return null;
  }

  const settings = quote.settings as Record<string, unknown>;
  const signatureData = quote.signatureData as Record<string, unknown> | null;

  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    title: quote.title || 'Quote',
    status: quote.status,
    issueDate: quote.issueDate.toISOString().split('T')[0] ?? '',
    expirationDate: quote.expirationDate?.toISOString().split('T')[0] ?? null,
    totals: {
      subtotal: toNumber(quote.subtotal),
      discountAmount: toNumber(quote.discountAmount),
      taxTotal: toNumber(quote.taxTotal),
      total: toNumber(quote.total),
    },
    notes: quote.notes,
    terms: quote.terms,
    client: {
      name: quote.client.name,
      email: quote.client.email,
      company: quote.client.company,
      phone: quote.client.phone,
      address: quote.client.address,
    },
    business: {
      name: quote.workspace.businessProfile?.businessName || quote.workspace.name,
      email: quote.workspace.businessProfile?.email || null,
      phone: quote.workspace.businessProfile?.phone || null,
      logoUrl: quote.workspace.businessProfile?.logoUrl || null,
      address: quote.workspace.businessProfile?.address || null,
    },
    branding: quote.workspace.brandingSettings
      ? {
          primaryColor: quote.workspace.brandingSettings.primaryColor,
          accentColor: quote.workspace.brandingSettings.accentColor,
        }
      : null,
    lineItems: quote.lineItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: toNumber(item.quantity),
      rate: toNumber(item.rate),
      amount: toNumber(item.amount),
      taxRate: item.taxRate ? Number(item.taxRate) : null,
      taxAmount: toNumber(item.taxAmount),
    })),
    currency: quote.currency || (settings?.currency as string) || 'USD',
    signature: signatureData
      ? {
          signerName: signatureData.signerName as string,
          signedAt: signatureData.signedAt as string,
          data: signatureData.data as string,
        }
      : null,
  };
}

/**
 * Get invoice data for PDF generation (authenticated)
 */
export async function getInvoicePdfData(invoiceId: string): Promise<InvoicePdfData | null> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId,
      deletedAt: null,
    },
    include: {
      client: true,
      workspace: {
        include: {
          businessProfile: true,
          brandingSettings: true,
        },
      },
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!invoice) {
    return null;
  }

  const settings = invoice.settings as Record<string, unknown>;

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    title: invoice.title || 'Invoice',
    status: invoice.status,
    issueDate: invoice.issueDate.toISOString().split('T')[0] ?? '',
    dueDate: invoice.dueDate.toISOString().split('T')[0] ?? '',
    totals: {
      subtotal: toNumber(invoice.subtotal),
      discountAmount: toNumber(invoice.discountAmount),
      taxTotal: toNumber(invoice.taxTotal),
      total: toNumber(invoice.total),
      amountPaid: toNumber(invoice.amountPaid),
      amountDue: toNumber(invoice.amountDue),
    },
    notes: invoice.notes,
    terms: invoice.terms,
    paymentTerms: (settings?.paymentTerms as string) ?? null,
    client: {
      name: invoice.client.name,
      email: invoice.client.email,
      company: invoice.client.company,
      phone: invoice.client.phone,
      address: invoice.client.address,
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
        }
      : null,
    lineItems: invoice.lineItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: toNumber(item.quantity),
      rate: toNumber(item.rate),
      amount: toNumber(item.amount),
      taxRate: item.taxRate ? Number(item.taxRate) : null,
      taxAmount: toNumber(item.taxAmount),
    })),
    currency: invoice.currency || (settings?.currency as string) || 'USD',
    payments: invoice.payments.map((payment) => ({
      id: payment.id,
      amount: toNumber(payment.amount),
      method: payment.paymentMethod,
      paidAt: payment.processedAt?.toISOString() ?? payment.createdAt.toISOString(),
      reference: payment.referenceNumber,
    })),
  };
}

/**
 * Get invoice data for PDF generation by access token (public)
 */
export async function getInvoicePdfDataByToken(accessToken: string): Promise<InvoicePdfData | null> {
  // MEDIUM #30: Rate limit public PDF endpoints to prevent abuse
  const { checkRateLimit } = await import('@/lib/rate-limit');
  const rateLimitResult = await checkRateLimit(`pdf-invoice:${accessToken}`, { limit: 20, windowMs: 60000 });
  if (rateLimitResult.limited) {
    return null;
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      accessToken,
      deletedAt: null,
    },
    include: {
      client: true,
      workspace: {
        include: {
          businessProfile: true,
          brandingSettings: true,
        },
      },
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!invoice) {
    return null;
  }

  // HIGH #16: Reject voided invoices from public PDF access
  if (invoice.status === 'voided') {
    return null;
  }

  const settings = invoice.settings as Record<string, unknown>;

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    title: invoice.title || 'Invoice',
    status: invoice.status,
    issueDate: invoice.issueDate.toISOString().split('T')[0] ?? '',
    dueDate: invoice.dueDate.toISOString().split('T')[0] ?? '',
    totals: {
      subtotal: toNumber(invoice.subtotal),
      discountAmount: toNumber(invoice.discountAmount),
      taxTotal: toNumber(invoice.taxTotal),
      total: toNumber(invoice.total),
      amountPaid: toNumber(invoice.amountPaid),
      amountDue: toNumber(invoice.amountDue),
    },
    notes: invoice.notes,
    terms: invoice.terms,
    paymentTerms: (settings?.paymentTerms as string) ?? null,
    client: {
      name: invoice.client.name,
      email: invoice.client.email,
      company: invoice.client.company,
      phone: invoice.client.phone,
      address: invoice.client.address,
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
        }
      : null,
    lineItems: invoice.lineItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: toNumber(item.quantity),
      rate: toNumber(item.rate),
      amount: toNumber(item.amount),
      taxRate: item.taxRate ? Number(item.taxRate) : null,
      taxAmount: toNumber(item.taxAmount),
    })),
    currency: invoice.currency || (settings?.currency as string) || 'USD',
    payments: invoice.payments.map((payment) => ({
      id: payment.id,
      amount: toNumber(payment.amount),
      method: payment.paymentMethod,
      paidAt: payment.processedAt?.toISOString() ?? payment.createdAt.toISOString(),
      reference: payment.referenceNumber,
    })),
  };
}
