'use server';

import { revalidatePath } from 'next/cache';
import { prisma, type Prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { generateCreditNoteNumber } from '@/lib/invoices/internal';
import { ROUTES } from '@/lib/routes';
import { domainEvents } from '@/lib/events/emitter';

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
 * Statuses from which a credit note can be created.
 * Draft invoices cannot have credit notes — only finalized invoices.
 */
const CREDIT_NOTE_ELIGIBLE_STATUSES = ['sent', 'viewed', 'paid', 'partial', 'overdue', 'voided'];

/**
 * Create a credit note from an existing invoice.
 */
export async function createCreditNote(
  invoiceId: string,
  data: {
    reason: string;
    notes?: string;
    lineItems: Array<{
      name: string;
      description?: string;
      quantity: number;
      rate: number;
    }>;
  }
) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot create credit notes' };
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
  });

  if (!invoice) {
    return { success: false, error: 'Invoice not found' };
  }

  if (!CREDIT_NOTE_ELIGIBLE_STATUSES.includes(invoice.status)) {
    return { success: false, error: 'Credit notes can only be created for sent, paid, partial, overdue, or voided invoices' };
  }

  if (!data.reason.trim()) {
    return { success: false, error: 'Reason is required' };
  }

  if (!data.lineItems || data.lineItems.length === 0) {
    return { success: false, error: 'At least one line item is required' };
  }

  // Validate and calculate totals
  let totalAmount = 0;
  const lineItems = data.lineItems.map((item, index) => {
    if (item.rate < 0) {
      throw new Error('Line item rate cannot be negative');
    }
    if (item.quantity < 0) {
      throw new Error('Line item quantity cannot be negative');
    }
    const amount = Math.round(item.quantity * item.rate * 100) / 100;
    totalAmount += amount;
    return {
      name: item.name,
      description: item.description || null,
      quantity: item.quantity,
      rate: item.rate,
      amount,
      sortOrder: index,
    };
  });

  totalAmount = Math.round(totalAmount * 100) / 100;

  const creditNoteNumber = await generateCreditNoteNumber(workspace.id);

  const creditNote = await prisma.$transaction(async (tx) => {
    const newCreditNote = await tx.creditNote.create({
      data: {
        workspaceId: workspace.id,
        invoiceId,
        creditNoteNumber,
        reason: data.reason,
        amount: totalAmount,
        currency: invoice.currency || 'USD',
        status: 'draft',
        notes: data.notes || null,
        lineItems: {
          create: lineItems,
        },
      },
      include: {
        lineItems: true,
      },
    });

    await tx.creditNoteEvent.create({
      data: {
        creditNoteId: newCreditNote.id,
        eventType: 'created',
        actorId: userId,
        actorType: 'user',
        metadata: { invoiceId },
      },
    });

    return newCreditNote;
  });

  revalidatePath(ROUTES.invoiceDetail(invoiceId));

  return { success: true, creditNote };
}

/**
 * Issue a credit note (draft → issued).
 */
export async function issueCreditNote(creditNoteId: string) {
  const { userId, workspace } = await getActiveWorkspace();
  const { role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions: viewers cannot issue credit notes' };
  }

  const creditNote = await prisma.creditNote.findFirst({
    where: {
      id: creditNoteId,
      workspaceId: workspace.id,
    },
  });

  if (!creditNote) {
    return { success: false, error: 'Credit note not found' };
  }

  if (creditNote.status !== 'draft') {
    return { success: false, error: 'Only draft credit notes can be issued' };
  }

  await prisma.$transaction([
    prisma.creditNote.update({
      where: { id: creditNoteId },
      data: {
        status: 'issued',
        issuedAt: new Date(),
      },
    }),
    prisma.creditNoteEvent.create({
      data: {
        creditNoteId,
        eventType: 'issued',
        actorId: userId,
        actorType: 'user',
        metadata: {},
      },
    }),
  ]);

  revalidatePath(ROUTES.invoiceDetail(creditNote.invoiceId));

  try {
    domainEvents.emit({ type: 'credit_note.issued', payload: { creditNoteId, invoiceId: creditNote.invoiceId } });
  } catch {}

  return { success: true };
}

/**
 * Get credit notes for the current workspace with optional filters.
 */
export async function getCreditNotes(filters?: {
  status?: string;
  invoiceId?: string;
  search?: string;
}) {
  const { workspace } = await getActiveWorkspace();

  const where: Prisma.CreditNoteWhereInput = {
    workspaceId: workspace.id,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.invoiceId && { invoiceId: filters.invoiceId }),
    ...(filters?.search && {
      OR: [
        { creditNoteNumber: { contains: filters.search, mode: 'insensitive' } },
        { reason: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  };

  const creditNotes = await prisma.creditNote.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
        },
      },
    },
  });

  return creditNotes.map((cn) => ({
    id: cn.id,
    creditNoteNumber: cn.creditNoteNumber,
    reason: cn.reason,
    amount: Number(cn.amount),
    currency: cn.currency || 'USD',
    status: cn.status,
    issuedAt: cn.issuedAt?.toISOString() ?? null,
    createdAt: cn.createdAt.toISOString(),
    invoice: cn.invoice,
  }));
}

/**
 * Get a single credit note by ID with line items and events.
 */
export async function getCreditNoteById(id: string) {
  const { workspace } = await getActiveWorkspace();

  const creditNote = await prisma.creditNote.findFirst({
    where: {
      id,
      workspaceId: workspace.id,
    },
    include: {
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
      events: {
        orderBy: { createdAt: 'desc' },
      },
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          title: true,
        },
      },
    },
  });

  if (!creditNote) {
    return null;
  }

  return {
    id: creditNote.id,
    creditNoteNumber: creditNote.creditNoteNumber,
    reason: creditNote.reason,
    amount: Number(creditNote.amount),
    currency: creditNote.currency || 'USD',
    status: creditNote.status,
    issuedAt: creditNote.issuedAt?.toISOString() ?? null,
    notes: creditNote.notes,
    createdAt: creditNote.createdAt.toISOString(),
    invoice: creditNote.invoice,
    lineItems: creditNote.lineItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount),
      sortOrder: item.sortOrder,
    })),
    events: creditNote.events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      actorType: event.actorType,
      metadata: event.metadata,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}

/**
 * Get all credit notes linked to a specific invoice.
 */
export async function getCreditNotesForInvoice(invoiceId: string) {
  const { workspace } = await getActiveWorkspace();

  // Verify invoice belongs to workspace
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!invoice) {
    return [];
  }

  const creditNotes = await prisma.creditNote.findMany({
    where: {
      invoiceId,
      workspaceId: workspace.id,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return creditNotes.map((cn) => ({
    id: cn.id,
    creditNoteNumber: cn.creditNoteNumber,
    reason: cn.reason,
    amount: Number(cn.amount),
    currency: cn.currency || 'USD',
    status: cn.status,
    issuedAt: cn.issuedAt?.toISOString() ?? null,
    createdAt: cn.createdAt.toISOString(),
    lineItems: cn.lineItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.amount),
      sortOrder: item.sortOrder,
    })),
  }));
}
