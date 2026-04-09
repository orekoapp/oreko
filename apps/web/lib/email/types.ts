import type { EmailTemplate, ScheduledEmail } from '@oreko/database';

// Email template types
export const EMAIL_TEMPLATE_TYPES = [
  'quote_sent',
  'quote_accepted',
  'quote_declined',
  'quote_reminder',
  'invoice_sent',
  'invoice_reminder',
  'invoice_overdue',
  'payment_received',
  'contract_sent',
  'contract_signed',
] as const;

export type EmailTemplateType = (typeof EMAIL_TEMPLATE_TYPES)[number];

// Email template list item
export interface EmailTemplateListItem {
  id: string;
  type: string;
  name: string;
  subject: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Email template detail
export interface EmailTemplateDetail extends EmailTemplateListItem {
  workspaceId: string;
  body: string;
}

// Create email template input
export interface CreateEmailTemplateInput {
  type: EmailTemplateType;
  name: string;
  subject: string;
  body: string;
  isActive?: boolean;
  isDefault?: boolean;
}

// Update email template input
export interface UpdateEmailTemplateInput extends Partial<CreateEmailTemplateInput> {
  id: string;
}

// Email template filter
export interface EmailTemplateFilter {
  type?: EmailTemplateType;
  search?: string;
  isActive?: boolean;
}

// Scheduled email list item
export interface ScheduledEmailListItem {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  scheduledFor: Date;
  status: string;
  sentAt: Date | null;
  createdAt: Date;
}

// Scheduled email detail
export interface ScheduledEmailDetail extends ScheduledEmailListItem {
  workspaceId: string;
  templateId: string | null;
  body: string;
  errorMessage: string | null;
  retryCount: number;
}

// Email template variables
export interface EmailVariables {
  // Common
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;

  // Quote specific
  quoteName?: string;
  quoteNumber?: string;
  quoteUrl?: string;
  quoteTotal?: string;
  quoteValidUntil?: string;

  // Invoice specific
  invoiceNumber?: string;
  invoiceUrl?: string;
  invoiceTotal?: string;
  invoiceDueDate?: string;
  amountPaid?: string;
  amountDue?: string;
  daysOverdue?: number;

  // Contract specific
  contractName?: string;
  contractUrl?: string;

  // Custom message
  message?: string;
}

// Default templates
export const DEFAULT_TEMPLATES: Record<
  EmailTemplateType,
  { name: string; subject: string; body: string }
> = {
  quote_sent: {
    name: 'Quote Sent',
    subject: 'Quote: {{quoteName}} from {{businessName}}',
    body: `<p>Hi {{clientName}},</p>
<p>{{businessName}} has sent you a quote: <strong>{{quoteName}}</strong></p>
{{#if message}}<p>{{message}}</p>{{/if}}
{{#if quoteValidUntil}}<p>This quote is valid until {{quoteValidUntil}}.</p>{{/if}}
<p><a href="{{quoteUrl}}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Quote</a></p>`,
  },
  quote_accepted: {
    name: 'Quote Accepted',
    subject: 'Quote Accepted: {{quoteName}} - {{quoteTotal}}',
    body: `<p>Great news!</p>
<p><strong>{{clientName}}</strong> has accepted your quote: {{quoteName}}</p>
<p><strong>Amount:</strong> {{quoteTotal}}</p>
<p><a href="{{quoteUrl}}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Quote</a></p>`,
  },
  quote_declined: {
    name: 'Quote Declined',
    subject: 'Quote Declined: {{quoteName}}',
    body: `<p>{{clientName}} has declined your quote: {{quoteName}}</p>
<p><a href="{{quoteUrl}}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Quote</a></p>`,
  },
  quote_reminder: {
    name: 'Quote Reminder',
    subject: 'Reminder: Quote {{quoteName}} expires soon',
    body: `<p>Hi {{clientName}},</p>
<p>This is a friendly reminder that the quote <strong>{{quoteName}}</strong> from {{businessName}} will expire on {{quoteValidUntil}}.</p>
<p><a href="{{quoteUrl}}" style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review Quote</a></p>`,
  },
  invoice_sent: {
    name: 'Invoice Sent',
    subject: 'Invoice {{invoiceNumber}} from {{businessName}} - {{invoiceTotal}}',
    body: `<p>Hi {{clientName}},</p>
<p>{{businessName}} has sent you an invoice:</p>
<p><strong>Invoice:</strong> {{invoiceNumber}}<br>
<strong>Amount:</strong> {{invoiceTotal}}<br>
<strong>Due Date:</strong> {{invoiceDueDate}}</p>
{{#if message}}<p>{{message}}</p>{{/if}}
<p><a href="{{invoiceUrl}}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View & Pay Invoice</a></p>`,
  },
  invoice_reminder: {
    name: 'Invoice Reminder',
    subject: 'Reminder: Invoice {{invoiceNumber}} from {{businessName}}',
    body: `<p>Hi {{clientName}},</p>
<p>This is a friendly reminder that invoice {{invoiceNumber}} is due on {{invoiceDueDate}}.</p>
<p><strong>Amount Due:</strong> {{amountDue}}</p>
<p><a href="{{invoiceUrl}}" style="background-color: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Pay Now</a></p>`,
  },
  invoice_overdue: {
    name: 'Invoice Overdue',
    subject: 'Overdue: Invoice {{invoiceNumber}} - {{daysOverdue}} days past due',
    body: `<p>Hi {{clientName}},</p>
<p>This is a reminder that invoice {{invoiceNumber}} is now {{daysOverdue}} days past due.</p>
<p><strong>Amount Due:</strong> {{amountDue}}</p>
<p><a href="{{invoiceUrl}}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Pay Now</a></p>`,
  },
  payment_received: {
    name: 'Payment Received',
    subject: 'Payment Received - Invoice {{invoiceNumber}}',
    body: `<p>Hi {{clientName}},</p>
<p>Thank you! We have received your payment of <strong>{{amountPaid}}</strong> for invoice {{invoiceNumber}}.</p>`,
  },
  contract_sent: {
    name: 'Contract Sent',
    subject: 'Contract: {{contractName}} from {{businessName}}',
    body: `<p>Hi {{clientName}},</p>
<p>{{businessName}} has sent you a contract to review and sign: <strong>{{contractName}}</strong></p>
{{#if message}}<p>{{message}}</p>{{/if}}
<p><a href="{{contractUrl}}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review & Sign</a></p>`,
  },
  contract_signed: {
    name: 'Contract Signed',
    subject: 'Contract Signed: {{contractName}}',
    body: `<p>Great news!</p>
<p><strong>{{clientName}}</strong> has signed the contract: {{contractName}}</p>
<p><a href="{{contractUrl}}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Signed Contract</a></p>`,
  },
};

// Get human-readable template type name
export function getTemplateTypeName(type: EmailTemplateType): string {
  const names: Record<EmailTemplateType, string> = {
    quote_sent: 'Quote Sent',
    quote_accepted: 'Quote Accepted',
    quote_declined: 'Quote Declined',
    quote_reminder: 'Quote Reminder',
    invoice_sent: 'Invoice Sent',
    invoice_reminder: 'Invoice Reminder',
    invoice_overdue: 'Invoice Overdue',
    payment_received: 'Payment Received',
    contract_sent: 'Contract Sent',
    contract_signed: 'Contract Signed',
  };
  return names[type] || type;
}
