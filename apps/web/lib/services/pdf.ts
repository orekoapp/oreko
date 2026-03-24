import puppeteer, { Browser, Page } from 'puppeteer-core';

// PDF generation options
export interface PdfOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  scale?: number;
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

// Default PDF options
const defaultOptions: PdfOptions = {
  format: 'A4',
  landscape: false,
  margin: {
    top: '20mm',
    right: '15mm',
    bottom: '20mm',
    left: '15mm',
  },
  scale: 1,
  printBackground: true,
  displayHeaderFooter: false,
};

// Browser pool for reuse
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  // Bug #148: Check if existing browser is still alive before reusing
  if (browserInstance) {
    try {
      if (browserInstance.connected) {
        return browserInstance;
      }
    } catch {
      // Browser disconnected — fall through to create new one
    }
    browserInstance = null;
  }

  // In serverless environments (Vercel), use @sparticuz/chromium
  // In local dev, fall back to system Chrome/Chromium
  const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    const chromium = (await import('@sparticuz/chromium')).default;
    browserInstance = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
      defaultViewport: { width: 1280, height: 720 },
    });
  } else {
    // Local development: find system Chrome/Chromium
    const executablePath =
      (process.env.PUPPETEER_EXECUTABLE_PATH || findLocalChrome()).replace(/\\/g, '/');

    browserInstance = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });
  }

  return browserInstance;
}

/**
 * Find a local Chrome/Chromium executable for development
 */
function findLocalChrome(): string {
  const paths = [
    // Windows (native)
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    // Linux
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Windows (WSL)
    '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
    '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ];

  const fs = require('fs');
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) {
        // Puppeteer needs forward slashes on Windows
        return p.replace(/\\/g, '/');
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    'Could not find Chrome/Chromium. Set PUPPETEER_EXECUTABLE_PATH environment variable.'
  );
}

// Close browser instance
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

// Generate PDF from HTML
export async function generatePdfFromHtml(
  html: string,
  options: PdfOptions = {}
): Promise<Buffer> {
  // Limit HTML size to prevent DoS via massive content (e.g., thousands of line items)
  const MAX_HTML_SIZE = 2 * 1024 * 1024; // 2MB
  if (html.length > MAX_HTML_SIZE) {
    throw new Error('PDF content too large to generate');
  }

  const browser = await getBrowser();
  let page: Page | null = null;

  try {
    page = await browser.newPage();

    // HIGH #28: Disable JS before rendering to prevent script injection from user content
    await page.setJavaScriptEnabled(false);

    // Bug #147: Use domcontentloaded instead of networkidle0 to prevent
    // outbound requests from user content (SSRF via crafted image URLs).
    // Since we removed external Google Fonts import, no external requests needed.
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Wait for fonts to load (with timeout fallback)
    await page.evaluateHandle('document.fonts.ready').catch(() => {
      // Fonts may not be available in serverless - continue anyway
    });

    const mergedOptions = { ...defaultOptions, ...options };

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: mergedOptions.format,
      landscape: mergedOptions.landscape,
      margin: mergedOptions.margin,
      scale: mergedOptions.scale,
      printBackground: mergedOptions.printBackground,
      displayHeaderFooter: mergedOptions.displayHeaderFooter,
      headerTemplate: mergedOptions.headerTemplate,
      footerTemplate: mergedOptions.footerTemplate,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (page) {
      await page.close();
    }
  }
}

// Validate URL is safe for PDF generation (prevent SSRF)
function validatePdfUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    // Block private/internal IPs
    const hostname = parsed.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') ||
      hostname.startsWith('192.168.') ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.internal') ||
      hostname === '[::1]'
    ) {
      // Allow localhost only if it matches our own app URL
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || '';
      if (!baseUrl.includes(hostname)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Generate PDF from URL
export async function generatePdfFromUrl(
  url: string,
  options: PdfOptions = {}
): Promise<Buffer> {
  if (!validatePdfUrl(url)) {
    throw new Error('Invalid URL for PDF generation');
  }

  const browser = await getBrowser();
  let page: Page | null = null;

  try {
    page = await browser.newPage();

    // Disable JavaScript to prevent script injection
    await page.setJavaScriptEnabled(false);

    // Navigate to URL
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready').catch(() => {
      // Fonts may not be available in serverless - continue anyway
    });

    const mergedOptions = { ...defaultOptions, ...options };

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: mergedOptions.format,
      landscape: mergedOptions.landscape,
      margin: mergedOptions.margin,
      scale: mergedOptions.scale,
      printBackground: mergedOptions.printBackground,
      displayHeaderFooter: mergedOptions.displayHeaderFooter,
      headerTemplate: mergedOptions.headerTemplate,
      footerTemplate: mergedOptions.footerTemplate,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    if (page) {
      await page.close();
    }
  }
}

// Generate quote PDF
export async function generateQuotePdf(params: {
  quoteId: string;
  baseUrl: string;
}): Promise<Buffer> {
  const { quoteId, baseUrl } = params;
  const url = `${baseUrl}/api/pdf/quote/${quoteId}`;

  return generatePdfFromUrl(url, {
    displayHeaderFooter: true,
    footerTemplate: `
      <div style="width: 100%; font-size: 10px; padding: 5px 15mm; color: #666; display: flex; justify-content: space-between;">
        <span>Quote ID: ${quoteId}</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });
}

// Generate invoice PDF
export async function generateInvoicePdf(params: {
  invoiceId: string;
  baseUrl: string;
}): Promise<Buffer> {
  const { invoiceId, baseUrl } = params;
  const url = `${baseUrl}/api/pdf/invoice/${invoiceId}`;

  return generatePdfFromUrl(url, {
    displayHeaderFooter: true,
    footerTemplate: `
      <div style="width: 100%; font-size: 10px; padding: 5px 15mm; color: #666; display: flex; justify-content: space-between;">
        <span>Invoice ID: ${invoiceId}</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });
}

// Simple HTML template for quotes/invoices
export function createPdfTemplate(params: {
  title: string;
  content: string;
  styles?: string;
}): string {
  const { title, content, styles = '' } = params;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          /* Font loaded from system stack — removed external Google Fonts import to prevent IP leakage */

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

          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
          }

          .logo {
            max-height: 60px;
            max-width: 200px;
          }

          .document-title {
            font-size: 28px;
            font-weight: 700;
            color: #111827;
            text-transform: uppercase;
          }

          .document-number {
            font-size: 14px;
            color: #6b7280;
            margin-top: 4px;
          }

          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 32px;
          }

          .info-block {
            flex: 1;
          }

          .info-label {
            font-size: 10px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }

          .info-value {
            color: #374151;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }

          th {
            background-color: #f9fafb;
            text-align: left;
            padding: 12px;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            border-bottom: 2px solid #e5e7eb;
          }

          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }

          .text-right {
            text-align: right;
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
            font-size: 16px;
            font-weight: 700;
            border-bottom: 2px solid #111827;
            border-top: 2px solid #111827;
            padding: 12px 0;
          }

          .notes {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }

          .notes-title {
            font-weight: 600;
            margin-bottom: 8px;
          }

          .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }

          .signature-block {
            width: 45%;
          }

          .signature-line {
            border-top: 1px solid #374151;
            margin-top: 40px;
            padding-top: 8px;
            font-size: 11px;
            color: #6b7280;
          }

          ${styles}
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
}
