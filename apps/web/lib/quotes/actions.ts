'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { prisma, Prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import type { QuoteDocument, QuoteBlock, ServiceItemBlock } from './types';
import { sendQuoteSentEmail } from '@/lib/services/email';
import { createNotification } from '@/lib/notifications/actions';
import { ROUTES } from '@/lib/routes';
import { domainEvents } from '@/lib/events/emitter';
import { toNumber, getBaseUrl } from '@/lib/utils';

/**
 * Bug #134: Safely parse quote settings from JSON with runtime validation.
 * Returns typed defaults for any missing or invalid fields.
 */
function safeParseQuoteSettings(raw: unknown) {
  const settings = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  return {
    blocks: (Array.isArray(settings.blocks) ? settings.blocks : []) as QuoteBlock[],
    requireSignature: typeof settings.requireSignature === 'boolean' ? settings.requireSignature : true,
    autoConvertToInvoice: typeof settings.autoConvertToInvoice === 'boolean' ? settings.autoConvertToInvoice : false,
    depositRequired: typeof settings.depositRequired === 'boolean' ? settings.depositRequired : false,
    depositType: (settings.depositType === 'percentage' || settings.depositType === 'fixed' ? settings.depositType : 'percentage') as 'percentage' | 'fixed',
    depositValue: typeof settings.depositValue === 'number' ? settings.depositValue : 50,
    showLineItemPrices: typeof settings.showLineItemPrices === 'boolean' ? settings.showLineItemPrices : true,
    allowPartialAcceptance: typeof settings.allowPartialAcceptance === 'boolean' ? settings.allowPartialAcceptance : false,
    currency: typeof settings.currency === 'string' ? settings.currency : 'USD',
    taxInclusive: typeof settings.taxInclusive === 'boolean' ? settings.taxInclusive : false,
  };
}

/** Generate a cryptographically secure access token (64 hex chars = 256 bits) */
function generateAccessToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Get the current user's active workspace with full workspace data
 */
async function getActiveWorkspace() {
  const { workspaceId, userId } = await getCurrentUserWorkspace();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  return {
    userId,
    workspace,
  };
}

/**
 * Generate the next quote number for a workspace
 * Uses atomic increment on NumberSequence table to prevent race conditions
 */
async function generateQuoteNumber(workspaceId: string): Promise<string> {
  // Use upsert to atomically create or increment the sequence (race-condition safe)
  // Bug #82: Counter uses Int (max ~2.1B). Safe for any realistic business use case.
  // At 1000 quotes/day, this supports ~5,800 years of operation.
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.numberSequence.upsert({
      where: { workspaceId_type: { workspaceId, type: 'quote' } },
      update: { currentValue: { increment: 1 } },
      create: {
        workspaceId,
        type: 'quote',
        prefix: 'QT',
        currentValue: 1,
        padding: 4,
      },
    });

    if (updated.currentValue > 2_000_000_000) {
      throw new Error('Quote number sequence approaching overflow. Contact support.');
    }

    return {
      prefix: updated.prefix || 'QT',
      suffix: updated.suffix,
      value: updated.currentValue,
      padding: updated.padding,
    };
  });

  // Format the quote number
  const paddedValue = String(result.value).padStart(result.padding, '0');
  const prefix = result.prefix.replace(/-$/, '');
  const parts = [prefix, paddedValue];
  if (result.suffix) {
    parts.push(result.suffix);
  }
  return parts.join('-');
}

/** Allowed block types for server-side validation */
const VALID_BLOCK_TYPES = new Set([
  'header', 'text', 'service-item', 'service-group',
  'image', 'divider', 'spacer', 'columns', 'table', 'signature',
]);

/**
 * Create a new quote
 */
