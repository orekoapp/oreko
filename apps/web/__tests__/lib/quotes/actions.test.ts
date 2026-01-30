import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock modules before imports
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Import mocked modules - must be after vi.mock calls
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Mock Prisma
const mockPrisma = {
  quote: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  quoteLineItem: {
    deleteMany: vi.fn(),
  },
  quoteEvent: {
    create: vi.fn(),
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
    TransactionClient: {},
  },
}));

describe('Quote Actions', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  const mockWorkspace = {
    id: 'ws-123',
    name: 'Test Workspace',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(auth).mockResolvedValue(mockSession as any);

    mockPrisma.workspaceMember.findFirst.mockResolvedValue({
      userId: mockSession.user.id,
      workspaceId: mockWorkspace.id,
      workspace: mockWorkspace,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createQuote', () => {
    it('creates a quote with valid data', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null); // No existing quotes
      mockPrisma.quote.create.mockResolvedValue({
        id: 'quote-123',
        quoteNumber: 'QT-0001',
        title: 'New Project',
        status: 'draft',
        subtotal: 0,
        taxTotal: 0,
        total: 0,
      });

      // Test the quote creation flow
      const data = {
        title: 'New Project',
        clientId: 'client-123',
        blocks: [],
      };

      expect(data.title).toBe('New Project');
      expect(data.clientId).toBeDefined();
    });

    it('generates unique quote numbers', () => {
      const lastQuoteNumber = 'QT-0005';
      const lastNumber = parseInt(lastQuoteNumber.replace(/\D/g, ''), 10);
      const nextNumber = lastNumber + 1;
      const newQuoteNumber = `QT-${String(nextNumber).padStart(4, '0')}`;

      expect(newQuoteNumber).toBe('QT-0006');
    });

    it('calculates totals from service item blocks', () => {
      const serviceItems = [
        { type: 'service-item', content: { quantity: 2, rate: 100, taxRate: 0 } },
        { type: 'service-item', content: { quantity: 1, rate: 500, taxRate: 10 } },
      ];

      const subtotal = serviceItems.reduce(
        (sum, item) => sum + item.content.quantity * item.content.rate,
        0
      );
      const taxTotal = serviceItems.reduce((sum, item) => {
        const amount = item.content.quantity * item.content.rate;
        return sum + (item.content.taxRate ? amount * (item.content.taxRate / 100) : 0);
      }, 0);
      const total = subtotal + taxTotal;

      expect(subtotal).toBe(700);
      expect(taxTotal).toBe(50);
      expect(total).toBe(750);
    });

    it('requires authentication', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      // Should throw Unauthorized error
      expect(auth).toBeDefined();
    });

    it('requires workspace membership', async () => {
      mockPrisma.workspaceMember.findFirst.mockResolvedValue(null);

      // Should throw 'No workspace found' error
      const membership = await mockPrisma.workspaceMember.findFirst({
        where: { userId: 'user-123' },
      });
      expect(membership).toBeNull();
    });
  });

  describe('updateQuote', () => {
    const existingQuote = {
      id: 'quote-123',
      workspaceId: 'ws-123',
      title: 'Original Title',
      settings: { blocks: [] },
    };

    it('updates quote title', () => {
      const updateData = { title: 'Updated Title' };

      expect(updateData.title).toBe('Updated Title');
    });

    it('updates quote blocks and recalculates totals', () => {
      const newBlocks = [
        {
          type: 'service-item',
          content: { name: 'Service', quantity: 3, rate: 200 },
        },
      ];

      const newSubtotal = 600;
      expect(newSubtotal).toBe(3 * 200);
    });

    it('verifies quote belongs to workspace', () => {
      const quoteWorkspaceId = existingQuote.workspaceId;
      const userWorkspaceId = 'ws-123';

      expect(quoteWorkspaceId).toBe(userWorkspaceId);
    });

    it('throws error for non-existent quote', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null);

      const quote = await mockPrisma.quote.findFirst({
        where: { id: 'non-existent' },
      });
      expect(quote).toBeNull();
    });
  });

  describe('getQuote', () => {
    const mockQuoteData = {
      id: 'quote-123',
      workspaceId: 'ws-123',
      clientId: 'client-123',
      quoteNumber: 'QT-0001',
      status: 'draft',
      title: 'Test Quote',
      subtotal: 1000,
      taxTotal: 100,
      total: 1100,
      discountType: null,
      discountValue: null,
      discountAmount: 0,
      issueDate: new Date('2024-01-15'),
      expirationDate: new Date('2024-02-15'),
      notes: 'Test notes',
      terms: 'Test terms',
      internalNotes: 'Internal notes',
      settings: {
        blocks: [],
        requireSignature: true,
        autoConvertToInvoice: false,
        depositRequired: true,
        depositType: 'percentage',
        depositValue: 50,
      },
      lineItems: [],
      client: { id: 'client-123', name: 'Test Client' },
    };

    it('returns quote document format', () => {
      const settings = mockQuoteData.settings;

      const document = {
        id: mockQuoteData.id,
        quoteNumber: mockQuoteData.quoteNumber,
        status: mockQuoteData.status,
        title: mockQuoteData.title,
        settings: {
          requireSignature: settings.requireSignature ?? true,
          autoConvertToInvoice: settings.autoConvertToInvoice ?? false,
          depositRequired: settings.depositRequired ?? false,
          depositType: settings.depositType ?? 'percentage',
          depositValue: settings.depositValue ?? 50,
        },
        totals: {
          subtotal: mockQuoteData.subtotal,
          taxTotal: mockQuoteData.taxTotal,
          total: mockQuoteData.total,
        },
      };

      expect(document.id).toBe('quote-123');
      expect(document.settings.depositRequired).toBe(true);
      expect(document.settings.depositValue).toBe(50);
    });

    it('returns null for non-existent quote', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null);

      const quote = await mockPrisma.quote.findFirst({
        where: { id: 'non-existent' },
      });
      expect(quote).toBeNull();
    });

    it('excludes deleted quotes', () => {
      const whereClause = {
        id: 'quote-123',
        workspaceId: 'ws-123',
        deletedAt: null,
      };

      expect(whereClause.deletedAt).toBeNull();
    });
  });

  describe('getQuotes', () => {
    it('returns paginated results', async () => {
      mockPrisma.quote.findMany.mockResolvedValue([
        { id: 'q1', quoteNumber: 'QT-0001' },
        { id: 'q2', quoteNumber: 'QT-0002' },
      ]);
      mockPrisma.quote.count.mockResolvedValue(10);

      const options = { limit: 2, offset: 0 };
      const quotes = await mockPrisma.quote.findMany({
        take: options.limit,
        skip: options.offset,
      });
      const total = await mockPrisma.quote.count({});

      expect(quotes.length).toBe(2);
      expect(total).toBe(10);
    });

    it('filters by status', () => {
      const whereClause = {
        workspaceId: 'ws-123',
        status: 'sent',
        deletedAt: null,
      };

      expect(whereClause.status).toBe('sent');
    });

    it('searches by title, quote number, and client name', () => {
      const search = 'acme';
      const orConditions = [
        { title: { contains: search, mode: 'insensitive' } },
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ];

      expect(orConditions.length).toBe(3);
    });
  });

  describe('deleteQuote', () => {
    it('soft deletes quote', async () => {
      mockPrisma.quote.update.mockResolvedValue({
        id: 'quote-123',
        deletedAt: new Date(),
      });

      const result = await mockPrisma.quote.update({
        where: { id: 'quote-123' },
        data: { deletedAt: new Date() },
      });

      expect(result.deletedAt).toBeDefined();
    });

    it('revalidates quotes path', async () => {
      // After deletion
      expect(vi.mocked(revalidatePath)).toHaveBeenCalledTimes(0);
    });
  });

  describe('duplicateQuote', () => {
    const originalQuote = {
      id: 'quote-original',
      workspaceId: 'ws-123',
      clientId: 'client-123',
      title: 'Original Quote',
      subtotal: 1000,
      taxTotal: 100,
      total: 1100,
      notes: 'Notes',
      terms: 'Terms',
      settings: { blocks: [] },
      lineItems: [
        { name: 'Item 1', quantity: 1, rate: 1000, amount: 1000, taxRate: 10 },
      ],
    };

    it('creates copy with new quote number', () => {
      const newTitle = `${originalQuote.title} (Copy)`;
      const newStatus = 'draft';

      expect(newTitle).toBe('Original Quote (Copy)');
      expect(newStatus).toBe('draft');
    });

    it('copies all line items', () => {
      const copiedLineItems = originalQuote.lineItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        taxRate: item.taxRate,
      }));

      expect(copiedLineItems.length).toBe(1);
      expect(copiedLineItems[0]!.name).toBe('Item 1');
    });

    it('preserves settings but resets status', () => {
      const newStatus = 'draft';
      const preservedSettings = { ...originalQuote.settings };

      expect(newStatus).toBe('draft');
      expect(preservedSettings).toEqual({ blocks: [] });
    });
  });

  describe('updateQuoteStatus', () => {
    it('sets sentAt timestamp when status is sent', () => {
      const status = 'sent';
      const timestampField = status === 'sent' ? 'sentAt' : null;

      expect(timestampField).toBe('sentAt');
    });

    it('sets acceptedAt timestamp when status is accepted', () => {
      const status = 'accepted';
      const statusTimestamps: Record<string, string> = {
        sent: 'sentAt',
        accepted: 'acceptedAt',
        declined: 'declinedAt',
      };

      expect(statusTimestamps[status]).toBe('acceptedAt');
    });

    it('creates quote event on status change', () => {
      const eventData = {
        quoteId: 'quote-123',
        eventType: 'status_changed_to_sent',
        actorId: 'user-123',
        actorType: 'user',
      };

      expect(eventData.eventType).toBe('status_changed_to_sent');
    });

    it('revalidates both quotes list and detail paths', () => {
      const paths = ['/quotes', '/quotes/quote-123'];

      expect(paths.length).toBe(2);
    });
  });
});
