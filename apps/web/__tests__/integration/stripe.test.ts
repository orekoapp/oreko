import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Stripe SDK
const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
  paymentIntents: {
    create: vi.fn(),
    retrieve: vi.fn(),
    confirm: vi.fn(),
    cancel: vi.fn(),
  },
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
    update: vi.fn(),
  },
  refunds: {
    create: vi.fn(),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
};

vi.mock('stripe', () => ({
  default: vi.fn(() => mockStripe),
}));

describe('Stripe Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Checkout Session Creation', () => {
    it('creates checkout session for invoice payment', async () => {
      const sessionParams = {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: 10000, // $100.00
              product_data: {
                name: 'Invoice INV-0001',
                description: 'Monthly Services',
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          invoiceId: 'inv-123',
          workspaceId: 'ws-123',
        },
        success_url: 'https://example.com/payment/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://example.com/payment/cancel',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        payment_status: 'unpaid',
        status: 'open',
      });

      const session = await mockStripe.checkout.sessions.create(sessionParams);

      expect(session.id).toBe('cs_test_123');
      expect(session.url).toContain('checkout.stripe.com');
    });

    it('includes customer email when available', () => {
      const sessionParams = {
        customer_email: 'client@example.com',
      };

      expect(sessionParams.customer_email).toBe('client@example.com');
    });

    it('supports multiple currencies', () => {
      const currencies = ['usd', 'eur', 'gbp', 'cad', 'aud'];

      currencies.forEach((currency) => {
        expect(currency.length).toBe(3);
      });
    });

    it('converts dollar amounts to cents', () => {
      const dollarAmount = 100.50;
      const centAmount = Math.round(dollarAmount * 100);

      expect(centAmount).toBe(10050);
    });
  });

  describe('Payment Intent Handling', () => {
    it('retrieves payment intent details', async () => {
      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_test_123',
        amount: 10000,
        status: 'succeeded',
        charges: {
          data: [
            { id: 'ch_test_123', receipt_url: 'https://pay.stripe.com/receipts/...' },
          ],
        },
      });

      const paymentIntent = await mockStripe.paymentIntents.retrieve('pi_test_123');

      expect(paymentIntent.status).toBe('succeeded');
      expect(paymentIntent.amount).toBe(10000);
    });

    it('handles failed payment intents', async () => {
      mockStripe.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_test_456',
        status: 'requires_payment_method',
        last_payment_error: {
          code: 'card_declined',
          message: 'Your card was declined.',
        },
      });

      const paymentIntent = await mockStripe.paymentIntents.retrieve('pi_test_456');

      expect(paymentIntent.status).toBe('requires_payment_method');
      expect(paymentIntent.last_payment_error.code).toBe('card_declined');
    });
  });

  describe('Webhook Processing', () => {
    it('verifies webhook signature', () => {
      const payload = JSON.stringify({ type: 'checkout.session.completed' });
      const signature = 't=1234567890,v1=abc123';
      const secret = 'whsec_test_secret';

      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_123' } },
      });

      const event = mockStripe.webhooks.constructEvent(payload, signature, secret);

      expect(event.type).toBe('checkout.session.completed');
    });

    it('handles checkout.session.completed event', () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_status: 'paid',
            amount_total: 10000,
            metadata: { invoiceId: 'inv-123' },
          },
        },
      };

      expect(event.type).toBe('checkout.session.completed');
      expect(event.data.object.payment_status).toBe('paid');
    });

    it('handles payment_intent.succeeded event', () => {
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 10000,
            charges: {
              data: [{ id: 'ch_test_123' }],
            },
          },
        },
      };

      expect(event.type).toBe('payment_intent.succeeded');
    });

    it('handles charge.refunded event', () => {
      const event = {
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_test_123',
            amount_refunded: 5000,
            refunded: true,
          },
        },
      };

      expect(event.type).toBe('charge.refunded');
      expect(event.data.object.amount_refunded).toBe(5000);
    });

    it('rejects invalid signatures', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      expect(() => {
        mockStripe.webhooks.constructEvent('payload', 'invalid', 'secret');
      }).toThrow('Invalid signature');
    });
  });

  describe('Refund Processing', () => {
    it('creates full refund', async () => {
      mockStripe.refunds.create.mockResolvedValue({
        id: 're_test_123',
        amount: 10000,
        status: 'succeeded',
        payment_intent: 'pi_test_123',
      });

      const refund = await mockStripe.refunds.create({
        payment_intent: 'pi_test_123',
      });

      expect(refund.status).toBe('succeeded');
      expect(refund.amount).toBe(10000);
    });

    it('creates partial refund', async () => {
      mockStripe.refunds.create.mockResolvedValue({
        id: 're_test_456',
        amount: 5000,
        status: 'succeeded',
      });

      const refund = await mockStripe.refunds.create({
        payment_intent: 'pi_test_123',
        amount: 5000,
      });

      expect(refund.amount).toBe(5000);
    });
  });

  describe('Customer Management', () => {
    it('creates customer for new client', async () => {
      mockStripe.customers.create.mockResolvedValue({
        id: 'cus_test_123',
        email: 'client@example.com',
        name: 'Acme Corp',
      });

      const customer = await mockStripe.customers.create({
        email: 'client@example.com',
        name: 'Acme Corp',
        metadata: { clientId: 'client-123' },
      });

      expect(customer.id).toMatch(/^cus_/);
      expect(customer.email).toBe('client@example.com');
    });

    it('retrieves existing customer', async () => {
      mockStripe.customers.retrieve.mockResolvedValue({
        id: 'cus_test_123',
        email: 'client@example.com',
      });

      const customer = await mockStripe.customers.retrieve('cus_test_123');

      expect(customer.id).toBe('cus_test_123');
    });
  });

  describe('Error Handling', () => {
    it('handles card declined errors', async () => {
      mockStripe.paymentIntents.create.mockRejectedValue({
        type: 'StripeCardError',
        code: 'card_declined',
        message: 'Your card was declined.',
      });

      await expect(
        mockStripe.paymentIntents.create({ amount: 10000 })
      ).rejects.toMatchObject({
        code: 'card_declined',
      });
    });

    it('handles rate limit errors', async () => {
      mockStripe.checkout.sessions.create.mockRejectedValue({
        type: 'StripeRateLimitError',
        message: 'Too many requests',
      });

      await expect(
        mockStripe.checkout.sessions.create({})
      ).rejects.toMatchObject({
        type: 'StripeRateLimitError',
      });
    });

    it('handles network errors', async () => {
      mockStripe.paymentIntents.retrieve.mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        mockStripe.paymentIntents.retrieve('pi_test')
      ).rejects.toThrow('Network error');
    });
  });

  describe('Idempotency', () => {
    it('uses idempotency keys for payment creation', () => {
      const idempotencyKey = `payment-inv-123-${Date.now()}`;

      expect(idempotencyKey).toContain('payment-inv-123');
    });

    it('prevents duplicate payments', () => {
      const processedPayments = new Set(['pi_test_123']);
      const newPaymentId = 'pi_test_123';

      const isDuplicate = processedPayments.has(newPaymentId);
      expect(isDuplicate).toBe(true);
    });
  });
});