export async function createQuote(data: {
  title: string;
  clientId: string;
  projectId?: string | null;
  currency?: string;
  blocks?: QuoteBlock[];
}) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  // Bug #455: RBAC — viewers cannot create quotes
  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot create quotes' };
  }

  // Validate title
  if (!data.title || data.title.length > 500) {
    return { success: false, error: 'Title is required and must be under 500 characters' };
  }

  // Validate block types server-side
  if (data.blocks) {
    for (const block of data.blocks) {
      if (!VALID_BLOCK_TYPES.has(block.type)) {
        return { success: false, error: `Invalid block type: ${block.type}` };
      }
    }
  }

  // Verify client belongs to workspace
  const client = await prisma.client.findFirst({
    where: { id: data.clientId, workspaceId: workspace.id, deletedAt: null },
  });
  if (!client) {
    return { success: false, error: 'Client not found' };
  }

  // Determine currency: use provided value, or fall back to workspace BusinessProfile, then 'USD'
  let currency = data.currency || 'USD';
  if (!data.currency) {
    const profile = await prisma.businessProfile.findUnique({
      where: { workspaceId: workspace.id },
      select: { currency: true },
    });
    currency = profile?.currency || 'USD';
  }

  const quoteNumber = await generateQuoteNumber(workspace.id);

  // Extract service items from blocks to create line items
  const serviceItems = data.blocks
    ?.filter((block): block is ServiceItemBlock => block.type === 'service-item') || [];

  // Validate line item values
  for (const block of serviceItems) {
    if (block.content.rate < 0) {
      return { success: false, error: 'Line item rate cannot be negative' };
    }
    if (block.content.quantity < 0) {
      return { success: false, error: 'Line item quantity cannot be negative' };
    }
  }

  const lineItems = serviceItems
    .map((block, index) => ({
      name: block.content.name,
      description: block.content.description || null,
      quantity: block.content.quantity,
      rate: block.content.rate,
      amount: Math.round(block.content.quantity * block.content.rate * 100) / 100,
      taxRate: block.content.taxRate,
      taxAmount: block.content.taxRate
        ? Math.round(block.content.quantity * block.content.rate * (block.content.taxRate / 100) * 100) / 100
        : 0,
      sortOrder: index,
    }));

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxTotal = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + taxTotal;

  const quote = await prisma.quote.create({
    data: {
      workspaceId: workspace.id,
      clientId: data.clientId,
      projectId: data.projectId || null,
      quoteNumber,
      title: data.title,
      status: 'draft',
      accessToken: generateAccessToken(),
      subtotal,
      taxTotal,
      total,
      settings: {
        blocks: data.blocks || [],
        currency,
      } as unknown as Prisma.InputJsonValue,
      lineItems: {
        create: lineItems,
      },
    },
    include: {
      lineItems: true,
      client: true,
      project: true,
    },
  });

  // H01 fix: Create activity event on quote creation
  await prisma.quoteEvent.create({
    data: {
      quoteId: quote.id,
      eventType: 'created',
      actorId: userId,
      actorType: 'user',
      metadata: {},
    },
  });

  revalidatePath(ROUTES.quotes);

  try {
    domainEvents.emit({ type: 'quote.created', payload: { quoteId: quote.id, workspaceId: workspace.id } });
  } catch {}

  return {
    success: true,
    quote: {
      ...quote,
      subtotal: toNumber(quote.subtotal),
      taxTotal: toNumber(quote.taxTotal),
      total: toNumber(quote.total),
      discountValue: quote.discountValue ? Number(quote.discountValue) : null,
      discountAmount: toNumber(quote.discountAmount),
      lineItems: quote.lineItems.map((li) => ({
        ...li,
        quantity: toNumber(li.quantity),
        rate: toNumber(li.rate),
        amount: toNumber(li.amount),
        taxRate: li.taxRate ? Number(li.taxRate) : null,
        taxAmount: toNumber(li.taxAmount),
      })),
    },
  };
}

/**
 * Update an existing quote
 */
