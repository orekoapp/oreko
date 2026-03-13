import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockPrisma, mockGetCurrentUserWorkspace } = vi.hoisted(() => {
  const mockPrisma: Record<string, any> = {
    workspace: { findUnique: vi.fn() },
    invoice: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
    businessProfile: { findUnique: vi.fn() },
    invoiceLineItem: { deleteMany: vi.fn() },
    invoiceEvent: { create: vi.fn() },
    client: { findFirst: vi.fn() },
    quote: { findFirst: vi.fn(), update: vi.fn() },
    quoteEvent: { create: vi.fn() },
    payment: { create: vi.fn(), findMany: vi.fn() },
    numberSequence: { upsert: vi.fn() },
    $transaction: vi.fn((fnOrArray: any) => {
      if (typeof fnOrArray === 'function') return fnOrArray(mockPrisma);
      return Promise.all(fnOrArray);
    }),
  };
  const mockGetCurrentUserWorkspace = vi.fn();
  return { mockPrisma, mockGetCurrentUserWorkspace };
});

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/services/email', () => ({ sendInvoiceSentEmail: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/notifications/actions', () => ({ createNotification: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/utils', () => ({ formatCurrency: vi.fn((v: number) => `$${v.toFixed(2)}`) }));
vi.mock('@/lib/routes', () => ({ ROUTES: { quotes: '/quotes', invoices: '/invoices', quoteDetail: (id: string) => `/quotes/${id}`, invoiceDetail: (id: string) => `/invoices/${id}` } }));
vi.mock('@/lib/events/emitter', () => ({ domainEvents: { emit: vi.fn() } }));
vi.mock('@/lib/workspace/get-current-workspace', () => ({ getCurrentUserWorkspace: mockGetCurrentUserWorkspace }));
vi.mock('@/lib/invoices/internal', () => ({ generateInvoiceNumber: vi.fn().mockResolvedValue('INV-0001') }));
vi.mock('@quotecraft/database', () => ({
  prisma: mockPrisma,
  Prisma: { InputJsonValue: {}, TransactionClient: {} },
}));
import {
  createInvoice,
  getInvoices,
  deleteInvoice,
  updateInvoiceStatus,
  createInvoiceFromQuote,
} from '@/lib/invoices/actions';

describe('Invoice Actions', () => {
  const WORKSPACE_ID = 'ws-123';
  const USER_ID = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetCurrentUserWorkspace.mockResolvedValue({
      workspaceId: WORKSPACE_ID,
      userId: USER_ID,
      role: 'owner',
    });

    mockPrisma.workspace.findUnique.mockResolvedValue({
      id: WORKSPACE_ID,
      name: 'Test Workspace',
    });

    mockPrisma.invoiceEvent.create.mockResolvedValue({ id: 'event-1' });

    // Default businessProfile for currency lookup
    mockPrisma.businessProfile.findUnique.mockResolvedValue({ currency: 'USD' });
  });

  describe('createInvoice', () => {
    it('creates an invoice with valid data', async () => {
      mockPrisma.client.findFirst.mockResolvedValue({ id: 'client-1', workspaceId: WORKSPACE_ID });
      mockPrisma.invoice.findFirst.mockResolvedValue(null);
      mockPrisma.invoice.create.mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-0001',
        status: 'draft',
        lineItems: [],
        client: { id: 'client-1' },
        project: null,
      });

      const result = await createInvoice({
        clientId: 'client-1',
        title: 'Monthly Services',
        dueDate: '2024-02-15',
        lineItems: [
          { name: 'Service A', quantity: 2, rate: 100 },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.invoice).toBeDefined();
      expect(mockPrisma.invoice.create).toHaveBeenCalledTimes(1);
    });

    it('returns error when client not found', async () => {
      mockPrisma.client.findFirst.mockResolvedValue(null);

      const result = await createInvoice({
        clientId: 'nonexistent',
        title: 'Test',
        dueDate: '2024-02-15',
        lineItems: [{ name: 'Item', quantity: 1, rate: 100 }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Client not found');
    });

    it('rejects negative rates', async () => {
      mockPrisma.client.findFirst.mockResolvedValue({ id: 'client-1', workspaceId: WORKSPACE_ID });

      const result = await createInvoice({
        clientId: 'client-1',
        title: 'Test',
        dueDate: '2024-02-15',
        lineItems: [{ name: 'Item', quantity: 1, rate: -50 }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('rate cannot be negative');
    });

    it('calculates totals from line items', async () => {
      mockPrisma.client.findFirst.mockResolvedValue({ id: 'client-1', workspaceId: WORKSPACE_ID });
      mockPrisma.invoice.findFirst.mockResolvedValue(null);
      mockPrisma.invoice.create.mockImplementation(async ({ data }: any) => ({
        id: 'inv-1',
        ...data,
        lineItems: [],
        client: { id: 'client-1' },
        project: null,
      }));

      await createInvoice({
        clientId: 'client-1',
        title: 'Test',
        dueDate: '2024-02-15',
        lineItems: [
          { name: 'A', quantity: 2, rate: 100, taxRate: 10 },
          { name: 'B', quantity: 1, rate: 500 },
        ],
      });

      const createCall = mockPrisma.invoice.create.mock.calls[0]![0];
      expect(createCall.data.subtotal).toBe(700);
      expect(createCall.data.taxTotal).toBe(20);
      expect(createCall.data.total).toBe(720);
    });
  });

  describe('createInvoiceFromQuote', () => {
    it('creates invoice from an accepted quote', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({
        id: 'quote-1',
        workspaceId: WORKSPACE_ID,
        clientId: 'client-1',
        projectId: null,
        title: 'Project',
        subtotal: 1000,
        taxTotal: 100,
        total: 1100,
        discountType: null,
        discountValue: null,
        discountAmount: 0,
        notes: 'notes',
        terms: 'terms',
        lineItems: [
          { name: 'Dev', description: null, quantity: 10, rate: 100, amount: 1000, taxRate: 10, taxAmount: 100, sortOrder: 0 },
        ],
        client: { id: 'client-1', name: 'Acme' },
      });
      mockPrisma.invoice.findFirst.mockResolvedValue(null); // no existing invoice
      mockPrisma.invoice.create.mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-0001',
        subtotal: 1000,
        discountValue: null,
        discountAmount: 0,
        taxTotal: 100,
        total: 1100,
        amountPaid: 0,
        amountDue: 1100,
        lineItems: [
          { name: 'Dev', quantity: 10, rate: 100, amount: 1000, taxRate: 10, taxAmount: 100 },
        ],
      });
      mockPrisma.quote.update.mockResolvedValue({ id: 'quote-1', status: 'converted' });
      mockPrisma.quoteEvent.create.mockResolvedValue({ id: 'event-1' });

      const result = await createInvoiceFromQuote('quote-1');

      expect(result.success).toBe(true);
      expect(mockPrisma.invoice.create).toHaveBeenCalledTimes(1);
    });

    it('prevents duplicate invoice from same quote', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue({
        id: 'quote-1',
        workspaceId: WORKSPACE_ID,
        clientId: 'client-1',
        lineItems: [],
        client: { id: 'client-1' },
      });
      mockPrisma.invoice.findFirst.mockResolvedValue({ id: 'existing-inv' }); // already exists

      const result = await createInvoiceFromQuote('quote-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('returns error when quote not found', async () => {
      mockPrisma.quote.findFirst.mockResolvedValue(null);

      const result = await createInvoiceFromQuote('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Quote not found');
    });
  });

  describe('getInvoices', () => {
    it('returns invoice list', async () => {
      const now = new Date();
      mockPrisma.invoice.findMany.mockResolvedValue([
        {
          id: 'inv-1', invoiceNumber: 'INV-0001', title: 'Test', status: 'draft',
          total: 100, amountPaid: 0, amountDue: 100, issueDate: now, dueDate: now,
          client: { id: 'c1', name: 'Acme', email: 'a@b.com', company: null }, createdAt: now,
        },
      ]);

      const result = await getInvoices();

      expect(result.length).toBe(1);
      expect(result[0]!.invoiceNumber).toBe('INV-0001');
    });

    it('filters by status', async () => {
      mockPrisma.invoice.findMany.mockResolvedValue([]);

      await getInvoices({ status: 'sent' });

      const findManyCall = mockPrisma.invoice.findMany.mock.calls[0]![0];
      expect(findManyCall.where.status).toBe('sent');
    });

    it('marks overdue invoices', async () => {
      const pastDate = new Date('2020-01-01');
      mockPrisma.invoice.findMany.mockResolvedValue([
        {
          id: 'inv-1', invoiceNumber: 'INV-0001', title: 'Test', status: 'sent',
          total: 100, amountPaid: 0, amountDue: 100, issueDate: new Date(), dueDate: pastDate,
          client: { id: 'c1', name: 'Acme', email: null, company: null }, createdAt: new Date(),
        },
      ]);

      const result = await getInvoices();

      expect(result[0]!.isOverdue).toBe(true);
      expect(result[0]!.status).toBe('overdue');
    });
  });

  describe('updateInvoiceStatus', () => {
    it('updates status from draft to sent', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        workspaceId: WORKSPACE_ID,
        status: 'draft',
        sentAt: null,
        accessToken: 'token-123',
        client: { email: 'test@test.com' },
      });
      mockPrisma.invoice.update.mockResolvedValue({ id: 'inv-1', status: 'sent' });

      const result = await updateInvoiceStatus('inv-1', 'sent');

      expect(result.success).toBe(true);
    });

    it('returns error for non-existent invoice', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(null);

      const result = await updateInvoiceStatus('nonexistent', 'sent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('deleteInvoice', () => {
    it('soft deletes a draft invoice', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        workspaceId: WORKSPACE_ID,
        status: 'draft',
      });
      mockPrisma.invoice.update.mockResolvedValue({ id: 'inv-1', deletedAt: new Date() });

      const result = await deleteInvoice('inv-1');

      expect(result.success).toBe(true);
    });

    it('prevents deleting non-draft invoices', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'inv-1',
        workspaceId: WORKSPACE_ID,
        status: 'sent',
      });

      const result = await deleteInvoice('inv-1');

      expect(result.success).toBe(false);
    });
  });
});
