import { auth } from '@/lib/auth';
import { prisma } from '@oreko/database';
import { DEMO_CONFIG } from './constants';

/**
 * Check if the current session is a demo session
 * @returns true if the current user is the demo user
 *
 * Uses email match first, then falls back to checking
 * if the user's workspace has the demo slug. This ensures
 * demo guard works even if DEMO_USER_EMAIL env var is misconfigured.
 */
export async function isDemoSession(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  // Primary check: email match
  if (session.user.email === DEMO_CONFIG.email) return true;

  // Fallback: check if the user's current workspace is the demo workspace
  if (session.user.id) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: {
        workspace: {
          select: { slug: true },
        },
      },
    });
    if (membership?.workspace?.slug === DEMO_CONFIG.workspaceSlug) return true;
  }

  return false;
}
