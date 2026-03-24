import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address').min(1, 'Email is required');

/**
 * Password validation schema with requirements
 */
// MEDIUM #41: Special character requirement intentionally omitted here.
// Auth actions (register, reset-password) enforce additional strength checks
// including special characters. This base schema is used for general validation
// where we only require minimum complexity.
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Phone number validation (flexible)
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[\d\s\-+()]*$/, 'Invalid phone number format')
  .refine((val) => !val || /\d/.test(val), 'Phone number must contain at least one digit')
  .optional()
  .or(z.literal(''));

/**
 * URL validation
 */
export const urlSchema = z.string().url('Invalid URL').optional().or(z.literal(''));

/**
 * Slug validation (URL-safe string)
 */
export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(50, 'Slug must be at most 50 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

/**
 * Currency code validation (ISO 4217)
 */
export const currencyCodeSchema = z
  .string()
  .length(3, 'Currency code must be 3 characters')
  .toUpperCase();

/**
 * Positive decimal validation for money amounts.
 * Bug #145: Removed multipleOf(0.01) because 0.01 can't be represented exactly
 * in IEEE 754 floating point, causing valid amounts like 0.1+0.2=0.30000000000000004
 * to fail validation. Using refine with rounding instead.
 */
export const moneySchema = z
  .number()
  .nonnegative('Amount cannot be negative')
  .refine(
    (val) => Math.abs(val - Math.round(val * 100) / 100) < 0.001,
    'Amount must have at most 2 decimal places'
  );

/**
 * Percentage validation (0-100)
 */
export const percentageSchema = z
  .number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100');

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Address schema
 */
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

/**
 * Check if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUuid(uuid: string): boolean {
  return uuidSchema.safeParse(uuid).success;
}
