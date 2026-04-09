import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockGetCurrentUserWorkspace } = vi.hoisted(() => {
  const mockPrisma: Record<string, any> = {
    rateCard: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    rateCardCategory: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn((fn: any) => fn(mockPrisma)),
  };
  const mockGetCurrentUserWorkspace = vi.fn();
  return { mockPrisma, mockGetCurrentUserWorkspace };
});

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/workspace/get-current-workspace', () => ({ getCurrentUserWorkspace: mockGetCurrentUserWorkspace }));
vi.mock('@oreko/database', () => ({
  prisma: mockPrisma,
  Prisma: {
    InputJsonValue: {},
    RateCardWhereInput: {},
    RateCardOrderByWithRelationInput: {},
    RateCardUpdateInput: {},
    Decimal: class MockDecimal {
      value: number;
      constructor(v: number) { this.value = v; }
      toNumber() { return this.value; }
    },
  },
}));

import {
  getRateCards,
  createRateCard,
  updateRateCard,
  deleteRateCard,
  bulkDeleteRateCards,
  toggleRateCardActive,
} from '@/lib/rate-cards/actions';

describe('Rate Card Actions', () => {
  const WORKSPACE_ID = 'ws-123';
  const USER_ID = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetCurrentUserWorkspace.mockResolvedValue({
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
    });
  });

  describe('getRateCards', () => {
    it('returns paginated rate cards', async () => {
      mockPrisma.rateCard.findMany.mockResolvedValue([
        {
          id: 'rc-1', name: 'Standard Hourly', description: 'Default rates',
          pricingType: 'hourly', rate: 150, unit: 'hour', isActive: true,
          createdAt: new Date(), updatedAt: new Date(),
          category: null, taxRate: null, _count: { quoteLineItems: 2, invoiceLineItems: 0 },
        },
      ]);
      mockPrisma.rateCard.count.mockResolvedValue(1);

      const result = await getRateCards();

      expect(result.data.length).toBe(1);
      expect(result.data[0]!.name).toBe('Standard Hourly');
      expect(result.meta.total).toBe(1);
    });

    it('filters by search term', async () => {
      mockPrisma.rateCard.findMany.mockResolvedValue([]);
      mockPrisma.rateCard.count.mockResolvedValue(0);

      await getRateCards({ search: 'premium' });

      const findManyCall = mockPrisma.rateCard.findMany.mock.calls[0]![0];
      expect(findManyCall.where.OR).toBeDefined();
    });

    it('enforces workspace isolation', async () => {
      mockPrisma.rateCard.findMany.mockResolvedValue([]);
      mockPrisma.rateCard.count.mockResolvedValue(0);

      await getRateCards();

      const findManyCall = mockPrisma.rateCard.findMany.mock.calls[0]![0];
      expect(findManyCall.where.workspaceId).toBe(WORKSPACE_ID);
      expect(findManyCall.where.deletedAt).toBeNull();
    });
  });

  describe('createRateCard', () => {
    it('creates a rate card', async () => {
      mockPrisma.rateCard.create.mockResolvedValue({ id: 'rc-new' });

      const result = await createRateCard({
        name: 'New Card',
        rate: 200,
        pricingType: 'hourly',
        unit: 'hour',
      });

      expect(result.id).toBe('rc-new');
      const createCall = mockPrisma.rateCard.create.mock.calls[0]![0];
      expect(createCall.data.workspaceId).toBe(WORKSPACE_ID);
      expect(createCall.data.name).toBe('New Card');
      expect(createCall.data.rate).toBe(200);
    });

    it('defaults isActive to true', async () => {
      mockPrisma.rateCard.create.mockResolvedValue({ id: 'rc-new' });

      await createRateCard({ name: 'Card', rate: 100 });

      const createCall = mockPrisma.rateCard.create.mock.calls[0]![0];
      expect(createCall.data.isActive).toBe(true);
    });
  });

  describe('updateRateCard', () => {
    it('updates rate card name and rate', async () => {
      mockPrisma.rateCard.findFirst.mockResolvedValue({
        id: 'rc-1', workspaceId: WORKSPACE_ID,
      });
      mockPrisma.rateCard.update.mockResolvedValue({ id: 'rc-1' });

      const result = await updateRateCard({
        id: 'rc-1',
        name: 'Updated Card',
        rate: 300,
      });

      expect(result.id).toBe('rc-1');
      expect(mockPrisma.rateCard.update).toHaveBeenCalledTimes(1);
    });

    it('throws when rate card not found', async () => {
      mockPrisma.rateCard.findFirst.mockResolvedValue(null);

      await expect(
        updateRateCard({ id: 'nonexistent', name: 'X' })
      ).rejects.toThrow('Rate card not found');
    });
  });

  describe('deleteRateCard', () => {
    it('soft deletes a rate card', async () => {
      mockPrisma.rateCard.findFirst.mockResolvedValue({
        id: 'rc-1', workspaceId: WORKSPACE_ID,
      });
      mockPrisma.rateCard.update.mockResolvedValue({ id: 'rc-1', deletedAt: new Date() });

      await expect(deleteRateCard('rc-1')).resolves.not.toThrow();

      expect(mockPrisma.rateCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        })
      );
    });

    it('throws when rate card not found', async () => {
      mockPrisma.rateCard.findFirst.mockResolvedValue(null);

      await expect(deleteRateCard('nonexistent')).rejects.toThrow('Rate card not found');
    });
  });

  describe('bulkDeleteRateCards', () => {
    it('soft deletes multiple rate cards', async () => {
      mockPrisma.rateCard.updateMany.mockResolvedValue({ count: 3 });

      const result = await bulkDeleteRateCards(['rc-1', 'rc-2', 'rc-3']);

      expect(result.deleted).toBe(3);
      const updateCall = mockPrisma.rateCard.updateMany.mock.calls[0]![0];
      expect(updateCall.where.workspaceId).toBe(WORKSPACE_ID);
    });
  });

  describe('toggleRateCardActive', () => {
    it('toggles active status', async () => {
      mockPrisma.rateCard.findFirst.mockResolvedValue({
        id: 'rc-1', workspaceId: WORKSPACE_ID, isActive: true,
      });
      mockPrisma.rateCard.update.mockResolvedValue({ id: 'rc-1', isActive: false });

      const result = await toggleRateCardActive('rc-1');

      expect(result.isActive).toBe(false);
      expect(mockPrisma.rateCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isActive: false },
        })
      );
    });

    it('throws when rate card not found', async () => {
      mockPrisma.rateCard.findFirst.mockResolvedValue(null);

      await expect(toggleRateCardActive('nonexistent')).rejects.toThrow('Rate card not found');
    });
  });
});
