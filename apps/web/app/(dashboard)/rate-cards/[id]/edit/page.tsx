'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RateCardForm } from '@/components/rate-cards';
import {
  getRateCardById,
  updateRateCard,
  getCategories,
} from '@/lib/rate-cards/actions';
import type {
  CreateRateCardInput,
  RateCardDetail,
  CategoryListItem,
  PricingType,
} from '@/lib/rate-cards/types';
import { toast } from 'sonner';

export default function EditRateCardPage() {
  const router = useRouter();
  const params = useParams();
  const rateCardId = params.id as string;

  const [rateCard, setRateCard] = React.useState<RateCardDetail | null>(null);
  const [categories, setCategories] = React.useState<CategoryListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        const [rc, cats] = await Promise.all([
          getRateCardById(rateCardId),
          getCategories(),
        ]);
        setRateCard(rc);
        setCategories(cats);
      } catch {
        toast.error('Failed to load rate card');
        router.push('/rate-cards');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [rateCardId, router]);

  const handleSubmit = async (data: CreateRateCardInput) => {
    setIsSaving(true);
    try {
      await updateRateCard({ ...data, id: rateCardId });
      toast.success('Rate card updated successfully');
      router.push('/rate-cards');
    } catch {
      toast.error('Failed to update rate card');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-6">
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!rateCard) {
    return null;
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

      <RateCardForm
        defaultValues={{
          name: rateCard.name,
          description: rateCard.description || '',
          pricingType: rateCard.pricingType as PricingType,
          rate: rateCard.rate,
          unit: rateCard.unit || '',
          categoryId: rateCard.categoryId || '',
          taxRateId: rateCard.taxRateId || '',
          isActive: rateCard.isActive,
        }}
        categories={categories}
        taxRates={[]} // TODO: Load tax rates
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitLabel="Save Changes"
      />
    </div>
  );
}
