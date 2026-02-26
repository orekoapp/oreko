import { Resend } from 'resend';

// Email configuration types
export interface EmailConfig {
  from: string;
  replyTo?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  tags?: Array<{
    name: string;
    value: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Initialize email client
let resend: Resend | null = null;

function getEmailClient(): Resend | null {
  if (resend) return resend;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
    return null;
  }

  resend = new Resend(apiKey);
  return resend;
}

// Get default config
function getDefaultConfig(): EmailConfig {
  return {
    from: process.env.EMAIL_FROM || 'QuoteCraft <noreply@quote.persuado.tech>',
    replyTo: process.env.EMAIL_REPLY_TO,
  };
}

// Check if email is enabled
export function isEmailEnabled(): boolean {
  return getEmailClient() !== null;
}

// Send email
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const client = getEmailClient();

  if (!client) {
    console.warn('Email client not configured. Email not sent:', options.subject);
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  const config = getDefaultConfig();

  try {
    const { data, error } = await client.emails.send({
      from: config.from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html || options.text || 'This email has no content',
      replyTo: options.replyTo ?? config.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
      tags: options.tags,
    });

    if (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Email send exception:', message);
    return {
      success: false,
      error: message,
    };
  }
}

// Pre-built email templates
export async function sendQuoteSentEmail(params: {
  to: string;
  clientName: string;
  quoteName: string;
  quoteUrl: string;
  businessName: string;
  validUntil?: Date;
  message?: string;
}): Promise<EmailResult> {
  const { to, clientName, quoteName, quoteUrl, businessName, validUntil, message } = params;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Quote from ${businessName}</h2>
      <p>Hi ${clientName},</p>
      <p>${businessName} has sent you a quote: <strong>${quoteName}</strong></p>
      ${message ? `<p>${message}</p>` : ''}
      ${validUntil ? `<p>This quote is valid until ${validUntil.toLocaleDateString()}.</p>` : ''}
      <p style="margin: 24px 0;">
        <a href="${quoteUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Quote
        </a>
      </p>
      <p>Or copy this link: ${quoteUrl}</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 14px;">
        Sent via QuoteCraft on behalf of ${businessName}
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Quote: ${quoteName} from ${businessName}`,
    html,
    tags: [
      { name: 'type', value: 'quote_sent' },
    ],
  });
}

export async function sendInvoiceSentEmail(params: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  invoiceUrl: string;
  businessName: string;
  amount: string;
  dueDate: Date;
  message?: string;
}): Promise<EmailResult> {
  const { to, clientName, invoiceNumber, invoiceUrl, businessName, amount, dueDate, message } = params;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Invoice from ${businessName}</h2>
      <p>Hi ${clientName},</p>
      <p>${businessName} has sent you an invoice:</p>
      <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Invoice:</strong> ${invoiceNumber}</p>
        <p style="margin: 8px 0 0;"><strong>Amount:</strong> ${amount}</p>
        <p style="margin: 8px 0 0;"><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
      </div>
      ${message ? `<p>${message}</p>` : ''}
      <p style="margin: 24px 0;">
        <a href="${invoiceUrl}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View & Pay Invoice
        </a>
      </p>
      <p>Or copy this link: ${invoiceUrl}</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 14px;">
        Sent via QuoteCraft on behalf of ${businessName}
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Invoice ${invoiceNumber} from ${businessName} - ${amount}`,
    html,
    tags: [
      { name: 'type', value: 'invoice_sent' },
    ],
  });
}

export async function sendPaymentReceivedEmail(params: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  businessName: string;
  amount: string;
  receiptUrl?: string;
}): Promise<EmailResult> {
  const { to, clientName, invoiceNumber, businessName, amount, receiptUrl } = params;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Payment Received</h2>
      <p>Hi ${clientName},</p>
      <p>Thank you! We have received your payment of <strong>${amount}</strong> for invoice ${invoiceNumber}.</p>
      ${receiptUrl ? `
        <p style="margin: 24px 0;">
          <a href="${receiptUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Receipt
          </a>
        </p>
      ` : ''}
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 14px;">
        Sent via QuoteCraft on behalf of ${businessName}
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Payment Received - Invoice ${invoiceNumber}`,
    html,
    tags: [
      { name: 'type', value: 'payment_received' },
    ],
  });
}

export async function sendQuoteAcceptedEmail(params: {
  to: string;
  quoteName: string;
  clientName: string;
  amount: string;
  quoteUrl: string;
}): Promise<EmailResult> {
  const { to, quoteName, clientName, amount, quoteUrl } = params;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Quote Accepted!</h2>
      <p>Great news! <strong>${clientName}</strong> has accepted your quote.</p>
      <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10B981;">
        <p style="margin: 0;"><strong>Quote:</strong> ${quoteName}</p>
        <p style="margin: 8px 0 0;"><strong>Amount:</strong> ${amount}</p>
      </div>
      <p style="margin: 24px 0;">
        <a href="${quoteUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Quote
        </a>
      </p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 14px;">
        Sent via QuoteCraft
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `Quote Accepted: ${quoteName} - ${amount}`,
    html,
    tags: [
      { name: 'type', value: 'quote_accepted' },
    ],
  });
}

export async function sendInvoiceReminderEmail(params: {
  to: string;
  clientName: string;
  invoiceNumber: string;
  invoiceUrl: string;
  businessName: string;
  amount: string;
  dueDate: Date;
  daysOverdue?: number;
}): Promise<EmailResult> {
  const { to, clientName, invoiceNumber, invoiceUrl, businessName, amount, dueDate, daysOverdue } = params;

  const isOverdue = daysOverdue !== undefined && daysOverdue > 0;
  const subject = isOverdue
    ? `Overdue: Invoice ${invoiceNumber} - ${amount} (${daysOverdue} days past due)`
    : `Reminder: Invoice ${invoiceNumber} from ${businessName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isOverdue ? '#EF4444' : '#F59E0B'};">
        ${isOverdue ? 'Invoice Overdue' : 'Invoice Reminder'}
      </h2>
      <p>Hi ${clientName},</p>
      <p>
        ${isOverdue
          ? `This is a reminder that invoice ${invoiceNumber} is now ${daysOverdue} days past due.`
          : `This is a friendly reminder that invoice ${invoiceNumber} is due on ${dueDate.toLocaleDateString()}.`
        }
      </p>
      <div style="background: ${isOverdue ? '#fef2f2' : '#fffbeb'}; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid ${isOverdue ? '#EF4444' : '#F59E0B'};">
        <p style="margin: 0;"><strong>Invoice:</strong> ${invoiceNumber}</p>
        <p style="margin: 8px 0 0;"><strong>Amount:</strong> ${amount}</p>
        <p style="margin: 8px 0 0;"><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
      </div>
      <p style="margin: 24px 0;">
        <a href="${invoiceUrl}" style="background-color: ${isOverdue ? '#EF4444' : '#F59E0B'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Pay Now
        </a>
      </p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 14px;">
        Sent via QuoteCraft on behalf of ${businessName}
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html,
    tags: [
      { name: 'type', value: isOverdue ? 'invoice_overdue' : 'invoice_reminder' },
    ],
  });
}
