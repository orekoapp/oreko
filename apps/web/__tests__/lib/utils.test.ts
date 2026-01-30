import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercentage,
  slugify,
  truncate,
  generateInitials,
  isValidEmail,
  capitalizeFirst,
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

  it('formats with custom format', () => {
    const date = new Date('2024-01-15');
    expect(formatDate(date, 'yyyy-MM-dd')).toBe('2024-01-15');
  });
});

describe('formatNumber', () => {
  it('formats large numbers with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('handles decimals', () => {
    expect(formatNumber(1234.567, { maximumFractionDigits: 2 })).toBe('1,234.57');
  });
});

describe('formatPercentage', () => {
  it('formats percentage with default decimals', () => {
    expect(formatPercentage(75)).toBe('75%');
  });

  it('formats percentage with decimals', () => {
    expect(formatPercentage(75.567, 2)).toBe('75.57%');
  });
});

describe('slugify', () => {
  it('converts text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world');
  });

  it('handles multiple spaces and dashes', () => {
    expect(slugify('Hello   World--Test')).toBe('hello-world-test');
  });

  it('trims leading and trailing dashes', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world');
  });
});

describe('truncate', () => {
  it('returns original text if shorter than max', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('truncates long text with ellipsis', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('generateInitials', () => {
  it('generates initials from full name', () => {
    expect(generateInitials('John Doe')).toBe('JD');
  });

  it('handles single name', () => {
    expect(generateInitials('John')).toBe('J');
  });

  it('handles multiple names', () => {
    expect(generateInitials('John Michael Doe')).toBe('JM');
  });

  it('handles lowercase names', () => {
    expect(generateInitials('john doe')).toBe('JD');
  });
});

describe('isValidEmail', () => {
  it('validates correct email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('validates email with subdomain', () => {
    expect(isValidEmail('test@mail.example.com')).toBe(true);
  });

  it('rejects invalid email - no @', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });

  it('rejects invalid email - no domain', () => {
    expect(isValidEmail('test@')).toBe(false);
  });

  it('rejects invalid email - spaces', () => {
    expect(isValidEmail('test @example.com')).toBe(false);
  });
});

describe('capitalizeFirst', () => {
  it('capitalizes first letter', () => {
    expect(capitalizeFirst('hello')).toBe('Hello');
  });

  it('handles uppercase input', () => {
    expect(capitalizeFirst('HELLO')).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(capitalizeFirst('')).toBe('');
  });

  it('handles single character', () => {
    expect(capitalizeFirst('a')).toBe('A');
  });
});
