import { getBaseUrl } from '@/lib/utils';
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { z } from 'zod';
import { prisma } from '@quotecraft/database';
import { hashPassword } from '@/lib/auth/credentials';
import { checkRateLimit, getRateLimitHeaders, strictRateLimitOptions } from '@/lib/rate-limit';
import { passwordSchema } from '@/lib/validations/auth';
import { validateRequestOrigin } from '@/lib/csrf';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: passwordSchema,
  termsAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms and conditions' }) }),
});

// Reserved slugs that conflict with system routes
const RESERVED_SLUGS = new Set([
  'api', 'admin', 'auth', 'login', 'register', 'settings', 'dashboard',
  'onboarding', 'quotes', 'invoices', 'clients', 'projects', 'analytics',
  'help', 'templates', 'contracts', 'rate-cards', 'q', 'i', 'p', 'c',
  'invite', 'verify-email', 'reset-password', 'forgot-password',
  'public', 'static', 'assets', '_next',
]);

// Generate a unique workspace slug from name
function generateSlug(name: string): string {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  // Ensure slug doesn't collide with reserved routes
  if (RESERVED_SLUGS.has(baseSlug)) {
    baseSlug = `ws-${baseSlug}`;
  }
  const randomSuffix = crypto.randomUUID().substring(0, 8);
  return `${baseSlug}-${randomSuffix}`;
}

export async function POST(request: Request) {
  try {
    // Bug #14: CSRF origin validation
    if (!validateRequestOrigin(request)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = checkRateLimit(`register:${clientIp}`, strictRateLimitOptions);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.parse(body);
    const name = parsed.name;
    const email = parsed.email.toLowerCase();
    const password = parsed.password;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // MEDIUM #2: Use generic error to prevent user enumeration
    if (existingUser) {
      return NextResponse.json(
        { error: 'Unable to create account. Please try again.' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with workspace in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      // Create workspace for the user
      const workspaceName = `${name}'s Workspace`;
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: generateSlug(name),
          ownerId: user.id,
          settings: {
            onboardingCompleted: false,
          },
        },
      });

      // Add user as workspace member with owner role
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'owner',
          acceptedAt: new Date(),
        },
      });

      return user;
    });

    // Create email verification token and send email
    try {
      const rawToken = crypto.randomUUID();
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.emailVerificationToken.create({
        data: {
          userId: result.id,
          token: tokenHash, // Store hash, not raw token
          expiresAt: tokenExpiresAt,
        },
      });

      const { sendVerificationEmail } = await import('@/lib/services/email');
      const baseUrl = getBaseUrl();
      const verifyUrl = `${baseUrl}/verify-email/confirm?token=${rawToken}`; // Email gets raw token
      await sendVerificationEmail({ to: email, name, verifyUrl });
    } catch (emailError) {
      // Don't fail registration if verification email fails
      console.error('Failed to send verification email:', emailError);
    }

    // Bug #72: Audit log for new account creation
    console.info('[AUDIT] New account registered:', {
      userId: result.id,
      email: result.email,
      ip: clientIp,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      user: result,
      message: 'Account created. Please check your email to verify your account.',
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    const dbg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Something went wrong', _dbg: dbg },
      { status: 500 }
    );
  }
}
