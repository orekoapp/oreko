'use server';

import { prisma } from '@oreko/database';
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

// Low #91: Added offset pagination support
export async function getNotifications(limit = 20, offset = 0): Promise<{ data: NotificationData[]; total: number }> {
  const { userId, workspaceId } = await getCurrentUserWorkspace();

  const where = { userId, workspaceId };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where }),
  ]);

  return { data: notifications, total };
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
  const { userId, workspaceId } = await getCurrentUserWorkspace();

  // HIGH #51: Include workspaceId to prevent cross-workspace notification manipulation
  await prisma.notification.updateMany({
    where: { id: notificationId, userId, workspaceId },
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

