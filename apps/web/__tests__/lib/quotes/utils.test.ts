import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateDepositAmount,
  formatQuoteCurrency,
  isQuoteExpired,
} from '@/lib/quotes/utils';

describe('calculateDepositAmount', () => {
  describe('percentage-based deposits', () => {
    it('calculates 30% deposit on $1000 total', () => {
      expect(calculateDepositAmount(1000, 'percentage', 30)).toBe(300);
    });

    it('calculates 50% deposit on $2500 total', () => {
      expect(calculateDepositAmount(2500, 'percentage', 50)).toBe(1250);
    });

    it('calculates 100% deposit (full payment)', () => {
      expect(calculateDepositAmount(1000, 'percentage', 100)).toBe(1000);
    });

    it('calculates 0% deposit', () => {
      expect(calculateDepositAmount(1000, 'percentage', 0)).toBe(0);
    });

    it('rounds to 2 decimal places', () => {
      // 33.33% of 100 = 33.33
      expect(calculateDepositAmount(100, 'percentage', 33.33)).toBe(33.33);
    });

    it('handles decimal amounts correctly', () => {
      // 25% of 99.99
      expect(calculateDepositAmount(99.99, 'percentage', 25)).toBe(25);
    });
  });

  describe('fixed amount deposits', () => {
    it('returns fixed deposit amount when less than total', () => {
      expect(calculateDepositAmount(1000, 'fixed', 500)).toBe(500);
    });

    it('caps deposit at total when fixed amount exceeds total', () => {
      expect(calculateDepositAmount(1000, 'fixed', 1500)).toBe(1000);
    });

    it('returns exact total when fixed amount equals total', () => {
      expect(calculateDepositAmount(1000, 'fixed', 1000)).toBe(1000);
    });

    it('handles zero fixed deposit', () => {
      expect(calculateDepositAmount(1000, 'fixed', 0)).toBe(0);
    });
  });
});

describe('formatQuoteCurrency', () => {
  it('formats USD currency with dollar sign', () => {
    expect(formatQuoteCurrency(1234.56)).toBe('$ 1,234.56');
  });

  it('formats zero amount', () => {
    expect(formatQuoteCurrency(0)).toBe('$ 0.00');
  });

  it('formats negative amounts', () => {
    expect(formatQuoteCurrency(-100)).toBe('-$ 100.00');
  });

  it('formats large amounts with commas', () => {
    expect(formatQuoteCurrency(1000000)).toBe('$ 1,000,000.00');
  });

  it('formats EUR currency', () => {
    const result = formatQuoteCurrency(1234.56, 'EUR');
    expect(result).toContain('1,234.56');
    expect(result).toContain('€');
  });

  it('formats GBP currency', () => {
    const result = formatQuoteCurrency(1234.56, 'GBP');
    expect(result).toContain('1,234.56');
    expect(result).toContain('£');
  });

  it('handles small decimal amounts', () => {
    expect(formatQuoteCurrency(0.01)).toBe('$ 0.01');
  });
});

describe('isQuoteExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns false for null expiration date', () => {
    expect(isQuoteExpired(null)).toBe(false);
  });

  it('returns true for past date', () => {
    expect(isQuoteExpired('2026-01-14')).toBe(true);
  });

  it('returns true for past date (Date object)', () => {
    expect(isQuoteExpired(new Date('2026-01-14'))).toBe(true);
  });

  it('returns false for future date', () => {
    expect(isQuoteExpired('2026-01-20')).toBe(false);
  });

  it('returns false for future date (Date object)', () => {
    expect(isQuoteExpired(new Date('2026-01-20'))).toBe(false);
  });

  it('returns true for today (same day but earlier time)', () => {
    // Current time is 12:00, so earlier today should be expired
    expect(isQuoteExpired(new Date('2026-01-15T11:00:00Z'))).toBe(true);
  });

  it('returns false for later today', () => {
    expect(isQuoteExpired(new Date('2026-01-15T13:00:00Z'))).toBe(false);
  });
});
