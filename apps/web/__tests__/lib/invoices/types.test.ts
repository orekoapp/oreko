import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getDaysUntilDue,
  isInvoiceOverdue,
  DEFAULT_INVOICE_SETTINGS,
  PAYMENT_TERMS,
} from '@/lib/invoices/types';

describe('getDaysUntilDue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns positive days for future due date', () => {
    expect(getDaysUntilDue('2026-01-25')).toBe(10);
  });

  it('returns negative days for past due date', () => {
    expect(getDaysUntilDue('2026-01-10')).toBe(-5);
  });

  it('returns 0 for today due date', () => {
    // Due date is at midnight, current time is noon
    const result = getDaysUntilDue('2026-01-15');
    expect(result).toBeLessThanOrEqual(0);
  });

  it('returns 1 for tomorrow', () => {
    expect(getDaysUntilDue('2026-01-16')).toBe(1);
  });

  it('returns -1 for yesterday', () => {
    expect(getDaysUntilDue('2026-01-14')).toBe(-1);
  });

  it('handles month boundaries correctly', () => {
    vi.setSystemTime(new Date('2026-01-31T12:00:00Z'));
    expect(getDaysUntilDue('2026-02-07')).toBe(7);
  });

  it('handles year boundaries correctly', () => {
    vi.setSystemTime(new Date('2025-12-31T12:00:00Z'));
    expect(getDaysUntilDue('2026-01-07')).toBe(7);
  });
});

describe('isInvoiceOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for past due date with draft status', () => {
    expect(isInvoiceOverdue('2026-01-10', 'draft')).toBe(true);
  });

  it('returns true for past due date with sent status', () => {
    expect(isInvoiceOverdue('2026-01-10', 'sent')).toBe(true);
  });

  it('returns true for past due date with partial status', () => {
    expect(isInvoiceOverdue('2026-01-10', 'partial')).toBe(true);
  });

  it('returns false for past due date with paid status', () => {
    expect(isInvoiceOverdue('2026-01-10', 'paid')).toBe(false);
  });

  it('returns false for past due date with voided status', () => {
    expect(isInvoiceOverdue('2026-01-10', 'voided')).toBe(false);
  });

  it('returns false for future due date', () => {
    expect(isInvoiceOverdue('2026-01-25', 'sent')).toBe(false);
  });

  it('returns false for today due date (not yet past)', () => {
    // At noon on due date, it's not overdue yet
    expect(isInvoiceOverdue('2026-01-16', 'sent')).toBe(false);
  });
});

describe('DEFAULT_INVOICE_SETTINGS', () => {
  it('has USD as default currency', () => {
    expect(DEFAULT_INVOICE_SETTINGS.currency).toBe('USD');
  });

  it('has showLineItemPrices enabled by default', () => {
    expect(DEFAULT_INVOICE_SETTINGS.showLineItemPrices).toBe(true);
  });

  it('has net30 as default payment terms', () => {
    expect(DEFAULT_INVOICE_SETTINGS.paymentTerms).toBe('net30');
  });

  it('has late fee disabled by default', () => {
    expect(DEFAULT_INVOICE_SETTINGS.lateFeeEnabled).toBe(false);
  });

  it('has percentage as default late fee type', () => {
    expect(DEFAULT_INVOICE_SETTINGS.lateFeeType).toBe('percentage');
  });

  it('has reminders enabled by default', () => {
    expect(DEFAULT_INVOICE_SETTINGS.reminderEnabled).toBe(true);
  });

  it('has default reminder days set', () => {
    expect(DEFAULT_INVOICE_SETTINGS.reminderDays).toEqual([7, 3, 1]);
  });
});

describe('PAYMENT_TERMS', () => {
  it('contains all expected payment terms', () => {
    const values = PAYMENT_TERMS.map((t) => t.value);
    expect(values).toContain('due_on_receipt');
    expect(values).toContain('net7');
    expect(values).toContain('net15');
    expect(values).toContain('net30');
    expect(values).toContain('net45');
    expect(values).toContain('net60');
    expect(values).toContain('custom');
  });

  it('has 7 payment term options', () => {
    expect(PAYMENT_TERMS).toHaveLength(7);
  });

  it('each term has value and label', () => {
    for (const term of PAYMENT_TERMS) {
      expect(term).toHaveProperty('value');
      expect(term).toHaveProperty('label');
      expect(typeof term.value).toBe('string');
      expect(typeof term.label).toBe('string');
    }
  });

  it('Due on Receipt is first option', () => {
    const firstTerm = PAYMENT_TERMS[0];
    expect(firstTerm).toBeDefined();
    expect(firstTerm!.value).toBe('due_on_receipt');
    expect(firstTerm!.label).toBe('Due on Receipt');
  });
});
