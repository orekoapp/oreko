'use client';

import { useEffect, useState } from 'react';

import { getQuoteByAccessToken, trackQuoteView, type PublicQuoteData } from '@/lib/quotes/portal-actions';
import { QuotePortalView } from '@/components/client-portal/quote-portal-view';
import { QuotePortalHeader } from '@/components/client-portal/quote-portal-header';
import { QuotePortalSkeleton } from '@/components/client-portal/quote-portal-skeleton';

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
        setError(result.error);
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Quote Not Found</h1>
          <p className="text-muted-foreground">
            {error || 'This quote may have been deleted or the link is invalid.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <QuotePortalHeader quote={quote} />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <QuotePortalView quote={quote} accessToken={accessToken!} />
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
