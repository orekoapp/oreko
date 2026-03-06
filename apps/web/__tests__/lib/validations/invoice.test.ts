import { describe, it, expect } from 'vitest';
import {
  invoiceStatusSchema,
  paymentMethodSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  invoiceFilterSchema,
  sendInvoiceSchema,
  recordPaymentSchema,
  refundPaymentSchema,
  markAsPaidSchema,
  cancelInvoiceSchema,
  duplicateInvoiceSchema,
} from '@/lib/validations/invoice';

describe('invoiceStatusSchema', () => {
  const validStatuses = [
    'draft',
    'sent',
    'viewed',
    'paid',
    'partial',
    'overdue',
    'voided',
  ];

  it.each(validStatuses)('accepts valid status: %s', (status) => {
    const result = invoiceStatusSchema.safeParse(status);
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = invoiceStatusSchema.safeParse('invalid');
    expect(result.success).toBe(false);
  });
});

describe('paymentMethodSchema', () => {
  const validMethods = ['card', 'bank_transfer', 'check', 'cash', 'other'];

  it.each(validMethods)('accepts valid method: %s', (method) => {
    const result = paymentMethodSchema.safeParse(method);
    expect(result.success).toBe(true);
  });

  it('rejects invalid method', () => {
    const result = paymentMethodSchema.safeParse('crypto');
    expect(result.success).toBe(false);
  });
});

describe('createInvoiceSchema', () => {
  const validInvoice = {
    clientId: 'clrqm9k3k0000q3wz8k7v4z1w',
    title: 'Invoice for Web Development',
    dueDate: '2026-02-15',
    currency: 'USD',
    lineItems: [
      {
        id: 'item-1',
        description: 'Web Development Services',
        quantity: 20,
        rate: 15000,
      },
    ],
  };

  it('accepts valid invoice data', () => {
    const result = createInvoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
  });

  it('requires clientId', () => {
    const { clientId, ...withoutClient } = validInvoice;
    const result = createInvoiceSchema.safeParse(withoutClient);
    expect(result.success).toBe(false);
  });

  it('requires title', () => {
    const { title, ...withoutTitle } = validInvoice;
    const result = createInvoiceSchema.safeParse(withoutTitle);
    expect(result.success).toBe(false);
  });

  it('requires dueDate', () => {
    const { dueDate, ...withoutDueDate } = validInvoice;
    const result = createInvoiceSchema.safeParse(withoutDueDate);
    expect(result.success).toBe(false);
  });

  it('requires at least one line item', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      lineItems: [],
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional quoteId (for conversion)', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      quoteId: 'clrqm9k3k0001q3wz8k7v4z1x',
    });
    expect(result.success).toBe(true);
  });

  it('accepts tax rate', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      taxRate: 8.25,
    });
    expect(result.success).toBe(true);
  });

  it('accepts discount', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      discountType: 'fixed',
      discountValue: 5000,
    });
    expect(result.success).toBe(true);
  });

  it('accepts partial payments option', () => {
    const result = createInvoiceSchema.safeParse({
      ...validInvoice,
      allowPartialPayments: true,
      minimumPayment: 10000,
    });
    expect(result.success).toBe(true);
    expect(result.data?.allowPartialPayments).toBe(true);
  });

  it('defaults allowPartialPayments to false', () => {
    const result = createInvoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
    expect(result.data?.allowPartialPayments).toBe(false);
  });

  it('defaults currency to USD', () => {
    const { currency, ...withoutCurrency } = validInvoice;
    const result = createInvoiceSchema.safeParse(withoutCurrency);
    expect(result.success).toBe(true);
    expect(result.data?.currency).toBe('USD');
  });
});

