import { z } from 'zod';
import { idSchema, moneySchema, listQuerySchema } from './common';

// Rate card item type enum — aligned with types and Prisma schema
export const rateCardItemTypeSchema = z.enum([
  'hourly',
  'daily',
  'fixed',
  'package',
  'service',
  'product',
  'recurring',
]);

// Rate card category schema
export const rateCardCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0).default(0),
});

// Rate card item schema
export const rateCardItemSchema = z.object({
  id: z.string().optional(), // Optional for new items
  name: z
    .string()
    .min(1, 'Item name is required')
    .max(200, 'Name must be less than 200 characters'),
  description: z.string().max(2000).optional(),
  type: rateCardItemTypeSchema.default('service'),
  rate: moneySchema,
  unit: z.string().max(20).default('each'),
  taxable: z.boolean().default(true),
  categoryId: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isActive: z.boolean().default(true),
});

// Create rate card schema
export const createRateCardSchema = z.object({
  name: z
    .string()
    .min(1, 'Rate card name is required')
    .max(200, 'Name must be less than 200 characters'),
  description: z.string().max(2000).optional(),
  currency: z.string().length(3).default('USD'),
  isDefault: z.boolean().default(false),
  categories: z.array(rateCardCategorySchema).optional(),
  items: z.array(rateCardItemSchema).optional(),
});

// Update rate card schema
export const updateRateCardSchema = createRateCardSchema.partial().extend({
  id: idSchema,
});

// Rate card filter schema
export const rateCardFilterSchema = listQuerySchema.extend({
  isDefault: z.coerce.boolean().optional(),
  hasItems: z.coerce.boolean().optional(),
});

// Add item to rate card schema
export const addRateCardItemSchema = z.object({
  rateCardId: idSchema,
  item: rateCardItemSchema,
});

// Update rate card item schema
export const updateRateCardItemSchema = rateCardItemSchema.partial().extend({
  id: idSchema,
  rateCardId: idSchema,
});

// Delete rate card item schema
export const deleteRateCardItemSchema = z.object({
  id: idSchema,
  rateCardId: idSchema,
});

// Bulk add items schema
export const bulkAddRateCardItemsSchema = z.object({
  rateCardId: idSchema,
  items: z.array(rateCardItemSchema).min(1).max(100),
});

// Import rate card items schema (for CSV import)
export const rateCardItemImportRowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: rateCardItemTypeSchema.optional(),
  rate: z.coerce.number().min(0),
  unit: z.string().optional(),
  taxable: z.coerce.boolean().optional(),
  category: z.string().optional(),
});

export const importRateCardItemsSchema = z.object({
  rateCardId: idSchema,
  items: z.array(rateCardItemImportRowSchema).min(1).max(500),
  skipDuplicates: z.boolean().default(true),
});

// Duplicate rate card schema
export const duplicateRateCardSchema = z.object({
  id: idSchema,
  name: z.string().max(200).optional(),
});

// Type exports
export type RateCardItemType = z.infer<typeof rateCardItemTypeSchema>;
export type RateCardCategory = z.infer<typeof rateCardCategorySchema>;
export type RateCardItem = z.infer<typeof rateCardItemSchema>;
export type CreateRateCardInput = z.infer<typeof createRateCardSchema>;
export type UpdateRateCardInput = z.infer<typeof updateRateCardSchema>;
export type RateCardFilter = z.infer<typeof rateCardFilterSchema>;
export type AddRateCardItemInput = z.infer<typeof addRateCardItemSchema>;
export type UpdateRateCardItemInput = z.infer<typeof updateRateCardItemSchema>;
export type DeleteRateCardItemInput = z.infer<typeof deleteRateCardItemSchema>;
export type BulkAddRateCardItemsInput = z.infer<typeof bulkAddRateCardItemsSchema>;
export type RateCardItemImportRow = z.infer<typeof rateCardItemImportRowSchema>;
export type ImportRateCardItemsInput = z.infer<typeof importRateCardItemsSchema>;
export type DuplicateRateCardInput = z.infer<typeof duplicateRateCardSchema>;
