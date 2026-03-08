import { describe, it, expect } from 'vitest';

// Partial Payment Calculation Logic (Bug #332)
// Database stores amounts in DOLLARS (not cents).
// Tests verify partial payment accumulation and status transitions.

interface Invoice {
  total: number;
  amountPaid: number;
  amountDue: number;
  status: 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue';
}

interface PaymentResult {
  success: boolean;
  invoice: Invoice;
  error?: string;
}

function applyPayment(invoice: Invoice, paymentAmount: number): PaymentResult {
  // Reject zero or negative payments
  if (paymentAmount <= 0) {
    return { success: false, invoice, error: 'Payment amount must be positive' };
  }

  // Cap overpayment at amount due
  const effectivePayment = Math.min(paymentAmount, invoice.amountDue);

  const newAmountPaid = Math.round((invoice.amountPaid + effectivePayment) * 100) / 100;
  const newAmountDue = Math.round((invoice.total - newAmountPaid) * 100) / 100;

  let newStatus: Invoice['status'];
  if (newAmountDue <= 0) {
    newStatus = 'paid';
  } else if (newAmountPaid > 0) {
    newStatus = 'partial';
  } else {
    newStatus = invoice.status;
  }

  return {
    success: true,
    invoice: {
      total: invoice.total,
      amountPaid: newAmountPaid,
      amountDue: newAmountDue,
      status: newStatus,
    },
  };
}

function createInvoice(total: number): Invoice {
  return {
    total,
    amountPaid: 0,
    amountDue: total,
    status: 'sent',
  };
}

describe('Partial Payment Calculations (Bug #332)', () => {
  describe('single partial payment', () => {
    it('updates amountPaid and amountDue correctly', () => {
      const invoice = createInvoice(1000);
      const result = applyPayment(invoice, 300);

      expect(result.success).toBe(true);
      expect(result.invoice.amountPaid).toBe(300);
      expect(result.invoice.amountDue).toBe(700);
      expect(result.invoice.status).toBe('partial');
    });

    it('marks invoice as partial after first payment', () => {
      const invoice = createInvoice(500);
      const result = applyPayment(invoice, 100);

      expect(result.success).toBe(true);
      expect(result.invoice.status).toBe('partial');
    });
  });

  describe('multiple partial payments', () => {
    it('accumulates payments correctly over multiple transactions', () => {
      let invoice = createInvoice(1000);

      const result1 = applyPayment(invoice, 200);
      expect(result1.success).toBe(true);
      invoice = result1.invoice;
      expect(invoice.amountPaid).toBe(200);
      expect(invoice.amountDue).toBe(800);

      const result2 = applyPayment(invoice, 300);
      expect(result2.success).toBe(true);
      invoice = result2.invoice;
      expect(invoice.amountPaid).toBe(500);
      expect(invoice.amountDue).toBe(500);

      const result3 = applyPayment(invoice, 500);
      expect(result3.success).toBe(true);
      invoice = result3.invoice;
      expect(invoice.amountPaid).toBe(1000);
      expect(invoice.amountDue).toBe(0);
      expect(invoice.status).toBe('paid');
    });

    it('handles small incremental payments', () => {
      let invoice = createInvoice(100);

      for (let i = 0; i < 10; i++) {
        const result = applyPayment(invoice, 10);
        expect(result.success).toBe(true);
        invoice = result.invoice;
      }

      expect(invoice.amountPaid).toBe(100);
      expect(invoice.amountDue).toBe(0);
      expect(invoice.status).toBe('paid');
    });
  });

  describe('full payment', () => {
    it('marks invoice as paid when full amount is received', () => {
      const invoice = createInvoice(500);
      const result = applyPayment(invoice, 500);

      expect(result.success).toBe(true);
      expect(result.invoice.amountPaid).toBe(500);
      expect(result.invoice.amountDue).toBe(0);
      expect(result.invoice.status).toBe('paid');
    });

    it('final partial payment completes the invoice', () => {
      let invoice = createInvoice(250);
      invoice = applyPayment(invoice, 100).invoice;
      expect(invoice.status).toBe('partial');

      const result = applyPayment(invoice, 150);
      expect(result.success).toBe(true);
      expect(result.invoice.status).toBe('paid');
      expect(result.invoice.amountDue).toBe(0);
    });
  });

  describe('overpayment handling', () => {
    it('caps payment at amount due (no overpayment)', () => {
      const invoice = createInvoice(200);
      const result = applyPayment(invoice, 500);

      expect(result.success).toBe(true);
      expect(result.invoice.amountPaid).toBe(200);
      expect(result.invoice.amountDue).toBe(0);
      expect(result.invoice.status).toBe('paid');
    });

    it('caps partial overpayment at remaining balance', () => {
      let invoice = createInvoice(300);
      invoice = applyPayment(invoice, 200).invoice;

      const result = applyPayment(invoice, 500);
      expect(result.success).toBe(true);
      expect(result.invoice.amountPaid).toBe(300);
      expect(result.invoice.amountDue).toBe(0);
    });
  });

  describe('invalid payments', () => {
    it('rejects zero payment', () => {
      const invoice = createInvoice(100);
      const result = applyPayment(invoice, 0);

      expect(result.success).toBe(false);
      expect(result.error).toContain('positive');
    });

    it('rejects negative payment', () => {
      const invoice = createInvoice(100);
      const result = applyPayment(invoice, -50);

      expect(result.success).toBe(false);
      expect(result.error).toContain('positive');
    });
  });

  describe('decimal precision', () => {
    it('handles fractional dollar amounts correctly', () => {
      const invoice = createInvoice(99.99);
      const result = applyPayment(invoice, 33.33);

      expect(result.success).toBe(true);
      expect(result.invoice.amountPaid).toBe(33.33);
      expect(result.invoice.amountDue).toBe(66.66);
    });

    it('avoids floating point rounding issues', () => {
      let invoice = createInvoice(10);

      // 3 payments of 3.33 then a final payment to close out
      invoice = applyPayment(invoice, 3.33).invoice;
      invoice = applyPayment(invoice, 3.33).invoice;
      invoice = applyPayment(invoice, 3.34).invoice;

      expect(invoice.amountPaid).toBe(10);
      expect(invoice.amountDue).toBe(0);
      expect(invoice.status).toBe('paid');
    });
  });
});
