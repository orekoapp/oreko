import type { PaymentProvider } from './payment';
import type { PdfProvider } from './pdf';
import { StripeProvider } from './stripe-provider';
import { PuppeteerPdfProvider } from './puppeteer-pdf-provider';

let paymentProviderInstance: PaymentProvider | null = null;
let pdfProviderInstance: PdfProvider | null = null;

/**
 * Returns the configured payment provider.
 * Currently only supports Stripe.
 */
export function getPaymentProvider(): PaymentProvider {
  if (!paymentProviderInstance) {
    const provider = new StripeProvider();
    if (!provider.isEnabled()) {
      throw new Error(
        'No payment provider configured. Set STRIPE_SECRET_KEY to enable Stripe payments.'
      );
    }
    paymentProviderInstance = provider;
  }
  return paymentProviderInstance;
}

/**
 * Returns the configured PDF provider.
 * Currently only supports Puppeteer.
 */
export function getPdfProvider(): PdfProvider {
  if (!pdfProviderInstance) {
    pdfProviderInstance = new PuppeteerPdfProvider();
  }
  return pdfProviderInstance;
}

export type { PaymentProvider } from './payment';
export type { PdfProvider } from './pdf';
