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

