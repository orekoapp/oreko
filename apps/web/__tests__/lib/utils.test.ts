import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeTime,
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
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats EUR currency', () => {
    const result = formatCurrency(1234.56, 'EUR', 'de-DE');
    expect(result).toContain('1.234,56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-100)).toBe('-$100.00');
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
  it('returns a string', () => {
    const date = new Date();
    date.setHours(date.getHours() - 2);
    const result = formatRelativeTime(date);
    expect(typeof result).toBe('string');
    expect(result).toContain('hour');
  });
});
