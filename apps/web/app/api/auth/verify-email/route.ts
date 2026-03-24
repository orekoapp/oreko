import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@quotecraft/database';
import { checkRateLimit, getRateLimitHeaders, strictRateLimitOptions } from '@/lib/rate-limit';
import { validateRequestOrigin } from '@/lib/csrf';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    if (!validateRequestOrigin(request)) {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = await checkRateLimit(`verify-email:${clientIp}`, strictRateLimitOptions);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const token = body.token as string | undefined;
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Hash the token to look up (tokens are stored as hashes)
    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token: tokenHash },
      include: { user: { select: { id: true, emailVerifiedAt: true } } },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid verification link' }, { status: 400 });
    }

    if (verificationToken.usedAt) {
      return NextResponse.json({ error: 'This link has already been used' }, { status: 400 });
    }

    if (new Date() > verificationToken.expiresAt) {
      return NextResponse.json({ error: 'This verification link has expired' }, { status: 400 });
    }

    // Already verified
    if (verificationToken.user.emailVerifiedAt) {
      // Mark token as used anyway
      await prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      });
      return NextResponse.json({ success: true, message: 'Email already verified' });
    }

    // Verify the user's email
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Email verification error');
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
