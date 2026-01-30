import { z } from 'zod';
import { idSchema, moneySchema, percentageSchema, listQuerySchema } from './common';

// Quote status enum
export const quoteStatusSchema = z.enum([
  'draft',
  'sent',
  'viewed',
  'accepted',
  'declined',
  'expired',
  'converted',
]);

// Quote block types
export const quoteBlockTypeSchema = z.enum([
  'heading',
  'paragraph',
  'line-item',
  'subtotal',
  'tax',
  'discount',
  'total',
  'image',
  'divider',
  'spacer',
  'terms',
  'signature',
]);

// Line item schema
export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: moneySchema,
  unit: z.string().max(20).optional(),
  taxable: z.boolean().default(true),
});

// Quote block schema
export const quoteBlockSchema = z.object({
  id: z.string(),
  type: quoteBlockTypeSchema,
  content: z.record(z.unknown()).optional(),
  order: z.number().int().min(0),
});

// Create quote schema
export const createQuoteSchema = z.object({
  clientId: idSchema,
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000).optional(),
  validUntil: z.coerce.date().optional(),
  currency: z.string().length(3).default('USD'),
  taxRate: percentageSchema.optional(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().min(0).optional(),
  notes: z.string().max(5000).optional(),
  terms: z.string().max(10000).optional(),
  blocks: z.array(quoteBlockSchema).optional(),
  lineItems: z.array(lineItemSchema).optional(),
});

// Update quote schema
export const updateQuoteSchema = createQuoteSchema.partial().extend({
  id: idSchema,
});

// Quote filter schema
export const quoteFilterSchema = listQuerySchema.extend({
  status: quoteStatusSchema.optional(),
  statuses: z.array(quoteStatusSchema).optional(),
  clientId: idSchema.optional(),
  minAmount: moneySchema.optional(),
  maxAmount: moneySchema.optional(),
});

// Send quote schema
export const sendQuoteSchema = z.object({
  id: idSchema,
  recipientEmail: z.string().email().optional(), // Uses client email if not provided
  message: z.string().max(2000).optional(),
  ccEmails: z.array(z.string().email()).max(5).optional(),
});

// Accept quote schema (client action)
export const acceptQuoteSchema = z.object({
  token: z.string().min(1, 'Access token is required'),
  signatureData: z.string().optional(), // Base64 signature
  signatureName: z.string().min(1).max(100).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// Decline quote schema (client action)
export const declineQuoteSchema = z.object({
  token: z.string().min(1, 'Access token is required'),
  reason: z.string().max(1000).optional(),
});

// Convert to invoice schema
export const convertToInvoiceSchema = z.object({
  quoteId: idSchema,
  dueDate: z.coerce.date().optional(),
  sendImmediately: z.boolean().default(false),
});

// Duplicate quote schema
export const duplicateQuoteSchema = z.object({
  id: idSchema,
  title: z.string().max(200).optional(),
  clientId: idSchema.optional(),
});

// Type exports
export type QuoteStatus = z.infer<typeof quoteStatusSchema>;
export type QuoteBlockType = z.infer<typeof quoteBlockTypeSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type QuoteBlock = z.infer<typeof quoteBlockSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type QuoteFilter = z.infer<typeof quoteFilterSchema>;
export type SendQuoteInput = z.infer<typeof sendQuoteSchema>;
export type AcceptQuoteInput = z.infer<typeof acceptQuoteSchema>;
export type DeclineQuoteInput = z.infer<typeof declineQuoteSchema>;
export type ConvertToInvoiceInput = z.infer<typeof convertToInvoiceSchema>;
export type DuplicateQuoteInput = z.infer<typeof duplicateQuoteSchema>;
