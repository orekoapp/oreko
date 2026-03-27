import { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@quotecraft/database';
import { authenticateApiRequest, apiSuccess, apiError } from '@/lib/api/auth';
import { toNumber, getBaseUrl } from '@/lib/utils';
import { sendQuoteSentEmail } from '@/lib/services/email';
import { logger } from '@/lib/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/v1/quotes/:id/send — Send a quote to the client
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
      if (invalid.length > 0) return apiError(`Invalid email addresses: ${invalid.join(', ')}`, 400);
    }

    // Fetch quote with client
    const quote = await prisma.quote.findFirst({
      where: { id: id, workspaceId, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!quote) return apiError('Quote not found', 404);

    // Validate status allows sending
    const validSendStatuses = ['draft', 'sent', 'viewed'];
    if (!validSendStatuses.includes(quote.status)) {
      return apiError(`Cannot send a quote with status: ${quote.status}`, 400);
    }

    if (!quote.client?.email && (!recipients || recipients.length === 0)) {
      return apiError('Client email is required to send quote', 400);
    }

    // Prevent sending empty quotes
    if (Math.abs(toNumber(quote.total)) < 0.01) {
      return apiError('Cannot send a quote with zero total. Add line items first.', 400);
    }

    // Get workspace for business name
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    });

    // Send email
    const baseUrl = getBaseUrl();
    const quoteUrl = `${baseUrl}/q/${quote.accessToken}`;
    const emailRecipients = recipients?.length ? recipients : [quote.client!.email];

    let emailSent = false;
    try {
      const emailResult = await sendQuoteSentEmail({
        to: emailRecipients,
        clientName: quote.client!.name,
        quoteName: quote.title || quote.quoteNumber,
        quoteUrl,
        businessName: workspace?.name || 'Oreko',
        validUntil: quote.expirationDate || undefined,
        message: message || undefined,
        rateLimitKey: workspaceId,
      });
      emailSent = emailResult.success;
    } catch (err) {
      logger.error({ err }, 'Failed to send quote email');
    }

    // Only update status to sent if email was actually delivered
    if (emailSent) {
      await prisma.quote.update({
        where: { id: id },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      });
    }

    // Create event
    await prisma.quoteEvent.create({
      data: {
        quoteId: id,
        eventType: emailSent ? 'sent' : 'send_failed',
        actorType: 'system',
        metadata: { via: 'api', emailSent },
      },
    }).catch(() => {});

    if (!emailSent) {
      return apiError('Quote email could not be sent. Status unchanged.', 502);
    }

    return apiSuccess({
      message: 'Quote sent successfully',
      emailSent,
      quoteUrl,
    });
  } catch (err) {
    logger.error({ err }, 'Send quote API error');
    return apiError('Internal server error', 500);
  }
}
