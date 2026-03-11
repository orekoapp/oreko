import type {
  BusinessProfile,
  BrandingSettings,
  PaymentSettings,
  TaxRate,
  NumberSequence,
} from '@quotecraft/database';

// Business profile type
export interface BusinessProfileData {
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

// Address type
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Branding settings type
export interface BrandingSettingsData {
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  customCss: string | null;
  fontFamily: string | null;
}

// Payment settings type
export interface PaymentSettingsData {
  stripeAccountId: string | null;
  stripeAccountStatus: string | null;
  stripeOnboardingComplete: boolean;
  enabledPaymentMethods: string[];
  passProcessingFees: boolean;
  defaultPaymentTerms: number;
}

// Tax rate type
export interface TaxRateData {
  id: string;
  name: string;
  rate: number;
  description: string | null;
  isInclusive: boolean;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Number sequence type
export interface NumberSequenceData {
  id: string;
  type: string;
  prefix: string | null;
  suffix: string | null;
  currentValue: number;
  padding: number;
}

// Create tax rate input
export interface CreateTaxRateInput {
  name: string;
  rate: number;
  description?: string;
  isInclusive?: boolean;
  isDefault?: boolean;
  isActive?: boolean;
}

// Update tax rate input
export interface UpdateTaxRateInput extends Partial<CreateTaxRateInput> {
  id: string;
}

// Update business profile input
export interface UpdateBusinessProfileInput {
  businessName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Address;
  taxId?: string;
  currency?: string;
  timezone?: string;
}

// Update branding settings input
export interface UpdateBrandingSettingsInput {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
  fontFamily?: string;
}

// Update payment settings input
export interface UpdatePaymentSettingsInput {
  enabledPaymentMethods?: string[];
  passProcessingFees?: boolean;
  defaultPaymentTerms?: number;
}

// Update number sequence input
export interface UpdateNumberSequenceInput {
  type: 'quote' | 'invoice';
  prefix?: string;
  suffix?: string;
  currentValue?: number;
  padding?: number;
}

// All settings combined
export interface AllSettings {
  businessProfile: BusinessProfileData | null;
  branding: BrandingSettingsData | null;
  payment: PaymentSettingsData | null;
  taxRates: TaxRateData[];
  numberSequences: NumberSequenceData[];
}

// Workspace data
export interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  ownerId: string | null;
  createdAt: Date;
}

// Common timezones
export const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
] as const;

// Custom field types
export type CustomFieldType = 'text' | 'number' | 'date' | 'dropdown' | 'multiselect' | 'checkbox' | 'url' | 'email';
export type CustomFieldEntity = 'quote' | 'invoice' | 'client' | 'project';

export const CUSTOM_FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Text',
  number: 'Number',
  date: 'Date',
  dropdown: 'Dropdown',
  multiselect: 'Multi-Select',
  checkbox: 'Checkbox',
  url: 'URL',
  email: 'Email',
};

export const CUSTOM_FIELD_ENTITY_LABELS: Record<CustomFieldEntity, string> = {
  quote: 'Quotes',
  invoice: 'Invoices',
  client: 'Clients',
  project: 'Projects',
};

export interface CustomFieldData {
  id: string;
  name: string;
  fieldType: CustomFieldType;
  appliesTo: CustomFieldEntity[];
  isRequired: boolean;
  isActive: boolean;
  options: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Integration types
export interface IntegrationData {
  id: string;
  name: string;
  provider: string;
  description: string;
  isConnected: boolean;
  isAvailable: boolean;
  connectedAt: Date | null;
  config: Record<string, unknown>;
}

// Webhook types
export type WebhookEvent =
  | 'quote.created' | 'quote.sent' | 'quote.accepted' | 'quote.declined' | 'quote.expired'
  | 'invoice.created' | 'invoice.sent' | 'invoice.paid' | 'invoice.overdue' | 'invoice.voided'
  | 'client.created' | 'client.updated' | 'client.deleted'
  | 'project.created' | 'project.updated' | 'project.completed'
  | 'payment.received' | 'payment.refunded' | 'payment.failed';

export const WEBHOOK_EVENT_LABELS: Record<WebhookEvent, string> = {
  'quote.created': 'Created',
  'quote.sent': 'Sent',
  'quote.accepted': 'Accepted',
  'quote.declined': 'Declined',
  'quote.expired': 'Expired',
  'invoice.created': 'Created',
  'invoice.sent': 'Sent',
  'invoice.paid': 'Paid',
  'invoice.overdue': 'Overdue',
  'invoice.voided': 'Voided',
  'client.created': 'Created',
  'client.updated': 'Updated',
  'client.deleted': 'Deleted',
  'project.created': 'Created',
  'project.updated': 'Updated',
  'project.completed': 'Completed',
  'payment.received': 'Received',
  'payment.refunded': 'Refunded',
  'payment.failed': 'Failed',
};

export interface WebhookData {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: WebhookEvent[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Common currencies
export const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
] as const;
