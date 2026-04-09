'use server';

import { prisma } from '@oreko/database';
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

// Bug #86: Whitelist allowed preference keys to prevent mass assignment
const ALLOWED_PREFERENCE_KEYS = new Set(['fontSize', 'sidebarStyle']);

export async function updateUserPreferences(
  prefs: UserPreferences
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Only allow whitelisted keys
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(prefs)) {
      if (ALLOWED_PREFERENCE_KEYS.has(key)) {
        sanitized[key] = value;
      }
    }

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
        preferences: { ...existing, ...sanitized } as any,
      },
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save preferences' };
  }
}
