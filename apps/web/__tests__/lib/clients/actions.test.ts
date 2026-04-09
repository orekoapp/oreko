import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockGetCurrentUserWorkspace } = vi.hoisted(() => {
  const mockPrisma: Record<string, any> = {
    client: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
    quote: { findMany: vi.fn() },
    invoice: { findMany: vi.fn(), aggregate: vi.fn() },
    payment: { findMany: vi.fn() },
  };
  const mockGetCurrentUserWorkspace = vi.fn();
  return { mockPrisma, mockGetCurrentUserWorkspace };
});

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/api/errors', () => ({
  NotFoundError: class extends Error {
    constructor(resource: string, id: string) { super(`${resource} not found: ${id}`); this.name = 'NotFoundError'; }
  },
  UnauthorizedError: class extends Error {
    constructor(message = 'Unauthorized') { super(message); this.name = 'UnauthorizedError'; }
  },
}));
vi.mock('@/lib/workspace/get-current-workspace', () => ({ getCurrentUserWorkspace: mockGetCurrentUserWorkspace }));
vi.mock('nanoid', () => ({ nanoid: vi.fn(() => 'mock-nanoid-id') }));
vi.mock('@oreko/database', () => ({
  prisma: mockPrisma,
  Prisma: { InputJsonValue: {}, ClientWhereInput: {}, JsonNull: null },
}));
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  deleteClients,
  searchClients,
} from '@/lib/clients/actions';

