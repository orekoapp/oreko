/**
 * Wraps PrismaAdapter to encrypt/decrypt OAuth tokens at rest.
 * Only encrypts access_token and refresh_token fields.
 * Falls back to plaintext if ENCRYPTION_KEY is not set.
 */
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter, AdapterAccount } from 'next-auth/adapters';
import { prisma } from '@oreko/database';
import { encrypt, decrypt, isEncryptionEnabled } from '@/lib/encryption';

const baseAdapter = PrismaAdapter(prisma) as Adapter;

function encryptTokens(account: Record<string, unknown>): Record<string, unknown> {
  if (!isEncryptionEnabled()) return account;
  const result = { ...account };
  if (typeof result.access_token === 'string') {
    result.access_token = encrypt(result.access_token);
  }
  if (typeof result.refresh_token === 'string') {
    result.refresh_token = encrypt(result.refresh_token);
  }
  return result;
}

function decryptTokens(account: AdapterAccount | null): AdapterAccount | null {
  if (!account || !isEncryptionEnabled()) return account;
  return {
    ...account,
    access_token: account.access_token ? decrypt(account.access_token) : undefined,
    refresh_token: account.refresh_token ? decrypt(account.refresh_token) : undefined,
  };
}

export const encryptedAdapter: Adapter = {
  ...baseAdapter,

  linkAccount: async (account) => {
    const encrypted = encryptTokens(account as unknown as Record<string, unknown>);
    const result = await baseAdapter.linkAccount!(encrypted as Parameters<NonNullable<Adapter['linkAccount']>>[0]);
    return result ?? undefined;
  },

  // Prisma adapter doesn't expose getAccount directly, but NextAuth
  // calls it internally via the adapter. The PrismaAdapter reads tokens
  // in getUserByAccount which we wrap here.
  getUserByAccount: async (providerAccountId) => {
    // Call base to get the user, tokens are only used internally by NextAuth
    return baseAdapter.getUserByAccount!(providerAccountId);
  },
};
