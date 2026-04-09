import { NextRequest } from 'next/server';
import { prisma } from '@oreko/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';
import { toNumber, formatCurrency, getBaseUrl } from '@/lib/utils';
import { sendInvoiceSentEmail } from '@/lib/services/email';
import { logger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/v1/invoices/:id/send — Send an invoice to the client
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await authenticateApiRequest(request);
    if ('error' in auth) return auth.error;
    const { workspaceId } = auth.context;
    const { id } = await params;

    // Parse optional body (message, recipients)
    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional for send
    }

    const { message, recipients } = body as {
      message?: string;
      recipients?: string[];
    };

    // Validate recipients
    if (recipients) {
      if (recipients.length > 10) return apiError('Maximum 10 recipients allowed', 400);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalid = recipients.filter(e => !emailRegex.test(e));
      if (invalid.length > 0) return apiError('One or more email addresses are invalid', 400);
    }

    // Fetch invoice with client
    const invoice = await prisma.invoice.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
      },
    });

    if (!invoice) return apiError('Invoice not found', 404);

    // Validate status allows sending
    const validSendStatuses = ['draft', 'sent', 'viewed'];
    if (!validSendStatuses.includes(invoice.status)) {
      return apiError(`Cannot send an invoice with status: ${invoice.status}`, 400);
    }

    if (!invoice.client?.email && (!recipients || recipients.length === 0)) {
      return apiError('Client email is required to send invoice', 400);
    }

    // Prevent sending zero-amount invoices
    if (Math.abs(toNumber(invoice.total)) < 0.01) {
      return apiError('Cannot send an invoice with zero total. Add line items first.', 400);
    }

    // Get workspace for business name
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    // Send email
    const baseUrl = getBaseUrl();
    const invoiceUrl = `${baseUrl}/i/${invoice.accessToken}`;
    const emailRecipients = recipients?.length ? recipients : [invoice.client!.email];

    let emailSent = false;
    try {
      const emailResult = await sendInvoiceSentEmail({
        to: emailRecipients,
        clientName: invoice.client!.name,
        invoiceNumber: invoice.invoiceNumber,
        invoiceUrl,
        businessName: workspace?.name || 'Oreko',
        amount: formatCurrency(toNumber(invoice.total)),
        dueDate: invoice.dueDate,
        message: message || undefined,
        rateLimitKey: workspaceId,
      });
      emailSent = emailResult.success;
    } catch (err) {
      logger.error({ err }, 'Failed to send invoice email');
    }

    // Only update status to sent if email was actually delivered
    if (emailSent) {
      await prisma.invoice.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      });
    }

    // Create event
    await prisma.invoiceEvent.create({
      data: {
        invoiceId: id,
        eventType: emailSent ? 'sent' : 'send_failed',
        actorType: 'system',
        metadata: { via: 'api', emailSent },
      },
    }).catch(() => {});

    if (!emailSent) {
      return apiError('Invoice email could not be sent. Status unchanged.', 502);
    }

    return apiSuccess({
      message: 'Invoice sent successfully',
      emailSent,
      invoiceUrl,
    });
  } catch (err) {
    logger.error({ err }, 'Send invoice API error');
    return apiError('Internal server error', 500);
  }
}
