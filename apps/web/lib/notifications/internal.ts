import { prisma } from '@oreko/database';

// Create a notification (used internally when events happen)
// NOT a server action — must not be callable from the client
export async function createNotification(input: {
  userId: string;
  workspaceId: string;
  type: string;
  title: string;
  message?: string;
  entityType?: string;
  entityId?: string;
  link?: string;
}): Promise<void> {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId,
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: input.entityType,
      entityId: input.entityId,
      link: input.link,
    },
  });
}

// Create notifications for all workspace members (e.g., when a quote is viewed by a client)
// NOT a server action — must not be callable from the client
export async function notifyWorkspaceMembers(input: {
  workspaceId: string;
  excludeUserId?: string;
  type: string;
  title: string;
  message?: string;
  entityType?: string;
  entityId?: string;
  link?: string;
}): Promise<void> {
  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId: input.workspaceId,
      ...(input.excludeUserId ? { userId: { not: input.excludeUserId } } : {}),
    },
    select: { userId: true },
  });

  if (members.length === 0) return;

  await prisma.notification.createMany({
    data: members.map((m) => ({
      userId: m.userId,
      workspaceId: input.workspaceId,
      type: input.type,
      title: input.title,
      message: input.message,
      entityType: input.entityType,
      entityId: input.entityId,
      link: input.link,
    })),
  });
}
