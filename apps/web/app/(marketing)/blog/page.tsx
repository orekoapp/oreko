import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Blog | QuoteCraft',
  description: 'Tips, tutorials, and updates from the QuoteCraft team.',
};

export default function BlogPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Tips, tutorials, and updates from the QuoteCraft team.
        </p>

        <div className="rounded-lg border border-dashed p-12">
          <p className="text-lg font-medium mb-2">Coming Soon</p>
          <p className="text-muted-foreground mb-6">
            We are working on helpful content about invoicing, freelancing, and growing your business.
          </p>
          <Button asChild variant="outline">
            <a
              href="https://github.com/WisdmLabs/quote-software"
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow Us on GitHub for Updates
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
