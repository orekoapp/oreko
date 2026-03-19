'use server';

import { prisma } from '@quotecraft/database';
import { revalidatePath } from 'next/cache';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';

export interface SavedLineItemData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string | null;
  taxable: boolean;
  createdAt: string;
}

export async function getSavedLineItems(): Promise<SavedLineItemData[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const items = await prisma.savedLineItem.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    duration: item.duration,
    taxable: item.taxable,
    createdAt: item.createdAt.toISOString(),
  }));
}

export async function createSavedLineItem(data: {
  name: string;
  description?: string;
  price?: number;
  duration?: string;
  taxable?: boolean;
}) {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Viewers cannot create items' };
  }

  if (!data.name?.trim()) {
    return { success: false, error: 'Name is required' };
  }

  const item = await prisma.savedLineItem.create({
    data: {
      workspaceId,
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price: data.price ?? 0,
      duration: data.duration || null,
      taxable: data.taxable ?? true,
    },
  });

  revalidatePath('/templates/invoice-items');
  return { success: true, item: { ...item, price: Number(item.price) } };
}

export async function updateSavedLineItem(id: string, data: {
  name?: string;
  description?: string;
  price?: number;
  duration?: string;
  taxable?: boolean;
}) {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Viewers cannot update items' };
  }

  const item = await prisma.savedLineItem.findFirst({
    where: { id, workspaceId },
  });

  if (!item) {
    return { success: false, error: 'Item not found' };
  }

  const updated = await prisma.savedLineItem.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description.trim() || null }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.duration !== undefined && { duration: data.duration || null }),
      ...(data.taxable !== undefined && { taxable: data.taxable }),
    },
  });

  revalidatePath('/templates/invoice-items');
  return { success: true, item: { ...updated, price: Number(updated.price) } };
}

export async function deleteSavedLineItem(id: string) {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Viewers cannot delete items' };
  }

  const item = await prisma.savedLineItem.findFirst({
    where: { id, workspaceId },
  });

  if (!item) {
    return { success: false, error: 'Item not found' };
  }

  await prisma.savedLineItem.delete({ where: { id } });

  revalidatePath('/templates/invoice-items');
  return { success: true };
}

export async function deleteSavedLineItems(ids: string[]) {
  const { workspaceId, role } = await getCurrentUserWorkspace();

  if (role === 'viewer') {
    return { success: false, error: 'Viewers cannot delete items' };
  }

  await prisma.savedLineItem.deleteMany({
    where: { id: { in: ids }, workspaceId },
  });

  revalidatePath('/templates/invoice-items');
  return { success: true };
}
