/**
 * Base model with common fields
 */
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Soft-deletable model
 */
export interface SoftDeletable {
  deletedAt: Date | null;
}

/**
 * Address type
 */
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * User type
 */
export interface User extends BaseModel, SoftDeletable {
  email: string;
  name: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: Date | null;
}

/**
 * Workspace type
 */
export interface Workspace extends BaseModel, SoftDeletable {
  name: string;
  slug: string;
  ownerId: string;
  settings: WorkspaceSettings;
}

/**
 * Workspace settings
 */
export interface WorkspaceSettings {
  modules?: {
    quotes?: boolean;
    invoices?: boolean;
    contracts?: boolean;
    rateCards?: boolean;
  };
  defaults?: {
    currency?: string;
    timezone?: string;
    dateFormat?: string;
    paymentTermsDays?: number;
    quoteExpiryDays?: number;
    taxRate?: number;
  };
  notifications?: {
    emailOnQuoteAccepted?: boolean;
    emailOnPaymentReceived?: boolean;
  };
}

/**
 * Workspace member type
 */
export interface WorkspaceMember extends BaseModel {
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invitedAt: Date | null;
  acceptedAt: Date | null;
  user?: User;
}

/**
 * Business profile type
 */
export interface BusinessProfile {
  workspaceId: string;
  businessName: string;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: Address | null;
  taxId: string | null;
  currency: string;
  timezone: string;
}

/**
 * Client type
 */
export interface Client extends BaseModel, SoftDeletable {
  workspaceId: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  address: Address | null;
  billingAddress: Address | null;
  taxId: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
}

/**
 * Rate card type
 */
export interface RateCard extends BaseModel, SoftDeletable {
  workspaceId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  pricingType: 'hourly' | 'daily' | 'fixed' | 'package';
  rate: number;
  unit: string | null;
  taxRateId: string | null;
  isActive: boolean;
}

/**
 * Quote status type
 */
export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'converted';

/**
 * Quote type
 */
export interface Quote extends BaseModel, SoftDeletable {
  workspaceId: string;
  clientId: string;
  quoteNumber: string;
  status: QuoteStatus;
  title: string | null;
  issueDate: Date;
  expirationDate: Date | null;
  subtotal: number;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number | null;
  discountAmount: number;
  taxTotal: number;
  total: number;
  notes: string | null;
  terms: string | null;
  internalNotes: string | null;
  settings: QuoteSettings;
  accessToken: string;
  viewedAt: Date | null;
  viewCount: number;
  sentAt: Date | null;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  signedAt: Date | null;
  signatureData: SignatureData | null;
  pdfUrl: string | null;
  client?: Client;
  lineItems?: QuoteLineItem[];
}

/**
 * Quote settings
 */
export interface QuoteSettings {
  requireSignature?: boolean;
  autoConvertToInvoice?: boolean;
  depositRequired?: boolean;
  depositType?: 'percentage' | 'fixed';
  depositValue?: number;
  showLineItemPrices?: boolean;
  allowPartialAcceptance?: boolean;
}

/**
 * Signature data
 */
export interface SignatureData {
  signatureUrl: string;
  signerName: string;
  signerEmail: string;
  ipAddress: string;
  userAgent: string;
  signedAt: string;
}

/**
 * Quote line item type
 */
export interface QuoteLineItem extends BaseModel {
  quoteId: string;
  rateCardId: string | null;
  name: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
  taxRate: number | null;
  taxAmount: number;
  sortOrder: number;
}

/**
 * Invoice status type
 */
export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'voided';

/**
 * Invoice type
 */
export interface Invoice extends BaseModel, SoftDeletable {
  workspaceId: string;
  clientId: string;
  quoteId: string | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  title: string | null;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number | null;
  discountAmount: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes: string | null;
  terms: string | null;
  internalNotes: string | null;
  settings: InvoiceSettings;
  accessToken: string;
  viewedAt: Date | null;
  viewCount: number;
  sentAt: Date | null;
  paidAt: Date | null;
  voidedAt: Date | null;
  pdfUrl: string | null;
  client?: Client;
  lineItems?: InvoiceLineItem[];
  payments?: Payment[];
}

/**
 * Invoice settings
 */
export interface InvoiceSettings {
  paymentMethods?: ('card' | 'bank_transfer' | 'manual')[];
  gratuityEnabled?: boolean;
  gratuityOptions?: number[];
  autoReminders?: boolean;
  reminderSchedule?: number[];
  lateFeeEnabled?: boolean;
  lateFeeType?: 'percentage' | 'fixed';
  lateFeeValue?: number;
}

/**
 * Invoice line item type
 */
export interface InvoiceLineItem extends BaseModel {
  invoiceId: string;
  rateCardId: string | null;
  name: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
  taxRate: number | null;
  taxAmount: number;
  sortOrder: number;
}

/**
 * Payment status type
 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partial_refund';

/**
 * Payment type
 */
export interface Payment extends BaseModel {
  invoiceId: string;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'bank_transfer' | 'manual';
  status: PaymentStatus;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  stripeReceiptUrl: string | null;
  referenceNumber: string | null;
  notes: string | null;
  processedAt: Date | null;
  refundedAt: Date | null;
  refundAmount: number | null;
  refundReason: string | null;
}

/**
 * Tax rate type
 */
export interface TaxRate extends BaseModel {
  workspaceId: string;
  name: string;
  rate: number;
  description: string | null;
  isInclusive: boolean;
  isDefault: boolean;
  isActive: boolean;
}
