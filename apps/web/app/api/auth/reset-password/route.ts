import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@quotecraft/database';

export async function POST(request: NextRequest) {
  try {
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

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    // Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
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

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
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
