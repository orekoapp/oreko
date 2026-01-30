'use client';

import { useEffect, useState } from 'react';
import { getInvoiceByAccessToken, trackInvoiceView, type PublicInvoiceData } from '@/lib/invoices/portal-actions';
import { InvoicePortalView } from '@/components/client-portal/invoice-portal-view';
import { InvoicePortalHeader } from '@/components/client-portal/invoice-portal-header';
import { InvoicePortalSkeleton } from '@/components/client-portal/invoice-portal-skeleton';

interface InvoicePortalPageProps {
  params: Promise<{ token: string }>;
}

export default function InvoicePortalPage({ params }: InvoicePortalPageProps) {
  const [invoice, setInvoice] = useState<PublicInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      const resolvedParams = await params;
      const token = resolvedParams.token;
      setAccessToken(token);

      const result = await getInvoiceByAccessToken(token);

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setInvoice(result.invoice);
      setLoading(false);

      // Track the view (fire and forget)
      trackInvoiceView(token).catch(console.error);
    }

    loadInvoice();
  }, [params]);

  if (loading) {
    return <InvoicePortalSkeleton />;
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Invoice Not Found</h1>
          <p className="text-muted-foreground">
            {error || 'This invoice may have been deleted or the link is invalid.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <InvoicePortalHeader invoice={invoice} />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <InvoicePortalView invoice={invoice} accessToken={accessToken!} />
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
