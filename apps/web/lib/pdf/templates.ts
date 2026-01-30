import type { QuotePdfData, InvoicePdfData } from './types';

/**
 * Format currency for display
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format address from JSON
 */
function formatAddress(address: unknown): string {
  if (!address) return '';
  const addr = address as {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  const parts = [
    addr.street,
    [addr.city, addr.state, addr.zipCode].filter(Boolean).join(', '),
    addr.country,
  ].filter(Boolean);
  return parts.join('<br/>');
}

/**
 * Generate base styles for PDF templates
 */
function getBaseStyles(primaryColor: string = '#3B82F6'): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #1f2937;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }

    .logo {
      max-height: 60px;
      max-width: 200px;
    }

    .document-title {
      text-align: right;
    }

    .document-title h1 {
      font-size: 32px;
      font-weight: 700;
      color: ${primaryColor};
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .document-number {
      font-size: 14px;
      color: #6b7280;
    }

    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32px;
    }

    .party {
      flex: 1;
    }

    .party:first-child {
      padding-right: 20px;
    }

    .party:last-child {
      padding-left: 20px;
      text-align: right;
    }

    .party-label {
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }

    .party-name {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }

    .party-detail {
      color: #4b5563;
      font-size: 12px;
    }

    .meta-info {
      display: flex;
      justify-content: flex-start;
      gap: 40px;
      margin-bottom: 32px;
      padding: 16px;
      background-color: #f9fafb;
      border-radius: 8px;
    }

    .meta-item {
      text-align: left;
    }

    .meta-label {
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }

    .items-table th {
      background-color: ${primaryColor}10;
      text-align: left;
      padding: 12px;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${primaryColor};
      border-bottom: 2px solid ${primaryColor}30;
    }

    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }

    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
    }

    .item-name {
      font-weight: 500;
      color: #111827;
    }

    .item-description {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
    }

    .totals {
      margin-left: auto;
      width: 300px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .totals-row.total {
      font-size: 18px;
      font-weight: 700;
      color: ${primaryColor};
      border-bottom: none;
      border-top: 2px solid #111827;
      padding-top: 12px;
      margin-top: 8px;
    }

    .totals-label {
      color: #6b7280;
    }

    .totals-value {
      font-weight: 500;
    }

    .notes {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .notes-title {
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }

    .notes-content {
      color: #4b5563;
      white-space: pre-wrap;
    }

    .terms {
      margin-top: 24px;
      padding: 16px;
      background-color: #f9fafb;
      border-radius: 8px;
    }

    .terms-title {
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }

    .terms-content {
      color: #4b5563;
      font-size: 11px;
      white-space: pre-wrap;
    }

    .signature-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .signature-box {
      max-width: 300px;
    }

    .signature-label {
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }

    .signature-image {
      max-width: 250px;
      max-height: 80px;
      border-bottom: 1px solid #111827;
    }

    .signature-name {
      margin-top: 8px;
      font-weight: 500;
    }

    .signature-date {
      font-size: 11px;
      color: #6b7280;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-draft { background-color: #f3f4f6; color: #6b7280; }
    .status-sent { background-color: #dbeafe; color: #1d4ed8; }
    .status-viewed { background-color: #e0e7ff; color: #4338ca; }
    .status-accepted { background-color: #d1fae5; color: #047857; }
    .status-declined { background-color: #fee2e2; color: #b91c1c; }
    .status-paid { background-color: #d1fae5; color: #047857; }
    .status-partial { background-color: #fef3c7; color: #b45309; }
    .status-overdue { background-color: #fee2e2; color: #b91c1c; }

    .payments-section {
      margin-top: 24px;
    }

    .payments-title {
      font-weight: 600;
      color: #111827;
      margin-bottom: 12px;
    }

    .payment-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background-color: #f0fdf4;
      border-radius: 4px;
      margin-bottom: 4px;
    }

    .payment-info {
      color: #4b5563;
    }

    .payment-amount {
      font-weight: 600;
      color: #047857;
    }
  `;
}

/**
 * Generate quote PDF HTML
 */
export function generateQuotePdfHtml(data: QuotePdfData): string {
  const primaryColor = data.branding?.primaryColor || '#3B82F6';

  const lineItemsHtml = data.lineItems
    .map(
      (item) => `
      <tr>
        <td>
          <div class="item-name">${item.name}</div>
          ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
        </td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.rate, data.currency)}</td>
        ${item.taxRate ? `<td>${item.taxRate}%</td>` : '<td>-</td>'}
        <td>${formatCurrency(item.amount, data.currency)}</td>
      </tr>
    `
    )
    .join('');

  const signatureHtml = data.signature
    ? `
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-label">Client Signature</div>
          <img src="${data.signature.data}" alt="Signature" class="signature-image" />
          <div class="signature-name">${data.signature.signerName}</div>
          <div class="signature-date">Signed on ${formatDate(data.signature.signedAt)}</div>
        </div>
      </div>
    `
    : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Quote ${data.quoteNumber}</title>
        <style>${getBaseStyles(primaryColor)}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="business-info">
              ${data.business.logoUrl ? `<img src="${data.business.logoUrl}" alt="${data.business.name}" class="logo" />` : `<div class="party-name">${data.business.name}</div>`}
            </div>
            <div class="document-title">
              <h1>Quote</h1>
              <div class="document-number">${data.quoteNumber}</div>
            </div>
          </div>

          <div class="parties">
            <div class="party">
              <div class="party-label">From</div>
              <div class="party-name">${data.business.name}</div>
              ${data.business.email ? `<div class="party-detail">${data.business.email}</div>` : ''}
              ${data.business.phone ? `<div class="party-detail">${data.business.phone}</div>` : ''}
              ${data.business.address ? `<div class="party-detail">${formatAddress(data.business.address)}</div>` : ''}
            </div>
            <div class="party">
              <div class="party-label">To</div>
              <div class="party-name">${data.client.company || data.client.name}</div>
              ${data.client.company ? `<div class="party-detail">${data.client.name}</div>` : ''}
              <div class="party-detail">${data.client.email}</div>
              ${data.client.phone ? `<div class="party-detail">${data.client.phone}</div>` : ''}
              ${data.client.address ? `<div class="party-detail">${formatAddress(data.client.address)}</div>` : ''}
            </div>
          </div>

          <div class="meta-info">
            <div class="meta-item">
              <div class="meta-label">Issue Date</div>
              <div class="meta-value">${formatDate(data.issueDate)}</div>
            </div>
            ${
              data.expirationDate
                ? `
              <div class="meta-item">
                <div class="meta-label">Valid Until</div>
                <div class="meta-value">${formatDate(data.expirationDate)}</div>
              </div>
            `
                : ''
            }
            <div class="meta-item">
              <div class="meta-label">Status</div>
              <div class="meta-value">
                <span class="status-badge status-${data.status}">${data.status}</span>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Tax</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span class="totals-label">Subtotal</span>
              <span class="totals-value">${formatCurrency(data.totals.subtotal, data.currency)}</span>
            </div>
            ${
              data.totals.discountAmount > 0
                ? `
              <div class="totals-row">
                <span class="totals-label">Discount</span>
                <span class="totals-value">-${formatCurrency(data.totals.discountAmount, data.currency)}</span>
              </div>
            `
                : ''
            }
            ${
              data.totals.taxTotal > 0
                ? `
              <div class="totals-row">
                <span class="totals-label">Tax</span>
                <span class="totals-value">${formatCurrency(data.totals.taxTotal, data.currency)}</span>
              </div>
            `
                : ''
            }
            <div class="totals-row total">
              <span class="totals-label">Total</span>
              <span class="totals-value">${formatCurrency(data.totals.total, data.currency)}</span>
            </div>
          </div>

          ${
            data.notes
              ? `
            <div class="notes">
              <div class="notes-title">Notes</div>
              <div class="notes-content">${data.notes}</div>
            </div>
          `
              : ''
          }

          ${
            data.terms
              ? `
            <div class="terms">
              <div class="terms-title">Terms & Conditions</div>
              <div class="terms-content">${data.terms}</div>
            </div>
          `
              : ''
          }

          ${signatureHtml}
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate invoice PDF HTML
 */
export function generateInvoicePdfHtml(data: InvoicePdfData): string {
  const primaryColor = data.branding?.primaryColor || '#3B82F6';

  const lineItemsHtml = data.lineItems
    .map(
      (item) => `
      <tr>
        <td>
          <div class="item-name">${item.name}</div>
          ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
        </td>
        <td>${item.quantity}</td>
        <td>${formatCurrency(item.rate, data.currency)}</td>
        ${item.taxRate ? `<td>${item.taxRate}%</td>` : '<td>-</td>'}
        <td>${formatCurrency(item.amount, data.currency)}</td>
      </tr>
    `
    )
    .join('');

  const paymentsHtml =
    data.payments.length > 0
      ? `
      <div class="payments-section">
        <div class="payments-title">Payments Received</div>
        ${data.payments
          .map(
            (payment) => `
          <div class="payment-row">
            <span class="payment-info">${formatDate(payment.paidAt)} - ${payment.method}${payment.reference ? ` (${payment.reference})` : ''}</span>
            <span class="payment-amount">${formatCurrency(payment.amount, data.currency)}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `
      : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${data.invoiceNumber}</title>
        <style>${getBaseStyles(primaryColor)}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="business-info">
              ${data.business.logoUrl ? `<img src="${data.business.logoUrl}" alt="${data.business.name}" class="logo" />` : `<div class="party-name">${data.business.name}</div>`}
            </div>
            <div class="document-title">
              <h1>Invoice</h1>
              <div class="document-number">${data.invoiceNumber}</div>
            </div>
          </div>

          <div class="parties">
            <div class="party">
              <div class="party-label">From</div>
              <div class="party-name">${data.business.name}</div>
              ${data.business.email ? `<div class="party-detail">${data.business.email}</div>` : ''}
              ${data.business.phone ? `<div class="party-detail">${data.business.phone}</div>` : ''}
              ${data.business.address ? `<div class="party-detail">${formatAddress(data.business.address)}</div>` : ''}
            </div>
            <div class="party">
              <div class="party-label">Bill To</div>
              <div class="party-name">${data.client.company || data.client.name}</div>
              ${data.client.company ? `<div class="party-detail">${data.client.name}</div>` : ''}
              <div class="party-detail">${data.client.email}</div>
              ${data.client.phone ? `<div class="party-detail">${data.client.phone}</div>` : ''}
              ${data.client.address ? `<div class="party-detail">${formatAddress(data.client.address)}</div>` : ''}
            </div>
          </div>

          <div class="meta-info">
            <div class="meta-item">
              <div class="meta-label">Issue Date</div>
              <div class="meta-value">${formatDate(data.issueDate)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Due Date</div>
              <div class="meta-value">${formatDate(data.dueDate)}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Status</div>
              <div class="meta-value">
                <span class="status-badge status-${data.status}">${data.status}</span>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Tax</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineItemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span class="totals-label">Subtotal</span>
              <span class="totals-value">${formatCurrency(data.totals.subtotal, data.currency)}</span>
            </div>
            ${
              data.totals.discountAmount > 0
                ? `
              <div class="totals-row">
                <span class="totals-label">Discount</span>
                <span class="totals-value">-${formatCurrency(data.totals.discountAmount, data.currency)}</span>
              </div>
            `
                : ''
            }
            ${
              data.totals.taxTotal > 0
                ? `
              <div class="totals-row">
                <span class="totals-label">Tax</span>
                <span class="totals-value">${formatCurrency(data.totals.taxTotal, data.currency)}</span>
              </div>
            `
                : ''
            }
            <div class="totals-row">
              <span class="totals-label">Total</span>
              <span class="totals-value">${formatCurrency(data.totals.total, data.currency)}</span>
            </div>
            ${
              data.totals.amountPaid > 0
                ? `
              <div class="totals-row">
                <span class="totals-label">Amount Paid</span>
                <span class="totals-value" style="color: #047857;">-${formatCurrency(data.totals.amountPaid, data.currency)}</span>
              </div>
            `
                : ''
            }
            <div class="totals-row total">
              <span class="totals-label">Amount Due</span>
              <span class="totals-value">${formatCurrency(data.totals.amountDue, data.currency)}</span>
            </div>
          </div>

          ${paymentsHtml}

          ${
            data.notes
              ? `
            <div class="notes">
              <div class="notes-title">Notes</div>
              <div class="notes-content">${data.notes}</div>
            </div>
          `
              : ''
          }

          ${
            data.terms
              ? `
            <div class="terms">
              <div class="terms-title">Payment Terms</div>
              <div class="terms-content">${data.terms}</div>
            </div>
          `
              : ''
          }
        </div>
      </body>
    </html>
  `;
}
