import { z } from 'zod';

// Common ID schema — Prisma uses @default(uuid()) for all IDs
export const idSchema = z.string().uuid();

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Sort schema
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search schema
export const searchSchema = z.object({
  search: z.string().optional(),
});

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Combined list query schema
export const listQuerySchema = paginationSchema
  .merge(sortSchema)
  .merge(searchSchema)
  .merge(dateRangeSchema);

// Low #92: min(1) first so empty string shows "Email is required" not "invalid email"
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

// Phone schema (flexible international format, requires at least 7 digits)
// Low #93: Restructured so empty string resolves before regex validation fires
export const phoneSchema = z.union([
  z.literal(''),
  z.string()
    .regex(
      /^\+?[\d\s\-().]{7,25}$/,
      'Please enter a valid phone number (at least 7 digits)'
    )
    .refine(
      (val) => (val.match(/\d/g) || []).length >= 7,
      'Phone number must contain at least 7 digits'
    ),
]).optional();

// URL schema - accepts full URLs or plain domains (auto-prepends https://)
export const urlSchema = z
  .string()
  .transform((val) => {
    if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
      return `https://${val}`;
    }
    return val;
  })
  .pipe(z.string().url('Please enter a valid URL'))
  .optional()
  .or(z.literal(''));

// Money/currency amount schema — single source of truth for all monetary validation
// Note: packages/utils/src/validation.ts has a stricter version with decimal precision check.
// This version is used in forms where intermediate values may not have exact 2dp precision.
export const moneySchema = z
  .number()
  .min(0, 'Amount cannot be negative')
  .max(999999999, 'Amount exceeds maximum allowed ($999,999,999)');

// Percentage schema (0-100)
export const percentageSchema = z
  .number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100');

// Color hex schema
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Please enter a valid hex color (e.g., #3B82F6)');

// Slug schema
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only');

// Address schema (strict — all required, used when address is mandatory)
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().min(1, 'Country is required').max(100),
});

// Partial address (all optional, allows empty strings — used for client form)
export const partialAddressSchema = z.object({
  street: z.string().max(200).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
});

// File upload schema
export const fileUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.string().min(1),
  size: z.number().int().positive(),
  url: z.string().url(),
});

// Token schema (for public access tokens) — DB column allows up to 100 chars
export const tokenSchema = z.string().min(32).max(100);

// Status enum helpers
export function createStatusSchema<T extends string>(statuses: readonly T[]) {
  return z.enum(statuses as [T, ...T[]]);
}

// Date helpers
export const futureDateSchema = z.coerce.date().refine(
  (date) => date > new Date(),
  'Date must be in the future'
);

export const pastDateSchema = z.coerce.date().refine(
  (date) => date < new Date(),
  'Date must be in the past'
);

// Type exports
export type Pagination = z.infer<typeof paginationSchema>;
export type Sort = z.infer<typeof sortSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
export type Address = z.infer<typeof addressSchema>;
export type PartialAddress = z.infer<typeof partialAddressSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
