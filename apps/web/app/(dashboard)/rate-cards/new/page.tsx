import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategories } from '@/lib/rate-cards/actions';
import { getTaxRates } from '@/lib/settings/actions';
import { NewRateCardFormWrapper } from './new-rate-card-form-wrapper';

export default async function NewRateCardPage() {
  const [categories, taxRates] = await Promise.all([
    getCategories(),
    getTaxRates(),
  ]);

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/rate-cards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Rate Card</h1>
          <p className="text-muted-foreground">Create a new service or product pricing</p>
        </div>
      </div>

      <NewRateCardFormWrapper categories={categories} taxRates={taxRates} />
    </div>
  );
}
