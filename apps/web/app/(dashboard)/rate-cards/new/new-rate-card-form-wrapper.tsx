'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RateCardForm } from '@/components/rate-cards';
import { createRateCard } from '@/lib/rate-cards/actions';
import type { CreateRateCardInput, CategoryListItem } from '@/lib/rate-cards/types';
import { toast } from 'sonner';

interface NewRateCardFormWrapperProps {
  categories: CategoryListItem[];
  taxRates: Array<{ id: string; name: string; rate: number }>;
}

export function NewRateCardFormWrapper({ categories, taxRates }: NewRateCardFormWrapperProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSubmit = async (data: CreateRateCardInput) => {
    setIsSaving(true);
    try {
      await createRateCard(data);
      toast.success('Rate card created successfully');
      router.push('/rate-cards');
    } catch {
      toast.error('Failed to create rate card');
      setIsSaving(false);
    }
  };

  return (
    <RateCardForm
      categories={categories}
      taxRates={taxRates}
      onSubmit={handleSubmit}
      isLoading={isSaving}
      submitLabel="Create Rate Card"
    />
  );
}
