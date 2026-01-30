import { describe, it, expect } from 'vitest';
import {
  idSchema,
  paginationSchema,
  sortSchema,
  emailSchema,
  phoneSchema,
  urlSchema,
  moneySchema,
  percentageSchema,
  hexColorSchema,
  slugSchema,
  addressSchema,
  partialAddressSchema,
} from '@/lib/validations/common';

describe('idSchema', () => {
  it('accepts valid CUID', () => {
    const result = idSchema.safeParse('clrqm9k3k0000q3wz8k7v4z1w');
    expect(result.success).toBe(true);
  });

  it('rejects empty string', () => {
    const result = idSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejects invalid format', () => {
    const result = idSchema.safeParse('invalid-id');
    expect(result.success).toBe(false);
  });
});

describe('paginationSchema', () => {
  it('accepts valid pagination', () => {
    const result = paginationSchema.safeParse({ page: 1, limit: 20 });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ page: 1, limit: 20 });
  });

  it('provides defaults for missing values', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ page: 1, limit: 20 });
  });

  it('coerces string numbers', () => {
    const result = paginationSchema.safeParse({ page: '2', limit: '50' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ page: 2, limit: 50 });
  });

  it('rejects page less than 1', () => {
    const result = paginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects limit greater than 100', () => {
    const result = paginationSchema.safeParse({ limit: 150 });
    expect(result.success).toBe(false);
  });
});

