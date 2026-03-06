import { describe, it, expect } from 'vitest';
import {
  quoteStatusSchema,
  quoteBlockTypeSchema,
  lineItemSchema,
  createQuoteSchema,
  sendQuoteSchema,
  acceptQuoteSchema,
  declineQuoteSchema,
  convertToInvoiceSchema,
  duplicateQuoteSchema,
  quoteFilterSchema,
} from '@/lib/validations/quote';

describe('quoteStatusSchema', () => {
  const validStatuses = ['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired', 'converted'];

  it.each(validStatuses)('accepts valid status: %s', (status) => {
    const result = quoteStatusSchema.safeParse(status);
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = quoteStatusSchema.safeParse('invalid');
    expect(result.success).toBe(false);
  });
});

describe('quoteBlockTypeSchema', () => {
  const validTypes = [
    'header',
    'paragraph',
    'line-item',
    'subtotal',
    'tax',
    'discount',
    'total',
    'image',
    'divider',
    'spacer',
    'terms',
    'signature',
  ];

  it.each(validTypes)('accepts valid block type: %s', (type) => {
    const result = quoteBlockTypeSchema.safeParse(type);
    expect(result.success).toBe(true);
  });

  it('rejects invalid block type', () => {
    const result = quoteBlockTypeSchema.safeParse('invalid');
    expect(result.success).toBe(false);
  });
});

