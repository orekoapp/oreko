import { prisma } from '@quotecraft/database';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger, maskEmail } from '@/lib/logger';

/** Rate limit: 5 login attempts per email per 15 minutes */
const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

// Bug #44: Ideally we'd also rate limit by IP to prevent credential stuffing across
// multiple email addresses. However, the credentials provider authorize() callback
// does not receive the raw request object, so we can't extract the client IP here.
// IP-based rate limiting for login should be added at the middleware layer or in a
// custom signIn handler if next-auth is upgraded to a version that exposes the request.

export async function verifyCredentials(email: string, password: string) {
  // Rate limit by email to prevent brute-force attacks
  const normalizedEmail = email.toLowerCase().trim();
  const rateLimitResult = await checkRateLimit(`login:${normalizedEmail}`, LOGIN_RATE_LIMIT);
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
    logger.warn({ email: maskEmail(normalizedEmail) }, '[auth] Authentication failed');
    return null;
  }

  if (!user.passwordHash) {
    // User signed up with OAuth, doesn't have a password
    logger.warn({ email: maskEmail(normalizedEmail) }, '[auth] Authentication failed');
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    logger.warn({ email: maskEmail(normalizedEmail) }, '[auth] Authentication failed');
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
