import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted to define mock objects before vi.mock hoists
const { mockPrisma, mockGetCurrentUserWorkspace } = vi.hoisted(() => {
  const mockPrisma: Record<string, any> = {
    workspace: { findUnique: vi.fn() },
    quote: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    quoteLineItem: { deleteMany: vi.fn() },
    quoteEvent: { create: vi.fn(), updateMany: vi.fn() },
    invoice: { findFirst: vi.fn() },
    numberSequence: { upsert: vi.fn() },
    client: { findFirst: vi.fn() },
    businessProfile: { findUnique: vi.fn() },
    $transaction: vi.fn((fn: any) => fn(mockPrisma)),
  };
  const mockGetCurrentUserWorkspace = vi.fn();
  return { mockPrisma, mockGetCurrentUserWorkspace };
});

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/services/email', () => ({ sendQuoteSentEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/notifications/actions', () => ({ createNotification: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/routes', () => ({ ROUTES: { quotes: '/quotes', invoices: '/invoices', quoteDetail: (id: string) => `/quotes/${id}`, invoiceDetail: (id: string) => `/invoices/${id}` } }));
vi.mock('@/lib/events/emitter', () => ({ domainEvents: { emit: vi.fn() } }));
vi.mock('@/lib/workspace/get-current-workspace', () => ({ getCurrentUserWorkspace: mockGetCurrentUserWorkspace }));
vi.mock('@quotecraft/database', () => ({
  prisma: mockPrisma,
  Prisma: { InputJsonValue: {}, TransactionClient: {} },
}));

// Import actual functions under test
import { createQuote, updateQuote, getQuote, getQuotes, deleteQuote, duplicateQuote, updateQuoteStatus } from '@/lib/quotes/actions';

describe('Quote Actions', () => {
  const WORKSPACE_ID = 'ws-123';
  const USER_ID = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated user with workspace
    mockGetCurrentUserWorkspace.mockResolvedValue({
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
      role: 'owner',
    });

    // Default workspace lookup
    mockPrisma.workspace.findUnique.mockResolvedValue({
      id: WORKSPACE_ID,
      name: 'Test Workspace',
    });

    // Default number sequence for quote number generation
    mockPrisma.numberSequence.upsert.mockResolvedValue({
      prefix: 'QT',
      suffix: null,
      currentValue: 1,
      padding: 4,
    });

    // Default businessProfile for currency lookup
    mockPrisma.businessProfile.findUnique.mockResolvedValue({ currency: 'USD' });

    // Default quoteEvent create (succeeds silently)
    mockPrisma.quoteEvent.create.mockResolvedValue({ id: 'event-1' });
  });

  describe('createQuote', () => {
    it('creates a quote with valid data', async () => {
      mockPrisma.client.findFirst.mockResolvedValue({ id: 'client-1', workspaceId: WORKSPACE_ID });
      mockPrisma.quote.create.mockResolvedValue({
        id: 'quote-1',
        quoteNumber: 'QT-0001',
        title: 'New Project',
        status: 'draft',
        subtotal: 0,
        taxTotal: 0,
        total: 0,
        lineItems: [],
        client: { id: 'client-1' },
        project: null,
      });

      const result = await createQuote({
        title: 'New Project',
        clientId: 'client-1',
        blocks: [],
      });

      expect(result.success).toBe(true);
      expect(result.quote).toBeDefined();
      expect(mockPrisma.quote.create).toHaveBeenCalledTimes(1);
    });

    it('rejects empty title', async () => {
      const result = await createQuote({
        title: '',
        clientId: 'client-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Title is required');
    });

    it('rejects title over 500 characters', async () => {
      const result = await createQuote({
        title: 'a'.repeat(501),
        clientId: 'client-1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Title is required');
    });

    it('rejects invalid block types', async () => {
      const result = await createQuote({
        title: 'Test Quote',
        clientId: 'client-1',
        blocks: [{ type: 'malicious-script' as any, id: '1', content: { height: 'md' }, createdAt: '', updatedAt: '' } as any],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid block type');
    });

    it('returns error when client not found', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);

      const result = await createQuote({
        title: 'Test Quote',
        clientId: 'nonexistent',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Client not found');
    });

    it('calculates totals from service item blocks', async () => {
      mockPrisma.client.findFirst.mockResolvedValue({ id: 'client-1', workspaceId: WORKSPACE_ID });
      mockPrisma.quote.create.mockImplementation(async ({ data }: any) => ({
        id: 'quote-1',
        ...data,
        lineItems: [],
        client: { id: 'client-1' },
        project: null,
      }));

      await createQuote({
        title: 'Test',
        clientId: 'client-1',
        blocks: [
          {
            id: 'b1', type: 'service-item', createdAt: '', updatedAt: '',
            content: { name: 'Dev', description: '', quantity: 2, rate: 100, unit: 'hour', taxRate: 10, rateCardId: null },
          },
        ],
      });

      const createCall = mockPrisma.quote.create.mock.calls[0]![0];
      expect(createCall.data.subtotal).toBe(200);
      expect(createCall.data.taxTotal).toBe(20);
      expect(createCall.data.total).toBe(220);
    });

    it('throws when user is not authenticated', async () => {
      mockGetCurrentUserWorkspace.mockRejectedValue(new Error('Unauthorized'));

      await expect(createQuote({ title: 'Test', clientId: 'c1' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateQuote', () => {
    it('updates quote title', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({
        id: 'quote-1',
        workspaceId: WORKSPACE_ID,
        settings: { blocks: [] },
      });
      mockPrisma.quote.update.mockResolvedValue({
        id: 'quote-1',
        title: 'Updated Title',
        lineItems: [],
        client: null,
      });

      const result = await updateQuote('quote-1', { title: 'Updated Title' });

      expect(result.success).toBe(true);
    });

    it('returns error for non-existent quote', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null);

      const result = await updateQuote('nonexistent', { title: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Quote not found');
    });

    it('rejects negative rates in blocks', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({
        id: 'quote-1',
        workspaceId: WORKSPACE_ID,
        settings: {},
      });

      const result = await updateQuote('quote-1', {
        blocks: [
          {
            id: 'b1', type: 'service-item', createdAt: '', updatedAt: '',
            content: { name: 'Bad', description: '', quantity: 1, rate: -50, unit: 'hour', taxRate: 0, rateCardId: null },
          },
        ],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('rate cannot be negative');
    });
  });

  describe('getQuote', () => {
    it('returns quote document format', async () => {
      const now = new Date();
      mockPrisma.quote.findFirst.mockResolvedValue({
        id: 'quote-1',
        workspaceId: WORKSPACE_ID,
        clientId: 'client-1',
        projectId: null,
        quoteNumber: 'QT-0001',
        status: 'draft',
        title: 'Test Quote',
        issueDate: now,
        expirationDate: null,
        subtotal: 1000,
        taxTotal: 100,
        total: 1100,
        discountType: null,
        discountValue: null,
        discountAmount: 0,
        notes: '',
        terms: '',
        internalNotes: '',
        settings: { blocks: [], requireSignature: true },
        lineItems: [],
        client: { id: 'client-1', name: 'Acme', email: 'a@b.com', company: 'Acme Corp' },
        project: null,
        invoice: null,
      });

      const doc = await getQuote('quote-1');

      expect(doc).not.toBeNull();
      expect(doc!.id).toBe('quote-1');
      expect(doc!.totals.subtotal).toBe(1000);
      expect(doc!.client?.name).toBe('Acme');
    });

    it('returns null for non-existent quote', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null);

      const doc = await getQuote('nonexistent');

      expect(doc).toBeNull();
    });

    it('constructs blocks from lineItems when blocks are empty', async () => {
      const now = new Date();
      mockPrisma.quote.findFirst.mockResolvedValue({
        id: 'quote-1',
        workspaceId: WORKSPACE_ID,
        clientId: 'client-1',
        projectId: null,
        quoteNumber: 'QT-0001',
        status: 'draft',
        title: 'Test',
        issueDate: now,
        expirationDate: null,
        subtotal: 100,
        taxTotal: 0,
        total: 100,
        discountType: null,
        discountValue: null,
        discountAmount: 0,
        notes: '',
        terms: '',
        internalNotes: '',
        settings: { blocks: [] }, // empty blocks
        lineItems: [
          {
            id: 'li-1', name: 'Item 1', description: null, quantity: 1, rate: 100,
            amount: 100, taxRate: null, taxAmount: 0, sortOrder: 0, rateCardId: null,
            createdAt: now, updatedAt: now,
          },
        ],
        client: { id: 'client-1', name: 'Acme', email: 'a@b.com', company: null },
        project: null,
        invoice: null,
      });

      const doc = await getQuote('quote-1');

      expect(doc!.blocks.length).toBe(1);
      expect(doc!.blocks[0]!.type).toBe('service-item');
    });
  });

  describe('getQuotes', () => {
    it('returns paginated results', async () => {
      mockPrisma.quote.findMany.mockResolvedValue([
        { id: 'q1', quoteNumber: 'QT-0001', title: 'Q1', status: 'draft', total: 100, issueDate: new Date(), expirationDate: null, client: null, createdAt: new Date() },
      ]);
      mockPrisma.quote.count.mockResolvedValue(10);

      const result = await getQuotes({ limit: 1, offset: 0 });

      expect(result.quotes.length).toBe(1);
      expect(result.total).toBe(10);
    });

    it('passes status filter to query', async () => {
      mockPrisma.quote.findMany.mockResolvedValue([]);
      mockPrisma.quote.count.mockResolvedValue(0);

      await getQuotes({ status: 'sent' });

      const findManyCall = mockPrisma.quote.findMany.mock.calls[0]![0];
      expect(findManyCall.where.status).toBe('sent');
    });

    it('passes search filter to query', async () => {
      mockPrisma.quote.findMany.mockResolvedValue([]);
      mockPrisma.quote.count.mockResolvedValue(0);

      await getQuotes({ search: 'acme' });

      const findManyCall = mockPrisma.quote.findMany.mock.calls[0]![0];
      expect(findManyCall.where.OR).toBeDefined();
      expect(findManyCall.where.OR.length).toBe(3);
    });
  });

  describe('deleteQuote', () => {
    it('soft deletes a quote', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null); // no linked invoice
      mockPrisma.quote.update.mockResolvedValue({ id: 'quote-1', deletedAt: new Date() });

      const result = await deleteQuote('quote-1');

      expect(result.success).toBe(true);
      expect(mockPrisma.quote.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        })
      );
    });

    it('blocks deletion when linked invoice exists', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'inv-1', quoteId: 'quote-1' });

      const result = await deleteQuote('quote-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('linked invoice');
    });
  });

  describe('duplicateQuote', () => {
    it('creates a copy with new number and draft status', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({
        id: 'quote-1',
        workspaceId: WORKSPACE_ID,
        clientId: 'client-1',
        projectId: null,
        title: 'Original',
        subtotal: 100,
        discountType: null,
        discountValue: null,
        discountAmount: 0,
        taxTotal: 0,
        total: 100,
        notes: 'notes',
        terms: 'terms',
        settings: { blocks: [] },
        lineItems: [],
      });
      mockPrisma.quote.create.mockResolvedValue({ id: 'quote-dup' });

      const result = await duplicateQuote('quote-1');

      expect(result.success).toBe(true);
      expect(result.quoteId).toBe('quote-dup');

      const createCall = mockPrisma.quote.create.mock.calls[0]![0];
      expect(createCall.data.title).toBe('Original (Copy)');
      expect(createCall.data.status).toBe('draft');
    });

    it('throws when original not found', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null);

      await expect(duplicateQuote('nonexistent')).rejects.toThrow('Quote not found');
    });
  });

  describe('updateQuoteStatus', () => {
    it('allows valid transition from draft to sent', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({
        id: 'quote-1',
        workspaceId: WORKSPACE_ID,
        status: 'draft',
      });
      mockPrisma.quote.update.mockResolvedValue({ id: 'quote-1', status: 'sent' });

      const result = await updateQuoteStatus('quote-1', 'sent');

      expect(result.success).toBe(true);
    });

    it('rejects invalid transition from draft to accepted', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({
        id: 'quote-1',
        workspaceId: WORKSPACE_ID,
        status: 'draft',
      });

      const result = await updateQuoteStatus('quote-1', 'accepted');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot change status');
    });

    it('returns error when quote not found', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null);

      const result = await updateQuoteStatus('nonexistent', 'sent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Quote not found');
    });
  });
});
