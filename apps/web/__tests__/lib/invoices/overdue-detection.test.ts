import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Overdue Invoice Detection Logic (Bug #128 related)
// An invoice is overdue when:
// - It has a due date in the past
// - It is NOT paid
// - It is NOT voided
// - It has a due date (no due date = never overdue)

interface Invoice {
  dueDate: string | null;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'voided';
}

function isOverdue(invoice: Invoice, now: Date = new Date()): boolean {
  // No due date means never overdue
  if (!invoice.dueDate) return false;

  // Paid invoices are never overdue
  if (invoice.status === 'paid') return false;

  // Voided invoices are never overdue
  if (invoice.status === 'voided') return false;

  // Draft invoices are not overdue (not yet sent)
  if (invoice.status === 'draft') return false;

  const dueDate = new Date(invoice.dueDate);
  // Set to end of day for comparison (due ON the date means not overdue until the next day)
  dueDate.setHours(23, 59, 59, 999);

  return now.getTime() > dueDate.getTime();
}

function getDaysOverdue(invoice: Invoice, now: Date = new Date()): number {
  if (!isOverdue(invoice, now)) return 0;
  const dueDate = new Date(invoice.dueDate!);
  const diffMs = now.getTime() - dueDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

describe('Overdue Invoice Detection (Bug #128)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set current time to 2026-03-08 noon
    vi.setSystemTime(new Date('2026-03-08T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('basic overdue detection', () => {
    it('invoice past due date is overdue', () => {
      const invoice: Invoice = {
        dueDate: '2026-03-01',
        status: 'sent',
      };
      expect(isOverdue(invoice)).toBe(true);
    });

    it('invoice with future due date is NOT overdue', () => {
      const invoice: Invoice = {
        dueDate: '2026-03-20',
        status: 'sent',
      };
      expect(isOverdue(invoice)).toBe(false);
    });

    it('invoice on due date is NOT overdue (due until end of day)', () => {
      const invoice: Invoice = {
        dueDate: '2026-03-08',
        status: 'sent',
      };
      expect(isOverdue(invoice)).toBe(false);
    });

    it('invoice one day past due date is overdue', () => {
      const invoice: Invoice = {
        dueDate: '2026-03-07',
        status: 'sent',
      };
      expect(isOverdue(invoice)).toBe(true);
    });
  });

  describe('no due date', () => {
    it('invoice with no due date is never overdue', () => {
      const invoice: Invoice = {
        dueDate: null,
        status: 'sent',
      };
      expect(isOverdue(invoice)).toBe(false);
    });

    it('invoice with null due date and partial status is not overdue', () => {
      const invoice: Invoice = {
        dueDate: null,
        status: 'partial',
      };
      expect(isOverdue(invoice)).toBe(false);
    });
  });

  describe('status-based exemptions', () => {
    it('paid invoice is never overdue even past due date', () => {
      const invoice: Invoice = {
        dueDate: '2026-01-01', // Well past due
        status: 'paid',
      };
      expect(isOverdue(invoice)).toBe(false);
    });

    it('voided invoice is never overdue even past due date', () => {
      const invoice: Invoice = {
        dueDate: '2026-01-01',
        status: 'voided',
      };
      expect(isOverdue(invoice)).toBe(false);
    });

    it('draft invoice is not overdue even past due date', () => {
      const invoice: Invoice = {
        dueDate: '2026-01-01',
        status: 'draft',
      };
      expect(isOverdue(invoice)).toBe(false);
    });
  });

  describe('statuses that CAN be overdue', () => {
    const overdueDate = '2026-03-01';

    it('sent invoice past due is overdue', () => {
      expect(isOverdue({ dueDate: overdueDate, status: 'sent' })).toBe(true);
    });

    it('viewed invoice past due is overdue', () => {
      expect(isOverdue({ dueDate: overdueDate, status: 'viewed' })).toBe(true);
    });

    it('partial invoice past due is overdue', () => {
      expect(isOverdue({ dueDate: overdueDate, status: 'partial' })).toBe(true);
    });

    it('already-overdue invoice past due is overdue', () => {
      expect(isOverdue({ dueDate: overdueDate, status: 'overdue' })).toBe(true);
    });
  });

  describe('days overdue calculation', () => {
    it('returns 0 for non-overdue invoices', () => {
      const invoice: Invoice = {
        dueDate: '2026-03-20',
        status: 'sent',
      };
      expect(getDaysOverdue(invoice)).toBe(0);
    });

    it('calculates days overdue correctly', () => {
      const invoice: Invoice = {
        dueDate: '2026-03-01',
        status: 'sent',
      };
      // March 8 - March 1 = 7 days
      expect(getDaysOverdue(invoice)).toBe(7);
    });

    it('returns 0 for paid invoices even if past due', () => {
      const invoice: Invoice = {
        dueDate: '2026-01-01',
        status: 'paid',
      };
      expect(getDaysOverdue(invoice)).toBe(0);
    });

    it('returns 0 for invoices without due date', () => {
      const invoice: Invoice = {
        dueDate: null,
        status: 'sent',
      };
      expect(getDaysOverdue(invoice)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('invoice due yesterday at end of day is overdue today', () => {
      const invoice: Invoice = {
        dueDate: '2026-03-07',
        status: 'sent',
      };
      expect(isOverdue(invoice)).toBe(true);
    });

    it('handles invoice with far-future due date', () => {
      const invoice: Invoice = {
        dueDate: '2030-12-31',
        status: 'sent',
      };
      expect(isOverdue(invoice)).toBe(false);
    });

    it('handles invoice with very old due date', () => {
      const invoice: Invoice = {
        dueDate: '2020-01-01',
        status: 'sent',
      };
      expect(isOverdue(invoice)).toBe(true);
      expect(getDaysOverdue(invoice)).toBeGreaterThan(365);
    });
  });
});
