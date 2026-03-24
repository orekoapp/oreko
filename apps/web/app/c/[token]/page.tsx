import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getContractInstanceByToken } from '@/lib/contracts/actions';
import { ContractSigningView } from './contract-signing-view';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params;
  const instance = await getContractInstanceByToken(token);
  return {
    title: instance?.contractName || 'Contract',
    description: 'View and sign your contract',
    robots: { index: false, follow: false },
  };
}

export default async function ContractSigningPage({ params }: PageProps) {
  const { token } = await params;
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  const instance = await getContractInstanceByToken(token);

  if (!instance) {
    notFound();
  }

  return (
    <ContractSigningView
      contract={instance}
      token={token}
      ipAddress={ipAddress}
      userAgent={userAgent}
    />
  );
}
