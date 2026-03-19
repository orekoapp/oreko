export const dynamic = 'force-dynamic';

import { TaxRatesManager } from '@/components/settings';
import { getTaxRates } from '@/lib/settings/actions';

export const metadata = {
  title: 'Tax Rates - Settings',
};

export default async function TaxRatesSettingsPage() {
  const taxRates = await getTaxRates();

  return <TaxRatesManager initialData={taxRates} />;
}
