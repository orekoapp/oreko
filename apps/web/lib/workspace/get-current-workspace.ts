'use server';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

const ACTIVE_WORKSPACE_COOKIE = 'active-workspace-id';

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

interface WorkspaceContext {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
}

/**
 * Get the current user's active workspace ID, user ID, and role.
 * This is the shared helper used by all server actions that need workspace context.
 *
 * Wrapped with React.cache() so it only runs once per request —
 * multiple server actions calling this in the same render get the cached result.
 */
export const getCurrentUserWorkspace = cache(async (): Promise<WorkspaceContext> => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const cookieStore = await cookies();
  const storedWorkspaceId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;

  // If we have a stored workspace ID, verify the user has access and workspace is not deleted
  if (storedWorkspaceId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId: storedWorkspaceId,
        workspace: { deletedAt: null },
      },
      select: { workspaceId: true, role: true },
    });
    if (membership) {
      return { workspaceId: storedWorkspaceId, userId, role: membership.role as WorkspaceRole };
    }
  }

  // CR #12: Fall back to first non-deleted workspace
  logger.warn({ userId }, '[workspace] Stored workspace ID not found, falling back to first workspace');
  const firstMembership = await prisma.workspaceMember.findFirst({
    where: { userId, workspace: { deletedAt: null } },
    select: { workspaceId: true, role: true },
  });

  if (!firstMembership) {
    throw new Error('No workspace found');
  }

  return {
    workspaceId: firstMembership.workspaceId,
    userId,
    role: firstMembership.role as WorkspaceRole,
  };
});

/**
 * Role hierarchy for permission checks.
 * Higher value = more permissions.
 */
const ROLE_LEVELS: Record<WorkspaceRole, number> = {
  viewer: 0,
  editor: 1,
  admin: 2,
  owner: 3,
};

/**
 * Check if the current user has the minimum required role.
 * Throws an error if the user doesn't have sufficient permissions.
 */
export async function requireRole(minRole: WorkspaceRole): Promise<WorkspaceContext> {
  const ctx = await getCurrentUserWorkspace();
  if (ROLE_LEVELS[ctx.role] < ROLE_LEVELS[minRole]) {
    throw new Error(`Insufficient permissions. Required: ${minRole}, current: ${ctx.role}`);
  }
  return ctx;
}
