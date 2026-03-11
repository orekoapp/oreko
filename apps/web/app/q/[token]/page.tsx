import { Metadata } from 'next';
import { getQuoteByAccessToken, trackQuoteView } from '@/lib/quotes/portal-actions';
import { QuotePortalView } from '@/components/client-portal/quote-portal-view';
import { QuotePortalHeader } from '@/components/client-portal/quote-portal-header';

interface QuotePortalPageProps {
  params: Promise<{ token: string }>;
}

// Bug #249: Server-side data fetching for quote portal (SEO + faster initial paint)
export async function generateMetadata({ params }: QuotePortalPageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await getQuoteByAccessToken(token);

  if (!result.success) {
    return { title: 'Quote Not Found — QuoteCraft' };
  }

  return {
    title: `Quote ${result.quote.quoteNumber} — ${result.quote.business.name}`,
    description: `View quote ${result.quote.quoteNumber} from ${result.quote.business.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function QuotePortalPage({ params }: QuotePortalPageProps) {
  const { token } = await params;
  const result = await getQuoteByAccessToken(token);

  if (!result.success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Quote Not Found</h1>
          <p className="text-muted-foreground">
            {result.error || 'This quote may have been deleted or the link is invalid.'}
          </p>
        </div>
      </div>
    );
  }

  // Track the view (fire and forget — don't block render)
  trackQuoteView(token).catch(console.error);

  return (
    <div className="min-h-screen">
      <QuotePortalHeader quote={result.quote} />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <QuotePortalView quote={result.quote} accessToken={token} />
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
