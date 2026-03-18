'use server';

import { prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';

export interface UserPreferences {
  fontSize?: string;
  sidebarStyle?: string;
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const session = await auth();
  if (!session?.user?.id) {
    return {};
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  });

  if (!user?.preferences || typeof user.preferences !== 'object') {
    return {};
  }

  return user.preferences as UserPreferences;
}

export async function updateUserPreferences(
  prefs: UserPreferences
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Merge with existing preferences so we don't overwrite other fields
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    const existing =
      user?.preferences && typeof user.preferences === 'object'
        ? (user.preferences as Record<string, unknown>)
        : {};

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: { ...existing, ...prefs },
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save preferences' };
  }
}
