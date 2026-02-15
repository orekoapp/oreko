'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';
import { assertNotDemo } from '@/lib/demo/guard';

const ACTIVE_WORKSPACE_COOKIE = 'active-workspace-id';

export interface WorkspaceWithRole {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: Date;
}

export interface CreateWorkspaceInput {
  name: string;
}

// Get current user ID
async function getCurrentUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

// Generate a unique workspace slug from name
function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Get all workspaces for the current user
 */
export async function getUserWorkspaces(): Promise<WorkspaceWithRole[]> {
  const userId = await getCurrentUserId();

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      workspace: {
        createdAt: 'asc',
      },
    },
  });

  return memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role as 'owner' | 'admin' | 'member',
    createdAt: m.workspace.createdAt,
  }));
}

/**
 * Get the currently active workspace ID from cookie, or default to first workspace
 */
export async function getActiveWorkspaceId(): Promise<string> {
  const userId = await getCurrentUserId();
  const cookieStore = await cookies();
  const storedId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;

  // Verify the stored workspace ID is valid for this user
  if (storedId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId, workspaceId: storedId },
    });
    if (membership) {
      return storedId;
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

  return firstMembership.workspaceId;
}

/**
 * Get the active workspace details
 */
export async function getActiveWorkspace(): Promise<WorkspaceWithRole> {
  const userId = await getCurrentUserId();
  const workspaceId = await getActiveWorkspaceId();

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
        },
      },
    },
  });

  if (!membership) {
    throw new Error('Workspace not found');
  }

  return {
    id: membership.workspace.id,
    name: membership.workspace.name,
    slug: membership.workspace.slug,
    role: membership.role as 'owner' | 'admin' | 'member',
    createdAt: membership.workspace.createdAt,
  };
}

/**
 * Switch to a different workspace
 */
export async function switchWorkspace(workspaceId: string): Promise<void> {
  const userId = await getCurrentUserId();

  // Verify user has access to this workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId, workspaceId },
  });

  if (!membership) {
    throw new Error('Workspace not found or access denied');
  }

  // Set the active workspace cookie
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });

  revalidatePath('/', 'layout');
}

/**
 * Create a new workspace
 */
export async function createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceWithRole> {
  await assertNotDemo();
  const userId = await getCurrentUserId();

  const { name } = input;

  if (!name || name.trim().length < 2) {
    throw new Error('Workspace name must be at least 2 characters');
  }

  // Create workspace and membership in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: name.trim(),
        slug: generateSlug(name),
        ownerId: userId,
        settings: {
          onboardingCompleted: false,
        },
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: 'owner',
        acceptedAt: new Date(),
      },
    });

    return workspace;
  });

  // Switch to the new workspace
  await switchWorkspace(result.id);

  revalidatePath('/', 'layout');

  return {
    id: result.id,
    name: result.name,
    slug: result.slug,
    role: 'owner',
    createdAt: result.createdAt,
  };
}

/**
 * Update workspace name
 */
export async function updateWorkspace(workspaceId: string, name: string): Promise<void> {
  await assertNotDemo();
  const userId = await getCurrentUserId();

  // Verify user is owner or admin
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId,
      role: { in: ['owner', 'admin'] },
    },
  });

  if (!membership) {
    throw new Error('Permission denied');
  }

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { name: name.trim() },
  });

  revalidatePath('/', 'layout');
}

/**
 * Delete a workspace (owner only)
 */
export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await assertNotDemo();
  const userId = await getCurrentUserId();

  // Verify user is owner
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId,
      role: 'owner',
    },
  });

  if (!membership) {
    throw new Error('Only workspace owner can delete the workspace');
  }

  // Check user has at least one other workspace
  const otherWorkspaces = await prisma.workspaceMember.findMany({
    where: {
      userId,
      workspaceId: { not: workspaceId },
    },
  });

  if (otherWorkspaces.length === 0) {
    throw new Error('Cannot delete your only workspace');
  }

  // Delete workspace (cascades to all related data)
  await prisma.workspace.delete({
    where: { id: workspaceId },
  });

  // Switch to another workspace
  const nextWorkspace = otherWorkspaces[0];
  if (nextWorkspace) {
    await switchWorkspace(nextWorkspace.workspaceId);
  }

  revalidatePath('/', 'layout');
}
