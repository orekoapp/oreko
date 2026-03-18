/**
 * Shared types for public portal pages (quote, invoice, contract)
 */

import type { QuoteBlock, QuoteSettings, QuoteTotals, QuoteStatus } from '@/lib/quotes/types';
import type { InvoiceLineItem, InvoiceSettings, InvoiceTotals, InvoiceStatus } from '@/lib/invoices/types';

// ---- Shared ----

export interface PortalBranding {
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  companyName: string;
  contactEmail: string | null;
  contactPhone: string | null;
}

export interface PortalBusinessInfo {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  website: string | null;
}

export interface PortalClientInfo {
  name: string;
  email: string | null;
  company: string | null;
  address: string | null;
}

// ---- Quote Portal ----

export interface PublicQuoteData {
  id: string;
  quoteNumber: string;
  title: string;
  status: QuoteStatus;
  issueDate: string;
  expirationDate: string | null;
  isExpired: boolean;
  blocks: QuoteBlock[];
  lineItems: PublicQuoteLineItem[];
  settings: QuoteSettings;
  totals: QuoteTotals;
  notes: string | null;
  terms: string | null;
  business: PortalBusinessInfo;
  client: PortalClientInfo;
  branding: PortalBranding | null;
}

export interface PublicQuoteLineItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
  unit: string;
}

// ---- Invoice Portal ----

export interface PublicInvoiceData {
  id: string;
  invoiceNumber: string;
  title: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  isOverdue: boolean;
  daysOverdue: number;
  lineItems: InvoiceLineItem[];
  settings: InvoiceSettings;
  totals: InvoiceTotals;
  notes: string | null;
  terms: string | null;
  business: PortalBusinessInfo;
  client: PortalClientInfo;
  branding: PortalBranding | null;
  payments: PublicPaymentRecord[];
  canPay: boolean;
  quoteReference: { id: string; quoteNumber: string } | null;
}

export interface PublicPaymentRecord {
  id: string;
  amount: number;
  paymentMethod: string;
  processedAt: string | null;
  status: string;
}

// ---- Status Display ----

export type StatusVariant = 'info' | 'warning' | 'success' | 'error' | 'muted';

export interface StatusDisplayConfig {
  label: string;
  description: string;
  variant: StatusVariant;
}
