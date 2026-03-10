import type { PdfProvider, PdfOptions } from './pdf';
import { generatePdfFromHtml, type PdfOptions as InternalPdfOptions } from '@/lib/services/pdf';

export class PuppeteerPdfProvider implements PdfProvider {
  name = 'puppeteer';

  async generate(html: string, options?: PdfOptions): Promise<Buffer> {
    const internalOptions: InternalPdfOptions = {};

    if (options?.format) {
      internalOptions.format = options.format;
    }
    if (options?.landscape !== undefined) {
      internalOptions.landscape = options.landscape;
    }
    if (options?.margin) {
      internalOptions.margin = options.margin;
    }

    return generatePdfFromHtml(html, internalOptions);
  }
}
