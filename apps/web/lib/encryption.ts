/**
 * AES-256-GCM encryption for sensitive data stored in the database.
 * Uses ENCRYPTION_KEY env var (32-byte hex string = 64 hex chars).
 * Falls back to plaintext if ENCRYPTION_KEY is not set (dev mode).
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { logger } from '@/lib/logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM standard
const TAG_LENGTH = 16;
const ENCRYPTED_PREFIX = 'enc:';

function getKey(): Buffer | null {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('ENCRYPTION_KEY not set in production — secrets stored in plaintext. Set a 64-char hex key.');
    }
    return null;
  }
  if (hex.length !== 64) {
    logger.warn('ENCRYPTION_KEY must be 64 hex chars (32 bytes). Encryption disabled.');
    return null;
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Encrypt a plaintext string. Returns prefixed ciphertext or plaintext if no key.
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  if (!key) return plaintext;

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: enc:<iv>:<tag>:<ciphertext> (all base64)
  return `${ENCRYPTED_PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

/**
 * Decrypt a string. Handles both encrypted (prefixed) and plaintext (legacy) values.
 */
export function decrypt(value: string): string {
  if (!value.startsWith(ENCRYPTED_PREFIX)) {
    // Legacy plaintext value — return as-is
    return value;
  }

  const key = getKey();
  if (!key) {
    logger.warn('Cannot decrypt: ENCRYPTION_KEY not set');
    return value;
  }

  const parts = value.slice(ENCRYPTED_PREFIX.length).split(':');
  if (parts.length !== 3) {
    logger.warn('Invalid encrypted value format');
    return value;
  }

  const ivB64 = parts[0]!;
  const tagB64 = parts[1]!;
  const dataB64 = parts[2]!;
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const encrypted = Buffer.from(dataB64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted, undefined, 'utf8') + decipher.final('utf8');
}

/**
 * Check if encryption is available.
 */
export function isEncryptionEnabled(): boolean {
  return !!getKey();
}
