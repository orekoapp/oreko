import { getBaseUrl } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { prisma } from '@quotecraft/database';
import { sendEmail } from '@/lib/services/email';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  try {
    // Bug #16: Record start time to normalize response timing and prevent email enumeration via timing
    const startTime = Date.now();
    const MIN_RESPONSE_TIME = 500; // ms — ensures consistent timing regardless of user existence

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResult = checkRateLimit(`forgot-password:${clientIp}`, { limit: 5, windowMs: 300000 }); // 5 requests per 5 minutes
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const successResponse = {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    };

    // Bug #16: Helper to enforce minimum response time before returning
    const delayedResponse = async () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_RESPONSE_TIME) {
        await new Promise(r => setTimeout(r, MIN_RESPONSE_TIME - elapsed));
      }
      return NextResponse.json(successResponse);
    };

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return delayedResponse();
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.passwordHash) {
      return delayedResponse();
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Bug #84: Clean up expired tokens from all users (background housekeeping)
    prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    }).catch(() => {}); // Fire and forget

    // Generate a secure random token (store hash, send raw)
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save the hashed token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
      },
    });

    // Build reset URL (email gets raw token)
    const baseUrl = getBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    // Send email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Hi${user.name ? ` ${escapeHtml(user.name)}` : ''},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #3B82F6;">${resetUrl}</p>
        <p style="margin-top: 24px; color: #666; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px;">
          Sent by QuoteCraft
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Reset your password - QuoteCraft',
      html,
      tags: [{ name: 'type', value: 'password_reset' }],
    });

    // Bug #16: Use same timing-normalized response as non-existent user path
    return delayedResponse();
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
