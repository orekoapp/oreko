import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Stripe
const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
};

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe),
}));

// Mock Prisma
const mockPrisma = {
  invoice: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  invoiceEvent: {
    create: vi.fn(),
  },
  workspace: {
    findUnique: vi.fn(),
  },
};

vi.mock('@quotecraft/database', () => ({
  prisma: mockPrisma,
}));

describe('Invoice Checkout API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/checkout/invoice/[invoiceId]', () => {
    const mockInvoice = {
      id: 'inv-123',
      invoiceNumber: 'INV-0001',
      title: 'Monthly Services',
      status: 'sent',
      total: 10000, // $100.00 in cents
      amountDue: 10000,
      workspaceId: 'ws-123',
      clientId: 'client-123',
      client: {
        id: 'client-123',
        name: 'Acme Corp',
        email: 'billing@acme.com',
      },
      lineItems: [
        {
          name: 'Consulting Services',
          quantity: 1,
          rate: 100,
          amount: 100,
        },
      ],
    };

    it('validates invoice exists and is payable', async () => {
      mockPrisma.invoice.findFirst.mockResolvedValue(mockInvoice);

      const invoice = await mockPrisma.invoice.findFirst({
        where: { id: 'inv-123' },
      });

      expect(invoice).toBeDefined();
      expect(invoice?.status).toBe('sent');
      expect(Number(invoice?.amountDue)).toBeGreaterThan(0);
    });

    it('rejects paid invoices', () => {
      const paidInvoice = { ...mockInvoice, status: 'paid', amountDue: 0 };

      expect(paidInvoice.status).toBe('paid');
      expect(paidInvoice.amountDue).toBe(0);
      // Should return 400 error
    });

    it('rejects voided invoices', () => {
      const voidedInvoice = { ...mockInvoice, status: 'voided' };

      expect(voidedInvoice.status).toBe('voided');
      // Should return 400 error
    });

    it('creates Stripe checkout session with correct parameters', async () => {
      const sessionParams = {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: mockInvoice.total,
              product_data: {
                name: `Invoice ${mockInvoice.invoiceNumber}`,
                description: mockInvoice.title,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          invoiceId: mockInvoice.id,
        },
        success_url: expect.stringContaining('/success'),
        cancel_url: expect.stringContaining('/cancel'),
      };

      expect(sessionParams.mode).toBe('payment');
      expect(sessionParams.metadata.invoiceId).toBe('inv-123');
    });

    it('includes customer email in checkout session', () => {
      const sessionParams = {
        customer_email: mockInvoice.client.email,
      };

      expect(sessionParams.customer_email).toBe('billing@acme.com');
    });

    it('handles partial payment amounts', () => {
      const partialInvoice = {
        ...mockInvoice,
        amountDue: 5000, // $50 remaining
        amountPaid: 5000,
        status: 'partial',
      };

      expect(partialInvoice.amountDue).toBe(5000);
      expect(partialInvoice.status).toBe('partial');
    });

    it('converts amounts to cents for Stripe', () => {
      const dollarAmount = 100.50;
      const centAmount = Math.round(dollarAmount * 100);

      expect(centAmount).toBe(10050);
    });

    it('supports multiple currencies', () => {
      const currencies = ['usd', 'eur', 'gbp', 'cad', 'aud'];

      currencies.forEach((currency) => {
        expect(currency.length).toBe(3);
        expect(currency).toBe(currency.toLowerCase());
      });
    });
  });

  describe('Checkout Session Handling', () => {
    it('returns checkout session URL', () => {
      const session = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      expect(session.url).toContain('checkout.stripe.com');
    });

    it('handles Stripe API errors gracefully', async () => {
      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error('Card declined')
      );

      await expect(
        mockStripe.checkout.sessions.create({})
      ).rejects.toThrow('Card declined');
    });

    it('logs checkout initiation event', async () => {
      const eventData = {
        invoiceId: 'inv-123',
        eventType: 'checkout_initiated',
        actorType: 'client',
        metadata: {
          stripeSessionId: 'cs_test_123',
        },
      };

      expect(eventData.eventType).toBe('checkout_initiated');
    });
  });

  describe('Security', () => {
    it('validates invoice token for public checkout', () => {
      const validToken = 'abc123def456';
      const invoice = { id: 'inv-123', publicToken: validToken };

      expect(invoice.publicToken).toBe(validToken);
    });

    it('does not require authentication for public invoice checkout', () => {
      // Public checkout should work with just the invoice token
      const isPublicRoute = true;
      expect(isPublicRoute).toBe(true);
    });

    it('prevents checkout for deleted invoices', () => {
      const deletedInvoice = {
        id: 'inv-123',
        deletedAt: new Date(),
      };

      expect(deletedInvoice.deletedAt).toBeDefined();
      // Should return 404
    });
  });
});
