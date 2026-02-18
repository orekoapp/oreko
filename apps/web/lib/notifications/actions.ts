'use server';

import { prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { revalidatePath } from 'next/cache';

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string | null;
  entityType: string | null;
  entityId: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

// Get notifications for the current user
export async function getNotifications(limit = 20): Promise<NotificationData[]> {
  const { userId, workspaceId } = await getCurrentUserWorkspace();

  const notifications = await prisma.notification.findMany({
    where: { userId, workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return notifications;
}

// Get unread notification count
export async function getUnreadNotificationCount(): Promise<number> {
  const { userId, workspaceId } = await getCurrentUserWorkspace();

  return prisma.notification.count({
    where: { userId, workspaceId, isRead: false },
  });
}

// Mark a single notification as read
export async function markNotificationRead(notificationId: string): Promise<void> {
  const { userId } = await getCurrentUserWorkspace();

  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath('/');
}

// Mark all notifications as read
export async function markAllNotificationsRead(): Promise<void> {
  const { userId, workspaceId } = await getCurrentUserWorkspace();

  await prisma.notification.updateMany({
    where: { userId, workspaceId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  revalidatePath('/');
}

// Create a notification (used internally when events happen)
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
