import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaxRatesManager } from '@/components/settings';
import { getTaxRates } from '@/lib/settings/actions';

export const metadata = {
  title: 'Tax Rates - Settings',
};

export default async function TaxRatesSettingsPage() {
  const taxRates = await getTaxRates();

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Tax Rates</h1>
          <p className="text-muted-foreground">
            Manage tax rates for your quotes and invoices
          </p>
        </div>
      </div>

      <TaxRatesManager initialData={taxRates} />
    </div>
  );
}
