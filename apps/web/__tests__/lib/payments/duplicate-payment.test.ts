import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@oreko/database', () => {
  const mockPrisma = {
    payment: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    invoice: {
      update: vi.fn(),
    },
    invoiceEvent: {
      create: vi.fn(),
    },
    $transaction: vi.fn((fn: unknown) => (fn as (tx: unknown) => Promise<void>)(mockPrisma)),
  };
  return { prisma: mockPrisma };
});

vi.mock('@/lib/services/stripe', () => ({
  stripe: {},
  isStripeEnabled: () => true,
  createPaymentIntent: vi.fn(),
  getOrCreateCustomer: vi.fn(),
}));

vi.mock('@/lib/workspace/get-current-workspace', () => ({
  getCurrentUserWorkspace: vi.fn(),
}));

vi.mock('@/lib/services/email', () => ({
  sendPaymentReceivedEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/utils', () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  toNumber: (v: unknown) => (v === null || v === undefined ? 0 : Number(v) || 0),
  getBaseUrl: () => 'http://localhost:3000',
}));

import { prisma } from '@oreko/database';
import { processPaymentWebhook } from '@/lib/payments/internal';

const mockPrisma = prisma as unknown as {
  payment: { findFirst: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  invoice: { update: ReturnType<typeof vi.fn> };
  invoiceEvent: { create: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

describe('Duplicate Payment Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips processing when payment is already completed', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'pay-1',
      stripePaymentIntentId: 'pi_test_123',
      status: 'completed',
      amount: 100,
      invoiceId: 'inv-1',
      invoice: {
        id: 'inv-1',
        total: 100,
        amountPaid: 100,
        amountDue: 0,
        status: 'paid',
        workspaceId: 'ws-1',
        invoiceNumber: 'INV-001',
        client: { name: 'Test', email: 'test@test.com' },
        workspace: { name: 'Workspace' },
      },
    });

    const result = await processPaymentWebhook('pi_test_123', 'succeeded');

    expect(result.success).toBe(true);
    // Should NOT call $transaction because payment was already completed
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('skips processing when payment already failed', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'pay-1',
      stripePaymentIntentId: 'pi_test_123',
      status: 'failed',
      amount: 100,
      invoiceId: 'inv-1',
      invoice: {
        id: 'inv-1',
        total: 100,
        amountPaid: 0,
        amountDue: 100,
        status: 'sent',
        workspaceId: 'ws-1',
        invoiceNumber: 'INV-001',
        client: { name: 'Test', email: 'test@test.com' },
        workspace: { name: 'Workspace' },
      },
    });

    const result = await processPaymentWebhook('pi_test_123', 'succeeded');

    expect(result.success).toBe(true);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('processes payment when status is pending', async () => {
    const mockInvoice = {
      id: 'inv-1',
      total: 100,
      amountPaid: 0,
      amountDue: 100,
      status: 'sent',
      workspaceId: 'ws-1',
      invoiceNumber: 'INV-001',
      client: { name: 'Test Client', email: 'client@test.com' },
      workspace: { name: 'Test Workspace' },
    };

    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'pay-1',
      stripePaymentIntentId: 'pi_test_123',
      status: 'pending',
      amount: 100,
      invoiceId: 'inv-1',
      invoice: mockInvoice,
    });

    mockPrisma.payment.update.mockResolvedValue({});
    mockPrisma.invoice.update.mockResolvedValue({ ...mockInvoice, amountPaid: 100 });
    mockPrisma.invoiceEvent.create.mockResolvedValue({});

    const result = await processPaymentWebhook('pi_test_123', 'succeeded', 'ch_123', 'https://receipt.url');

    expect(result.success).toBe(true);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('returns false when payment not found', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue(null);

    const result = await processPaymentWebhook('pi_unknown', 'succeeded');

    expect(result.success).toBe(false);
  });

  it('marks payment as failed on payment_intent.failed', async () => {
    mockPrisma.payment.findFirst.mockResolvedValue({
      id: 'pay-1',
      stripePaymentIntentId: 'pi_test_456',
      status: 'pending',
      amount: 50,
      invoiceId: 'inv-2',
      invoice: {
        id: 'inv-2',
        total: 50,
        amountPaid: 0,
        amountDue: 50,
        status: 'sent',
        workspaceId: 'ws-1',
        invoiceNumber: 'INV-002',
        client: { name: 'Test', email: 'test@test.com' },
        workspace: { name: 'Workspace' },
      },
    });

    mockPrisma.payment.update.mockResolvedValue({});

    const result = await processPaymentWebhook('pi_test_456', 'failed');

    expect(result.success).toBe(true);
    expect(mockPrisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay-1' },
      data: { status: 'failed' },
    });
  });
});
