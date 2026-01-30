import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'View Invoice',
  description: 'View and pay your invoice',
  robots: {
    index: false,
    follow: false,
  },
};

export default function InvoicePortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {children}
    </div>
  );
}
