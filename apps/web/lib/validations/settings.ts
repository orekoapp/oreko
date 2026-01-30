import { z } from 'zod';
import {
  emailSchema,
  phoneSchema,
  urlSchema,
  hexColorSchema,
  addressSchema,
  partialAddressSchema,
} from './common';

// Business settings schema
export const businessSettingsSchema = z.object({
  businessName: z
    .string()
    .min(1, 'Business name is required')
    .max(200, 'Business name must be less than 200 characters'),
  email: emailSchema,
  phone: phoneSchema,
  website: urlSchema,
  taxId: z.string().max(50).optional(),
  address: partialAddressSchema.optional(),
});

// Branding settings schema
export const brandingSettingsSchema = z.object({
  logo: z.string().url().optional().nullable(),
  favicon: z.string().url().optional().nullable(),
  primaryColor: hexColorSchema.default('#3B82F6'),
  secondaryColor: hexColorSchema.default('#8B5CF6'),
  accentColor: hexColorSchema.default('#F59E0B'),
  fontFamily: z.string().max(100).optional(),
});

// Invoice settings schema
export const invoiceSettingsSchema = z.object({
  prefix: z.string().max(10).default('INV'),
  nextNumber: z.number().int().min(1).default(1),
  defaultDueDays: z.number().int().min(0).max(365).default(30),
  defaultNotes: z.string().max(5000).optional(),
  defaultTerms: z.string().max(10000).optional(),
  showLogo: z.boolean().default(true),
  showPaymentInfo: z.boolean().default(true),
  autoReminders: z.boolean().default(true),
  reminderDays: z.array(z.number().int().min(1).max(90)).max(5).default([7, 3, 1]),
});

// Quote settings schema
export const quoteSettingsSchema = z.object({
  prefix: z.string().max(10).default('QT'),
  nextNumber: z.number().int().min(1).default(1),
  defaultValidDays: z.number().int().min(1).max(365).default(30),
  defaultNotes: z.string().max(5000).optional(),
  defaultTerms: z.string().max(10000).optional(),
  showLogo: z.boolean().default(true),
  requireSignature: z.boolean().default(true),
  autoExpireQuotes: z.boolean().default(true),
});

// Email settings schema
export const emailSettingsSchema = z.object({
  fromName: z.string().max(100).optional(),
  replyToEmail: emailSchema.optional(),
  emailFooter: z.string().max(2000).optional(),
  sendCopyToSelf: z.boolean().default(false),
});

// Payment settings schema
export const paymentSettingsSchema = z.object({
  acceptedMethods: z.array(z.enum(['stripe', 'bank_transfer', 'check', 'cash', 'other'])).default(['stripe']),
  stripeEnabled: z.boolean().default(false),
  bankDetails: z.object({
    bankName: z.string().max(100).optional(),
    accountName: z.string().max(100).optional(),
    accountNumber: z.string().max(50).optional(),
    routingNumber: z.string().max(50).optional(),
    swiftCode: z.string().max(20).optional(),
    iban: z.string().max(50).optional(),
  }).optional(),
  defaultCurrency: z.string().length(3).default('USD'),
  defaultTaxRate: z.number().min(0).max(100).default(0),
  taxLabel: z.string().max(50).default('Tax'),
});

// Notification settings schema
export const notificationSettingsSchema = z.object({
  emailOnQuoteSent: z.boolean().default(true),
  emailOnQuoteAccepted: z.boolean().default(true),
  emailOnQuoteDeclined: z.boolean().default(true),
  emailOnQuoteExpired: z.boolean().default(true),
  emailOnInvoiceSent: z.boolean().default(true),
  emailOnInvoicePaid: z.boolean().default(true),
  emailOnInvoiceOverdue: z.boolean().default(true),
  emailOnPaymentReceived: z.boolean().default(true),
});

// Combined settings schema
export const settingsSchema = z.object({
  business: businessSettingsSchema.optional(),
  branding: brandingSettingsSchema.optional(),
  invoices: invoiceSettingsSchema.optional(),
  quotes: quoteSettingsSchema.optional(),
  email: emailSettingsSchema.optional(),
  payments: paymentSettingsSchema.optional(),
  notifications: notificationSettingsSchema.optional(),
});

// Update settings schema (for partial updates)
export const updateSettingsSchema = settingsSchema.partial();

// Type exports
export type BusinessSettings = z.infer<typeof businessSettingsSchema>;
export type BrandingSettings = z.infer<typeof brandingSettingsSchema>;
export type InvoiceSettings = z.infer<typeof invoiceSettingsSchema>;
export type QuoteSettings = z.infer<typeof quoteSettingsSchema>;
export type EmailSettings = z.infer<typeof emailSettingsSchema>;
export type PaymentSettings = z.infer<typeof paymentSettingsSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
