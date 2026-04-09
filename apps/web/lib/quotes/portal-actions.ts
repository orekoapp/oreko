'use server';

import { prisma } from '@oreko/database';
import { headers } from 'next/headers';
import type { QuoteBlock } from './types';
import { toNumber } from '@/lib/utils';
import { notifyWorkspaceMembers } from '@/lib/notifications/internal';
import { createInvoiceFromQuoteInternal } from '@/lib/invoices/internal';
import { computeQuoteDocumentHash, verifyDocumentHash } from '@/lib/signing/document-hash';
import { logger } from '@/lib/logger';

/**
 * Public quote data for client portal (subset of full quote)
 */
export interface PublicQuoteData {
  id: string;
  quoteNumber: string;
  status: string;
  title: string;
  currency: string;
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
    address: string | Record<string, string> | null;
    website?: string | null;
  };
  branding: {
    primaryColor: string | null;
    accentColor: string | null;
    logoUrl: string | null;
    companyName?: string;
    contactEmail?: string | null;
    contactPhone?: string | null;
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
  documentIntegrity?: 'verified' | 'tampered' | 'unchecked';
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

    // Bug #19: Limit access to accepted quotes after 90 days
    if (quote.status === 'accepted') {
      const acceptedDate = quote.acceptedAt || quote.updatedAt;
      const daysSinceAccepted = (Date.now() - new Date(acceptedDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceAccepted > 90) {
        return { success: false, error: 'This quote has expired' };
      }
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

    // Verify document hash integrity for signed/accepted quotes
    let documentIntegrity: 'verified' | 'tampered' | 'unchecked' = 'unchecked';
    if (quote.signedAt && quote.signatureData) {
      try {
        const sigData = quote.signatureData as Record<string, unknown>;
        const storedHash = sigData.documentHash as string | undefined;
        if (storedHash) {
          const recomputedHash = computeQuoteDocumentHash({
            quoteId: quote.id,
            lineItems: quote.lineItems.map((item) => ({
              name: item.name,
              description: item.description,
              quantity: toNumber(item.quantity),
              rate: toNumber(item.rate),
              amount: toNumber(item.amount),
            })),
            terms: quote.terms || '',
            notes: quote.notes || '',
            subtotal: toNumber(quote.subtotal),
            total: toNumber(quote.total),
            signerName: (sigData.signerName as string) || 'Unknown',
            signedAt: (sigData.signedAt as string) || quote.signedAt.toISOString(),
          });
          documentIntegrity = verifyDocumentHash(recomputedHash, storedHash) ? 'verified' : 'tampered';
        }
      } catch (err) {
        logger.error({ err }, 'Document hash verification failed');
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
      currency: quote.currency || (settings.currency as string) || 'USD',
      issueDate: quote.issueDate.toISOString().split('T')[0] ?? '',
      expirationDate: quote.expirationDate?.toISOString().split('T')[0] ?? null,
      isExpired,
      blocks,
      totals: {
        subtotal: toNumber(quote.subtotal),
        discountAmount: toNumber(quote.discountAmount),
        taxTotal: toNumber(quote.taxTotal),
        total: toNumber(quote.total),
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
        address: (quote.workspace.businessProfile?.address as string | Record<string, string>) || null,
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
        quantity: toNumber(item.quantity),
        rate: toNumber(item.rate),
        amount: toNumber(item.amount),
        taxRate: item.taxRate ? Number(item.taxRate) : null,
        taxAmount: toNumber(item.taxAmount),
      })),
      hasContract: quote.contractInstances.length > 0,
      documentIntegrity,
    };

    return { success: true, quote: publicQuote };
  } catch (error) {
    logger.error({ err: error }, 'Error fetching quote by access token');
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

    // Atomically set viewedAt only if it hasn't been set yet (prevents race condition)
    const updated = await prisma.quote.updateMany({
      where: { id: quote.id, viewedAt: null },
      data: { viewedAt: new Date() },
    });
    const isFirstView = updated.count > 0;

    // Update view count and status
    await prisma.$transaction([
      prisma.quote.update({
        where: { accessToken },
        data: {
          viewCount: { increment: 1 },
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

    // Notify workspace members on first view (only the request that atomically set viewedAt)
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
    logger.error({ err: error }, 'Error tracking quote view');
    // Don't throw - view tracking should not break the page
  }
}

/**
 * Accept a quote with signature.
 * OTP verification is enforced when otpCode is provided.
 */
export async function acceptQuote(data: {
  accessToken: string;
  signatureData: string;
  signerName: string;
  agreedToTerms: boolean;
  otpCode?: string;
}): Promise<{ success: true; depositRequired?: boolean; depositAmount?: number; invoicePayUrl?: string } | { success: false; error: string }> {
  try {
    const { ipAddress, userAgent } = await getRequestMetadata();

    // Rate limit by IP to prevent abuse on unauthenticated endpoint
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const rateLimitResult = await checkRateLimit(`quote-action:${ipAddress}`, { limit: 10, windowMs: 60000 });
    if (rateLimitResult.limited) {
      return { success: false, error: 'Too many attempts. Please try again later.' };
    }

    // Bug #1: Fix OTP key mismatch — use quote:<quoteId> matching sendSigningOtp
    // Also enforce that OTP was completed (not just optionally provided)
    {
      const { verifySigningOtp, isSigningVerified } = await import('@/lib/signing/otp');
      const quoteForOtp = await prisma.quote.findFirst({
        where: { accessToken: data.accessToken, deletedAt: null },
        select: { id: true, client: { select: { email: true } }, settings: true },
      });
      if (!quoteForOtp) {
        return { success: false, error: 'Quote not found' };
      }
      const otpSettings = (quoteForOtp.settings as Record<string, unknown>) ?? {};
      const requireOtp = (otpSettings.requireOtpVerification as boolean) ?? false;
      const otpKey = `quote:${quoteForOtp.id}`;

      if (data.otpCode) {
        if (!quoteForOtp.client?.email) {
          return { success: false, error: 'Could not verify identity — client email not found' };
        }
        const otpResult = await verifySigningOtp(otpKey, data.otpCode, quoteForOtp.client.email);
        if (!otpResult.valid) {
          return { success: false, error: otpResult.error || 'OTP verification failed' };
        }
      } else if (requireOtp) {
        // OTP is required but not provided — check if already verified in a prior step
        const alreadyVerified = await isSigningVerified(otpKey);
        if (!alreadyVerified) {
          return { success: false, error: 'Identity verification is required. Please complete the OTP step.' };
        }
      }
    }

    // Bug #68: Only validate signatureData if the quote actually requires signature
    // First fetch quote settings to check requireSignature
    const quoteForSigCheck = await prisma.quote.findFirst({
      where: { accessToken: data.accessToken, deletedAt: null },
      select: { settings: true },
    });
    const sigSettings = (quoteForSigCheck?.settings as Record<string, unknown>) ?? {};
    const requireSignature = (sigSettings.requireSignature as boolean) ?? true;

    if (requireSignature) {
      if (!data.signatureData || !data.signerName) {
        return { success: false, error: 'Signature is required' };
      }
      const isDrawn = data.signatureData.startsWith('data:image/png;base64,');
      const isTyped = data.signatureData.startsWith('typed:');
      if (!isDrawn && !isTyped) {
        return { success: false, error: 'Invalid signature format' };
      }
      if (isDrawn) {
        const signatureBase64 = data.signatureData.replace('data:image/png;base64,', '');
        if (signatureBase64.length < 1000) {
          return { success: false, error: 'Signature is too simple. Please provide a full signature.' };
        }
      }
      if (isTyped) {
        const typedName = data.signatureData.replace('typed:', '').trim();
        if (typedName.length < 2) {
          return { success: false, error: 'Please type your full name as signature.' };
        }
      }
    }
    if (data.signerName.trim().length < 2) {
      return { success: false, error: 'Please enter your full name' };
    }

    if (!data.agreedToTerms) {
      return { success: false, error: 'You must agree to the terms' };
    }

    // Find the quote with line items for document hash
    // HIGH #3-7: Add deletedAt check to prevent operating on soft-deleted quotes
    const quote = await prisma.quote.findFirst({
      where: { accessToken: data.accessToken, deletedAt: null },
      select: {
        id: true,
        status: true,
        expirationDate: true,
        settings: true,
        workspaceId: true,
        subtotal: true,
        total: true,
        terms: true,
        notes: true,
        lineItems: {
          select: {
            name: true,
            description: true,
            quantity: true,
            rate: true,
            amount: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
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

    // Compute document hash for tamper-proofing
    const signedAt = new Date();
    const signedAtISO = signedAt.toISOString();
    const documentHash = computeQuoteDocumentHash({
      quoteId: quote.id,
      lineItems: quote.lineItems.map((item) => ({
        name: item.name,
        description: item.description,
        quantity: toNumber(item.quantity),
        rate: toNumber(item.rate),
        amount: toNumber(item.amount),
      })),
      terms: quote.terms || '',
      notes: quote.notes || '',
      subtotal: toNumber(quote.subtotal),
      total: toNumber(quote.total),
      signerName: data.signerName,
      signedAt: signedAtISO,
    });

    // Atomic conditional update — prevents double-accept race condition
    // Only updates if status is still 'sent' or 'viewed' (not already accepted)
    const acceptResult = await prisma.quote.updateMany({
      where: {
        accessToken: data.accessToken,
        status: { in: ['sent', 'viewed'] },
        deletedAt: null,
      },
      data: {
        status: 'accepted',
        acceptedAt: signedAt,
        signedAt,
        signatureData: {
          type: 'drawn',
          encrypted: false,
          data: data.signatureData,
          signerName: data.signerName,
          signedAt: signedAtISO,
          ipAddress,
          userAgent,
          documentHash,
        },
      },
    });

    if (acceptResult.count === 0) {
      return { success: false, error: 'This quote has already been accepted or is no longer available' };
    }

    // Create event and notifications (side effects — safe to run after atomic update)
    await prisma.$transaction([
      prisma.quoteEvent.create({
        data: {
          quoteId: quote.id,
          eventType: 'accepted',
          actorType: 'client',
          metadata: {
            signerName: data.signerName,
            termsSnapshot: quote.terms || '',
            notesSnapshot: quote.notes || '',
            documentHash,
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
        logger.error({ err: error }, 'Auto-invoice creation failed');
      }
    }

    // Process deposit payment if required (and invoice was created)
    const depositRequired = (quoteSettings.depositRequired as boolean) ?? false;
    if (depositRequired && autoInvoice) {
      const depositType = (quoteSettings.depositType as 'percentage' | 'fixed') ?? 'percentage';
      const depositValue = (quoteSettings.depositValue as number) ?? 50;
      const total = toNumber(quote.total);
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
        logger.error({ err: error }, 'Deposit schedule creation failed');
      }

      return {
        success: true,
        depositRequired: true,
        depositAmount,
        invoicePayUrl: `/i/${autoInvoice.accessToken}`,
      };
    }

    return { success: true };
  } catch (error) {
    logger.error({ err: error }, 'Error accepting quote');
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

    // Rate limit by IP to prevent abuse on unauthenticated endpoint
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const rateLimitResult = await checkRateLimit(`quote-action:${ipAddress}`, { limit: 10, windowMs: 60000 });
    if (rateLimitResult.limited) {
      return { success: false, error: 'Too many attempts. Please try again later.' };
    }

    // Find the quote
    // MEDIUM #18: Filter out soft-deleted quotes
    const quote = await prisma.quote.findFirst({
      where: { accessToken: data.accessToken, deletedAt: null },
      select: {
        id: true,
        status: true,
        workspaceId: true,
        quoteNumber: true,
        expirationDate: true,
      },
    });

    if (!quote) {
      return { success: false, error: 'Quote not found' };
    }

    // Bug #20: Check if quote has expired
    if (quote.expirationDate && new Date(quote.expirationDate) < new Date()) {
      return { success: false, error: 'This quote has expired' };
    }

    // Check if quote can be declined
    if (!['sent', 'viewed'].includes(quote.status)) {
      return { success: false, error: 'This quote cannot be declined' };
    }

    // Atomic conditional update — prevents race condition with concurrent accept
    const declineResult = await prisma.quote.updateMany({
      where: {
        accessToken: data.accessToken,
        status: { in: ['sent', 'viewed'] },
        deletedAt: null,
      },
      data: {
        status: 'declined',
        declinedAt: new Date(),
      },
    });

    if (declineResult.count === 0) {
      return { success: false, error: 'This quote has already been accepted or declined' };
    }

    // Create event (side effect — safe after atomic update)
    await prisma.$transaction([
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
    logger.error({ err: error }, 'Error declining quote');
    return { success: false, error: 'Failed to decline quote' };
  }
}