describe('Client Actions', () => {
  const WORKSPACE_ID = 'ws-123';
  const USER_ID = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetCurrentUserWorkspace.mockResolvedValue({
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
    });
  });

  describe('getClients', () => {
    it('returns paginated clients', async () => {
      mockPrisma.client.findMany.mockResolvedValue([
        { id: 'c1', name: 'Client 1', email: 'a@b.com', company: null, phone: null, createdAt: new Date(), _count: { quotes: 1, invoices: 0 }, invoices: [] },
      ]);
      mockPrisma.client.count.mockResolvedValue(5);

      const result = await getClients({ page: 1, limit: 10 });

      expect(result.data.length).toBe(1);
      expect(result.meta.total).toBe(5);
      expect(mockPrisma.client.findMany).toHaveBeenCalledTimes(1);
    });

    it('applies search filter', async () => {
      mockPrisma.client.findMany.mockResolvedValue([]);
      mockPrisma.client.count.mockResolvedValue(0);

      await getClients({ search: 'acme' });

      const findManyCall = mockPrisma.client.findMany.mock.calls[0]![0];
      expect(findManyCall.where.OR).toBeDefined();
      expect(findManyCall.where.OR.length).toBe(3); // name, email, company
    });

    it('filters by client type: company', async () => {
      mockPrisma.client.findMany.mockResolvedValue([]);
      mockPrisma.client.count.mockResolvedValue(0);

      await getClients({ type: 'company' });

      const findManyCall = mockPrisma.client.findMany.mock.calls[0]![0];
      expect(findManyCall.where.company).toEqual({ not: null });
    });

    it('enforces workspace isolation', async () => {
      mockPrisma.client.findMany.mockResolvedValue([]);
      mockPrisma.client.count.mockResolvedValue(0);

      await getClients();

      const findManyCall = mockPrisma.client.findMany.mock.calls[0]![0];
      expect(findManyCall.where.workspaceId).toBe(WORKSPACE_ID);
      expect(findManyCall.where.deletedAt).toBeNull();
    });

    it('caps page size at 100', async () => {
      mockPrisma.client.findMany.mockResolvedValue([]);
      mockPrisma.client.count.mockResolvedValue(0);

      await getClients({ limit: 500 });

      const findManyCall = mockPrisma.client.findMany.mock.calls[0]![0];
      expect(findManyCall.take).toBeLessThanOrEqual(100);
    });
  });

  describe('getClientById', () => {
    it('returns client details', async () => {
      mockPrisma.client.findFirst.mockResolvedValue({
        id: 'client-1',
        workspaceId: WORKSPACE_ID,
        name: 'Acme Corp',
        email: 'a@b.com',
        phone: null,
        company: 'Acme',
        address: null,
        taxId: null,
        notes: null,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        quotes: [],
        invoices: [],
        _count: { quotes: 0, invoices: 0 },
      });
      mockPrisma.invoice.aggregate.mockResolvedValue({
        _sum: { total: 0, amountPaid: 0 },
      });

      const result = await getClientById('client-1');

      expect(result.name).toBe('Acme Corp');
    });

    it('throws NotFoundError for missing client', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);

      await expect(getClientById('nonexistent')).rejects.toThrow('not found');
    });
  });

  describe('createClient', () => {
    it('creates a client with valid data', async () => {
      mockPrisma.client.create.mockResolvedValue({ id: 'new-client-1' });

      const result = await createClient({
        name: 'New Client',
        email: 'new@client.com',
      });

      expect(result.id).toBe('new-client-1');
      expect(mockPrisma.client.create).toHaveBeenCalledTimes(1);

      // Verify workspace ID is set
      const createCall = mockPrisma.client.create.mock.calls[0]![0];
      expect(createCall.data.workspaceId).toBe(WORKSPACE_ID);
    });

    it('stores metadata for company type', async () => {
      mockPrisma.client.create.mockResolvedValue({ id: 'new-client-1' });

      await createClient({
        name: 'Corp Client',
        email: 'corp@test.com',
        company: 'Corp Inc',
        type: 'company',
      });

      const createCall = mockPrisma.client.create.mock.calls[0]![0];
      expect(createCall.data.company).toBe('Corp Inc');
    });
  });

  describe('updateClient', () => {
    it('updates client name', async () => {
      mockPrisma.client.findFirst.mockResolvedValue({
        id: 'client-1',
        workspaceId: WORKSPACE_ID,
        metadata: {},
      });
      mockPrisma.client.update.mockResolvedValue({ id: 'client-1' });

      const result = await updateClient({ id: 'client-1', name: 'Updated Name' });

      expect(result.id).toBe('client-1');
      expect(mockPrisma.client.update).toHaveBeenCalledTimes(1);
    });

    it('throws for client in different workspace', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);

      await expect(updateClient({ id: 'other-ws-client', name: 'X' })).rejects.toThrow();
    });
  });

  describe('deleteClient', () => {
    it('soft deletes a client', async () => {
      mockPrisma.client.findFirst.mockResolvedValue({
        id: 'client-1',
        workspaceId: WORKSPACE_ID,
      });
      mockPrisma.client.update.mockResolvedValue({ id: 'client-1', deletedAt: new Date() });

      await expect(deleteClient('client-1')).resolves.not.toThrow();
      expect(mockPrisma.client.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        })
      );
    });

    it('throws for non-existent client', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);

      await expect(deleteClient('nonexistent')).rejects.toThrow();
    });
  });

  describe('deleteClients (bulk)', () => {
    it('soft deletes multiple clients', async () => {
      mockPrisma.client.updateMany.mockResolvedValue({ count: 3 });

      const result = await deleteClients(['c1', 'c2', 'c3']);

      expect(result.deleted).toBe(3);
      const updateCall = mockPrisma.client.updateMany.mock.calls[0]![0];
      expect(updateCall.where.workspaceId).toBe(WORKSPACE_ID);
    });
  });

  describe('searchClients', () => {
    it('returns matching clients for autocomplete', async () => {
      mockPrisma.client.findMany.mockResolvedValue([
        { id: 'c1', name: 'Acme Corp', email: 'a@acme.com', company: 'Acme' },
      ]);

      const result = await searchClients('acme', 5);

      expect(result.length).toBe(1);
      expect(result[0]!.name).toBe('Acme Corp');
    });

    it('limits results', async () => {
      mockPrisma.client.findMany.mockResolvedValue([]);

      await searchClients('test', 5);

      const findManyCall = mockPrisma.client.findMany.mock.calls[0]![0];
      expect(findManyCall.take).toBe(5);
    });
  });
});
