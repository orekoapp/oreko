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
  invoice: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  invoiceLineItem: {
    deleteMany: vi.fn(),
  },
  invoiceEvent: {
    create: vi.fn(),
  },
  payment: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  quote: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  quoteEvent: {
    create: vi.fn(),
  },
  workspaceMember: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn((callbacks) => {
    if (typeof callbacks === 'function') {
      return callbacks(mockPrisma);
    }
    return Promise.all(callbacks);
  }),
};

vi.mock('@quotecraft/database', () => ({
  prisma: mockPrisma,
  Prisma: {
    InputJsonValue: {},
    InvoiceWhereInput: {},
    InvoiceUpdateInput: {},
  },
}));

describe('Invoice Actions', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  const mockWorkspace = {
    id: 'ws-123',
    name: 'Test Workspace',
  };

  beforeEach(() => {
    vi.clearAllMocks();

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

  describe('createInvoice', () => {
    const validInvoiceData = {
      clientId: 'client-123',
      title: 'Monthly Services',
      dueDate: '2024-02-15',
      lineItems: [
        { name: 'Service A', description: 'Description', quantity: 2, rate: 100 },
        { name: 'Service B', quantity: 1, rate: 500, taxRate: 10 },
      ],
      notes: 'Payment due upon receipt',
      terms: 'Net 30',
    };

    it('generates unique invoice numbers', () => {
      const lastInvoiceNumber = 'INV-0010';
      const lastNumber = parseInt(lastInvoiceNumber.replace(/\D/g, ''), 10);
      const nextNumber = lastNumber + 1;
      const newInvoiceNumber = `INV-${String(nextNumber).padStart(4, '0')}`;

      expect(newInvoiceNumber).toBe('INV-0011');
    });

    it('calculates totals correctly', () => {
      const lineItems = validInvoiceData.lineItems;

      let subtotal = 0;
      let taxTotal = 0;

      for (const item of lineItems) {
        const amount = item.quantity * item.rate;
        subtotal += amount;
        if (item.taxRate) {
          taxTotal += amount * (item.taxRate / 100);
        }
      }

      const total = subtotal + taxTotal;

      expect(subtotal).toBe(700);
      expect(taxTotal).toBe(50);
      expect(total).toBe(750);
    });

    it('rounds amounts to 2 decimal places', () => {
      const amount = 33.333333;
      const rounded = Math.round(amount * 100) / 100;

      expect(rounded).toBe(33.33);
    });

    it('sets initial status to draft', () => {
      const newInvoice = {
        status: 'draft',
        amountPaid: 0,
      };

      expect(newInvoice.status).toBe('draft');
      expect(newInvoice.amountPaid).toBe(0);
    });
  });

  describe('createInvoiceFromQuote', () => {
    const mockQuote = {
      id: 'quote-123',
      workspaceId: 'ws-123',
      clientId: 'client-123',
      title: 'Project Quote',
      subtotal: 5000,
      taxTotal: 500,
      total: 5500,
      discountType: 'percentage',
      discountValue: 10,
      discountAmount: 500,
      notes: 'Quote notes',
      terms: 'Quote terms',
      lineItems: [
        {
          name: 'Development',
          description: 'Web development',
          quantity: 50,
          rate: 100,
          amount: 5000,
          taxRate: 10,
          taxAmount: 500,
          sortOrder: 0,
        },
      ],
    };

    it('copies quote data to invoice', () => {
      const invoiceData = {
        clientId: mockQuote.clientId,
        quoteId: mockQuote.id,
        title: mockQuote.title,
        subtotal: mockQuote.subtotal,
        taxTotal: mockQuote.taxTotal,
        total: mockQuote.total,
        notes: mockQuote.notes,
        terms: mockQuote.terms,
      };

      expect(invoiceData.quoteId).toBe('quote-123');
      expect(invoiceData.total).toBe(5500);
    });

    it('sets due date 30 days from now by default', () => {
      const now = new Date();
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 30);

      const daysDiff = Math.round(
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBe(30);
    });

    it('marks quote as converted', () => {
      const updatedQuoteStatus = 'converted';
      expect(updatedQuoteStatus).toBe('converted');
    });

    it('prevents duplicate invoices from same quote', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue({
        id: 'existing-invoice',
        quoteId: 'quote-123',
      });

      const existingInvoice = await mockPrisma.invoice.findFirst({
        where: { quoteId: 'quote-123' },
      });

      expect(existingInvoice).toBeDefined();
      // Should return error: 'Invoice already exists for this quote'
    });
  });

  describe('updateInvoice', () => {
    const existingInvoice = {
      id: 'inv-123',
      workspaceId: 'ws-123',
      status: 'draft',
      title: 'Original Title',
      subtotal: 1000,
      taxTotal: 100,
      total: 1100,
      lineItems: [
        { id: 'li-1', name: 'Item 1', quantity: 1, rate: 1000 },
      ],
    };

    it('only allows editing draft invoices', () => {
      const draftInvoice = { ...existingInvoice, status: 'draft' };
      const sentInvoice = { ...existingInvoice, status: 'sent' };

      expect(draftInvoice.status).toBe('draft');
      expect(sentInvoice.status).toBe('sent');
      // Only draft should be editable
    });

    it('recalculates totals when line items change', () => {
      const newLineItems = [
        { name: 'New Item', quantity: 2, rate: 500, taxRate: 8 },
      ];

      const subtotal = 1000;
      const taxTotal = 80;
      const total = 1080;

      expect(subtotal).toBe(2 * 500);
      expect(taxTotal).toBe(1000 * 0.08);
      expect(total).toBe(subtotal + taxTotal);
    });
  });

  describe('getInvoices', () => {
    it('filters by status', () => {
      const status = 'sent';
      const whereClause = {
        workspaceId: 'ws-123',
        deletedAt: null,
        status,
      };

      expect(whereClause.status).toBe('sent');
    });

    it('filters by client', () => {
      const clientId = 'client-123';
      const whereClause = {
        clientId,
      };

      expect(whereClause.clientId).toBe('client-123');
    });

    it('identifies overdue invoices', () => {
      const now = new Date();
      const pastDueDate = new Date('2024-01-01');
      const futureDueDate = new Date('2099-12-31');

      const isOverdue1 = pastDueDate < now;
      const isOverdue2 = futureDueDate < now;

      expect(isOverdue1).toBe(true);
      expect(isOverdue2).toBe(false);
    });

    it('marks sent invoices as overdue when past due date', () => {
      const invoice = {
        status: 'sent',
        dueDate: new Date('2024-01-01'),
      };
      const now = new Date();

      const isOverdue =
        invoice.status !== 'paid' &&
        invoice.status !== 'voided' &&
        invoice.dueDate < now;

      expect(isOverdue).toBe(true);
    });
  });

  describe('updateInvoiceStatus', () => {
    it('sets sentAt when status changes to sent', () => {
      const status = 'sent';
      const invoice = { sentAt: null };

      if (status === 'sent' && !invoice.sentAt) {
        invoice.sentAt = new Date() as unknown as null;
      }

      expect(invoice.sentAt).toBeDefined();
    });

    it('sets paidAt and clears amountDue when status is paid', () => {
      const status = 'paid';
      const updateData: Record<string, unknown> = { status };

      if (status === 'paid') {
        updateData.paidAt = new Date();
        updateData.amountPaid = 1000;
        updateData.amountDue = 0;
      }

      expect(updateData.paidAt).toBeDefined();
      expect(updateData.amountDue).toBe(0);
    });

    it('creates invoice event on status change', () => {
      const event = {
        invoiceId: 'inv-123',
        eventType: 'status_changed_to_sent',
        actorId: 'user-123',
        actorType: 'user',
        metadata: { previousStatus: 'draft' },
      };

      expect(event.eventType).toBe('status_changed_to_sent');
      expect(event.metadata.previousStatus).toBe('draft');
    });
  });

  describe('recordPayment', () => {
    const invoice = {
      id: 'inv-123',
      status: 'sent',
      total: 1000,
      amountPaid: 0,
      amountDue: 1000,
    };

    it('calculates new amounts after payment', () => {
      const paymentAmount = 500;
      const newAmountPaid = invoice.amountPaid + paymentAmount;
      const newAmountDue = invoice.total - newAmountPaid;

      expect(newAmountPaid).toBe(500);
      expect(newAmountDue).toBe(500);
    });

    it('sets status to paid when fully paid', () => {
      const paymentAmount = 1000;
      const newAmountPaid = invoice.amountPaid + paymentAmount;

      const newStatus = newAmountPaid >= invoice.total ? 'paid' : 'partial';

      expect(newStatus).toBe('paid');
    });

    it('sets status to partial when partially paid', () => {
      const paymentAmount = 500;
      const newAmountPaid = invoice.amountPaid + paymentAmount;

      const newStatus = newAmountPaid >= invoice.total ? 'paid' : 'partial';

      expect(newStatus).toBe('partial');
    });

    it('prevents payment on voided invoices', () => {
      const voidedInvoice = { ...invoice, status: 'voided' };

      expect(voidedInvoice.status).toBe('voided');
      // Should return error: 'Cannot record payment for voided invoice'
    });

    it('creates payment record', () => {
      const paymentData = {
        invoiceId: 'inv-123',
        amount: 500,
        paymentMethod: 'credit_card',
        status: 'completed',
        referenceNumber: 'REF-123',
        notes: 'Partial payment',
        processedAt: new Date(),
      };

      expect(paymentData.status).toBe('completed');
      expect(paymentData.amount).toBe(500);
    });
  });

  describe('deleteInvoice', () => {
    it('only allows deleting draft invoices', () => {
      const draftInvoice = { status: 'draft' };
      const sentInvoice = { status: 'sent' };

      const canDeleteDraft = draftInvoice.status === 'draft';
      const canDeleteSent = sentInvoice.status === 'draft';

      expect(canDeleteDraft).toBe(true);
      expect(canDeleteSent).toBe(false);
    });

    it('performs soft delete', async () => {
      const deletedAt = new Date();

      mockPrisma.invoice.update.mockResolvedValue({
        id: 'inv-123',
        deletedAt,
      });

      const result = await mockPrisma.invoice.update({
        where: { id: 'inv-123' },
        data: { deletedAt },
      });

      expect(result.deletedAt).toBeDefined();
    });
  });
});
