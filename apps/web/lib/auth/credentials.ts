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

  if (!user || user.deletedAt) {
    return null;
  }

  if (!user.passwordHash) {
    // User signed up with OAuth, doesn't have a password
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  // Bug #17: Enforce email verification before allowing login
  // Skip in development since SMTP is not configured
  if (!user.emailVerifiedAt && process.env.NODE_ENV !== 'development') {
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
