import { MarketingHeader, MarketingFooter } from '@/components/landing';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      <main id="main-content" className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
