export const dynamic = 'force-dynamic';

import { ContractSettingsForm } from '@/components/settings/contract-settings-form';
import { getContractSettings } from '@/lib/contracts/actions';

export const metadata = {
  title: 'Contract Settings',
};

export default async function ContractSettingsPage() {
  const settings = await getContractSettings();

  return <ContractSettingsForm initialData={settings} />;
}
