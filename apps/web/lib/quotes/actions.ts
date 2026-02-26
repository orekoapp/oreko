'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, type Prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import type { QuoteDocument, QuoteBlock, ServiceItemBlock } from './types';
import { sendQuoteSentEmail } from '@/lib/services/email';
import { createNotification } from '@/lib/notifications/actions';

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

/**
 * Create a new quote
 */
export async function createQuote(data: {
  title: string;
  clientId: string;
  projectId?: string | null;
  blocks?: QuoteBlock[];
}) {
  const { userId, workspace } = await getActiveWorkspace();

  // Verify client belongs to workspace
  const client = await prisma.client.findFirst({
    where: { id: data.clientId, workspaceId: workspace.id, deletedAt: null },
  });
  if (!client) {
    return { success: false, error: 'Client not found' };
  }

  const quoteNumber = await generateQuoteNumber(workspace.id);

  // Extract service items from blocks to create line items
  const lineItems = data.blocks
    ?.filter((block): block is ServiceItemBlock => block.type === 'service-item')
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
    })) || [];

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
      subtotal,
      taxTotal,
      total,
      settings: {
        blocks: data.blocks || [],
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

  revalidatePath('/quotes');

  return { success: true, quote };
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

  // Verify quote belongs to workspace
  const existingQuote = await prisma.quote.findFirst({
    where: {
      id: quoteId,
      workspaceId: workspace.id,
    },
  });

  if (!existingQuote) {
    throw new Error('Quote not found');
  }

  // Extract service items from blocks
  const lineItems = data.blocks
    ?.filter((block): block is ServiceItemBlock => block.type === 'service-item')
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
  const subtotal = lineItems?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const taxTotal = lineItems?.reduce((sum, item) => sum + item.taxAmount, 0) || 0;
  const total = subtotal + taxTotal;

  // Update quote
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

  revalidatePath('/quotes');
  revalidatePath(`/quotes/${quoteId}`);

  return { success: true, quote };
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
  const settings = quote.settings as Record<string, unknown>;
  let blocks = (settings.blocks as QuoteBlock[]) || [];

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
        quantity: Number(item.quantity),
        rate: Number(item.rate),
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
      requireSignature: (settings.requireSignature as boolean) ?? true,
      autoConvertToInvoice: (settings.autoConvertToInvoice as boolean) ?? false,
      depositRequired: (settings.depositRequired as boolean) ?? false,
      depositType: (settings.depositType as 'percentage' | 'fixed') ?? 'percentage',
      depositValue: (settings.depositValue as number) ?? 50,
      showLineItemPrices: (settings.showLineItemPrices as boolean) ?? true,
      allowPartialAcceptance: (settings.allowPartialAcceptance as boolean) ?? false,
      currency: (settings.currency as string) ?? 'USD',
      taxInclusive: (settings.taxInclusive as boolean) ?? false,
    },
    totals: {
      subtotal: Number(quote.subtotal),
      discountType: quote.discountType as 'percentage' | 'fixed' | null,
      discountValue: quote.discountValue ? Number(quote.discountValue) : null,
      discountAmount: Number(quote.discountAmount),
      taxTotal: Number(quote.taxTotal),
      total: Number(quote.total),
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
      total: Number(quote.total),
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

  // Check for linked invoices
  const linkedInvoice = await prisma.invoice.findFirst({
    where: { quoteId, deletedAt: null },
  });

  if (linkedInvoice) {
    return { success: false, error: 'Cannot delete a quote that has a linked invoice. Delete or void the invoice first.' };
  }

  await prisma.quote.update({
    where: {
      id: quoteId,
      workspaceId: workspace.id,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  revalidatePath('/quotes');

  return { success: true };
}

/**
 * Duplicate a quote
 */
export async function duplicateQuote(quoteId: string) {
  const { userId, workspace } = await getActiveWorkspace();

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

  revalidatePath('/quotes');

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

  revalidatePath('/quotes');
  revalidatePath(`/quotes/${quoteId}`);

  return { success: true };
}

/**
 * Send quote to client
 * Updates status to 'sent' and triggers email notification
 */
export async function sendQuote(quoteId: string) {
  const { userId, workspace } = await getActiveWorkspace();

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
  if (Number(quote.total) === 0) {
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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
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

  revalidatePath('/quotes');
  revalidatePath(`/quotes/${quoteId}`);

  return { success: true, recipientEmail: quote.client.email, emailSent };
}