export async function updateQuote(
  quoteId: string,
  data: {
    title?: string;
    projectId?: string | null;
    blocks?: QuoteBlock[];
    notes?: string;
    terms?: string;
    internalNotes?: string;
    settings?: Record<string, unknown>;
  }
) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  // Bug #455: RBAC — viewers cannot update quotes
  if (role === 'viewer') {
    return { success: false as const, error: 'Insufficient permissions: viewers cannot edit quotes' };
  }

  // Verify quote belongs to workspace
  const existingQuote = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      workspaceId: workspace.id,
    },
  });

  if (!existingQuote) {
    return { success: false as const, error: 'Quote not found' };
  }

  // Bug #11: Prevent modifications to signed/accepted quotes
  if (['accepted', 'converted'].includes(existingQuote.status) || existingQuote.signedAt) {
    return { success: false as const, error: 'Cannot modify a quote that has been accepted or signed' };
  }

  // Extract service items from blocks
  const serviceBlocks = data.blocks
    ?.filter((block): block is ServiceItemBlock => block.type === 'service-item');

  // Validate line item values
  if (serviceBlocks) {
    for (const block of serviceBlocks) {
      if (block.content.rate < 0) {
        return { success: false as const, error: 'Line item rate cannot be negative' };
      }
      if (block.content.quantity < 0) {
        return { success: false as const, error: 'Line item quantity cannot be negative' };
      }
    }
  }

  const lineItems = serviceBlocks?.map((block, index) => ({
    name: block.content.name,
    description: block.content.description || null,
    quantity: block.content.quantity,
    rate: block.content.rate,
    amount: Math.round(block.content.quantity * block.content.rate * 100) / 100,
    taxRate: block.content.taxRate,
    taxAmount: block.content.taxRate
      ? Math.round(block.content.quantity * block.content.rate * (block.content.taxRate / 100) * 100) / 100
      : 0,
    sortOrder: index,
  }));

  // Calculate totals
  const subtotal = lineItems?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const taxTotal = lineItems?.reduce((sum, item) => sum + item.taxAmount, 0) || 0;

  // Bug #123: Validate discount values server-side
  const mergedSettings = { ...(existingQuote.settings as Record<string, unknown>), ...data.settings };
  const discountType = mergedSettings.discountType as string | undefined;
  const discountValue = Number(mergedSettings.discountValue) || 0;
  if (discountValue < 0) {
    return { success: false as const, error: 'Discount cannot be negative' };
  }
  if (discountType === 'percentage' && discountValue > 100) {
    return { success: false as const, error: 'Discount percentage cannot exceed 100%' };
  }
  if (discountType === 'fixed' && discountValue > subtotal) {
    return { success: false as const, error: 'Discount amount cannot exceed subtotal' };
  }

  // Apply discount to total
  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Math.round(subtotal * (discountValue / 100) * 100) / 100;
  } else if (discountType === 'fixed') {
    discountAmount = Math.min(discountValue, subtotal);
  }
  const total = subtotal - discountAmount + taxTotal;

  // Update quote
  try {
    const quote = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete existing line items if blocks are being updated
      if (data.blocks) {
        await tx.quoteLineItem.deleteMany({
          where: { quoteId },
        });
      }

      // Update quote with new data
      return tx.quote.update({
        where: { id: quoteId },
        data: {
          title: data.title,
          ...(data.projectId !== undefined && { projectId: data.projectId }),
          notes: data.notes,
          terms: data.terms,
          internalNotes: data.internalNotes,
          ...(data.blocks && {
            subtotal,
            taxTotal,
            total,
            settings: {
              ...(existingQuote.settings as object),
              blocks: data.blocks,
            } as unknown as Prisma.InputJsonValue,
            lineItems: {
              create: lineItems,
            },
          }),
        },
        include: {
          lineItems: true,
          client: true,
        },
      });
    });

    revalidatePath(ROUTES.quotes);
    revalidatePath(`/quotes/${quoteId}`);

    return {
      success: true as const,
      quote: {
        ...quote,
        subtotal: toNumber(quote.subtotal),
        taxTotal: toNumber(quote.taxTotal),
        total: toNumber(quote.total),
        discountValue: quote.discountValue ? Number(quote.discountValue) : null,
        discountAmount: toNumber(quote.discountAmount),
        lineItems: quote.lineItems.map((li) => ({
          ...li,
          quantity: toNumber(li.quantity),
          rate: toNumber(li.rate),
          amount: toNumber(li.amount),
          taxRate: li.taxRate ? Number(li.taxRate) : null,
          taxAmount: toNumber(li.taxAmount),
        })),
      },
    };
  } catch (error) {
    console.error('Failed to update quote:', error);
    return { success: false as const, error: 'Failed to save quote. Please try again.' };
  }
}

