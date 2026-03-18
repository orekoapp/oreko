'use client';

import { useEffect, useState } from 'react';
import { getInvoiceByAccessToken, trackInvoiceView, type PublicInvoiceData } from '@/lib/invoices/portal-actions';
import { InvoicePortalView } from '@/components/client-portal/invoice-portal-view';
import { InvoiceStatusBadge } from '@/components/client-portal/invoice-portal-header';
import { InvoicePortalSkeleton } from '@/components/client-portal/invoice-portal-skeleton';
import { PortalDocumentShell } from '@/components/client-portal/portal-document-shell';

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
        setError('error' in result ? String(result.error) : 'Invoice not found');
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
      <div className="flex min-h-screen items-center justify-center bg-gray-100/80 dark:bg-neutral-950">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Invoice Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This invoice may have been deleted or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PortalDocumentShell
      business={invoice.business}
      branding={invoice.branding}
      documentType="invoice"
      documentNumber={invoice.invoiceNumber}
      statusBadge={<InvoiceStatusBadge status={invoice.status} />}
      onDownloadPdf={() => {
        window.open(`/api/download/invoice/${invoice.id}`, '_blank');
      }}
    >
      <InvoicePortalView invoice={invoice} accessToken={accessToken!} />
    </PortalDocumentShell>
  );
}