describe('updateInvoiceSchema', () => {
  it('requires id', () => {
    const result = updateInvoiceSchema.safeParse({
      title: 'Updated Title',
    });
    expect(result.success).toBe(false);
  });

  it('accepts partial update', () => {
    const result = updateInvoiceSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      title: 'Updated Title',
    });
    expect(result.success).toBe(true);
  });

  it('allows updating line items', () => {
    const result = updateInvoiceSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      lineItems: [
        { id: '1', description: 'New item', quantity: 1, rate: 1000 },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe('invoiceFilterSchema', () => {
  it('accepts valid filter with all options', () => {
    const result = invoiceFilterSchema.safeParse({
      page: 1,
      limit: 20,
      status: 'sent',
      clientId: 'clrqm9k3k0000q3wz8k7v4z1w',
      quoteId: 'clrqm9k3k0001q3wz8k7v4z1x',
      minAmount: 10000,
      maxAmount: 50000,
      overdue: true,
      dueBefore: '2026-02-28',
      dueAfter: '2026-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('accepts multiple statuses', () => {
    const result = invoiceFilterSchema.safeParse({
      statuses: ['draft', 'sent', 'overdue'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty filter', () => {
    const result = invoiceFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('coerces overdue boolean', () => {
    const result = invoiceFilterSchema.safeParse({
      overdue: 'true',
    });
    expect(result.success).toBe(true);
    expect(result.data?.overdue).toBe(true);
  });
});

describe('sendInvoiceSchema', () => {
  it('accepts valid send data', () => {
    const result = sendInvoiceSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      recipientEmail: 'client@example.com',
      message: 'Please find your invoice attached',
      ccEmails: ['cc@example.com'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal send data', () => {
    const result = sendInvoiceSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
    });
    expect(result.success).toBe(true);
  });

  it('rejects more than 5 CC emails', () => {
    const result = sendInvoiceSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      ccEmails: Array(6).fill('cc@example.com'),
    });
    expect(result.success).toBe(false);
  });
});

describe('recordPaymentSchema', () => {
  it('accepts valid payment', () => {
    const result = recordPaymentSchema.safeParse({
      invoiceId: 'clrqm9k3k0000q3wz8k7v4z1w',
      amount: 50000,
      method: 'bank_transfer',
      transactionId: 'TXN-123456',
      notes: 'Wire transfer received',
    });
    expect(result.success).toBe(true);
  });

  it('requires invoiceId', () => {
    const result = recordPaymentSchema.safeParse({
      amount: 50000,
      method: 'cash',
    });
    expect(result.success).toBe(false);
  });

  it('requires amount greater than 0', () => {
    const result = recordPaymentSchema.safeParse({
      invoiceId: 'clrqm9k3k0000q3wz8k7v4z1w',
      amount: 0,
      method: 'cash',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = recordPaymentSchema.safeParse({
      invoiceId: 'clrqm9k3k0000q3wz8k7v4z1w',
      amount: -100,
      method: 'cash',
    });
    expect(result.success).toBe(false);
  });

  it('sets default paidAt to now', () => {
    const result = recordPaymentSchema.safeParse({
      invoiceId: 'clrqm9k3k0000q3wz8k7v4z1w',
      amount: 1000,
      method: 'cash',
    });
    expect(result.success).toBe(true);
    expect(result.data?.paidAt).toBeInstanceOf(Date);
  });
});

describe('refundPaymentSchema', () => {
  it('accepts full refund (no amount)', () => {
    const result = refundPaymentSchema.safeParse({
      paymentId: 'clrqm9k3k0000q3wz8k7v4z1w',
      reason: 'Customer request',
    });
    expect(result.success).toBe(true);
  });

  it('accepts partial refund', () => {
    const result = refundPaymentSchema.safeParse({
      paymentId: 'clrqm9k3k0000q3wz8k7v4z1w',
      amount: 5000,
    });
    expect(result.success).toBe(true);
  });

  it('requires paymentId', () => {
    const result = refundPaymentSchema.safeParse({
      amount: 5000,
    });
    expect(result.success).toBe(false);
  });

  it('rejects reason over 500 chars', () => {
    const result = refundPaymentSchema.safeParse({
      paymentId: 'clrqm9k3k0000q3wz8k7v4z1w',
      reason: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('markAsPaidSchema', () => {
  it('accepts valid mark as paid', () => {
    const result = markAsPaidSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      method: 'cash',
      notes: 'Cash payment received in office',
    });
    expect(result.success).toBe(true);
  });

  it('defaults method to other', () => {
    const result = markAsPaidSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
    });
    expect(result.success).toBe(true);
    expect(result.data?.method).toBe('other');
  });

  it('rejects notes over 500 chars', () => {
    const result = markAsPaidSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      notes: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('cancelInvoiceSchema', () => {
  it('accepts valid cancellation', () => {
    const result = cancelInvoiceSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      reason: 'Client requested cancellation',
    });
    expect(result.success).toBe(true);
  });

  it('accepts cancellation without reason', () => {
    const result = cancelInvoiceSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
    });
    expect(result.success).toBe(true);
  });

  it('requires id', () => {
    const result = cancelInvoiceSchema.safeParse({
      reason: 'Some reason',
    });
    expect(result.success).toBe(false);
  });
});

describe('duplicateInvoiceSchema', () => {
  it('accepts valid duplication', () => {
    const result = duplicateInvoiceSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      title: 'Copy of Invoice',
      clientId: 'clrqm9k3k0001q3wz8k7v4z1x',
      dueDate: '2026-03-15',
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal duplication', () => {
    const result = duplicateInvoiceSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
    });
    expect(result.success).toBe(true);
  });
});
