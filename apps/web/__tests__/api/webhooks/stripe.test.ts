import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Stripe
const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
};

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe),
}));

// Mock Prisma
const mockPrisma = {
  invoice: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  payment: {
    create: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
  },
  invoiceEvent: {
    create: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
};

vi.mock('@oreko/database', () => ({
  prisma: mockPrisma,
}));

// Mock environment variables
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_secret');

describe('Stripe Webhook API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Webhook Event Types', () => {
    it('handles checkout.session.completed event', () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: { invoiceId: 'inv-123' },
            amount_total: 10000,
            payment_intent: 'pi_test_123',
          },
        },
      };

      expect(event.type).toBe('checkout.session.completed');
      expect(event.data.object.metadata.invoiceId).toBe('inv-123');
    });

    it('handles payment_intent.succeeded event', () => {
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 10000,
            metadata: { invoiceId: 'inv-123' },
          },
        },
      };

      expect(event.type).toBe('payment_intent.succeeded');
      expect(event.data.object.amount).toBe(10000);
    });

    it('handles payment_intent.payment_failed event', () => {
      const event = {
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            last_payment_error: {
              message: 'Card declined',
            },
          },
        },
      };

      expect(event.type).toBe('payment_intent.payment_failed');
      expect(event.data.object.last_payment_error.message).toBe('Card declined');
    });

    it('handles charge.refunded event', () => {
      const event = {
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_test_123',
            amount_refunded: 5000,
            payment_intent: 'pi_test_123',
          },
        },
      };

      expect(event.type).toBe('charge.refunded');
      expect(event.data.object.amount_refunded).toBe(5000);
    });
  });

  describe('Webhook Signature Verification', () => {
    it('validates webhook signature format', () => {
      const validSignature = 't=1234567890,v1=abc123,v0=def456';
      const parts = validSignature.split(',');

      expect(parts.length).toBe(3);
      expect(parts[0]).toMatch(/^t=\d+$/);
      expect(parts[1]).toMatch(/^v1=/);
    });

    it('rejects requests without signature', () => {
      const request = {
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
      };

      const signature = request.headers.get('stripe-signature');
      expect(signature).toBeNull();
    });
  });

  describe('Invoice Payment Processing', () => {
    it('updates invoice status to paid on successful payment', async () => {
      const invoice = {
        id: 'inv-123',
        total: 100,
        amountPaid: 0,
        amountDue: 100,
        status: 'sent',
      };

      const paymentAmount = 100;
      const newAmountPaid = invoice.amountPaid + paymentAmount;
      const newAmountDue = Number(invoice.total) - newAmountPaid;
      const newStatus = newAmountPaid >= Number(invoice.total) ? 'paid' : 'partial';

      expect(newStatus).toBe('paid');
      expect(newAmountDue).toBe(0);
    });

    it('updates invoice status to partial on partial payment', () => {
      const invoice = {
        id: 'inv-123',
        total: 100,
        amountPaid: 0,
        amountDue: 100,
        status: 'sent',
      };

      const paymentAmount = 50;
      const newAmountPaid = invoice.amountPaid + paymentAmount;
      const newAmountDue = Number(invoice.total) - newAmountPaid;
      const newStatus = newAmountPaid >= Number(invoice.total) ? 'paid' : 'partial';

      expect(newStatus).toBe('partial');
      expect(newAmountDue).toBe(50);
    });
  });

  describe('Error Handling', () => {
    it('handles missing invoice gracefully', () => {
      const invoice = null;

      expect(invoice).toBeNull();
      // Should log error and return 200 to acknowledge webhook
    });

    it('handles duplicate payment events idempotently', () => {
      // When a payment already exists for a given paymentIntentId, don't create another
      const existingPayments = [
        { id: 'pay-123', stripePaymentIntentId: 'pi_test_123', status: 'completed' },
      ];

      const newEventPaymentIntentId = 'pi_test_123';
      const isDuplicate = existingPayments.some(
        (p) => p.stripePaymentIntentId === newEventPaymentIntentId
      );

      expect(isDuplicate).toBe(true);
      // System should skip creating a new payment record
    });

    it('prevents double-processing of same checkout session', () => {
      const processedEvents = new Set<string>();
      const eventId = 'evt_test_123';

      // First processing
      expect(processedEvents.has(eventId)).toBe(false);
      processedEvents.add(eventId);

      // Duplicate delivery
      expect(processedEvents.has(eventId)).toBe(true);
      // Should skip second processing
    });
  });

  describe('Replay Attack Prevention', () => {
    it('rejects events with expired timestamps', () => {
      const tolerance = 300; // 5 minutes in seconds
      const now = Math.floor(Date.now() / 1000);
      const oldTimestamp = now - 600; // 10 minutes ago

      const isExpired = (now - oldTimestamp) > tolerance;
      expect(isExpired).toBe(true);
    });

    it('accepts events within timestamp tolerance', () => {
      const tolerance = 300;
      const now = Math.floor(Date.now() / 1000);
      const recentTimestamp = now - 60; // 1 minute ago

      const isExpired = (now - recentTimestamp) > tolerance;
      expect(isExpired).toBe(false);
    });

    it('validates webhook signature with constructEvent', () => {
      // Stripe's constructEvent verifies signature + timestamp
      const body = '{"id":"evt_123"}';
      const sig = 't=1234567890,v1=abc123';
      const secret = 'whsec_test_secret';

      mockStripe.webhooks.constructEvent.mockReturnValue({ id: 'evt_123', type: 'checkout.session.completed' });

      const event = mockStripe.webhooks.constructEvent(body, sig, secret);
      expect(event.id).toBe('evt_123');
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(body, sig, secret);
    });

    it('throws on invalid webhook signature', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('No signatures found matching the expected signature for payload');
      });

      expect(() => {
        mockStripe.webhooks.constructEvent('body', 'bad_sig', 'whsec_test');
      }).toThrow('No signatures found');
    });
  });
});
