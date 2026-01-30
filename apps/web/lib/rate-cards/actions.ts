'use server';

import { revalidatePath } from 'next/cache';
import { prisma, Prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';
import { assertNotDemo } from '@/lib/demo/guard';
import type {
  RateCardListItem,
  RateCardDetail,
  CategoryListItem,
  CreateRateCardInput,
  UpdateRateCardInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  RateCardFilter,
  RateCardStats,
  PaginatedRateCards,
  RateCardSelection,
  RateCardImportResult,
} from './types';

// Helper to get current user's workspace
async function getCurrentUserWorkspace(): Promise<{ workspaceId: string; userId: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Get user's first workspace (for now, single workspace support)
  const workspaceMember = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    select: { workspaceId: true },
  });

  if (!workspaceMember) {
    throw new Error('No workspace found');
  }

  return {
    workspaceId: workspaceMember.workspaceId,
    userId: session.user.id,
  };
}

// Helper to convert Prisma Decimal to number
function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return value.toNumber();
}

// ============================================
// RATE CARD ACTIONS
// ============================================

// Get rate cards with pagination and filters
export async function getRateCards(filter?: RateCardFilter): Promise<PaginatedRateCards> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const page = filter?.page || 1;
  const limit = filter?.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.RateCardWhereInput = {
    workspaceId,
    deletedAt: null,
    ...(filter?.search && {
      OR: [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ],
    }),
    ...(filter?.categoryId && { categoryId: filter.categoryId }),
    ...(filter?.pricingType && { pricingType: filter.pricingType }),
    ...(filter?.isActive !== undefined && { isActive: filter.isActive }),
    ...(filter?.minRate !== undefined && { rate: { gte: filter.minRate } }),
    ...(filter?.maxRate !== undefined && { rate: { lte: filter.maxRate } }),
  };

  const orderBy: Prisma.RateCardOrderByWithRelationInput = filter?.sortBy
    ? { [filter.sortBy]: filter.sortOrder || 'asc' }
    : { name: 'asc' };

  const [rateCards, total] = await Promise.all([
    prisma.rateCard.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: true,
        taxRate: true,
        _count: {
          select: {
            quoteLineItems: true,
            invoiceLineItems: true,
          },
        },
      },
    }),
    prisma.rateCard.count({ where }),
  ]);

  const data: RateCardListItem[] = rateCards.map((rc) => ({
    id: rc.id,
    name: rc.name,
    description: rc.description,
    pricingType: rc.pricingType,
    rate: toNumber(rc.rate),
    unit: rc.unit,
    categoryId: rc.categoryId,
    categoryName: rc.category?.name || null,
    categoryColor: rc.category?.color || null,
    taxRateId: rc.taxRateId,
    taxRateName: rc.taxRate?.name || null,
    taxRatePercentage: rc.taxRate ? toNumber(rc.taxRate.rate) : null,
    isActive: rc.isActive,
    usageCount: rc._count.quoteLineItems + rc._count.invoiceLineItems,
    createdAt: rc.createdAt,
    updatedAt: rc.updatedAt,
  }));

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get rate card by ID
export async function getRateCardById(id: string): Promise<RateCardDetail> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const rateCard = await prisma.rateCard.findFirst({
    where: {
      id,
      workspaceId,
      deletedAt: null,
    },
    include: {
      category: true,
      taxRate: true,
      _count: {
        select: {
          quoteLineItems: true,
          invoiceLineItems: true,
        },
      },
    },
  });

  if (!rateCard) {
    throw new Error('Rate card not found');
  }

  return {
    id: rateCard.id,
    workspaceId: rateCard.workspaceId,
    name: rateCard.name,
    description: rateCard.description,
    pricingType: rateCard.pricingType,
    rate: toNumber(rateCard.rate),
    unit: rateCard.unit,
    categoryId: rateCard.categoryId,
    taxRateId: rateCard.taxRateId,
    isActive: rateCard.isActive,
    createdAt: rateCard.createdAt,
    updatedAt: rateCard.updatedAt,
    deletedAt: rateCard.deletedAt,
    category: rateCard.category
      ? {
          id: rateCard.category.id,
          name: rateCard.category.name,
          color: rateCard.category.color,
        }
      : null,
    taxRate: rateCard.taxRate
      ? {
          id: rateCard.taxRate.id,
          name: rateCard.taxRate.name,
          rate: toNumber(rateCard.taxRate.rate),
        }
      : null,
    _count: rateCard._count,
  };
}

