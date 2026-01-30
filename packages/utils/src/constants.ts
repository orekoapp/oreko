/**
 * Quote status values
 */
export const QUOTE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  CONVERTED: 'converted',
} as const;

export type QuoteStatus = (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];

/**
 * Invoice status values
 */
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  PARTIAL: 'partial',
  PAID: 'paid',
  OVERDUE: 'overdue',
  VOID: 'void',
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

/**
 * Payment status values
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIAL_REFUND: 'partial_refund',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/**
 * Payment methods
 */
export const PAYMENT_METHOD = {
  CARD: 'card',
  BANK: 'bank',
  MANUAL: 'manual',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

/**
 * Workspace member roles
 */
export const WORKSPACE_ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLE)[keyof typeof WORKSPACE_ROLE];

/**
 * Pricing types for rate cards
 */
export const PRICING_TYPE = {
  HOURLY: 'hourly',
  DAILY: 'daily',
  FIXED: 'fixed',
  PACKAGE: 'package',
} as const;

export type PricingType = (typeof PRICING_TYPE)[keyof typeof PRICING_TYPE];

/**
 * Discount types
 */
export const DISCOUNT_TYPE = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;

export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];

/**
 * Contract status values
 */
export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  SIGNED: 'signed',
  EXPIRED: 'expired',
} as const;

export type ContractStatus = (typeof CONTRACT_STATUS)[keyof typeof CONTRACT_STATUS];

/**
 * Email template types
 */
export const EMAIL_TEMPLATE_TYPE = {
  QUOTE_SENT: 'quote_sent',
  QUOTE_ACCEPTED: 'quote_accepted',
  QUOTE_REMINDER: 'quote_reminder',
  INVOICE_SENT: 'invoice_sent',
  INVOICE_REMINDER: 'invoice_reminder',
  INVOICE_OVERDUE: 'invoice_overdue',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_RECEIPT: 'payment_receipt',
  CONTRACT_SENT: 'contract_sent',
  CONTRACT_SIGNED: 'contract_signed',
} as const;

export type EmailTemplateType = (typeof EMAIL_TEMPLATE_TYPE)[keyof typeof EMAIL_TEMPLATE_TYPE];

/**
 * Supported currencies (ISO 4217)
 */
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
] as const;

/**
 * Default pagination
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * File upload limits
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