/**
 * Get a single quote by ID
 */
export async function getQuote(quoteId: string) {
  const { userId, workspace } = await getActiveWorkspace();

  const quote = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
      client: true,
      project: true,
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
        },
      },
    },
  });

  if (!quote) {
    return null;
  }

  // Convert to QuoteDocument format for the builder
  // Bug #134: Use safe parser instead of raw casts
  const parsedSettings = safeParseQuoteSettings(quote.settings);
  let blocks = parsedSettings.blocks;

  // If blocks are empty but lineItems exist, construct blocks from lineItems
  if (blocks.length === 0 && quote.lineItems.length > 0) {
    const now = new Date().toISOString();
    blocks = quote.lineItems.map((item) => ({
      id: item.id,
      type: 'service-item' as const,
      createdAt: item.createdAt?.toISOString?.() ?? now,
      updatedAt: item.updatedAt?.toISOString?.() ?? now,
      content: {
        name: item.name,
        description: item.description || '',
        quantity: toNumber(item.quantity),
        rate: toNumber(item.rate),
        unit: 'hour',
        taxRate: item.taxRate ? Number(item.taxRate) : null,
        rateCardId: item.rateCardId || null,
      },
    }));
  }

  const document: QuoteDocument = {
    id: quote.id,
    workspaceId: quote.workspaceId,
    clientId: quote.clientId,
    projectId: quote.projectId,
    quoteNumber: quote.quoteNumber,
    status: quote.status as QuoteDocument['status'],
    title: quote.title || 'Untitled Quote',
    issueDate: quote.issueDate.toISOString().split('T')[0] ?? '',
    expirationDate: quote.expirationDate?.toISOString().split('T')[0] ?? null,
    blocks,
    settings: {
      requireSignature: parsedSettings.requireSignature,
      autoConvertToInvoice: parsedSettings.autoConvertToInvoice,
      depositRequired: parsedSettings.depositRequired,
      depositType: parsedSettings.depositType,
      depositValue: parsedSettings.depositValue,
      showLineItemPrices: parsedSettings.showLineItemPrices,
      allowPartialAcceptance: parsedSettings.allowPartialAcceptance,
      currency: parsedSettings.currency,
      taxInclusive: parsedSettings.taxInclusive,
    },
    totals: {
      subtotal: toNumber(quote.subtotal),
      discountType: quote.discountType as 'percentage' | 'fixed' | null,
      discountValue: quote.discountValue ? Number(quote.discountValue) : null,
      discountAmount: toNumber(quote.discountAmount),
      taxTotal: toNumber(quote.taxTotal),
      total: toNumber(quote.total),
    },
    notes: quote.notes || '',
    terms: quote.terms || '',
    internalNotes: quote.internalNotes || '',
    linkedInvoice: quote.invoice
      ? {
          id: quote.invoice.id,
          invoiceNumber: quote.invoice.invoiceNumber,
          status: quote.invoice.status,
        }
      : null,
    client: quote.client
      ? {
          id: quote.client.id,
          name: quote.client.name,
          email: quote.client.email,
          company: quote.client.company,
        }
      : null,
    signatureData: quote.signatureData as {
      type: string;
      data: string;
      signerName: string;
      signedAt: string;
      ipAddress: string;
      documentHash: string;
    } | null,
    acceptedAt: quote.acceptedAt?.toISOString() ?? null,
  };

  return document;
}

/**
 * Get all quotes for the current workspace
 */
