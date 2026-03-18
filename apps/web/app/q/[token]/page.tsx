'use client';

import { useEffect, useState } from 'react';
import { getQuoteByAccessToken, trackQuoteView, type PublicQuoteData } from '@/lib/quotes/portal-actions';
import { QuotePortalView } from '@/components/client-portal/quote-portal-view';
import { QuoteStatusBadge } from '@/components/client-portal/quote-portal-header';
import { QuotePortalSkeleton } from '@/components/client-portal/quote-portal-skeleton';
import { PortalDocumentShell } from '@/components/client-portal/portal-document-shell';

interface QuotePortalPageProps {
  params: Promise<{ token: string }>;
}

export default function QuotePortalPage({ params }: QuotePortalPageProps) {
  const [quote, setQuote] = useState<PublicQuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuote() {
      const resolvedParams = await params;
      const token = resolvedParams.token;
      setAccessToken(token);

      const result = await getQuoteByAccessToken(token);

      if (!result.success) {
        setError('error' in result ? String(result.error) : 'Quote not found');
        setLoading(false);
        return;
      }

      setQuote(result.quote);
      setLoading(false);

      // Track the view (fire and forget)
      trackQuoteView(token).catch(console.error);
    }

    loadQuote();
  }, [params]);

  if (loading) {
    return <QuotePortalSkeleton />;
  }

  if (error || !quote) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100/80 dark:bg-neutral-950">
        <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Quote Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This quote may have been deleted or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PortalDocumentShell
      business={quote.business}
      branding={quote.branding}
      documentType="quote"
      documentNumber={quote.quoteNumber}
      statusBadge={<QuoteStatusBadge status={quote.isExpired ? 'expired' : quote.status} />}
      onDownloadPdf={() => {
        // TODO: Implement public PDF download via access token
      }}
    >
      <QuotePortalView quote={quote} accessToken={accessToken!} />
    </PortalDocumentShell>
  );
}
