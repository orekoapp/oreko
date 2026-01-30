'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma, type Prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';
import type { QuoteDocument, QuoteBlock, ServiceItemBlock } from './types';

/**
 * Get the current user's active workspace
 * In a real app, this would check the user's session for their active workspace
 */
async function getActiveWorkspace() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // For now, get the first workspace the user is a member of
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

  if (!membership) {
    throw new Error('No workspace found');
  }

  return {
    userId: session.user.id,
    workspace: membership.workspace,
  };
}

/**
 * Generate the next quote number for a workspace
 */
async function generateQuoteNumber(workspaceId: string): Promise<string> {
  const lastQuote = await prisma.quote.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    select: { quoteNumber: true },
  });

  // Parse the last number or start at 0
  const lastNumber = lastQuote?.quoteNumber
    ? parseInt(lastQuote.quoteNumber.replace(/\D/g, ''), 10) || 0
    : 0;

  const nextNumber = lastNumber + 1;
  return `QT-${String(nextNumber).padStart(4, '0')}`;
}

/**
 * Create a new quote
 */
export async function createQuote(data: {
  title: string;
  clientId: string;
  blocks?: QuoteBlock[];
}) {
  const { userId, workspace } = await getActiveWorkspace();

  const quoteNumber = await generateQuoteNumber(workspace.id);

  // Extract service items from blocks to create line items
  const lineItems = data.blocks
    ?.filter((block): block is ServiceItemBlock => block.type === 'service-item')
    .map((block, index) => ({
      name: block.content.name,
      description: block.content.description || null,
      quantity: block.content.quantity,
      rate: block.content.rate,
      amount: block.content.quantity * block.content.rate,
      taxRate: block.content.taxRate,
      taxAmount: block.content.taxRate
        ? block.content.quantity * block.content.rate * (block.content.taxRate / 100)
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
      amount: block.content.quantity * block.content.rate,
      taxRate: block.content.taxRate,
      taxAmount: block.content.taxRate
        ? block.content.quantity * block.content.rate * (block.content.taxRate / 100)
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
    },
  });

  if (!quote) {
    return null;
  }

  // Convert to QuoteDocument format for the builder
  const settings = quote.settings as Record<string, unknown>;
  const blocks = (settings.blocks as QuoteBlock[]) || [];

  const document: QuoteDocument = {
    id: quote.id,
    workspaceId: quote.workspaceId,
    clientId: quote.clientId,
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
          select: { id: true, name: true, email: true },
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
      client: quote.client,
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
