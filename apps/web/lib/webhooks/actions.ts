'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import type { DomainEventType } from '@/lib/events/types';

/** All valid event types for webhook subscriptions */
const VALID_EVENT_TYPES: DomainEventType[] = [
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

function generateSecret(): string {
  return `whsec_${randomBytes(24).toString('hex')}`;
}

/**
 * Create a webhook endpoint for the current workspace.
 */
export async function createWebhookEndpoint(data: {
  url: string;
  events: string[];
}) {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions' };
  }

  // Validate URL
  try {
    const parsed = new URL(data.url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { success: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
  } catch {
    return { success: false, error: 'Invalid URL' };
  }

  // Validate events
  const validEvents = data.events.filter((e) =>
    VALID_EVENT_TYPES.includes(e as DomainEventType)
  );
  if (validEvents.length === 0) {
    return { success: false, error: 'At least one valid event type is required' };
  }

  const secret = generateSecret();

  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      workspaceId,
      url: data.url,
      secret,
      events: validEvents,
      isActive: true,
    },
  });

  revalidatePath('/settings/webhooks');

  return { success: true, endpoint: { ...endpoint, secret } };
}

/**
 * Update a webhook endpoint.
 */
export async function updateWebhookEndpoint(
  id: string,
  data: {
    url?: string;
    events?: string[];
    isActive?: boolean;
  }
) {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions' };
  }

  const existing = await prisma.webhookEndpoint.findFirst({
    where: { id, workspaceId },
  });

  if (!existing) {
    return { success: false, error: 'Webhook endpoint not found' };
  }

  // Validate URL if provided
  if (data.url) {
    try {
      const parsed = new URL(data.url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { success: false, error: 'URL must use HTTP or HTTPS protocol' };
      }
    } catch {
      return { success: false, error: 'Invalid URL' };
    }
  }

  // Validate events if provided
  if (data.events) {
    const validEvents = data.events.filter((e) =>
      VALID_EVENT_TYPES.includes(e as DomainEventType)
    );
    if (validEvents.length === 0) {
      return { success: false, error: 'At least one valid event type is required' };
    }
    data.events = validEvents;
  }

  const endpoint = await prisma.webhookEndpoint.update({
    where: { id },
    data: {
      ...(data.url && { url: data.url }),
      ...(data.events && { events: data.events }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });

  revalidatePath('/settings/webhooks');

  return { success: true, endpoint };
}

/**
 * Delete a webhook endpoint.
 */
export async function deleteWebhookEndpoint(id: string) {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Insufficient permissions' };
  }

  const existing = await prisma.webhookEndpoint.findFirst({
    where: { id, workspaceId },
  });

  if (!existing) {
    return { success: false, error: 'Webhook endpoint not found' };
  }

  await prisma.webhookEndpoint.delete({
    where: { id },
  });

  revalidatePath('/settings/webhooks');

  return { success: true };
}

/**
 * Get all webhook endpoints for the current workspace.
 */
export async function getWebhookEndpoints() {
  const { workspaceId } = await getCurrentUserWorkspace();

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { deliveries: true },
      },
    },
  });

  return endpoints.map((ep) => ({
    id: ep.id,
    url: ep.url,
    events: ep.events,
    isActive: ep.isActive,
    createdAt: ep.createdAt.toISOString(),
    updatedAt: ep.updatedAt.toISOString(),
    totalDeliveries: ep._count.deliveries,
  }));
}

/**
 * Get delivery history for a webhook endpoint.
 */
export async function getWebhookDeliveries(endpointId: string, limit = 20) {
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify endpoint belongs to workspace
  const endpoint = await prisma.webhookEndpoint.findFirst({
    where: { id: endpointId, workspaceId },
  });

  if (!endpoint) {
    return [];
  }

  const deliveries = await prisma.webhookDelivery.findMany({
    where: { endpointId },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 100),
  });

  return deliveries.map((d) => ({
    id: d.id,
    eventType: d.eventType,
    status: d.status,
    statusCode: d.statusCode,
    attempts: d.attempts,
    createdAt: d.createdAt.toISOString(),
  }));
}

