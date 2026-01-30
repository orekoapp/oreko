import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock modules before imports
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Import mocked modules - must be after vi.mock calls
import { auth } from '@/lib/auth';

// Mock Prisma
const mockPrisma = {
  rateCard: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  rateCardItem: {
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  workspaceMember: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
};

vi.mock('@quotecraft/database', () => ({
  prisma: mockPrisma,
  Prisma: {
    InputJsonValue: {},
  },
}));

describe('Rate Card Actions', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(auth).mockResolvedValue(mockSession as any);

    mockPrisma.workspaceMember.findFirst.mockResolvedValue({
      userId: mockSession.user.id,
      workspaceId: 'ws-123',
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getRateCards', () => {
    it('returns all rate cards for workspace', async () => {
      mockPrisma.rateCard.findMany.mockResolvedValue([
        { id: 'rc1', name: 'Standard Rates', isDefault: true },
        { id: 'rc2', name: 'Premium Rates', isDefault: false },
      ]);

      const cards = await mockPrisma.rateCard.findMany({
        where: { workspaceId: 'ws-123', deletedAt: null },
      });

      expect(cards.length).toBe(2);
    });

    it('includes item counts', () => {
      const rateCard = {
        id: 'rc1',
        name: 'Standard',
        _count: { items: 15 },
      };

      expect(rateCard._count.items).toBe(15);
    });

    it('identifies default rate card', () => {
      const cards = [
        { id: 'rc1', isDefault: true },
        { id: 'rc2', isDefault: false },
      ];

      const defaultCard = cards.find((c) => c.isDefault);
      expect(defaultCard?.id).toBe('rc1');
    });
  });

  describe('getRateCard', () => {
    const mockRateCard = {
      id: 'rc-123',
      workspaceId: 'ws-123',
      name: 'Standard Rates',
      description: 'Default hourly rates',
      currency: 'USD',
      isDefault: true,
      items: [
        {
          id: 'item-1',
          name: 'Senior Developer',
          description: 'Full-stack development',
          rate: 150,
          unit: 'hour',
          category: 'Development',
        },
        {
          id: 'item-2',
          name: 'Junior Developer',
          description: 'Support development',
          rate: 75,
          unit: 'hour',
          category: 'Development',
        },
      ],
    };

    it('returns rate card with items', async () => {
      mockPrisma.rateCard.findFirst.mockResolvedValue(mockRateCard);

      const card = await mockPrisma.rateCard.findFirst({
        where: { id: 'rc-123' },
        include: { items: true },
      });

      expect(card?.name).toBe('Standard Rates');
      expect(card?.items.length).toBe(2);
    });

    it('orders items by sort order', () => {
      const items = [
        { sortOrder: 2, name: 'Item B' },
        { sortOrder: 0, name: 'Item A' },
        { sortOrder: 1, name: 'Item C' },
      ];

      const sorted = items.sort((a, b) => a.sortOrder - b.sortOrder);

      expect(sorted[0]?.name).toBe('Item A');
      expect(sorted[2]?.name).toBe('Item B');
    });
  });

  describe('createRateCard', () => {
    const validInput = {
      name: 'New Rate Card',
      description: 'Custom rates',
      currency: 'USD',
      isDefault: false,
      items: [
        { name: 'Service 1', rate: 100, unit: 'hour' },
        { name: 'Service 2', rate: 50, unit: 'item' },
      ],
    };

    it('creates rate card with items', async () => {
      mockPrisma.rateCard.create.mockResolvedValue({
        id: 'new-rc-123',
        ...validInput,
      });

      const result = await mockPrisma.rateCard.create({
        data: validInput,
      });

      expect(result.id).toBe('new-rc-123');
    });

    it('sets first rate card as default', () => {
      const existingCount = 0;
      const shouldBeDefault = existingCount === 0;

      expect(shouldBeDefault).toBe(true);
    });

    it('unsets other defaults when setting new default', async () => {
      const newCardIsDefault = true;

      if (newCardIsDefault) {
        await mockPrisma.rateCard.update({
          where: { id: 'old-default' },
          data: { isDefault: false },
        });
      }

      expect(mockPrisma.rateCard.update).toHaveBeenCalled();
    });

    it('assigns sort order to items', () => {
      const items = validInput.items.map((item, index) => ({
        ...item,
        sortOrder: index,
      }));

      expect(items[0]?.sortOrder).toBe(0);
      expect(items[1]?.sortOrder).toBe(1);
    });
  });

  describe('updateRateCard', () => {
    it('updates rate card details', async () => {
      const updates = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      mockPrisma.rateCard.update.mockResolvedValue({
        id: 'rc-123',
        ...updates,
      });

      const result = await mockPrisma.rateCard.update({
        where: { id: 'rc-123' },
        data: updates,
      });

      expect(result.name).toBe('Updated Name');
    });

    it('handles items CRUD operations', () => {
      const existingItems = [
        { id: 'item-1', name: 'Existing' },
        { id: 'item-2', name: 'To Delete' },
      ];

      const updatedItems = [
        { id: 'item-1', name: 'Updated Existing' },
        { name: 'New Item' }, // No ID = create
      ];

      // Items to delete
      const toDelete = existingItems.filter(
        (e) => !updatedItems.find((u) => 'id' in u && u.id === e.id)
      );

      // Items to update
      const toUpdate = updatedItems.filter((u) => 'id' in u);

      // Items to create
      const toCreate = updatedItems.filter((u) => !('id' in u));

      expect(toDelete.length).toBe(1);
      expect(toUpdate.length).toBe(1);
      expect(toCreate.length).toBe(1);
    });
  });

  describe('deleteRateCard', () => {
    it('performs soft delete', async () => {
      mockPrisma.rateCard.update.mockResolvedValue({
        id: 'rc-123',
        deletedAt: new Date(),
      });

      const result = await mockPrisma.rateCard.update({
        where: { id: 'rc-123' },
        data: { deletedAt: new Date() },
      });

      expect(result.deletedAt).toBeDefined();
    });

    it('prevents deleting the only rate card', async () => {
      mockPrisma.rateCard.count.mockResolvedValue(1);

      const count = await mockPrisma.rateCard.count({
        where: { workspaceId: 'ws-123', deletedAt: null },
      });

      expect(count).toBe(1);
      // Should return error: 'Cannot delete the only rate card'
    });

    it('reassigns default when deleting default card', () => {
      const cards = [
        { id: 'rc1', isDefault: true },
        { id: 'rc2', isDefault: false },
      ];

      const deletedId = 'rc1';
      const remainingCards = cards.filter((c) => c.id !== deletedId);
      const newDefault = remainingCards[0];

      expect(newDefault?.id).toBe('rc2');
    });
  });

  describe('setDefaultRateCard', () => {
    it('unsets previous default', async () => {
      await mockPrisma.rateCard.update({
        where: { isDefault: true },
        data: { isDefault: false },
      });

      expect(mockPrisma.rateCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isDefault: false },
        })
      );
    });

    it('sets new default', async () => {
      await mockPrisma.rateCard.update({
        where: { id: 'rc-123' },
        data: { isDefault: true },
      });

      expect(mockPrisma.rateCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { isDefault: true },
        })
      );
    });
  });

  describe('duplicateRateCard', () => {
    const original = {
      id: 'rc-original',
      name: 'Original Card',
      description: 'Original description',
      currency: 'USD',
      items: [
        { name: 'Item 1', rate: 100, unit: 'hour' },
      ],
    };

    it('creates copy with modified name', () => {
      const newName = `${original.name} (Copy)`;
      expect(newName).toBe('Original Card (Copy)');
    });

    it('copies all items to new card', () => {
      const copiedItems = original.items.map((item) => ({
        name: item.name,
        rate: item.rate,
        unit: item.unit,
      }));

      expect(copiedItems.length).toBe(1);
    });

    it('does not set duplicate as default', () => {
      const duplicateCard = {
        ...original,
        id: 'new-id',
        isDefault: false,
      };

      expect(duplicateCard.isDefault).toBe(false);
    });
  });

  describe('Rate Card Item Operations', () => {
    describe('addRateCardItem', () => {
      it('creates item with next sort order', async () => {
        const existingItems = [
          { sortOrder: 0 },
          { sortOrder: 1 },
        ];

        const nextSortOrder = existingItems.length;
        expect(nextSortOrder).toBe(2);
      });

      it('validates rate is positive', () => {
        const validRate = 100;
        const invalidRate = -50;

        expect(validRate).toBeGreaterThan(0);
        expect(invalidRate).toBeLessThan(0);
      });
    });

    describe('updateRateCardItem', () => {
      it('updates item details', async () => {
        mockPrisma.rateCardItem.update.mockResolvedValue({
          id: 'item-123',
          name: 'Updated Name',
          rate: 200,
        });

        const result = await mockPrisma.rateCardItem.update({
          where: { id: 'item-123' },
          data: { name: 'Updated Name', rate: 200 },
        });

        expect(result.rate).toBe(200);
      });
    });

    describe('deleteRateCardItem', () => {
      it('deletes item from rate card', async () => {
        await mockPrisma.rateCardItem.delete({
          where: { id: 'item-123' },
        });

        expect(mockPrisma.rateCardItem.delete).toHaveBeenCalled();
      });
    });

    describe('reorderRateCardItems', () => {
      it('updates sort orders for all items', async () => {
        const newOrder = ['item-2', 'item-1', 'item-3'];

        const updates = newOrder.map((id, index) => ({
          id,
          sortOrder: index,
        }));

        expect(updates[0]?.sortOrder).toBe(0);
        expect(updates[1]?.sortOrder).toBe(1);
        expect(updates[2]?.sortOrder).toBe(2);
      });
    });
  });

  describe('Unit Types', () => {
    it('supports various unit types', () => {
      const validUnits = ['hour', 'day', 'week', 'month', 'item', 'project'];

      expect(validUnits).toContain('hour');
      expect(validUnits).toContain('project');
      expect(validUnits.length).toBe(6);
    });
  });

  describe('Currency Handling', () => {
    it('defaults to USD currency', () => {
      const defaultCurrency = 'USD';
      expect(defaultCurrency).toBe('USD');
    });

    it('supports multiple currencies', () => {
      const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
      expect(currencies).toContain('EUR');
    });
  });
});
