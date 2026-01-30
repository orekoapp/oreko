'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RateCardForm } from '@/components/rate-cards';
import { createRateCard, getCategories } from '@/lib/rate-cards/actions';
import type { CreateRateCardInput, CategoryListItem } from '@/lib/rate-cards/types';
import { toast } from 'sonner';

export default function NewRateCardPage() {
  const router = useRouter();
  const [categories, setCategories] = React.useState<CategoryListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch {
        toast.error('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (data: CreateRateCardInput) => {
    setIsSaving(true);
    try {
      const result = await createRateCard(data);
      toast.success('Rate card created successfully');
      router.push('/rate-cards');
    } catch {
      toast.error('Failed to create rate card');
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

      <RateCardForm
        categories={categories}
        taxRates={[]} // TODO: Load tax rates
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitLabel="Create Rate Card"
      />
    </div>
  );
}
