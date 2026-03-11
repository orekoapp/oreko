import { describe, it, expect } from 'vitest';

// Refund Calculation Logic (Bug #335)
// Standalone implementation for testing refund processing

interface Payment {
  id: string;
  amount: number;
  refundedAmount: number;
  status: string;
}

interface RefundResult {
  success: boolean;
  error?: string;
  payment?: Payment;
}

function processRefund(payment: Payment, refundAmount: number): RefundResult {
  if (refundAmount <= 0) {
    return { success: false, error: 'Refund amount must be positive' };
  }
  if (payment.status === 'refunded') {
    return { success: false, error: 'Payment already fully refunded' };
  }
  const maxRefundable = payment.amount - payment.refundedAmount;
  if (refundAmount > maxRefundable) {
    return { success: false, error: `Maximum refundable: ${maxRefundable}` };
  }
  const newRefunded = payment.refundedAmount + refundAmount;
  return {
    success: true,
    payment: {
      ...payment,
      refundedAmount: newRefunded,
      status: newRefunded >= payment.amount ? 'refunded' : 'partially_refunded',
    },
  };
}

function calculateAmountDue(invoiceTotal: number, amountPaid: number, totalRefunded: number): number {
  return invoiceTotal - amountPaid + totalRefunded;
}

describe('Refund Calculation Logic (Bug #335)', () => {
  const basePayment: Payment = {
    id: 'pay-1',
    amount: 500,
    refundedAmount: 0,
    status: 'completed',
  };

  it('full refund returns entire amount', () => {
    const result = processRefund(basePayment, 500);
    expect(result.success).toBe(true);
    expect(result.payment!.refundedAmount).toBe(500);
    expect(result.payment!.status).toBe('refunded');
  });

  it('partial refund returns specified amount', () => {
    const result = processRefund(basePayment, 200);
    expect(result.success).toBe(true);
    expect(result.payment!.refundedAmount).toBe(200);
    expect(result.payment!.status).toBe('partially_refunded');
  });

  it('cannot refund more than paid amount', () => {
    const result = processRefund(basePayment, 600);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Maximum refundable: 500');
  });

  it('cannot refund zero', () => {
    const result = processRefund(basePayment, 0);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Refund amount must be positive');
  });

  it('cannot refund negative amount', () => {
    const result = processRefund(basePayment, -50);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Refund amount must be positive');
  });

  it('multiple partial refunds accumulate', () => {
    // First refund of $150
    const result1 = processRefund(basePayment, 150);
    expect(result1.success).toBe(true);
    expect(result1.payment!.refundedAmount).toBe(150);
    expect(result1.payment!.status).toBe('partially_refunded');

    // Second refund of $200 from updated payment
    const result2 = processRefund(result1.payment!, 200);
    expect(result2.success).toBe(true);
    expect(result2.payment!.refundedAmount).toBe(350);
    expect(result2.payment!.status).toBe('partially_refunded');

    // Third refund of remaining $150
    const result3 = processRefund(result2.payment!, 150);
    expect(result3.success).toBe(true);
    expect(result3.payment!.refundedAmount).toBe(500);
    expect(result3.payment!.status).toBe('refunded');
  });

  it('cannot refund already-refunded payment', () => {
    const refundedPayment: Payment = {
      id: 'pay-2',
      amount: 300,
      refundedAmount: 300,
      status: 'refunded',
    };
    const result = processRefund(refundedPayment, 50);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Payment already fully refunded');
  });

  it('cannot exceed remaining refundable after partial refund', () => {
    const partiallyRefunded: Payment = {
      id: 'pay-3',
      amount: 400,
      refundedAmount: 350,
      status: 'partially_refunded',
    };
    const result = processRefund(partiallyRefunded, 100);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Maximum refundable: 50');
  });

  it('refund updates invoice amountDue correctly', () => {
    const invoiceTotal = 1000;
    const amountPaid = 1000;
    const totalRefunded = 0;

    // Before refund
    expect(calculateAmountDue(invoiceTotal, amountPaid, totalRefunded)).toBe(0);

    // After $300 refund
    expect(calculateAmountDue(invoiceTotal, amountPaid, 300)).toBe(300);

    // After full refund
    expect(calculateAmountDue(invoiceTotal, amountPaid, 1000)).toBe(1000);
  });

  it('handles penny-precise refund amounts', () => {
    const precisePayment: Payment = {
      id: 'pay-4',
      amount: 99.99,
      refundedAmount: 0,
      status: 'completed',
    };
    const result = processRefund(precisePayment, 33.33);
    expect(result.success).toBe(true);
    expect(result.payment!.refundedAmount).toBe(33.33);
    expect(result.payment!.status).toBe('partially_refunded');
  });

  it('exact remaining amount triggers full refund status', () => {
    const partialPayment: Payment = {
      id: 'pay-5',
      amount: 250,
      refundedAmount: 100,
      status: 'partially_refunded',
    };
    const result = processRefund(partialPayment, 150);
    expect(result.success).toBe(true);
    expect(result.payment!.refundedAmount).toBe(250);
    expect(result.payment!.status).toBe('refunded');
  });

  it('preserves payment id through refund', () => {
    const result = processRefund(basePayment, 100);
    expect(result.success).toBe(true);
    expect(result.payment!.id).toBe('pay-1');
    expect(result.payment!.amount).toBe(500);
  });
});
