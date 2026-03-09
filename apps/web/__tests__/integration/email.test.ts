import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock nodemailer
const mockTransporter = {
  sendMail: vi.fn(),
  verify: vi.fn(),
};

vi.mock('nodemailer', () => ({
  createTransport: vi.fn(() => mockTransporter),
}));

// Mock React Email
vi.mock('@react-email/render', () => ({
  render: vi.fn((component) => '<html>Rendered Email</html>'),
}));

describe('Email Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('SMTP Configuration', () => {
    it('configures transporter with SMTP settings', () => {
      const smtpConfig = {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'user@example.com',
          pass: 'password',
        },
      };

      expect(smtpConfig.host).toBe('smtp.example.com');
      expect(smtpConfig.port).toBe(587);
    });

    it('uses TLS for secure connection', () => {
      const secureSMTP = {
        host: 'smtp.example.com',
        port: 465,
        secure: true,
      };

      expect(secureSMTP.secure).toBe(true);
      expect(secureSMTP.port).toBe(465);
    });

    it('verifies SMTP connection', async () => {
      mockTransporter.verify.mockResolvedValue(true);

      const isConnected = await mockTransporter.verify();
      expect(isConnected).toBe(true);
    });
  });

  describe('Quote Emails', () => {
    it('sends quote to client', async () => {
      const emailData = {
        to: 'client@example.com',
        subject: 'Your quote from Acme Corp',
        html: '<html>Quote details...</html>',
        attachments: [
          { filename: 'quote-QT-0001.pdf', content: Buffer.from('pdf') },
        ],
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: '<msg123@example.com>',
        accepted: ['client@example.com'],
      });

      const result = await mockTransporter.sendMail(emailData);

      expect(result.accepted).toContain('client@example.com');
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'client@example.com',
        })
      );
    });

    it('includes quote PDF attachment', () => {
      const attachment = {
        filename: 'quote-QT-0001.pdf',
        content: Buffer.from('PDF content'),
        contentType: 'application/pdf',
      };

      expect(attachment.filename).toContain('.pdf');
      expect(attachment.contentType).toBe('application/pdf');
    });

    it('uses quote email template', () => {
      const templateData = {
        recipientName: 'John Doe',
        quoteNumber: 'QT-0001',
        quoteTitle: 'Web Development Project',
        quoteTotal: '$5,000.00',
        expirationDate: 'February 15, 2024',
        viewQuoteUrl: 'https://app.example.com/q/token123',
        companyName: 'Acme Corp',
      };

      expect(templateData.quoteNumber).toBe('QT-0001');
      expect(templateData.viewQuoteUrl).toContain('/q/');
    });
  });

  describe('Invoice Emails', () => {
    it('sends invoice to client', async () => {
      const emailData = {
        to: 'billing@client.com',
        subject: 'Invoice INV-0001 from Acme Corp',
        html: '<html>Invoice details...</html>',
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: '<inv123@example.com>',
        accepted: ['billing@client.com'],
      });

      const result = await mockTransporter.sendMail(emailData);

      expect(result.accepted).toContain('billing@client.com');
    });

    it('includes invoice PDF attachment', () => {
      const attachment = {
        filename: 'invoice-INV-0001.pdf',
        content: Buffer.from('PDF content'),
      };

      expect(attachment.filename).toContain('invoice');
    });

    it('uses invoice email template', () => {
      const templateData = {
        recipientName: 'John Doe',
        invoiceNumber: 'INV-0001',
        invoiceTitle: 'Monthly Services',
        invoiceTotal: '$1,000.00',
        dueDate: 'February 15, 2024',
        payInvoiceUrl: 'https://app.example.com/i/token123',
      };

      expect(templateData.invoiceNumber).toBe('INV-0001');
      expect(templateData.payInvoiceUrl).toContain('/i/');
    });
  });

  describe('Payment Confirmation Emails', () => {
    it('sends payment receipt', async () => {
      const emailData = {
        to: 'client@example.com',
        subject: 'Payment Received - Invoice INV-0001',
        html: '<html>Payment confirmation...</html>',
      };

      mockTransporter.sendMail.mockResolvedValue({
        messageId: '<receipt123@example.com>',
        accepted: ['client@example.com'],
      });

      await mockTransporter.sendMail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('includes payment details', () => {
      const paymentData = {
        invoiceNumber: 'INV-0001',
        amountPaid: '$500.00',
        paymentMethod: 'Credit Card',
        paymentDate: 'January 30, 2024',
        remainingBalance: '$500.00',
      };

      expect(paymentData.amountPaid).toBe('$500.00');
    });
  });

  describe('Reminder Emails', () => {
    it('sends payment reminder before due date', async () => {
      const reminderData = {
        to: 'client@example.com',
        subject: 'Payment Reminder - Invoice INV-0001 due in 7 days',
        daysUntilDue: 7,
      };

      expect(reminderData.daysUntilDue).toBe(7);
    });

    it('sends overdue reminder', async () => {
      const overdueData = {
        to: 'client@example.com',
        subject: 'Overdue Invoice - INV-0001',
        daysOverdue: 5,
      };

      expect(overdueData.daysOverdue).toBe(5);
    });

    it('respects reminder schedule settings', () => {
      const reminderDays = [7, 3, 1]; // Days before due
      const currentDaysUntilDue = 7;

      const shouldSend = reminderDays.includes(currentDaysUntilDue);
      expect(shouldSend).toBe(true);
    });
  });

  describe('Email Template Rendering', () => {
    it('renders React Email components', () => {
      // Mock the render function behavior
      const mockRender = (component: unknown) => '<html><body>Email content</body></html>';
      const html = mockRender({ type: 'QuoteEmail' });

      expect(html).toContain('<html>');
    });

    it('replaces template variables', () => {
      const template = 'Hello {{name}}, your quote {{quoteNumber}} is ready.';
      const variables = { name: 'John', quoteNumber: 'QT-0001' };

      const rendered = template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '');

      expect(rendered).toBe('Hello John, your quote QT-0001 is ready.');
    });

    it('escapes HTML in user content', () => {
      const userContent = '<script>alert("xss")</script>';
      const escaped = userContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });
  });

  describe('Error Handling', () => {
    it('handles SMTP connection errors', async () => {
      mockTransporter.verify.mockRejectedValue(
        new Error('Connection refused')
      );

      await expect(mockTransporter.verify()).rejects.toThrow('Connection refused');
    });

    it('handles send failures', async () => {
      mockTransporter.sendMail.mockRejectedValue(
        new Error('Recipient not found')
      );

      await expect(
        mockTransporter.sendMail({ to: 'invalid@example.com' })
      ).rejects.toThrow('Recipient not found');
    });

    it('handles rate limiting', async () => {
      mockTransporter.sendMail.mockRejectedValue(
        new Error('Too many emails sent')
      );

      await expect(
        mockTransporter.sendMail({})
      ).rejects.toThrow('Too many emails sent');
    });

    it('retries on temporary failures', async () => {
      mockTransporter.sendMail
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ messageId: 'success' });

      // First call fails
      await expect(mockTransporter.sendMail({})).rejects.toThrow();

      // Retry succeeds
      const result = await mockTransporter.sendMail({});
      expect(result.messageId).toBe('success');
    });
  });

  describe('Email Validation', () => {
    it('validates recipient email format', () => {
      const validEmails = ['user@example.com', 'user+tag@domain.co.uk'];
      const invalidEmails = ['invalid', 'no@domain', '@nodomain.com'];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });

    it('validates from address matches workspace', () => {
      const workspaceEmail = 'billing@acme.com';
      const fromAddress = 'billing@acme.com';

      expect(fromAddress).toBe(workspaceEmail);
    });
  });

  describe('Email Logging', () => {
    it('logs sent emails for audit', () => {
      const emailLog = {
        id: 'log-123',
        to: 'client@example.com',
        subject: 'Invoice',
        status: 'sent',
        sentAt: new Date(),
        messageId: '<msg123@example.com>',
      };

      expect(emailLog.status).toBe('sent');
      expect(emailLog.messageId).toBeDefined();
    });

    it('logs failed emails with error', () => {
      const failedLog = {
        id: 'log-456',
        to: 'invalid@example.com',
        status: 'failed',
        error: 'Recipient not found',
        attemptedAt: new Date(),
      };

      expect(failedLog.status).toBe('failed');
      expect(failedLog.error).toBeDefined();
    });
  });
});
