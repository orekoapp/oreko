/**
 * Generate HTML for a signing certificate PDF.
 * This is a summary of all audit trail data for legal compliance.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface SigningCertificateData {
  documentType: 'quote' | 'contract';
  documentId: string;
  documentNumber: string;
  documentTitle: string;
  businessName: string;
  clientName: string;
  clientEmail: string;
  signerName: string;
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  documentHash: string | null;
  signatureImageUrl: string | null;
  termsSnapshot: string | null;
  events: Array<{
    type: string;
    timestamp: string;
    ipAddress: string | null;
    userAgent: string | null;
  }>;
}

export function generateSigningCertificateHtml(data: SigningCertificateData): string {
  const eventsHtml = data.events
    .map(
      (e) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(e.type)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(e.timestamp)}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">${escapeHtml(e.ipAddress || 'N/A')}</td>
      </tr>`
    )
    .join('');

  const signatureSection = data.signatureImageUrl
    ? `<div style="margin: 16px 0; padding: 16px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; text-align: center;">
        <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">Signature</p>
        <img src="${data.signatureImageUrl}" alt="Signature" style="max-height: 80px;" />
       </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937; line-height: 1.6; margin: 0; padding: 0; }
    .container { max-width: 700px; margin: 0 auto; padding: 40px; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    h2 { font-size: 16px; font-weight: 600; margin-top: 32px; margin-bottom: 12px; color: #374151; border-bottom: 2px solid #3b82f6; padding-bottom: 4px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-signed { background: #dcfce7; color: #166534; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    .detail-table td:first-child { font-weight: 600; color: #4b5563; width: 180px; padding: 6px 0; }
    .detail-table td:last-child { padding: 6px 0; }
    .hash { font-family: 'Courier New', monospace; font-size: 11px; word-break: break-all; background: #f3f4f6; padding: 8px 12px; border-radius: 4px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Signing Certificate</h1>
    <p style="color: #6b7280; margin-top: 0;">
      ${escapeHtml(data.documentType === 'quote' ? 'Quote' : 'Contract')}
      <strong>${escapeHtml(data.documentNumber)}</strong>
      <span class="badge badge-signed" style="margin-left: 8px;">Signed</span>
    </p>

    <h2>Document Details</h2>
    <table class="detail-table">
      <tr><td>Document</td><td>${escapeHtml(data.documentTitle)}</td></tr>
      <tr><td>Reference</td><td>${escapeHtml(data.documentNumber)}</td></tr>
      <tr><td>Business</td><td>${escapeHtml(data.businessName)}</td></tr>
      <tr><td>Client</td><td>${escapeHtml(data.clientName)}</td></tr>
    </table>

    <h2>Signer Details</h2>
    <table class="detail-table">
      <tr><td>Name</td><td>${escapeHtml(data.signerName)}</td></tr>
      <tr><td>Email</td><td>${escapeHtml(data.clientEmail)}</td></tr>
      <tr><td>Signed At</td><td>${escapeHtml(data.signedAt)}</td></tr>
      <tr><td>IP Address</td><td>${escapeHtml(data.ipAddress)}</td></tr>
      <tr><td>User Agent</td><td style="font-size: 11px;">${escapeHtml(data.userAgent)}</td></tr>
    </table>

    ${signatureSection}

    ${data.documentHash ? `
    <h2>Document Integrity</h2>
    <table class="detail-table">
      <tr><td>Algorithm</td><td>SHA-256</td></tr>
      <tr><td>Hash</td><td style="font-family: 'Courier New', monospace; font-size: 11px; word-break: break-all;">${escapeHtml(data.documentHash)}</td></tr>
    </table>
    <p style="font-size: 11px; color: #6b7280; margin-top: 8px;">This SHA-256 hash can be used to verify the document has not been modified since signing.</p>
    ` : ''}

    <h2>Audit Trail</h2>
    <table style="font-size: 13px;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Event</th>
          <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Timestamp</th>
          <th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">IP Address</th>
        </tr>
      </thead>
      <tbody>
        ${eventsHtml}
      </tbody>
    </table>

    <div class="footer">
      <p>This signing certificate was generated by QuoteCraft and contains a record of the electronic signing process.</p>
      <p>Generated: ${escapeHtml(new Date().toISOString())}</p>
    </div>
  </div>
</body>
</html>`;
}