export async function getQuotes(options?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const { userId, workspace } = await getActiveWorkspace();

  const where = {
    workspaceId: workspace.id,
    deletedAt: null,
    ...(options?.status && { status: options.status }),
    ...(options?.search && {
      OR: [
        { title: { contains: options.search, mode: 'insensitive' as const } },
        { quoteNumber: { contains: options.search, mode: 'insensitive' as const } },
        { client: { name: { contains: options.search, mode: 'insensitive' as const } } },
      ],
    }),
  };

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: {
        client: {
          select: { id: true, name: true, email: true, company: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 20,
      skip: options?.offset || 0,
    }),
    prisma.quote.count({ where }),
  ]);

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quotes: quotes.map((quote: any) => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      title: quote.title,
      status: quote.status,
      total: toNumber(quote.total),
      currency: quote.currency || 'USD',
      issueDate: quote.issueDate.toISOString().split('T')[0],
      expirationDate: quote.expirationDate?.toISOString().split('T')[0] || null,
      client: quote.client ? {
        id: quote.client.id,
        name: quote.client.name,
        email: quote.client.email,
        company: quote.client.company,
      } : null,
      createdAt: quote.createdAt.toISOString(),
    })),
    total,
  };
}

/**
 * Delete a quote (soft delete)
 */
export async function deleteQuote(quoteId: string) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot delete quotes' };
  }

  // Check for linked invoices
  const linkedInvoice = await prisma.invoice.findFirst({
    where: { quoteId, deletedAt: null },
  });

  if (linkedInvoice) {
    return { success: false, error: 'Cannot delete a quote that has a linked invoice. Delete or void the invoice first.' };
  }

  // Bug #79: Clean up signature data before soft-deleting
  // Clear any stored signature data (base64 in quoteEvent metadata) to free space
  await prisma.$transaction(async (tx) => {
    await tx.quoteEvent.updateMany({
      where: { quoteId, eventType: 'signed' },
      data: { metadata: {} },
    });

    await tx.quote.update({
      where: { id: quoteId, workspaceId: workspace.id },
      data: {
        deletedAt: new Date(),
        signatureData: Prisma.JsonNull,
      },
    });
  });

  revalidatePath(ROUTES.quotes);

  return { success: true };
}

/**
 * Duplicate a quote
 */
export async function duplicateQuote(quoteId: string) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  // Bug #455: RBAC — viewers cannot duplicate quotes
  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot duplicate quotes' };
  }

  const original = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      workspaceId: workspace.id,
    },
    include: {
      lineItems: true,
    },
  });

  if (!original) {
    throw new Error('Quote not found');
  }

  const quoteNumber = await generateQuoteNumber(workspace.id);

  const duplicate = await prisma.quote.create({
    data: {
      workspaceId: workspace.id,
      clientId: original.clientId,
      projectId: original.projectId,
      quoteNumber,
      title: `${original.title || 'Untitled'} (Copy)`,
      status: 'draft',
      currency: original.currency,
      accessToken: generateAccessToken(),
      subtotal: original.subtotal,
      discountType: original.discountType,
      discountValue: original.discountValue,
      discountAmount: original.discountAmount,
      taxTotal: original.taxTotal,
      total: original.total,
      notes: original.notes,
      terms: original.terms,
      settings: original.settings as Prisma.InputJsonValue,
      lineItems: {
        create: original.lineItems.map((item: typeof original.lineItems[number]) => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          sortOrder: item.sortOrder,
        })),
      },
    },
  });

  revalidatePath(ROUTES.quotes);

  return { success: true, quoteId: duplicate.id };
}

/**
 * Update quote status
 */
