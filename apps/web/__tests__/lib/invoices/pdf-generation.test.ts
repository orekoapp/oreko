import { describe, it, expect } from 'vitest';

// PDF Generation Logic (Bug #340-341)
// Standalone implementation for testing invoice PDF data validation and generation

interface PdfLineItem {
  name: string;
  qty: number;
  rate: number;
  amount: number;
}

interface PdfInvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  lineItems: PdfLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string;
  dueDate?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validatePdfData(data: Partial<PdfInvoiceData>): ValidationResult {
  const errors: string[] = [];

  if (!data.invoiceNumber) errors.push('Invoice number required');
  if (!data.clientName) errors.push('Client name required');
  if (!data.lineItems || data.lineItems.length === 0) errors.push('At least one line item required');

  if (data.lineItems) {
    for (let i = 0; i < data.lineItems.length; i++) {
      const item = data.lineItems[i]!;
      if (!item.name || !item.name.trim()) {
        errors.push(`Line item ${i + 1}: name required`);
      }
      if (item.qty <= 0) {
        errors.push(`Line item ${i + 1}: quantity must be positive`);
      }
      if (item.rate < 0) {
        errors.push(`Line item ${i + 1}: rate cannot be negative`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function calculateLineItemAmount(qty: number, rate: number): number {
  return Math.round(qty * rate * 100) / 100;
}

function calculateSubtotal(lineItems: PdfLineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.amount, 0);
}

function calculateTotal(subtotal: number, tax: number): number {
  return Math.round((subtotal + tax) * 100) / 100;
}

function formatCurrencyForPdf(amount: number, currency: string): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '\u20AC', GBP: '\u00A3' };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${amount.toFixed(2)}`;
}

const MAX_TEXT_LENGTH = 500;

function truncateText(text: string, maxLength: number = MAX_TEXT_LENGTH): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

function getPdfSections(data: PdfInvoiceData): string[] {
  const sections: string[] = ['header', 'client_info', 'line_items', 'totals'];
  if (data.notes) sections.push('notes');
  sections.push('footer');
  return sections;
}

describe('PDF Generation Logic (Bug #340-341)', () => {
  const validData: PdfInvoiceData = {
    invoiceNumber: 'INV-001',
    clientName: 'Acme Corp',
    clientEmail: 'billing@acme.com',
    lineItems: [
      { name: 'Web Design', qty: 40, rate: 150, amount: 6000 },
      { name: 'Logo Design', qty: 1, rate: 2500, amount: 2500 },
    ],
    subtotal: 8500,
    tax: 850,
    total: 9350,
    currency: 'USD',
    notes: 'Payment due within 30 days.',
  };

  describe('data validation', () => {
    it('valid invoice data passes validation', () => {
      const result = validatePdfData(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('missing invoice number is rejected', () => {
      const result = validatePdfData({ ...validData, invoiceNumber: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invoice number required');
    });

    it('missing client name is rejected', () => {
      const result = validatePdfData({ ...validData, clientName: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Client name required');
    });

    it('empty line items array is rejected', () => {
      const result = validatePdfData({ ...validData, lineItems: [] });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one line item required');
    });

    it('undefined line items is rejected', () => {
      const result = validatePdfData({ invoiceNumber: 'INV-001', clientName: 'Test' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one line item required');
    });

    it('line item with empty name is rejected', () => {
      const data = {
        ...validData,
        lineItems: [{ name: '', qty: 1, rate: 100, amount: 100 }],
      };
      const result = validatePdfData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Line item 1: name required');
    });

    it('line item with zero quantity is rejected', () => {
      const data = {
        ...validData,
        lineItems: [{ name: 'Item', qty: 0, rate: 100, amount: 0 }],
      };
      const result = validatePdfData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Line item 1: quantity must be positive');
    });

    it('line item with negative rate is rejected', () => {
      const data = {
        ...validData,
        lineItems: [{ name: 'Discount', qty: 1, rate: -50, amount: -50 }],
      };
      const result = validatePdfData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Line item 1: rate cannot be negative');
    });

    it('collects multiple errors at once', () => {
      const result = validatePdfData({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('line item calculations', () => {
    it('line items calculated correctly (qty * rate)', () => {
      expect(calculateLineItemAmount(40, 150)).toBe(6000);
      expect(calculateLineItemAmount(1, 2500)).toBe(2500);
    });

    it('handles fractional quantities', () => {
      expect(calculateLineItemAmount(2.5, 100)).toBe(250);
    });

    it('handles penny precision', () => {
      expect(calculateLineItemAmount(3, 33.33)).toBe(99.99);
    });
  });

  describe('totals calculations', () => {
    it('subtotal is sum of line item amounts', () => {
      const subtotal = calculateSubtotal(validData.lineItems);
      expect(subtotal).toBe(8500);
    });

    it('total includes tax', () => {
      const total = calculateTotal(8500, 850);
      expect(total).toBe(9350);
    });

    it('total with zero tax equals subtotal', () => {
      expect(calculateTotal(5000, 0)).toBe(5000);
    });
  });

  describe('currency formatting', () => {
    it('formats USD with dollar sign', () => {
      expect(formatCurrencyForPdf(9350, 'USD')).toBe('$9350.00');
    });

    it('formats EUR with euro sign', () => {
      expect(formatCurrencyForPdf(1500.5, 'EUR')).toBe('\u20AC1500.50');
    });

    it('formats GBP with pound sign', () => {
      expect(formatCurrencyForPdf(750, 'GBP')).toBe('\u00A3750.00');
    });

    it('unknown currency uses code as prefix', () => {
      expect(formatCurrencyForPdf(100, 'JPY')).toBe('JPY 100.00');
    });
  });

  describe('text handling', () => {
    it('short text is not truncated', () => {
      expect(truncateText('Hello world')).toBe('Hello world');
    });

    it('very long text fields are truncated', () => {
      const longText = 'A'.repeat(600);
      const result = truncateText(longText);
      expect(result.length).toBe(MAX_TEXT_LENGTH);
      expect(result.endsWith('...')).toBe(true);
    });

    it('text at exact max length is not truncated', () => {
      const exact = 'B'.repeat(MAX_TEXT_LENGTH);
      expect(truncateText(exact)).toBe(exact);
    });
  });

  describe('PDF sections', () => {
    it('PDF includes all required sections', () => {
      const sections = getPdfSections(validData);
      expect(sections).toContain('header');
      expect(sections).toContain('line_items');
      expect(sections).toContain('totals');
      expect(sections).toContain('footer');
    });

    it('notes section included when notes present', () => {
      const sections = getPdfSections(validData);
      expect(sections).toContain('notes');
    });

    it('notes section excluded when no notes', () => {
      const noNotes = { ...validData, notes: undefined };
      const sections = getPdfSections(noNotes);
      expect(sections).not.toContain('notes');
    });

    it('client_info section is always present', () => {
      const sections = getPdfSections(validData);
      expect(sections).toContain('client_info');
    });
  });
});
