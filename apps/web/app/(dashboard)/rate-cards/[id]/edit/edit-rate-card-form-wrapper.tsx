'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RateCardForm } from '@/components/rate-cards';
import { updateRateCard } from '@/lib/rate-cards/actions';
import type {
  CreateRateCardInput,
  RateCardDetail,
  CategoryListItem,
  PricingType,
} from '@/lib/rate-cards/types';
import { toast } from 'sonner';

interface EditRateCardFormWrapperProps {
  rateCard: RateCardDetail;
  categories: CategoryListItem[];
  taxRates: Array<{ id: string; name: string; rate: number }>;
}

export function EditRateCardFormWrapper({
  rateCard,
  categories,
  taxRates,
}: EditRateCardFormWrapperProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSubmit = async (data: CreateRateCardInput) => {
    setIsSaving(true);
    try {
      await updateRateCard({ ...data, id: rateCard.id });
      toast.success('Rate card updated successfully');
      router.push('/rate-cards');
    } catch {
      toast.error('Failed to update rate card');
      setIsSaving(false);
    }
  };

  return (
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
      taxRates={taxRates}
      onSubmit={handleSubmit}
      isLoading={isSaving}
      submitLabel="Save Changes"
    />
  );
}
