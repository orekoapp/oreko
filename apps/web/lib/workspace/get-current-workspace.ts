'use server';

import { cookies } from 'next/headers';
import { prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';

const ACTIVE_WORKSPACE_COOKIE = 'active-workspace-id';

/**
 * Get the current user's active workspace ID and user ID.
 * This is the shared helper used by all server actions that need workspace context.
 *
 * Respects the active workspace cookie if set, otherwise falls back to the first workspace.
 */
export async function getCurrentUserWorkspace(): Promise<{ workspaceId: string; userId: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const cookieStore = await cookies();
  const storedWorkspaceId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;

  // If we have a stored workspace ID, verify the user has access
  if (storedWorkspaceId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId, workspaceId: storedWorkspaceId },
      select: { workspaceId: true },
    });
    if (membership) {
      return { workspaceId: storedWorkspaceId, userId };
    }
  }

  // Fall back to first workspace
  const firstMembership = await prisma.workspaceMember.findFirst({
    where: { userId },
    select: { workspaceId: true },
  });

  if (!firstMembership) {
    throw new Error('No workspace found');
  }

  return {
    workspaceId: firstMembership.workspaceId,
    userId,
  };
}
