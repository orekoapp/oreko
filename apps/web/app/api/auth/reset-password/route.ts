import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { hash } from 'bcryptjs';
import { prisma } from '@quotecraft/database';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { validateRequestOrigin } from '@/lib/csrf';
import { passwordSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  // Low #14: CSRF protection
  if (!validateRequestOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = await checkRateLimit(`reset-password:${clientIp}`, { limit: 5, windowMs: 300000 }); // 5 requests per 5 minutes
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const { token, password } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate password strength using shared schema
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      return NextResponse.json(
        { error: passwordResult.error.issues[0]?.message || 'Invalid password' },
        { status: 400 }
      );
    }

    // Hash the token to look up (tokens are stored as hashes)
    const tokenHash = createHash('sha256').update(token).digest('hex');

    // Bug #84: Clean up expired tokens on each request (lazy cleanup)
    await prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    }).catch(() => {}); // Don't block if cleanup fails

    // Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      // Delete the expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Check if token was already used
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await hash(password, 12);

    // Bug #83: Update password, mark token used, AND invalidate existing sessions
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash, passwordChangedAt: new Date() },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all existing sessions so stolen JWTs from before the reset
      // won't work if the app ever switches to DB sessions
      prisma.session.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
