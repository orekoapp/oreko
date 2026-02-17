'use server';

import { prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
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
      subtotal: Number(quote.subtotal),
      discountAmount: Number(quote.discountAmount),
      taxTotal: Number(quote.taxTotal),
      total: Number(quote.total),
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
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount),
      taxRate: item.taxRate ? Number(item.taxRate) : null,
      taxAmount: Number(item.taxAmount),
    })),
    currency: (settings?.currency as string) ?? 'USD',
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
      subtotal: Number(quote.subtotal),
      discountAmount: Number(quote.discountAmount),
      taxTotal: Number(quote.taxTotal),
      total: Number(quote.total),
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
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount),
      taxRate: item.taxRate ? Number(item.taxRate) : null,
      taxAmount: Number(item.taxAmount),
    })),
    currency: (settings?.currency as string) ?? 'USD',
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
      subtotal: Number(invoice.subtotal),
      discountAmount: Number(invoice.discountAmount),
      taxTotal: Number(invoice.taxTotal),
      total: Number(invoice.total),
      amountPaid: Number(invoice.amountPaid),
      amountDue: Number(invoice.amountDue),
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
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount),
      taxRate: item.taxRate ? Number(item.taxRate) : null,
      taxAmount: Number(item.taxAmount),
    })),
    currency: (settings?.currency as string) ?? 'USD',
    payments: invoice.payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
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

  const settings = invoice.settings as Record<string, unknown>;

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    title: invoice.title || 'Invoice',
    status: invoice.status,
    issueDate: invoice.issueDate.toISOString().split('T')[0] ?? '',
    dueDate: invoice.dueDate.toISOString().split('T')[0] ?? '',
    totals: {
      subtotal: Number(invoice.subtotal),
      discountAmount: Number(invoice.discountAmount),
      taxTotal: Number(invoice.taxTotal),
      total: Number(invoice.total),
      amountPaid: Number(invoice.amountPaid),
      amountDue: Number(invoice.amountDue),
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
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount),
      taxRate: item.taxRate ? Number(item.taxRate) : null,
      taxAmount: Number(item.taxAmount),
    })),
    currency: (settings?.currency as string) ?? 'USD',
    payments: invoice.payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      method: payment.paymentMethod,
      paidAt: payment.processedAt?.toISOString() ?? payment.createdAt.toISOString(),
      reference: payment.referenceNumber,
    })),
  };
}
