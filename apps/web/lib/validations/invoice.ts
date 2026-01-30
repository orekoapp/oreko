import { z } from 'zod';
import { idSchema, moneySchema, percentageSchema, listQuerySchema, emailSchema } from './common';
import { lineItemSchema } from './quote';

// Invoice status enum
export const invoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'viewed',
  'paid',
  'partially_paid',
  'overdue',
  'cancelled',
  'refunded',
]);

// Payment method enum
export const paymentMethodSchema = z.enum([
  'stripe',
  'bank_transfer',
  'check',
  'cash',
  'other',
]);

// Create invoice schema
export const createInvoiceSchema = z.object({
  clientId: idSchema,
  quoteId: idSchema.optional(), // If created from quote
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string().max(5000).optional(),
  dueDate: z.coerce.date(),
  currency: z.string().length(3).default('USD'),
  taxRate: percentageSchema.optional(),
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.number().min(0).optional(),
  notes: z.string().max(5000).optional(),
  terms: z.string().max(10000).optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  allowPartialPayments: z.boolean().default(false),
  minimumPayment: moneySchema.optional(),
});

// Update invoice schema
export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  id: idSchema,
});

// Invoice filter schema
export const invoiceFilterSchema = listQuerySchema.extend({
  status: invoiceStatusSchema.optional(),
  statuses: z.array(invoiceStatusSchema).optional(),
  clientId: idSchema.optional(),
  quoteId: idSchema.optional(),
  minAmount: moneySchema.optional(),
  maxAmount: moneySchema.optional(),
  overdue: z.coerce.boolean().optional(),
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
});

// Send invoice schema
export const sendInvoiceSchema = z.object({
  id: idSchema,
  recipientEmail: emailSchema.optional(), // Uses client email if not provided
  message: z.string().max(2000).optional(),
  ccEmails: z.array(emailSchema).max(5).optional(),
});

// Record payment schema
export const recordPaymentSchema = z.object({
  invoiceId: idSchema,
  amount: moneySchema.min(1, 'Amount must be greater than 0'),
  method: paymentMethodSchema,
  transactionId: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  paidAt: z.coerce.date().default(() => new Date()),
});

// Refund payment schema
export const refundPaymentSchema = z.object({
  paymentId: idSchema,
  amount: moneySchema.optional(), // Full refund if not specified
  reason: z.string().max(500).optional(),
});

// Mark as paid schema (quick action)
export const markAsPaidSchema = z.object({
  id: idSchema,
  method: paymentMethodSchema.default('other'),
  notes: z.string().max(500).optional(),
});

// Cancel invoice schema
export const cancelInvoiceSchema = z.object({
  id: idSchema,
  reason: z.string().max(500).optional(),
});

// Duplicate invoice schema
export const duplicateInvoiceSchema = z.object({
  id: idSchema,
  title: z.string().max(200).optional(),
  clientId: idSchema.optional(),
  dueDate: z.coerce.date().optional(),
});

// Payment intent schema (for Stripe)
export const createPaymentIntentSchema = z.object({
  invoiceId: idSchema,
  amount: moneySchema.optional(), // Partial payment amount
});

// Type exports
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceFilter = z.infer<typeof invoiceFilterSchema>;
export type SendInvoiceInput = z.infer<typeof sendInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type MarkAsPaidInput = z.infer<typeof markAsPaidSchema>;
export type CancelInvoiceInput = z.infer<typeof cancelInvoiceSchema>;
export type DuplicateInvoiceInput = z.infer<typeof duplicateInvoiceSchema>;
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
