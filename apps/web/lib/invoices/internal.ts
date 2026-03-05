/**
 * Internal invoice operations that should NOT be exposed as server actions.
 * This file intentionally does NOT have 'use server' directive.
 */

import { prisma, type Prisma } from '@quotecraft/database';

/**
 * Generate next invoice number for a workspace (atomic, race-condition safe).
 */
export async function generateInvoiceNumber(workspaceId: string): Promise<string> {
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.numberSequence.upsert({
      where: { workspaceId_type: { workspaceId, type: 'invoice' } },
      update: { currentValue: { increment: 1 } },
      create: {
        workspaceId,
        type: 'invoice',
        prefix: 'INV',
        currentValue: 1,
        padding: 4,
      },
    });
    return {
      prefix: updated.prefix || 'INV',
      suffix: updated.suffix,
      value: updated.currentValue,
      padding: updated.padding,
    };
  });

  const paddedValue = String(result.value).padStart(result.padding, '0');
  const prefix = result.prefix.replace(/-$/, '');
  const parts = [prefix, paddedValue];
  if (result.suffix) {
    parts.push(result.suffix);
  }
  return parts.join('-');
}

/**
 * Create invoice from quote without requiring auth context.
 * Used by the public portal when auto-invoice is enabled on quote acceptance.
 *
 * NOT a server action - only callable from server-side code, not from the client.
 */
export async function createInvoiceFromQuoteInternal(
  quoteId: string,
  workspaceId: string,
  options?: { dueDays?: number }
): Promise<{ success: boolean; invoice?: { id: string; accessToken: string }; error?: string }> {
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, workspaceId, deletedAt: null },
    include: {
      lineItems: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!quote) {
    return { success: false, error: 'Quote not found' };
  }

  const existingInvoice = await prisma.invoice.findFirst({
    where: { quoteId: quote.id },
  });
  if (existingInvoice) {
    return { success: false, error: 'Invoice already exists for this quote' };
  }

  const invoiceNumber = await generateInvoiceNumber(workspaceId);
  const dueDays = options?.dueDays ?? 30;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueDays);

  const invoice = await prisma.$transaction(async (tx) => {
    const newInvoice = await tx.invoice.create({
      data: {
        workspaceId,
        clientId: quote.clientId,
        projectId: quote.projectId,
        quoteId: quote.id,
        invoiceNumber,
        title: quote.title || 'Invoice',
        status: 'sent', // Auto-generated from quote acceptance — ready for client payment
        issueDate: new Date(),
        dueDate,
        subtotal: quote.subtotal,
        discountType: quote.discountType,
        discountValue: quote.discountValue,
        discountAmount: quote.discountAmount,
        taxTotal: quote.taxTotal,
        total: quote.total,
        amountDue: quote.total,
        notes: quote.notes,
        terms: quote.terms,
        settings: {} as unknown as Prisma.InputJsonValue,
        lineItems: {
          create: quote.lineItems.map((item, idx) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            sortOrder: idx,
          })),
        },
      },
      select: { id: true, accessToken: true },
    });

    await tx.quote.update({
      where: { id: quote.id },
      data: { status: 'converted' },
    });

    await tx.quoteEvent.create({
      data: {
        quoteId: quote.id,
        eventType: 'converted_to_invoice',
        actorType: 'system',
        metadata: { invoiceId: newInvoice.id, trigger: 'auto_convert' },
      },
    });

    await tx.invoiceEvent.create({
      data: {
        invoiceId: newInvoice.id,
        eventType: 'created',
        actorType: 'system',
        metadata: { fromQuoteId: quote.id, trigger: 'auto_convert' },
      },
    });

    return newInvoice;
  });

  return { success: true, invoice: { id: invoice.id, accessToken: invoice.accessToken } };
}
