export interface PdfOptions {
  format?: 'A4' | 'Letter';
  landscape?: boolean;
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
}

export interface PdfProvider {
  name: string;
  generate(html: string, options?: PdfOptions): Promise<Buffer>;
}
