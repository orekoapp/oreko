'use server';

import { prisma } from '@quotecraft/database';
import { headers } from 'next/headers';
import type { QuoteBlock, QuoteDocument } from './types';
import { notifyWorkspaceMembers } from '@/lib/notifications/actions';
import { createInvoiceFromQuoteInternal } from '@/lib/invoices/actions';

/**
 * Public quote data for client portal (subset of full quote)
 */
export interface PublicQuoteData {
  id: string;
  quoteNumber: string;
  status: string;
  title: string;
  issueDate: string;
  expirationDate: string | null;
  isExpired: boolean;
  blocks: QuoteBlock[];
  totals: {
    subtotal: number;
    discountAmount: number;
    taxTotal: number;
    total: number;
  };
  settings: {
    requireSignature: boolean;
    depositRequired: boolean;
    depositType: 'percentage' | 'fixed';
    depositValue: number;
    showLineItemPrices: boolean;
    currency: string;
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
  hasContract: boolean;
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
 * Get a quote by its public access token
 * This does not require authentication
 */
export async function getQuoteByAccessToken(
  accessToken: string
): Promise<{ success: true; quote: PublicQuoteData } | { success: false; error: string }> {
  try {
    const quote = await prisma.quote.findFirst({
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
          },
        },
        lineItems: {
          orderBy: { sortOrder: 'asc' },
        },
        contractInstances: {
          where: {
            status: { not: 'draft' },
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!quote) {
      return { success: false, error: 'Quote not found' };
    }

    // Reject access to voided or converted quotes that are no longer actionable
    if (quote.status === 'declined') {
      return { success: false, error: 'This quote has been declined' };
    }

    // Check if quote is expired
    const now = new Date();
    const isExpired =
      quote.expirationDate !== null && new Date(quote.expirationDate) < now;

    // Reject access if quote expired more than 30 days ago (grace period for reference)
    if (isExpired) {
      const expirationDate = new Date(quote.expirationDate!);
      const daysSinceExpiry = Math.ceil(
        (now.getTime() - expirationDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceExpiry > 30) {
        return { success: false, error: 'This quote link has expired' };
      }
    }

    // Parse settings from JSON
    const settings = quote.settings as Record<string, unknown>;
    const blocks = (settings.blocks as QuoteBlock[]) || [];

    const publicQuote: PublicQuoteData = {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      title: quote.title || 'Quote',
      issueDate: quote.issueDate.toISOString().split('T')[0] ?? '',
      expirationDate: quote.expirationDate?.toISOString().split('T')[0] ?? null,
      isExpired,
      blocks,
      totals: {
        subtotal: Number(quote.subtotal),
        discountAmount: Number(quote.discountAmount),
        taxTotal: Number(quote.taxTotal),
        total: Number(quote.total),
      },
      settings: {
        requireSignature: (settings.requireSignature as boolean) ?? true,
        depositRequired: (settings.depositRequired as boolean) ?? false,
        depositType: (settings.depositType as 'percentage' | 'fixed') ?? 'percentage',
        depositValue: (settings.depositValue as number) ?? 0,
        showLineItemPrices: (settings.showLineItemPrices as boolean) ?? true,
        currency: (settings.currency as string) ?? 'USD',
      },
      notes: quote.notes || '',
      terms: quote.terms || '',
      client: {
        id: quote.client.id,
        name: quote.client.name,
        email: quote.client.email,
        company: quote.client.company,
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
            logoUrl: quote.workspace.brandingSettings.logoUrl,
          }
        : null,
      lineItems: quote.lineItems.map((item: (typeof quote.lineItems)[number]) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.amount),
        taxRate: item.taxRate ? Number(item.taxRate) : null,
        taxAmount: Number(item.taxAmount),
      })),
      hasContract: quote.contractInstances.length > 0,
    };

    return { success: true, quote: publicQuote };
  } catch (error) {
    console.error('Error fetching quote by access token:', error);
    return { success: false, error: 'Failed to load quote' };
  }
}

/**
 * Track when a client views a quote
 */
export async function trackQuoteView(accessToken: string): Promise<void> {
  try {
    const { ipAddress, userAgent } = await getRequestMetadata();

    const quote = await prisma.quote.findUnique({
      where: { accessToken },
      select: { id: true, status: true, viewedAt: true, workspaceId: true, quoteNumber: true },
    });

    if (!quote) return;

    const isFirstView = quote.viewedAt === null;

    // Update view count and first view timestamp
    await prisma.$transaction([
      prisma.quote.update({
        where: { accessToken },
        data: {
          viewCount: { increment: 1 },
          ...(isFirstView && { viewedAt: new Date() }),
          ...(quote.status === 'sent' && { status: 'viewed' }),
        },
      }),
      prisma.quoteEvent.create({
        data: {
          quoteId: quote.id,
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
        workspaceId: quote.workspaceId,
        type: 'quote_viewed',
        title: `Quote ${quote.quoteNumber} was viewed`,
        message: 'Your client has opened the quote.',
        entityType: 'quote',
        entityId: quote.id,
        link: `/quotes/${quote.id}`,
      }).catch(() => {}); // Don't fail if notification fails
    }
  } catch (error) {
    console.error('Error tracking quote view:', error);
    // Don't throw - view tracking should not break the page
  }
}

/**
 * Accept a quote with signature
 */
export async function acceptQuote(data: {
  accessToken: string;
  signatureData: string;
  signerName: string;
  agreedToTerms: boolean;
}): Promise<{ success: true; depositRequired?: boolean; depositAmount?: number; invoiceAccessToken?: string } | { success: false; error: string }> {
  try {
    const { ipAddress, userAgent } = await getRequestMetadata();

    // Validate signature - must be a valid base64 PNG data URL from SignaturePad
    if (!data.signatureData || !data.signerName) {
      return { success: false, error: 'Signature is required' };
    }
    if (!data.signatureData.startsWith('data:image/png;base64,')) {
      return { success: false, error: 'Invalid signature format' };
    }
    // Ensure signature has sufficient data (not just a blank canvas or single dot)
    const signatureBase64 = data.signatureData.replace('data:image/png;base64,', '');
    if (signatureBase64.length < 1000) {
      return { success: false, error: 'Signature is too simple. Please provide a full signature.' };
    }
    if (data.signerName.trim().length < 2) {
      return { success: false, error: 'Please enter your full name' };
    }

    if (!data.agreedToTerms) {
      return { success: false, error: 'You must agree to the terms' };
    }

    // Find the quote
    const quote = await prisma.quote.findUnique({
      where: { accessToken: data.accessToken },
      select: {
        id: true,
        status: true,
        expirationDate: true,
        settings: true,
        workspaceId: true,
        total: true,
      },
    });

    if (!quote) {
      return { success: false, error: 'Quote not found' };
    }

    // Check if quote can be accepted
    if (!['sent', 'viewed'].includes(quote.status)) {
      return { success: false, error: 'This quote cannot be accepted' };
    }

    // Check expiration
    if (quote.expirationDate && new Date(quote.expirationDate) < new Date()) {
      return { success: false, error: 'This quote has expired' };
    }

    // Update quote with acceptance
    await prisma.$transaction([
      prisma.quote.update({
        where: { accessToken: data.accessToken },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
          signedAt: new Date(),
          signatureData: {
            type: 'drawn',
            data: data.signatureData,
            signerName: data.signerName,
            signedAt: new Date().toISOString(),
            ipAddress,
            userAgent,
          },
        },
      }),
      prisma.quoteEvent.create({
        data: {
          quoteId: quote.id,
          eventType: 'accepted',
          actorType: 'client',
          metadata: {
            signerName: data.signerName,
          },
          ipAddress,
          userAgent,
        },
      }),
    ]);

    // Notify workspace members
    await notifyWorkspaceMembers({
      workspaceId: quote.workspaceId,
      type: 'quote_accepted',
      title: `Quote accepted by ${data.signerName}`,
      message: 'Your client has accepted and signed the quote.',
      entityType: 'quote',
      entityId: quote.id,
      link: `/quotes/${quote.id}`,
    }).catch(() => {});

    // Auto-create invoice if setting enabled
    const quoteSettings = (quote.settings as Record<string, unknown>) ?? {};
    const shouldAutoInvoice = (quoteSettings.autoConvertToInvoice as boolean) ?? false;

    let autoInvoice: { id: string; accessToken: string } | undefined;
    if (shouldAutoInvoice) {
      try {
        const invoiceResult = await createInvoiceFromQuoteInternal(quote.id, quote.workspaceId);
        if (invoiceResult.success && invoiceResult.invoice) {
          autoInvoice = invoiceResult.invoice;
        }
      } catch (error) {
        // Log but don't fail acceptance - invoice can be created manually
        console.error('Auto-invoice creation failed:', error);
      }
    }

    // Process deposit payment if required (and invoice was created)
    const depositRequired = (quoteSettings.depositRequired as boolean) ?? false;
    if (depositRequired && autoInvoice) {
      const depositType = (quoteSettings.depositType as 'percentage' | 'fixed') ?? 'percentage';
      const depositValue = (quoteSettings.depositValue as number) ?? 50;
      const total = Number(quote.total);
      const depositAmount = depositType === 'percentage'
        ? Math.round(total * (depositValue / 100) * 100) / 100
        : Math.min(depositValue, total);

      try {
        await prisma.paymentSchedule.create({
          data: {
            invoiceId: autoInvoice.id,
            type: 'deposit',
            description: `Deposit (${depositType === 'percentage' ? `${depositValue}%` : `$${depositValue}`})`,
            amount: depositAmount,
            percentage: depositType === 'percentage' ? depositValue : null,
            dueDate: new Date(),
            status: 'pending',
          },
        });
      } catch (error) {
        console.error('Deposit schedule creation failed:', error);
      }

      return {
        success: true,
        depositRequired: true,
        depositAmount,
        invoiceAccessToken: autoInvoice.accessToken,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error accepting quote:', error);
    return { success: false, error: 'Failed to accept quote' };
  }
}

/**
 * Decline a quote with optional reason
 */
export async function declineQuote(data: {
  accessToken: string;
  reason?: string;
  comment?: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const { ipAddress, userAgent } = await getRequestMetadata();

    // Find the quote
    const quote = await prisma.quote.findUnique({
      where: { accessToken: data.accessToken },
      select: {
        id: true,
        status: true,
        workspaceId: true,
        quoteNumber: true,
      },
    });

    if (!quote) {
      return { success: false, error: 'Quote not found' };
    }

    // Check if quote can be declined
    if (!['sent', 'viewed'].includes(quote.status)) {
      return { success: false, error: 'This quote cannot be declined' };
    }

    // Update quote
    await prisma.$transaction([
      prisma.quote.update({
        where: { accessToken: data.accessToken },
        data: {
          status: 'declined',
          declinedAt: new Date(),
        },
      }),
      prisma.quoteEvent.create({
        data: {
          quoteId: quote.id,
          eventType: 'declined',
          actorType: 'client',
          metadata: {
            reason: data.reason || null,
            comment: data.comment || null,
          },
          ipAddress,
          userAgent,
        },
      }),
    ]);

    // Notify workspace members
    await notifyWorkspaceMembers({
      workspaceId: quote.workspaceId,
      type: 'quote_declined',
      title: `Quote ${quote.quoteNumber} was declined`,
      message: data.reason ? `Reason: ${data.reason}` : 'Your client has declined the quote.',
      entityType: 'quote',
      entityId: quote.id,
      link: `/quotes/${quote.id}`,
    }).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error('Error declining quote:', error);
    return { success: false, error: 'Failed to decline quote' };
  }
}
