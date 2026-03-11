import { describe, it, expect } from 'vitest';

// Email Template Rendering Logic (Bug #342)
// Standalone implementation for testing email template variable replacement

interface TemplateContext {
  [key: string]: string | number | undefined;
}

function renderTemplate(template: string, context: TemplateContext): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = context[key];
    if (value === undefined) return '';
    return String(value);
  });
}

function renderSubject(subject: string, context: TemplateContext): string {
  return renderTemplate(subject, context);
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

function renderHtmlTemplate(template: string, context: TemplateContext): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = context[key];
    if (value === undefined) return '';
    return escapeHtml(String(value));
  });
}

const EMAIL_PREVIEW_MAX_LENGTH = 150;

function generatePreview(body: string): string {
  // Strip HTML tags for preview
  const plainText = body.replace(/<[^>]*>/g, '').trim();
  if (plainText.length <= EMAIL_PREVIEW_MAX_LENGTH) return plainText;
  return plainText.slice(0, EMAIL_PREVIEW_MAX_LENGTH - 3) + '...';
}

describe('Email Template Rendering (Bug #342)', () => {
  describe('variable replacement', () => {
    it('template variables replaced correctly', () => {
      const template = 'Hello {{clientName}}, your invoice {{invoiceNumber}} is ready.';
      const context = { clientName: 'Alice', invoiceNumber: 'INV-042' };
      const result = renderTemplate(template, context);
      expect(result).toBe('Hello Alice, your invoice INV-042 is ready.');
    });

    it('numeric values are converted to string', () => {
      const template = 'Amount due: ${{amount}}';
      const context = { amount: 1500 };
      const result = renderTemplate(template, context);
      expect(result).toBe('Amount due: $1500');
    });

    it('multiple occurrences of same variable replaced', () => {
      const template = '{{name}} - Invoice for {{name}}';
      const context = { name: 'Bob' };
      const result = renderTemplate(template, context);
      expect(result).toBe('Bob - Invoice for Bob');
    });

    it('missing variables leave empty string', () => {
      const template = 'Hi {{clientName}}, your project {{projectName}} update.';
      const context = { clientName: 'Carol' };
      const result = renderTemplate(template, context);
      expect(result).toBe('Hi Carol, your project  update.');
    });

    it('template with no variables returns unchanged', () => {
      const template = 'This is a static email body.';
      const result = renderTemplate(template, {});
      expect(result).toBe('This is a static email body.');
    });
  });

  describe('subject line rendering', () => {
    it('subject line variables replaced', () => {
      const subject = 'Invoice {{invoiceNumber}} from {{companyName}}';
      const context = { invoiceNumber: 'INV-100', companyName: 'DesignCo' };
      expect(renderSubject(subject, context)).toBe('Invoice INV-100 from DesignCo');
    });

    it('subject with missing variable still renders', () => {
      const subject = 'Quote {{quoteNumber}} - {{status}}';
      const context = { quoteNumber: 'Q-55' };
      expect(renderSubject(subject, context)).toBe('Quote Q-55 - ');
    });
  });

  describe('HTML entity escaping', () => {
    it('HTML entities escaped in user content', () => {
      const template = '<p>Client: {{clientName}}</p>';
      const context = { clientName: '<script>alert("xss")</script>' };
      const result = renderHtmlTemplate(template, context);
      expect(result).toBe('<p>Client: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</p>');
    });

    it('ampersands in names are escaped', () => {
      const template = '<p>{{companyName}}</p>';
      const context = { companyName: 'Smith & Wesson' };
      const result = renderHtmlTemplate(template, context);
      expect(result).toBe('<p>Smith &amp; Wesson</p>');
    });

    it('quotes in content are escaped', () => {
      const template = '<div title="{{title}}">Content</div>';
      const context = { title: 'He said "hello"' };
      const result = renderHtmlTemplate(template, context);
      expect(result).toContain('&quot;hello&quot;');
    });
  });

  describe('special characters in names', () => {
    it('handles accented characters', () => {
      const template = 'Dear {{name}},';
      const context = { name: 'Ren\u00E9 M\u00FCller' };
      const result = renderTemplate(template, context);
      expect(result).toBe('Dear Ren\u00E9 M\u00FCller,');
    });

    it('handles apostrophes in names in HTML context', () => {
      const template = '<span>{{name}}</span>';
      const context = { name: "O'Brien" };
      const result = renderHtmlTemplate(template, context);
      expect(result).toBe('<span>O&#39;Brien</span>');
    });

    it('handles emoji in content', () => {
      const template = 'Status: {{status}}';
      const result = renderTemplate(template, { status: 'Paid \u2705' });
      expect(result).toBe('Status: Paid \u2705');
    });
  });

  describe('email preview truncation', () => {
    it('short content is not truncated', () => {
      const body = '<p>Your invoice is ready.</p>';
      expect(generatePreview(body)).toBe('Your invoice is ready.');
    });

    it('long content is truncated for email preview', () => {
      const longBody = '<p>' + 'A'.repeat(200) + '</p>';
      const preview = generatePreview(longBody);
      expect(preview.length).toBe(EMAIL_PREVIEW_MAX_LENGTH);
      expect(preview.endsWith('...')).toBe(true);
    });

    it('HTML tags are stripped in preview', () => {
      const body = '<h1>Invoice</h1><p>Dear <strong>Client</strong>,</p>';
      const preview = generatePreview(body);
      expect(preview).toBe('InvoiceDear Client,');
      expect(preview).not.toContain('<');
    });

    it('preview at exact max length is not truncated', () => {
      const exactBody = 'X'.repeat(EMAIL_PREVIEW_MAX_LENGTH);
      expect(generatePreview(exactBody)).toBe(exactBody);
    });
  });
});
