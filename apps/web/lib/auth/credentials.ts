import { prisma } from '@quotecraft/database';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rate-limit';

/** Rate limit: 5 login attempts per email per 15 minutes */
const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

export async function verifyCredentials(email: string, password: string) {
  // Rate limit by email to prevent brute-force attacks
  const normalizedEmail = email.toLowerCase().trim();
  const rateLimitResult = checkRateLimit(`login:${normalizedEmail}`, LOGIN_RATE_LIMIT);
  if (rateLimitResult.limited) {
    throw new Error('Too many login attempts. Please try again in 15 minutes.');
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      passwordHash: true,
      emailVerifiedAt: true,
      deletedAt: true,
    },
  });

  // Bug #84: Reject soft-deleted users — also checked in JWT callback for existing tokens
  if (!user || user.deletedAt) {
    const reason = !user ? 'user not found' : 'soft-deleted account';
    console.warn(`[auth] Failed login attempt for email: ${normalizedEmail} at ${new Date().toISOString()} — reason: ${reason}`);
    return null;
  }

  if (!user.passwordHash) {
    // User signed up with OAuth, doesn't have a password
    console.warn(`[auth] Failed login attempt for email: ${normalizedEmail} at ${new Date().toISOString()} — reason: OAuth-only account (no password)`);
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    console.warn(`[auth] Failed login attempt for email: ${normalizedEmail} at ${new Date().toISOString()} — reason: wrong password`);
    return null;
  }

  // Bug #17: Enforce email verification before allowing login
  // Use dedicated env var instead of NODE_ENV (Vercel previews may use NODE_ENV=development)
  const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true' && process.env.NODE_ENV !== 'production';
  if (!user.emailVerifiedAt && !skipVerification) {
    throw new Error('Please verify your email before logging in. Check your inbox for a verification link.');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
