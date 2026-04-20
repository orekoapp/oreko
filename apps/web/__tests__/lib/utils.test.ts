import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getBaseUrl,
  toNumber,
} from '@/lib/utils';

describe('cn (class name merger)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

describe('formatCurrency', () => {
  it('formats USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$ 1,234.56');
  });

  it('formats EUR currency', () => {
    const result = formatCurrency(1234.56, 'EUR', 'de-DE');
    expect(result).toContain('1.234,56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$ 0.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-100)).toBe('-$ 100.00');
  });
});

describe('formatDate', () => {
  it('formats date with default format', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2024');
  });

  it('formats date string', () => {
    expect(formatDate('2024-06-20')).toBe('Jun 20, 2024');
  });

  it('formats with custom options', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' })).toBe('01/15/2024');
  });
});

describe('formatRelativeTime', () => {
  it('returns hours for recent timestamps', () => {
    const date = new Date();
    date.setHours(date.getHours() - 2);

    const result = formatRelativeTime(date);

    expect(result).toContain('hour');
  });

  it('returns days for older timestamps', () => {
    const date = new Date();
    date.setDate(date.getDate() - 3);

    const result = formatRelativeTime(date);

    expect(result).toContain('day');
  });
});

describe('toNumber', () => {
  it('returns numbers unchanged', () => {
    expect(toNumber(12.5)).toBe(12.5);
  });

  it('converts Decimal-like objects with toString', () => {
    expect(toNumber({ toString: () => '42.75' })).toBe(42.75);
  });

  it('falls back to zero for nullish values', () => {
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
  });
});

describe('getBaseUrl', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('prefers NEXT_PUBLIC_APP_URL when set', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com';

    expect(getBaseUrl()).toBe('https://app.example.com');
  });

  it('falls back to VERCEL_URL when app url is missing', () => {
    process.env.VERCEL_URL = 'preview.example.com';

    expect(getBaseUrl()).toBe('https://preview.example.com');
  });

  it('returns localhost during local development', () => {
    expect(getBaseUrl()).toBe('http://localhost:3000');
  });
});
