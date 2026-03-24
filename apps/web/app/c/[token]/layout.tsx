import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Contract - QuoteCraft',
  description: 'View and sign your contract',
  robots: { index: false, follow: false },
};

export default function ContractPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
