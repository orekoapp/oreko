import { Metadata } from 'next';
import { getInvoiceByAccessToken, trackInvoiceView } from '@/lib/invoices/portal-actions';
import { InvoicePortalView } from '@/components/client-portal/invoice-portal-view';
import { InvoicePortalHeader } from '@/components/client-portal/invoice-portal-header';

interface InvoicePortalPageProps {
  params: Promise<{ token: string }>;
}

// Bug #250: Server-side data fetching for invoice portal (SEO + faster initial paint)
export async function generateMetadata({ params }: InvoicePortalPageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await getInvoiceByAccessToken(token);

  if (!result.success) {
    return { title: 'Invoice Not Found — QuoteCraft' };
  }

  return {
    title: `Invoice ${result.invoice.invoiceNumber} — ${result.invoice.business.name}`,
    description: `View invoice ${result.invoice.invoiceNumber} from ${result.invoice.business.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function InvoicePortalPage({ params }: InvoicePortalPageProps) {
  const { token } = await params;
  const result = await getInvoiceByAccessToken(token);

  if (!result.success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Invoice Not Found</h1>
          <p className="text-muted-foreground">
            {result.error || 'This invoice may have been deleted or the link is invalid.'}
          </p>
        </div>
      </div>
    );
  }

  // Track the view (fire and forget — don't block render)
  trackInvoiceView(token).catch(console.error);

  return (
    <div className="min-h-screen">
      <InvoicePortalHeader invoice={result.invoice} />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <InvoicePortalView invoice={result.invoice} accessToken={token} />
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          Powered by{' '}
          <a href="/" className="font-medium text-foreground hover:underline">
            QuoteCraft
          </a>
        </div>
      </footer>
    </div>
  );
}