describe('lineItemSchema', () => {
  it('accepts valid line item', () => {
    const result = lineItemSchema.safeParse({
      id: 'item-1',
      description: 'Web Development Services',
      quantity: 10,
      rate: 15000, // $150.00 in cents
      unit: 'hour',
      taxable: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal line item', () => {
    const result = lineItemSchema.safeParse({
      id: 'item-1',
      description: 'Service',
      quantity: 1,
      rate: 100,
    });
    expect(result.success).toBe(true);
    expect(result.data?.taxable).toBe(true); // Default
  });

  it('rejects empty description', () => {
    const result = lineItemSchema.safeParse({
      id: 'item-1',
      description: '',
      quantity: 1,
      rate: 100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity', () => {
    const result = lineItemSchema.safeParse({
      id: 'item-1',
      description: 'Service',
      quantity: 0,
      rate: 100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative rate', () => {
    const result = lineItemSchema.safeParse({
      id: 'item-1',
      description: 'Service',
      quantity: 1,
      rate: -100,
    });
    expect(result.success).toBe(false);
  });

  it('rejects description over 500 chars', () => {
    const result = lineItemSchema.safeParse({
      id: 'item-1',
      description: 'x'.repeat(501),
      quantity: 1,
      rate: 100,
    });
    expect(result.success).toBe(false);
  });
});

describe('createQuoteSchema', () => {
  const validQuote = {
    clientId: 'clrqm9k3k0000q3wz8k7v4z1w',
    title: 'Website Redesign Proposal',
    description: 'Complete website redesign with modern UI',
    currency: 'USD',
    notes: 'Thank you for your business',
    terms: 'Payment due within 30 days',
  };

  it('accepts valid quote data', () => {
    const result = createQuoteSchema.safeParse(validQuote);
    expect(result.success).toBe(true);
  });

  it('requires clientId', () => {
    const { clientId, ...withoutClient } = validQuote;
    const result = createQuoteSchema.safeParse(withoutClient);
    expect(result.success).toBe(false);
  });

  it('requires title', () => {
    const { title, ...withoutTitle } = validQuote;
    const result = createQuoteSchema.safeParse(withoutTitle);
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = createQuoteSchema.safeParse({ ...validQuote, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects title over 200 chars', () => {
    const result = createQuoteSchema.safeParse({ ...validQuote, title: 'x'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('defaults currency to USD', () => {
    const { currency, ...withoutCurrency } = validQuote;
    const result = createQuoteSchema.safeParse(withoutCurrency);
    expect(result.success).toBe(true);
    expect(result.data?.currency).toBe('USD');
  });

  it('accepts valid tax rate', () => {
    const result = createQuoteSchema.safeParse({ ...validQuote, taxRate: 8.25 });
    expect(result.success).toBe(true);
  });

  it('accepts valid discount', () => {
    const result = createQuoteSchema.safeParse({
      ...validQuote,
      discountType: 'percentage',
      discountValue: 10,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid discount type', () => {
    const result = createQuoteSchema.safeParse({
      ...validQuote,
      discountType: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('accepts validUntil date', () => {
    const result = createQuoteSchema.safeParse({
      ...validQuote,
      validUntil: '2026-02-15',
    });
    expect(result.success).toBe(true);
  });

  it('accepts line items', () => {
    const result = createQuoteSchema.safeParse({
      ...validQuote,
      lineItems: [
        {
          id: 'item-1',
          description: 'Design work',
          quantity: 20,
          rate: 10000,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe('sendQuoteSchema', () => {
  it('accepts valid send data', () => {
    const result = sendQuoteSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      recipientEmail: 'client@example.com',
      message: 'Please review the attached quote',
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal send data (just id)', () => {
    const result = sendQuoteSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
    });
    expect(result.success).toBe(true);
  });

  it('accepts CC emails', () => {
    const result = sendQuoteSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      ccEmails: ['cc1@example.com', 'cc2@example.com'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects more than 5 CC emails', () => {
    const result = sendQuoteSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      ccEmails: Array(6).fill('cc@example.com'),
    });
    expect(result.success).toBe(false);
  });

  it('rejects message over 2000 chars', () => {
    const result = sendQuoteSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      message: 'x'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe('acceptQuoteSchema', () => {
  it('accepts valid acceptance with signature', () => {
    const result = acceptQuoteSchema.safeParse({
      token: 'abc123def456ghi789jkl012mno345pqr',
      signatureData: 'data:image/png;base64,iVBORw0KGgo=',
      signatureName: 'John Doe',
    });
    expect(result.success).toBe(true);
  });

  it('requires token', () => {
    const result = acceptQuoteSchema.safeParse({
      signatureData: 'data:image/png;base64,iVBORw0KGgo=',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty token', () => {
    const result = acceptQuoteSchema.safeParse({
      token: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts IP address and user agent', () => {
    const result = acceptQuoteSchema.safeParse({
      token: 'abc123def456ghi789jkl012mno345pqr',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    });
    expect(result.success).toBe(true);
  });
});

describe('declineQuoteSchema', () => {
  it('accepts valid decline with reason', () => {
    const result = declineQuoteSchema.safeParse({
      token: 'abc123def456ghi789jkl012mno345pqr',
      reason: 'Budget constraints',
    });
    expect(result.success).toBe(true);
  });

  it('accepts decline without reason', () => {
    const result = declineQuoteSchema.safeParse({
      token: 'abc123def456ghi789jkl012mno345pqr',
    });
    expect(result.success).toBe(true);
  });

  it('rejects reason over 1000 chars', () => {
    const result = declineQuoteSchema.safeParse({
      token: 'abc123def456ghi789jkl012mno345pqr',
      reason: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe('convertToInvoiceSchema', () => {
  it('accepts valid conversion data', () => {
    const result = convertToInvoiceSchema.safeParse({
      quoteId: 'clrqm9k3k0000q3wz8k7v4z1w',
      dueDate: '2026-02-15',
      sendImmediately: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal conversion (just quoteId)', () => {
    const result = convertToInvoiceSchema.safeParse({
      quoteId: 'clrqm9k3k0000q3wz8k7v4z1w',
    });
    expect(result.success).toBe(true);
    expect(result.data?.sendImmediately).toBe(false); // Default
  });

  it('requires quoteId', () => {
    const result = convertToInvoiceSchema.safeParse({
      dueDate: '2026-02-15',
    });
    expect(result.success).toBe(false);
  });
});

describe('duplicateQuoteSchema', () => {
  it('accepts valid duplication with new title', () => {
    const result = duplicateQuoteSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      title: 'New Quote Copy',
      clientId: 'clrqm9k3k0001q3wz8k7v4z1x',
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal duplication (just id)', () => {
    const result = duplicateQuoteSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
    });
    expect(result.success).toBe(true);
  });

  it('rejects title over 200 chars', () => {
    const result = duplicateQuoteSchema.safeParse({
      id: 'clrqm9k3k0000q3wz8k7v4z1w',
      title: 'x'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe('quoteFilterSchema', () => {
  it('accepts valid filter with all options', () => {
    const result = quoteFilterSchema.safeParse({
      page: 1,
      limit: 20,
      status: 'sent',
      clientId: 'clrqm9k3k0000q3wz8k7v4z1w',
      search: 'website',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(result.success).toBe(true);
  });

  it('accepts multiple statuses', () => {
    const result = quoteFilterSchema.safeParse({
      statuses: ['draft', 'sent', 'viewed'],
    });
    expect(result.success).toBe(true);
  });

  it('accepts amount range', () => {
    const result = quoteFilterSchema.safeParse({
      minAmount: 10000,
      maxAmount: 50000,
    });
    expect(result.success).toBe(true);
  });

  it('accepts date range', () => {
    const result = quoteFilterSchema.safeParse({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty filter', () => {
    const result = quoteFilterSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
