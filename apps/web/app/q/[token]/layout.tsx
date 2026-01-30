import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'View Quote',
  description: 'View and respond to your quote',
  robots: {
    index: false,
    follow: false,
  },
};

export default function QuotePortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {children}
    </div>
  );
}
