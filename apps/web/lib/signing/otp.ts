import { randomInt, timingSafeEqual } from 'crypto';

/**
 * OTP verification for signer identity.
 * Uses in-memory storage (same pattern as rate-limit.ts).
 * For multi-instance deployments, replace with Redis.
 */

interface OtpRecord {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

// In-memory OTP store keyed by `${type}:${documentId}`
const otpStore = new Map<string, OtpRecord>();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/**
 * Generate a 6-digit OTP for a signing session.
 * Returns the code to be emailed to the signer.
 */
export function generateSigningOtp(key: string, email: string): string {
  const code = String(randomInt(100000, 999999));

  otpStore.set(key, {
    code,
    email: email.toLowerCase(),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
    verified: false,
  });

  return code;
}

/**
 * Verify a signing OTP.
 * Returns { valid, error } — valid=true means identity is verified.
 */
export function verifySigningOtp(
  key: string,
  code: string,
  email: string
): { valid: boolean; error?: string } {
  const record = otpStore.get(key);

  if (!record) {
    return { valid: false, error: 'No verification code found. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { valid: false, error: 'Verification code has expired. Please request a new one.' };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key);
    return { valid: false, error: 'Too many failed attempts. Please request a new code.' };
  }

  if (record.email !== email.toLowerCase()) {
    return { valid: false, error: 'Email address does not match.' };
  }

  record.attempts++;

  // Bug #154: Use constant-time comparison to prevent timing side-channel attacks
  const codeMatch = record.code.length === code.length &&
    timingSafeEqual(Buffer.from(record.code), Buffer.from(code));
  if (!codeMatch) {
    otpStore.set(key, record);
    return { valid: false, error: `Invalid code. ${MAX_ATTEMPTS - record.attempts} attempts remaining.` };
  }

  // Mark as verified
  record.verified = true;
  otpStore.set(key, record);

  return { valid: true };
}

/**
 * Check if a signing session has been verified via OTP.
 */
export function isSigningVerified(key: string): boolean {
  const record = otpStore.get(key);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return false;
  }
  return record.verified;
}

/**
 * Clean up expired OTPs (called lazily).
 */
export function cleanupExpiredOtps(): void {
  const now = Date.now();
  for (const [key, record] of otpStore) {
    if (now > record.expiresAt) {
      otpStore.delete(key);
    }
  }
}
