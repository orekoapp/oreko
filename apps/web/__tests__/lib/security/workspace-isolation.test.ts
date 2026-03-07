import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockGetCurrentUserWorkspace } = vi.hoisted(() => {
  const mockPrisma: Record<string, any> = {
    quote: { findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    invoice: { findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    client: { findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    rateCard: { findFirst: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    workspace: { findUnique: vi.fn() },
    workspaceMember: { findFirst: vi.fn() },
    $transaction: vi.fn((fn: any) => fn(mockPrisma)),
  };
  const mockGetCurrentUserWorkspace = vi.fn();
  return { mockPrisma, mockGetCurrentUserWorkspace };
});

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/workspace/get-current-workspace', () => ({
  getCurrentUserWorkspace: mockGetCurrentUserWorkspace,
}));
vi.mock('@quotecraft/database', () => ({
  prisma: mockPrisma,
  Prisma: { JsonNull: null },
}));
vi.mock('@/lib/notifications/actions', () => ({
  createNotification: vi.fn(),
}));
vi.mock('@/lib/services/email', () => ({
  sendQuoteSentEmail: vi.fn().mockResolvedValue({ success: true }),
  sendInvoiceSentEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import { getQuotes } from '@/lib/quotes/actions';
import { getInvoices } from '@/lib/invoices/actions';
import { getClients } from '@/lib/clients/actions';

describe('Cross-Workspace Isolation', () => {
  const WORKSPACE_A = 'ws-A';
  const USER_A = 'user-A';

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserWorkspace.mockResolvedValue({
      workspaceId: WORKSPACE_A,
      userId: USER_A,
      role: 'owner',
    });
    // getInvoices calls getActiveWorkspace which does workspace.findUnique
    mockPrisma.workspace.findUnique.mockResolvedValue({
      id: WORKSPACE_A,
      name: 'Workspace A',
    });
  });

  describe('Quote Isolation', () => {
    it('only queries quotes within the current workspace', async () => {
      mockPrisma.quote.findMany.mockResolvedValue([]);
      mockPrisma.quote.count.mockResolvedValue(0);

      await getQuotes();

      const findManyCall = mockPrisma.quote.findMany.mock.calls[0]?.[0];
      expect(findManyCall.where.workspaceId).toBe(WORKSPACE_A);
    });

    it('cannot access quotes from another workspace via listing', async () => {
      // Even if database has quotes from ws-B, the where clause filters them
      mockPrisma.quote.findMany.mockResolvedValue([]);
      mockPrisma.quote.count.mockResolvedValue(0);

      await getQuotes();

      // Verify workspace filter is applied
      const whereClause = mockPrisma.quote.findMany.mock.calls[0]?.[0]?.where;
      expect(whereClause.workspaceId).toBe(WORKSPACE_A);
    });
  });

  describe('Invoice Isolation', () => {
    it('only queries invoices within the current workspace', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([]);
      mockPrisma.invoice.count.mockResolvedValue(0);

      await getInvoices();

      const findManyCall = mockPrisma.invoice.findMany.mock.calls[0]?.[0];
      expect(findManyCall.where.workspaceId).toBe(WORKSPACE_A);
    });
  });

  describe('Client Isolation', () => {
    it('only queries clients within the current workspace', async () => {
      mockPrisma.client.findMany.mockResolvedValue([]);
      mockPrisma.client.count.mockResolvedValue(0);

      await getClients();

      const findManyCall = mockPrisma.client.findMany.mock.calls[0]?.[0];
      expect(findManyCall.where.workspaceId).toBe(WORKSPACE_A);
    });
  });
});
