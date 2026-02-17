import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRateCardById, getCategories } from '@/lib/rate-cards/actions';
import { getTaxRates } from '@/lib/settings/actions';
import { EditRateCardFormWrapper } from './edit-rate-card-form-wrapper';

interface EditRateCardPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRateCardPage({ params }: EditRateCardPageProps) {
  const { id } = await params;

  const [rateCard, categories, taxRates] = await Promise.all([
    getRateCardById(id).catch(() => null),
    getCategories(),
    getTaxRates(),
  ]);

  if (!rateCard) {
    notFound();
  }

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/rate-cards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Rate Card</h1>
          <p className="text-muted-foreground">{rateCard.name}</p>
        </div>
      </div>

      <EditRateCardFormWrapper
        rateCard={rateCard}
        categories={categories}
        taxRates={taxRates}
      />
    </div>
  );
}
