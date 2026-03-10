/**
 * PDF Generation Types
 */

// PDF format options
export type PdfFormat = 'A4' | 'Letter' | 'Legal';

// PDF generation options
export interface PdfGenerationOptions {
  format?: PdfFormat;
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  showHeader?: boolean;
  showFooter?: boolean;
  watermark?: string;
}

// Quote PDF data
export interface QuotePdfData {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  issueDate: string;
  expirationDate: string | null;
  totals: {
    subtotal: number;
    discountAmount: number;
    taxTotal: number;
    total: number;
  };
  notes: string | null;
  terms: string | null;
  client: {
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
    address: unknown;
  };
  business: {
    name: string;
    email: string | null;
    phone: string | null;
    logoUrl: string | null;
    address: unknown;
  };
  branding: {
    primaryColor: string | null;
    accentColor: string | null;
  } | null;
  lineItems: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    rate: number;
    amount: number;
    taxRate: number | null;
    taxAmount: number;
  }>;
  currency: string;
  signature?: {
    signerName: string;
    signedAt: string;
    data: string;
  } | null;
}

// Invoice PDF data
export interface InvoicePdfData {
  id: string;
  invoiceNumber: string;
  title: string;
  status: string;
  issueDate: string;
  dueDate: string;
  totals: {
    subtotal: number;
    discountAmount: number;
    taxTotal: number;
    total: number;
    amountPaid: number;
    amountDue: number;
  };
  notes: string | null;
  terms: string | null;
  paymentTerms: string | null;
  client: {
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
    address: unknown;
  };
  business: {
    name: string;
    email: string | null;
    phone: string | null;
    logoUrl: string | null;
    address: unknown;
  };
  branding: {
    primaryColor: string | null;
    accentColor: string | null;
  } | null;
  lineItems: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    rate: number;
    amount: number;
    taxRate: number | null;
    taxAmount: number;
  }>;
  currency: string;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    paidAt: string;
    reference: string | null;
  }>;
}

// Credit Note PDF data
export interface CreditNotePdfData {
  id: string;
  creditNoteNumber: string;
  reason: string;
  status: string;
  issuedAt: string | null;
  createdAt: string;
  originalInvoiceNumber: string;
  totals: {
    total: number;
  };
  notes: string | null;
  client: {
    name: string;
    email: string;
    company: string | null;
    phone: string | null;
    address: unknown;
  };
  business: {
    name: string;
    email: string | null;
    phone: string | null;
    logoUrl: string | null;
    address: unknown;
  };
  branding: {
    primaryColor: string | null;
    accentColor: string | null;
  } | null;
  lineItems: Array<{
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  currency: string;
}
