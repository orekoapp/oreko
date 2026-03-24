'use server';

import { revalidatePath } from 'next/cache';
import { hash, compare } from 'bcryptjs';
import { prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';

interface ActionResult {
  success: boolean;
  error?: string;
}

interface ChangePasswordInput {
  currentPassword?: string;
  newPassword: string;
}

export async function changePassword(input: ChangePasswordInput): Promise<ActionResult> {
  try {

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, passwordHash: true, emailVerifiedAt: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // If user has existing password, verify current password
    if (user.passwordHash) {
      if (!input.currentPassword) {
        return { success: false, error: 'Current password is required' };
      }

      const isValid = await compare(input.currentPassword, user.passwordHash);
      if (!isValid) {
        return { success: false, error: 'Current password is incorrect' };
      }
    } else {
      // Bug #13: OAuth users setting a password for the first time must have verified email
      if (!user.emailVerifiedAt) {
        return { success: false, error: 'Please verify your email before setting a password' };
      }
    }

    // Validate new password
    if (input.newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/.test(input.newPassword)) {
      return {
        success: false,
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      };
    }

    // Hash and save new password
    const passwordHash = await hash(input.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, passwordChangedAt: new Date() },
    });

    // Delete DB sessions for defense-in-depth + set passwordChangedAt so JWT callback
    // will reject tokens issued before this timestamp (forces re-login on all devices)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    revalidatePath('/settings/account');

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);

    if (error instanceof Error && error.message === 'Demo mode - mutations disabled') {
      return { success: false, error: 'Changes are disabled in demo mode' };
    }

    return { success: false, error: 'Something went wrong' };
  }
}

interface UpdateProfileInput {
  name?: string;
}

export async function updateProfile(input: UpdateProfileInput): Promise<ActionResult> {
  try {

    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate name
    if (input.name !== undefined) {
      if (input.name.length < 2) {
        return { success: false, error: 'Name must be at least 2 characters' };
      }
      if (input.name.length > 100) {
        return { success: false, error: 'Name must be less than 100 characters' };
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
      },
    });

    revalidatePath('/settings/account');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);

    if (error instanceof Error && error.message === 'Demo mode - mutations disabled') {
      return { success: false, error: 'Changes are disabled in demo mode' };
    }

    return { success: false, error: 'Something went wrong' };
  }
}
