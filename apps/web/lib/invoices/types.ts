/**
 * Invoice Types
 * These define the data structures for invoices
 */

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'voided';

export interface InvoiceLineItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
  taxRate: number | null;
  taxAmount: number;
  sortOrder: number;
}

export interface InvoiceSettings {
  currency: string;
  showLineItemPrices: boolean;
  paymentTerms: string;
  lateFeeEnabled: boolean;
  lateFeeType: 'percentage' | 'fixed';
  lateFeeValue: number;
  reminderEnabled: boolean;
  reminderDays: number[];
}

export interface InvoiceTotals {
  subtotal: number;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number | null;
  discountAmount: number;
  taxTotal: number;
  total: number;
  amountPaid: number;
  amountDue: number;
}

export interface InvoiceClient {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
}

export interface InvoiceDocument {
  id: string;
  workspaceId: string;
  clientId: string;
  projectId: string | null;
  quoteId: string | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  title: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  settings: InvoiceSettings;
  totals: InvoiceTotals;
  notes: string;
  terms: string;
  internalNotes: string;
  client?: InvoiceClient | null;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  title: string;
  issueDate: string;
  dueDate: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  client: {
    id: string;
    name: string;
    company: string | null;
  };
  isOverdue: boolean;
}

export interface CreateInvoiceData {
  clientId: string;
  projectId?: string | null;
  title: string;
  dueDate: string;
  lineItems: Array<{
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    taxRate?: number;
  }>;
  notes?: string;
  terms?: string;
  internalNotes?: string;
}

export interface UpdateInvoiceData {
  projectId?: string | null;
  title?: string;
  dueDate?: string;
  lineItems?: Array<{
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    taxRate?: number;
  }>;
  notes?: string;
  terms?: string;
  internalNotes?: string;
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  currency: 'USD',
  showLineItemPrices: true,
  paymentTerms: 'net30',
  lateFeeEnabled: false,
  lateFeeType: 'percentage',
  lateFeeValue: 0,
  reminderEnabled: true,
  reminderDays: [7, 3, 1],
};

export const PAYMENT_TERMS = [
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net7', label: 'Net 7' },
  { value: 'net15', label: 'Net 15' },
  { value: 'net30', label: 'Net 30' },
  { value: 'net45', label: 'Net 45' },
  { value: 'net60', label: 'Net 60' },
  { value: 'custom', label: 'Custom' },
];

/**
 * Calculate days until due date
 */
export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(dueDate: string, status: string): boolean {
  if (status === 'paid' || status === 'voided') return false;
  return getDaysUntilDue(dueDate) < 0;
}
