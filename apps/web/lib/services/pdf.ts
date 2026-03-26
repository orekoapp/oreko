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

// Bug #77: Concurrency limiter to prevent OOM from too many simultaneous PDF generations
let activePdfCount = 0;
const MAX_CONCURRENT_PDFS = 3;
const PDF_SLOT_TIMEOUT = 30000; // 30s max wait for a slot

async function acquirePdfSlot(): Promise<void> {
  const start = Date.now();
  while (activePdfCount >= MAX_CONCURRENT_PDFS) {
    if (Date.now() - start > PDF_SLOT_TIMEOUT) {
      throw new Error('PDF generation service is busy. Please try again later.');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  activePdfCount++;
}

function releasePdfSlot(): void {
  activePdfCount--;
}

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

  // Bug #77: Limit concurrent PDF generations to prevent OOM
  await acquirePdfSlot();

  try {
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
  } finally {
    releasePdfSlot();
  }
}

// Bug #75: Comprehensive private IP detection (covers IPv4, IPv6-mapped, octal, decimal formats)
function isPrivateIp(hostname: string): boolean {
  // Strip IPv6 brackets
  let ip = hostname.replace(/^\[|\]$/g, '');

  // Handle IPv6-mapped IPv4 (e.g., ::ffff:127.0.0.1)
  const v4MappedMatch = ip.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i);
  if (v4MappedMatch && v4MappedMatch[1]) {
    ip = v4MappedMatch[1];
  }

  // IPv6 loopback
  if (ip === '::1') return true;

  // Handle decimal IP format (e.g., 2130706433 = 127.0.0.1)
  if (/^\d+$/.test(ip)) {
    const num = parseInt(ip, 10);
    if (num >= 0 && num <= 0xFFFFFFFF) {
      ip = [
        (num >>> 24) & 0xFF,
        (num >>> 16) & 0xFF,
        (num >>> 8) & 0xFF,
        num & 0xFF,
      ].join('.');
    }
  }

  // Handle octal IP format (e.g., 0177.0.0.1 = 127.0.0.1)
  if (/^0\d/.test(ip) || ip.includes('.0') && /\.\d/.test(ip)) {
    const parts = ip.split('.');
    if (parts.length === 4 && parts.every(p => /^0?\d+$/.test(p))) {
      const decoded = parts.map(p => p.startsWith('0') && p.length > 1 ? parseInt(p, 8) : parseInt(p, 10));
      if (decoded.every(n => !isNaN(n) && n >= 0 && n <= 255)) {
        ip = decoded.join('.');
      }
    }
  }

  // Standard IPv4 dotted-decimal checks
  const ipParts = ip.split('.');
  if (ipParts.length === 4 && ipParts.every(p => /^\d{1,3}$/.test(p))) {
    const octets = ipParts.map(Number);
    if (octets.some(o => o < 0 || o > 255)) return false;

    const a = octets[0]!;
    const b = octets[1]!;
    // 127.0.0.0/8 (loopback)
    if (a === 127) return true;
    // 10.0.0.0/8
    if (a === 10) return true;
    // 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 (link-local, including AWS metadata 169.254.169.254)
    if (a === 169 && b === 254) return true;
    // 0.0.0.0
    if (octets.every(o => o === 0)) return true;
  }

  return false;
}

// Bug #75 + #76: Validate URL is safe for PDF generation (prevent SSRF)
function validatePdfUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;

    const hostname = parsed.hostname;

    // Block 'localhost' and known internal hostnames
    if (hostname === 'localhost' || hostname.endsWith('.internal') || hostname.endsWith('.local')) {
      return false;
    }

    // Block private/internal IPs (comprehensive check)
    if (isPrivateIp(hostname)) {
      return false;
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

  // Bug #77: Limit concurrent PDF generations to prevent OOM
  await acquirePdfSlot();

  try {
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
  } finally {
    releasePdfSlot();
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
