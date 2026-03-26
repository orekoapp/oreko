import { NextResponse } from 'next/server';
import { prisma } from '@quotecraft/database';
import { randomBytes } from 'crypto';
import { logger } from '@/lib/logger';

/**
 * Vercel Cron Job — Generates recurring invoices.
 *
 * Schedule: 0 6 * * * (daily at 6 AM UTC)
 * Configured in vercel.json
 *
 * Finds all invoices where isRecurring=true and nextRecurringDate <= today,
 * then generates a new child invoice for each.
 */
export async function GET(request: Request) {
  // Verify the cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Bug #3: Require CRON_SECRET in ALL environments to prevent unauthorized access
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    logger.info('[Recurring Invoices] Starting recurring invoice generation...');

    const now = new Date();
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Find recurring invoices due for generation in batches to avoid memory issues
    const BATCH_SIZE = 50;
    let offset = 0;
    let eligibleInvoices: Awaited<ReturnType<typeof prisma.invoice.findMany>> = [];
    let totalFound = 0;

    // Paginate through all due invoices in batches of 50
    while (true) {
      const batch = await prisma.invoice.findMany({
        where: {
          isRecurring: true,
          nextRecurringDate: { lte: today },
          deletedAt: null,
        },
        include: {
          lineItems: { orderBy: { sortOrder: 'asc' } },
        },
        take: BATCH_SIZE,
        skip: offset,
        orderBy: { createdAt: 'asc' },
      });
      eligibleInvoices.push(...batch);
      totalFound += batch.length;
      if (batch.length < BATCH_SIZE) break;
      offset += BATCH_SIZE;
    }

    logger.info({ total: totalFound }, '[Recurring Invoices] Found invoice(s) due');

    let generated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const parent of eligibleInvoices) {
      try {
        // Check if end date has passed
        if (parent.recurringEndDate && new Date() > parent.recurringEndDate) {
          await prisma.invoice.update({
            where: { id: parent.id },
            data: { isRecurring: false, nextRecurringDate: null },
          });
          logger.info({ invoiceNumber: parent.invoiceNumber }, '[Recurring Invoices] End date passed, disabled recurring');
          continue;
        }

        // Generate invoice number atomically
        const seqResult = await prisma.$transaction(async (tx) => {
          const updated = await tx.numberSequence.upsert({
            where: {
              workspaceId_type: { workspaceId: parent.workspaceId, type: 'invoice' },
            },
            update: { currentValue: { increment: 1 } },
            create: {
              workspaceId: parent.workspaceId,
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

        const paddedValue = String(seqResult.value).padStart(seqResult.padding, '0');
        const prefix = seqResult.prefix.replace(/-$/, '');
        const parts = [prefix, paddedValue];
        if (seqResult.suffix) parts.push(seqResult.suffix);
        const invoiceNumber = parts.join('-');

        // Calculate payment term days from parent
        const issueTodue = parent.dueDate.getTime() - parent.issueDate.getTime();
        const paymentTermDays = Math.max(Math.round(issueTodue / (1000 * 60 * 60 * 24)), 1);
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + paymentTermDays);

        const status = parent.recurringAutoSend ? 'sent' : 'draft';

        // Create the child invoice in a transaction
        await prisma.$transaction(async (tx) => {
          const newInvoice = await tx.invoice.create({
            data: {
              workspaceId: parent.workspaceId,
              clientId: parent.clientId,
              projectId: parent.projectId,
              parentInvoiceId: parent.id,
              invoiceNumber,
              title: parent.title || 'Invoice',
              status,
              currency: parent.currency,
              accessToken: randomBytes(32).toString('hex'),
              issueDate,
              dueDate,
              subtotal: parent.subtotal,
              discountType: parent.discountType,
              discountValue: parent.discountValue,
              discountAmount: parent.discountAmount,
              taxTotal: parent.taxTotal,
              total: parent.total,
              amountDue: parent.total,
              amountPaid: 0,
              notes: parent.notes,
              terms: parent.terms,
              settings: parent.settings as any,
              sentAt: parent.recurringAutoSend ? new Date() : null,
              lineItems: {
                create: parent.lineItems.map((item, idx) => ({
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
          });

          // Log creation event
          await tx.invoiceEvent.create({
            data: {
              invoiceId: newInvoice.id,
              eventType: 'created',
              actorType: 'system',
              metadata: { trigger: 'recurring', parentInvoiceId: parent.id },
            },
          });

          if (parent.recurringAutoSend) {
            await tx.invoiceEvent.create({
              data: {
                invoiceId: newInvoice.id,
                eventType: 'sent',
                actorType: 'system',
                metadata: { trigger: 'recurring_auto_send' },
              },
            });
          }

          // Update parent's next recurring date
          const interval = parent.recurringInterval || 'monthly';
          const nextDate = calculateNextDate(new Date(), interval);

          if (parent.recurringEndDate && nextDate > parent.recurringEndDate) {
            await tx.invoice.update({
              where: { id: parent.id },
              data: { nextRecurringDate: null, isRecurring: false },
            });
          } else {
            await tx.invoice.update({
              where: { id: parent.id },
              data: { nextRecurringDate: nextDate },
            });
          }
        });

        generated++;
        logger.info({ invoiceNumber, parentInvoiceNumber: parent.invoiceNumber }, '[Recurring Invoices] Generated invoice');
      } catch (err) {
        failed++;
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${parent.invoiceNumber}: ${message}`);
        logger.error({ err, parentInvoiceNumber: parent.invoiceNumber }, '[Recurring Invoices] Failed to generate');
      }
    }

    logger.info({ generated, failed }, '[Recurring Invoices] Complete');

    return NextResponse.json({
      success: true,
      generated,
      failed,
      total: totalFound,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ err: error }, '[Recurring Invoices] Error');
    return NextResponse.json(
      { success: false, error: 'Failed to process recurring invoices' },
      { status: 500 }
    );
  }
}

function calculateNextDate(fromDate: Date, interval: string): Date {
  const next = new Date(fromDate);
  switch (interval) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
}