describe('sortSchema', () => {
  it('accepts valid sort options', () => {
    const result = sortSchema.safeParse({ sortBy: 'createdAt', sortOrder: 'asc' });
    expect(result.success).toBe(true);
  });

  it('defaults sortOrder to desc', () => {
    const result = sortSchema.safeParse({});
    expect(result.success).toBe(true);
    expect(result.data?.sortOrder).toBe('desc');
  });

  it('rejects invalid sortOrder', () => {
    const result = sortSchema.safeParse({ sortOrder: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('accepts valid email', () => {
    const result = emailSchema.safeParse('test@example.com');
    expect(result.success).toBe(true);
  });

  it('accepts email with subdomain', () => {
    const result = emailSchema.safeParse('user@mail.example.com');
    expect(result.success).toBe(true);
  });

  it('accepts email with plus sign', () => {
    const result = emailSchema.safeParse('user+tag@example.com');
    expect(result.success).toBe(true);
  });

  it('rejects empty string', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejects invalid email - no @', () => {
    const result = emailSchema.safeParse('invalid');
    expect(result.success).toBe(false);
  });

  it('rejects invalid email - no domain', () => {
    const result = emailSchema.safeParse('user@');
    expect(result.success).toBe(false);
  });

  it('rejects too long email', () => {
    const result = emailSchema.safeParse('a'.repeat(250) + '@example.com');
    expect(result.success).toBe(false);
  });
});

describe('phoneSchema', () => {
  it('accepts US phone number', () => {
    const result = phoneSchema.safeParse('(555) 123-4567');
    expect(result.success).toBe(true);
  });

  it('accepts international format', () => {
    const result = phoneSchema.safeParse('+1 555-123-4567');
    expect(result.success).toBe(true);
  });

  it('accepts simple number format', () => {
    const result = phoneSchema.safeParse('5551234567');
    expect(result.success).toBe(true);
  });

  it('accepts empty string (optional)', () => {
    const result = phoneSchema.safeParse('');
    expect(result.success).toBe(true);
  });

  it('accepts undefined (optional)', () => {
    const result = phoneSchema.safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it('rejects letters', () => {
    const result = phoneSchema.safeParse('555-CALL-ME');
    expect(result.success).toBe(false);
  });
});

describe('urlSchema', () => {
  it('accepts valid URL with https', () => {
    const result = urlSchema.safeParse('https://example.com');
    expect(result.success).toBe(true);
  });

  it('accepts valid URL with http', () => {
    const result = urlSchema.safeParse('http://example.com');
    expect(result.success).toBe(true);
  });

  it('accepts URL with path', () => {
    const result = urlSchema.safeParse('https://example.com/path/to/page');
    expect(result.success).toBe(true);
  });

  it('accepts empty string (optional)', () => {
    const result = urlSchema.safeParse('');
    expect(result.success).toBe(true);
  });

  it('rejects invalid URL', () => {
    const result = urlSchema.safeParse('not-a-url');
    expect(result.success).toBe(false);
  });
});

describe('moneySchema', () => {
  it('accepts zero', () => {
    const result = moneySchema.safeParse(0);
    expect(result.success).toBe(true);
  });

  it('accepts positive integer', () => {
    const result = moneySchema.safeParse(10000);
    expect(result.success).toBe(true);
  });

  it('rejects negative amount', () => {
    const result = moneySchema.safeParse(-100);
    expect(result.success).toBe(false);
  });

  it('rejects decimal (requires cents)', () => {
    const result = moneySchema.safeParse(99.99);
    expect(result.success).toBe(false);
  });
});

describe('percentageSchema', () => {
  it('accepts 0', () => {
    const result = percentageSchema.safeParse(0);
    expect(result.success).toBe(true);
  });

  it('accepts 100', () => {
    const result = percentageSchema.safeParse(100);
    expect(result.success).toBe(true);
  });

  it('accepts 50.5', () => {
    const result = percentageSchema.safeParse(50.5);
    expect(result.success).toBe(true);
  });

  it('rejects negative', () => {
    const result = percentageSchema.safeParse(-1);
    expect(result.success).toBe(false);
  });

  it('rejects over 100', () => {
    const result = percentageSchema.safeParse(101);
    expect(result.success).toBe(false);
  });
});

describe('hexColorSchema', () => {
  it('accepts valid hex color', () => {
    const result = hexColorSchema.safeParse('#3B82F6');
    expect(result.success).toBe(true);
  });

  it('accepts lowercase hex', () => {
    const result = hexColorSchema.safeParse('#3b82f6');
    expect(result.success).toBe(true);
  });

  it('accepts mixed case hex', () => {
    const result = hexColorSchema.safeParse('#3B82f6');
    expect(result.success).toBe(true);
  });

  it('rejects without hash', () => {
    const result = hexColorSchema.safeParse('3B82F6');
    expect(result.success).toBe(false);
  });

  it('rejects 3-character hex', () => {
    const result = hexColorSchema.safeParse('#F00');
    expect(result.success).toBe(false);
  });

  it('rejects 8-character hex with alpha', () => {
    const result = hexColorSchema.safeParse('#3B82F6FF');
    expect(result.success).toBe(false);
  });

  it('rejects invalid hex characters', () => {
    const result = hexColorSchema.safeParse('#GGGGGG');
    expect(result.success).toBe(false);
  });
});

describe('slugSchema', () => {
  it('accepts simple slug', () => {
    const result = slugSchema.safeParse('my-project');
    expect(result.success).toBe(true);
  });

  it('accepts single word', () => {
    const result = slugSchema.safeParse('project');
    expect(result.success).toBe(true);
  });

  it('accepts multiple hyphens', () => {
    const result = slugSchema.safeParse('my-awesome-project');
    expect(result.success).toBe(true);
  });

  it('accepts numbers', () => {
    const result = slugSchema.safeParse('project-123');
    expect(result.success).toBe(true);
  });

  it('rejects uppercase', () => {
    const result = slugSchema.safeParse('My-Project');
    expect(result.success).toBe(false);
  });

  it('rejects spaces', () => {
    const result = slugSchema.safeParse('my project');
    expect(result.success).toBe(false);
  });

  it('rejects underscores', () => {
    const result = slugSchema.safeParse('my_project');
    expect(result.success).toBe(false);
  });

  it('rejects leading hyphen', () => {
    const result = slugSchema.safeParse('-project');
    expect(result.success).toBe(false);
  });
});

describe('addressSchema', () => {
  it('accepts valid full address', () => {
    const result = addressSchema.safeParse({
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    });
    expect(result.success).toBe(true);
  });

  it('accepts address with only required fields', () => {
    const result = addressSchema.safeParse({
      street: '123 Main St',
      city: 'New York',
      country: 'USA',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing street', () => {
    const result = addressSchema.safeParse({
      city: 'New York',
      country: 'USA',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing city', () => {
    const result = addressSchema.safeParse({
      street: '123 Main St',
      country: 'USA',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing country', () => {
    const result = addressSchema.safeParse({
      street: '123 Main St',
      city: 'New York',
    });
    expect(result.success).toBe(false);
  });
});

describe('partialAddressSchema', () => {
  it('accepts empty object', () => {
    const result = partialAddressSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial address', () => {
    const result = partialAddressSchema.safeParse({
      city: 'New York',
      country: 'USA',
    });
    expect(result.success).toBe(true);
  });

  it('accepts full address', () => {
    const result = partialAddressSchema.safeParse({
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    });
    expect(result.success).toBe(true);
  });
});