export async function updateQuoteStatus(
  quoteId: string,
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'
) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  // Bug #455: RBAC — viewers cannot change quote status
  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot change quote status' };
  }

  // Validate state transitions
  const validTransitions: Record<string, string[]> = {
    draft: ['sent'],
    sent: ['viewed', 'accepted', 'declined', 'expired'],
    viewed: ['accepted', 'declined', 'expired'],
    accepted: [], // converted is set internally via createInvoiceFromQuote
    declined: ['draft'], // allow re-drafting
    expired: ['draft'], // allow re-drafting
  };

  const existingQuote = await prisma.quote.findFirst({
    where: { id: quoteId, workspaceId: workspace.id, deletedAt: null },
  });

  if (!existingQuote) {
    return { success: false, error: 'Quote not found' };
  }

  const allowed = validTransitions[existingQuote.status] || [];
  if (!allowed.includes(status)) {
    return { success: false, error: `Cannot change status from '${existingQuote.status}' to '${status}'` };
  }

  const statusTimestamps: Record<string, string> = {
    sent: 'sentAt',
    accepted: 'acceptedAt',
    declined: 'declinedAt',
  };

  const timestampField = statusTimestamps[status];

  await prisma.quote.update({
    where: {
      id: quoteId,
      workspaceId: workspace.id,
    },
    data: {
      status,
      ...(timestampField && { [timestampField]: new Date() }),
    },
  });

  // Log event
  await prisma.quoteEvent.create({
    data: {
      quoteId,
      eventType: `status_changed_to_${status}`,
      actorId: userId,
      actorType: 'user',
    },
  });

  revalidatePath(ROUTES.quotes);
  revalidatePath(ROUTES.quoteDetail(quoteId));

  try {
    if (status === 'accepted') {
      domainEvents.emit({ type: 'quote.accepted', payload: { quoteId } });
    } else if (status === 'declined') {
      domainEvents.emit({ type: 'quote.declined', payload: { quoteId } });
    }
  } catch {}

  return { success: true };
}

/**
 * Send quote to client
 * Updates status to 'sent' and triggers email notification
 */
export async function sendQuote(quoteId: string) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  // Bug #455: RBAC — viewers cannot send quotes
  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot send quotes' };
  }

  // Get quote with client details
  const quote = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      workspaceId: workspace.id,
    },
    include: {
      client: true,
    },
  });

  if (!quote) {
    return { success: false, error: 'Quote not found' };
  }

  if (!quote.client?.email) {
    return { success: false, error: 'Client email is required to send quote' };
  }

  // Prevent sending empty quotes
  if (Math.abs(toNumber(quote.total)) < 0.01) {
    return { success: false, error: 'Cannot send a quote with zero total. Add line items first.' };
  }

  // Update quote status to sent
  await prisma.quote.update({
    where: {
      id: quoteId,
      workspaceId: workspace.id,
    },
    data: {
      status: 'sent',
      sentAt: new Date(),
    },
  });

  // Log event
  await prisma.quoteEvent.create({
    data: {
      quoteId,
      eventType: 'quote_sent',
      actorId: userId,
      actorType: 'user',
      metadata: {
        recipientEmail: quote.client.email,
        sentAt: new Date().toISOString(),
      },
    },
  });

  // Send email notification
  const baseUrl = getBaseUrl();
  const quoteUrl = `${baseUrl}/q/${quote.accessToken}`;

  let emailSent = false;
  try {
    const emailResult = await sendQuoteSentEmail({
      to: quote.client.email,
      clientName: quote.client.name,
      quoteName: quote.title || `Quote ${quote.quoteNumber}`,
      quoteUrl,
      businessName: workspace.name,
      validUntil: quote.expirationDate ?? undefined,
      rateLimitKey: workspace.id,
    });
    emailSent = emailResult.success;
    if (!emailResult.success) {
      console.error('Failed to send quote email:', emailResult.error);
    }
  } catch (err) {
    console.error('Failed to send quote email:', err);
  }

  // Create notification for sender
  createNotification({
    userId,
    workspaceId: workspace.id,
    type: 'quote_sent',
    title: `Quote ${quote.quoteNumber} sent`,
    message: `Sent to ${quote.client.email}`,
    entityType: 'quote',
    entityId: quoteId,
    link: `/quotes/${quoteId}`,
  }).catch(() => {});

  revalidatePath(ROUTES.quotes);
  revalidatePath(ROUTES.quoteDetail(quoteId));

  try {
    domainEvents.emit({ type: 'quote.sent', payload: { quoteId, clientEmail: quote.client.email } });
  } catch {}

  return { success: true, recipientEmail: quote.client.email, emailSent };
}