// Create rate card
export async function createRateCard(input: CreateRateCardInput): Promise<{ id: string }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const rateCard = await prisma.rateCard.create({
    data: {
      workspaceId,
      name: input.name,
      description: input.description || null,
      pricingType: input.pricingType || 'fixed',
      rate: input.rate,
      unit: input.unit || null,
      categoryId: input.categoryId || null,
      taxRateId: input.taxRateId || null,
      isActive: input.isActive ?? true,
    },
  });

  revalidatePath('/rate-cards');

  return { id: rateCard.id };
}

// Update rate card
export async function updateRateCard(input: UpdateRateCardInput): Promise<{ id: string }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify ownership
  const existing = await prisma.rateCard.findFirst({
    where: {
      id: input.id,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error('Rate card not found');
  }

  const updateData: Prisma.RateCardUpdateInput = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description || null;
  if (input.pricingType !== undefined) updateData.pricingType = input.pricingType;
  if (input.rate !== undefined) updateData.rate = input.rate;
  if (input.unit !== undefined) updateData.unit = input.unit || null;
  if (input.categoryId !== undefined) {
    updateData.category = input.categoryId
      ? { connect: { id: input.categoryId } }
      : { disconnect: true };
  }
  if (input.taxRateId !== undefined) {
    updateData.taxRate = input.taxRateId
      ? { connect: { id: input.taxRateId } }
      : { disconnect: true };
  }
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  await prisma.rateCard.update({
    where: { id: input.id },
    data: updateData,
  });

  revalidatePath('/rate-cards');
  revalidatePath(`/rate-cards/${input.id}`);

  return { id: input.id };
}

// Delete rate card (soft delete)
export async function deleteRateCard(id: string): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify ownership
  const existing = await prisma.rateCard.findFirst({
    where: {
      id,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error('Rate card not found');
  }

  await prisma.rateCard.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/rate-cards');
}

// Bulk delete rate cards
export async function bulkDeleteRateCards(ids: string[]): Promise<{ deleted: number }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const result = await prisma.rateCard.updateMany({
    where: {
      id: { in: ids },
      workspaceId,
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/rate-cards');

  return { deleted: result.count };
}

// Toggle rate card active status
export async function toggleRateCardActive(id: string): Promise<{ isActive: boolean }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const existing = await prisma.rateCard.findFirst({
    where: {
      id,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error('Rate card not found');
  }

  const updated = await prisma.rateCard.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  revalidatePath('/rate-cards');

  return { isActive: updated.isActive };
}

// Duplicate rate card
export async function duplicateRateCard(
  id: string,
  newName?: string
): Promise<{ id: string }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  const existing = await prisma.rateCard.findFirst({
    where: {
      id,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error('Rate card not found');
  }

  const newRateCard = await prisma.rateCard.create({
    data: {
      workspaceId,
      name: newName || `${existing.name} (Copy)`,
      description: existing.description,
      pricingType: existing.pricingType,
      rate: existing.rate,
      unit: existing.unit,
      categoryId: existing.categoryId,
      taxRateId: existing.taxRateId,
      isActive: true,
    },
  });

  revalidatePath('/rate-cards');

  return { id: newRateCard.id };
}

// Get rate cards for selection (quote builder)
export async function getRateCardsForSelection(
  categoryId?: string
): Promise<RateCardSelection[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const rateCards = await prisma.rateCard.findMany({
    where: {
      workspaceId,
      isActive: true,
      deletedAt: null,
      ...(categoryId && { categoryId }),
    },
    include: {
      category: true,
    },
    orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
  });

  return rateCards.map((rc) => ({
    id: rc.id,
    name: rc.name,
    description: rc.description,
    pricingType: rc.pricingType,
    rate: toNumber(rc.rate),
    unit: rc.unit,
    categoryId: rc.categoryId,
    categoryName: rc.category?.name || null,
    categoryColor: rc.category?.color || null,
    taxRateId: rc.taxRateId,
  }));
}

// Get rate card stats
export async function getRateCardStats(): Promise<RateCardStats> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const [total, active, byCategory, byPricingType] = await Promise.all([
    prisma.rateCard.count({
      where: { workspaceId, deletedAt: null },
    }),
    prisma.rateCard.count({
      where: { workspaceId, deletedAt: null, isActive: true },
    }),
    prisma.rateCard.groupBy({
      by: ['categoryId'],
      where: { workspaceId, deletedAt: null },
      _count: true,
    }),
    prisma.rateCard.groupBy({
      by: ['pricingType'],
      where: { workspaceId, deletedAt: null },
      _count: true,
    }),
  ]);

  // Get category names
  const categoryIds = byCategory
    .map((c) => c.categoryId)
    .filter((id): id is string => id !== null);
  const categories = await prisma.rateCardCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return {
    total,
    active,
    inactive: total - active,
    byCategory: byCategory.map((c) => ({
      categoryId: c.categoryId,
      categoryName: c.categoryId ? categoryMap.get(c.categoryId) || null : null,
      count: c._count,
    })),
    byPricingType: byPricingType.map((p) => ({
      pricingType: p.pricingType,
      count: p._count,
    })),
  };
}

// ============================================
// CATEGORY ACTIONS
// ============================================

// Get all categories
export async function getCategories(): Promise<CategoryListItem[]> {
  const { workspaceId } = await getCurrentUserWorkspace();

  const categories = await prisma.rateCardCategory.findMany({
    where: { workspaceId },
    include: {
      _count: {
        select: { rateCards: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    sortOrder: cat.sortOrder,
    rateCardCount: cat._count.rateCards,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  }));
}

// Create category
export async function createCategory(input: CreateCategoryInput): Promise<{ id: string }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // Get max sort order
  const maxOrder = await prisma.rateCardCategory.aggregate({
    where: { workspaceId },
    _max: { sortOrder: true },
  });

  const category = await prisma.rateCardCategory.create({
    data: {
      workspaceId,
      name: input.name,
      color: input.color || null,
      sortOrder: input.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath('/rate-cards');

  return { id: category.id };
}

// Update category
export async function updateCategory(input: UpdateCategoryInput): Promise<{ id: string }> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify ownership
  const existing = await prisma.rateCardCategory.findFirst({
    where: {
      id: input.id,
      workspaceId,
    },
  });

  if (!existing) {
    throw new Error('Category not found');
  }

  await prisma.rateCardCategory.update({
    where: { id: input.id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.color !== undefined && { color: input.color || null }),
      ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
    },
  });

  revalidatePath('/rate-cards');

  return { id: input.id };
}

// Delete category
export async function deleteCategory(id: string): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // Verify ownership
  const existing = await prisma.rateCardCategory.findFirst({
    where: {
      id,
      workspaceId,
    },
    include: {
      _count: { select: { rateCards: true } },
    },
  });

  if (!existing) {
    throw new Error('Category not found');
  }

  if (existing._count.rateCards > 0) {
    throw new Error('Cannot delete category with rate cards. Remove or reassign rate cards first.');
  }

  await prisma.rateCardCategory.delete({
    where: { id },
  });

  revalidatePath('/rate-cards');
}

// Reorder categories
export async function reorderCategories(
  categoryIds: string[]
): Promise<void> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();

  // Update sort orders in transaction
  await prisma.$transaction(
    categoryIds.map((id, index) =>
      prisma.rateCardCategory.updateMany({
        where: { id, workspaceId },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath('/rate-cards');
}

// ============================================
// IMPORT/EXPORT ACTIONS
// ============================================

// Import rate cards from CSV data
export async function importRateCards(
  data: Array<{
    name: string;
    description?: string;
    pricingType?: string;
    rate: number;
    unit?: string;
    categoryName?: string;
  }>,
  options: { skipDuplicates?: boolean } = {}
): Promise<RateCardImportResult> {
  await assertNotDemo();
  const { workspaceId } = await getCurrentUserWorkspace();
  const { skipDuplicates = true } = options;

  const result: RateCardImportResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  // Get or create categories
  const categoryNames = [...new Set(data.map((d) => d.categoryName).filter(Boolean))];
  const categoryMap = new Map<string, string>();

  for (const name of categoryNames) {
    if (!name) continue;
    let category = await prisma.rateCardCategory.findFirst({
      where: { workspaceId, name },
    });
    if (!category) {
      category = await prisma.rateCardCategory.create({
        data: { workspaceId, name },
      });
    }
    categoryMap.set(name, category.id);
  }

  // Process each row
  for (let i = 0; i < data.length; i++) {
    const row = data[i]!;

    try {
      // Check for duplicate
      if (skipDuplicates) {
        const existing = await prisma.rateCard.findFirst({
          where: {
            workspaceId,
            name: row.name,
            deletedAt: null,
          },
        });

        if (existing) {
          result.skipped++;
          continue;
        }
      }

      await prisma.rateCard.create({
        data: {
          workspaceId,
          name: row.name,
          description: row.description || null,
          pricingType: row.pricingType || 'fixed',
          rate: row.rate,
          unit: row.unit || null,
          categoryId: row.categoryName ? categoryMap.get(row.categoryName) || null : null,
        },
      });

      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  revalidatePath('/rate-cards');

  return result;
}
