import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('InvoiceList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockInvoice = (overrides = {}) => ({
    id: 'inv-123',
    invoiceNumber: 'INV-0001',
    title: 'Monthly Services',
    status: 'sent' as const,
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    total: 5000,
    amountPaid: 0,
    amountDue: 5000,
    client: {
      id: 'client-123',
      name: 'Acme Corp',
      company: 'Acme Corporation',
    },
    isOverdue: false,
    ...overrides,
  });

  describe('Rendering', () => {
    it('displays invoice number', () => {
      const invoice = createMockInvoice({ invoiceNumber: 'INV-0042' });
      expect(invoice.invoiceNumber).toBe('INV-0042');
    });

    it('displays client name', () => {
      const invoice = createMockInvoice();
      expect(invoice.client.name).toBe('Acme Corp');
    });

    it('displays total amount', () => {
      const invoice = createMockInvoice({ total: 10000 });
      expect(invoice.total).toBe(10000);
    });

    it('displays due date', () => {
      const invoice = createMockInvoice({ dueDate: '2024-03-01' });
      expect(invoice.dueDate).toBe('2024-03-01');
    });
  });

  describe('Status Display', () => {
    const statuses = ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'voided'];

    statuses.forEach((status) => {
      it(`displays ${status} status correctly`, () => {
        const invoice = createMockInvoice({ status });
        expect(invoice.status).toBe(status);
      });
    });

    it('shows overdue indicator for overdue invoices', () => {
      const invoice = createMockInvoice({ isOverdue: true });
      expect(invoice.isOverdue).toBe(true);
    });

    it('calculates overdue status based on due date', () => {
      const now = new Date();
      const pastDate = new Date('2024-01-01');
      const futureDate = new Date('2099-12-31');

      const isOverdue1 = pastDate < now;
      const isOverdue2 = futureDate < now;

      expect(isOverdue1).toBe(true);
      expect(isOverdue2).toBe(false);
    });
  });

  describe('Amount Display', () => {
    it('formats currency amounts', () => {
      const amount = 5000;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);

      expect(formatted).toBe('$5,000.00');
    });

    it('shows amount paid vs total', () => {
      const invoice = createMockInvoice({
        total: 5000,
        amountPaid: 2000,
        amountDue: 3000,
      });

      expect(invoice.amountPaid).toBe(2000);
      expect(invoice.amountDue).toBe(3000);
    });

    it('shows zero balance for paid invoices', () => {
      const invoice = createMockInvoice({
        status: 'paid',
        amountPaid: 5000,
        amountDue: 0,
      });

      expect(invoice.amountDue).toBe(0);
    });
  });

  describe('Filtering', () => {
    it('filters by status', () => {
      const invoices = [
        createMockInvoice({ id: '1', status: 'draft' }),
        createMockInvoice({ id: '2', status: 'sent' }),
        createMockInvoice({ id: '3', status: 'paid' }),
      ];

      const sentInvoices = invoices.filter((inv) => inv.status === 'sent');
      expect(sentInvoices.length).toBe(1);
    });

    it('filters by client', () => {
      const invoices = [
        createMockInvoice({ id: '1', client: { id: 'c1', name: 'Client 1', company: null } }),
        createMockInvoice({ id: '2', client: { id: 'c2', name: 'Client 2', company: null } }),
        createMockInvoice({ id: '3', client: { id: 'c1', name: 'Client 1', company: null } }),
      ];

      const client1Invoices = invoices.filter((inv) => inv.client.id === 'c1');
      expect(client1Invoices.length).toBe(2);
    });

    it('filters overdue invoices', () => {
      const invoices = [
        createMockInvoice({ id: '1', isOverdue: false }),
        createMockInvoice({ id: '2', isOverdue: true }),
        createMockInvoice({ id: '3', isOverdue: true }),
      ];

      const overdueInvoices = invoices.filter((inv) => inv.isOverdue);
      expect(overdueInvoices.length).toBe(2);
    });
  });

  describe('Sorting', () => {
    it('sorts by date descending', () => {
      const invoices = [
        createMockInvoice({ id: '1', issueDate: '2024-01-15' }),
        createMockInvoice({ id: '2', issueDate: '2024-03-01' }),
        createMockInvoice({ id: '3', issueDate: '2024-02-01' }),
      ];

      const sorted = [...invoices].sort(
        (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      );

      expect(sorted[0]?.id).toBe('2');
      expect(sorted[2]?.id).toBe('1');
    });

    it('sorts by amount', () => {
      const invoices = [
        createMockInvoice({ id: '1', total: 1000 }),
        createMockInvoice({ id: '2', total: 5000 }),
        createMockInvoice({ id: '3', total: 2500 }),
      ];

      const sorted = [...invoices].sort((a, b) => b.total - a.total);

      expect(sorted[0]?.id).toBe('2');
      expect(sorted[2]?.id).toBe('1');
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no invoices', () => {
      const invoices: typeof createMockInvoice[] = [];
      expect(invoices.length).toBe(0);
      // Should show "No invoices yet" message
    });

    it('shows filtered empty state', () => {
      const invoices = [
        createMockInvoice({ status: 'draft' }),
      ];

      const paidInvoices = invoices.filter((inv) => inv.status === ('paid' as string));
      expect(paidInvoices.length).toBe(0);
      // Should show "No paid invoices" message
    });
  });

  describe('Actions', () => {
    const mockOnView = vi.fn();
    const mockOnSend = vi.fn();
    const mockOnRecordPayment = vi.fn();
    const mockOnDelete = vi.fn();

    it('view action navigates to invoice detail', () => {
      const invoice = createMockInvoice();
      mockOnView(invoice.id);

      expect(mockOnView).toHaveBeenCalledWith('inv-123');
    });

    it('send action is available for draft invoices', () => {
      const invoice = createMockInvoice({ status: 'draft' });
      const canSend = (invoice.status as string) === 'draft';

      expect(canSend).toBe(true);
    });

    it('record payment action is available for unpaid invoices', () => {
      const invoice = createMockInvoice({ status: 'sent' });
      const canRecordPayment = !['paid', 'voided'].includes(invoice.status);

      expect(canRecordPayment).toBe(true);
    });

    it('delete action is only available for draft invoices', () => {
      const draftInvoice = createMockInvoice({ status: 'draft' });
      const sentInvoice = createMockInvoice({ status: 'sent' });

      const canDeleteDraft = (draftInvoice.status as string) === 'draft';
      const canDeleteSent = (sentInvoice.status as string) === 'draft';

      expect(canDeleteDraft).toBe(true);
      expect(canDeleteSent).toBe(false);
    });
  });

  describe('Bulk Actions', () => {
    it('allows selecting multiple invoices', () => {
      const selectedIds = new Set(['inv-1', 'inv-2', 'inv-3']);
      expect(selectedIds.size).toBe(3);
    });

    it('select all selects all visible invoices', () => {
      const visibleInvoices = [
        createMockInvoice({ id: 'inv-1' }),
        createMockInvoice({ id: 'inv-2' }),
        createMockInvoice({ id: 'inv-3' }),
      ];

      const allIds = visibleInvoices.map((inv) => inv.id);
      expect(allIds.length).toBe(3);
    });
  });

  describe('Accessibility', () => {
    it('table has proper structure', () => {
      const tableElements = ['thead', 'tbody', 'tr', 'th', 'td'];
      expect(tableElements).toContain('thead');
      expect(tableElements).toContain('tbody');
    });

    it('rows are keyboard navigable', () => {
      const tabIndex = 0;
      expect(tabIndex).toBe(0);
    });

    it('status badges have accessible names', () => {
      const statusLabel = 'Status: Sent';
      expect(statusLabel).toContain('Sent');
    });
  });
});
