import { createHmac } from 'crypto';
import { prisma } from '@quotecraft/database';
import { domainEvents } from '@/lib/events/emitter';
import type { DomainEvent, DomainEventType } from '@/lib/events/types';
import { logger } from '@/lib/logger';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 4000, 16000]; // Exponential backoff in ms

/**
 * Compute HMAC-SHA256 signature for a webhook payload.
 */
function computeSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Deliver a webhook event to a single endpoint.
 */
async function deliverToEndpoint(
  endpointId: string,
  endpointUrl: string,
  secret: string,
  event: DomainEvent
): Promise<void> {
  const payloadJson = JSON.stringify({
    type: event.type,
    payload: event.payload,
    timestamp: new Date().toISOString(),
  });

  const signature = computeSignature(payloadJson, secret);

  // Create delivery record
  const delivery = await prisma.webhookDelivery.create({
    data: {
      endpointId,
      eventType: event.type,
      payload: JSON.parse(payloadJson),
      status: 'pending',
      attempts: 0,
    },
  });

  // Attempt delivery with retries
  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature-256': signature,
          'X-Webhook-Event': event.type,
        },
        body: payloadJson,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const statusCode = response.status;
      let responseBody: string;
      try {
        responseBody = await response.text();
        // Limit stored response size
        if (responseBody.length > 1000) {
          responseBody = responseBody.slice(0, 1000) + '...';
        }
      } catch {
        responseBody = '';
      }

      if (statusCode >= 200 && statusCode < 300) {
        // Success
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'delivered',
            statusCode,
            response: responseBody,
            attempts: attempt + 1,
          },
        });
        return;
      }

      // Non-2xx response — update attempt count and retry
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          statusCode,
          response: responseBody,
          attempts: attempt + 1,
          ...(attempt < MAX_RETRY_ATTEMPTS - 1 && {
            nextRetry: new Date(Date.now() + RETRY_DELAYS[attempt]!),
          }),
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          attempts: attempt + 1,
          response: `Error: ${errorMessage}`,
          ...(attempt < MAX_RETRY_ATTEMPTS - 1 && {
            nextRetry: new Date(Date.now() + RETRY_DELAYS[attempt]!),
          }),
        },
      });
    }

    // Wait before retry (if not last attempt)
    if (attempt < MAX_RETRY_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]!));
    }
  }

  // All retries exhausted — mark as failed
  await prisma.webhookDelivery.update({
    where: { id: delivery.id },
    data: {
      status: 'failed',
      nextRetry: null,
    },
  });
}

/**
 * Handle a domain event by finding matching webhook endpoints and delivering.
 * Bug #2: Always require workspaceId — never deliver across all tenants.
 */
async function handleDomainEvent(event: DomainEvent): Promise<void> {
  const payload = event.payload as Record<string, unknown>;
  const workspaceId = payload.workspaceId as string | undefined;

  // Critical: Never query all endpoints — skip if workspaceId is missing
  if (!workspaceId) {
    logger.warn({ eventType: event.type }, '[Webhooks] Skipping event delivery — no workspaceId in payload');
    return;
  }

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {
      isActive: true,
      events: { has: event.type },
      workspaceId,
    },
  });

  if (endpoints.length === 0) {
    return;
  }

  // Deliver in parallel, don't let one failure block others
  await Promise.allSettled(
    endpoints.map((endpoint) =>
      deliverToEndpoint(endpoint.id, endpoint.url, endpoint.secret, event)
    )
  );
}

// All event types we listen for
const ALL_EVENT_TYPES: DomainEventType[] = [
  'quote.created',
  'quote.sent',
  'quote.accepted',
  'quote.declined',
  'invoice.created',
  'invoice.sent',
  'invoice.paid',
  'invoice.voided',
  'payment.received',
  'payment.refunded',
  'client.created',
  'credit_note.issued',
];

/**
 * Initialize outbound webhook listeners.
 * Call this once during application startup.
 */
export function initOutboundWebhooks(): void {
  for (const eventType of ALL_EVENT_TYPES) {
    domainEvents.on(eventType, (payload) => {
      // Fire and forget — don't block the main flow
      handleDomainEvent({ type: eventType, payload } as DomainEvent).catch((err) => {
        logger.error({ err, eventType }, '[Webhooks] Failed to handle event');
      });
    });
  }
}
