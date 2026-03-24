'use server';

import { randomBytes, createHash } from 'crypto';
import { prisma } from '@quotecraft/database';
import { revalidatePath } from 'next/cache';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export interface ApiKeyListItem {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

/**
 * Generate a new API key. Returns the raw key ONCE — it's hashed in DB.
 */
export async function generateApiKey(data: {
  name: string;
  expiresAt?: string | null;
}): Promise<{ success: boolean; key?: string; id?: string; error?: string }> {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role !== 'owner' && role !== 'admin') {
    return { success: false, error: 'Only owners and admins can create API keys' };
  }

  if (!data.name?.trim()) {
    return { success: false, error: 'API key name is required' };
  }

  // Generate a secure random key with prefix
  const rawBytes = randomBytes(32);
  const rawKey = `qc_sk_${rawBytes.toString('hex')}`;
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 10);

  await prisma.apiKey.create({
    data: {
      workspaceId,
      name: data.name.trim(),
      keyHash,
      keyPrefix,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  revalidatePath('/settings/api');
  return { success: true, key: rawKey };
}

/**
 * List all active API keys for the workspace (never returns the actual key).
 */
export async function getApiKeys(): Promise<ApiKeyListItem[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const keys = await prisma.apiKey.findMany({
    where: { workspaceId, revokedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return keys;
}

/**
 * Revoke (delete) an API key.
 */
export async function revokeApiKey(id: string): Promise<{ success: boolean; error?: string }> {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role !== 'owner' && role !== 'admin') {
    return { success: false, error: 'Only owners and admins can revoke API keys' };
  }

  const key = await prisma.apiKey.findFirst({
    where: { id, workspaceId, revokedAt: null },
  });

  if (!key) {
    return { success: false, error: 'API key not found' };
  }

  await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  revalidatePath('/settings/api');
  return { success: true };
}
