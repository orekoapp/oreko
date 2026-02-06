import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { RateCardList, CategoryManager } from '@/components/rate-cards';
import { getRateCards, getCategories, getRateCardStats } from '@/lib/rate-cards/actions';
import type { RateCardFilter, PricingType } from '@/lib/rate-cards/types';

interface RateCardsPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    pricingType?: string;
    isActive?: string;
    page?: string;
    limit?: string;
  }>;
}

export const metadata = {
  title: 'Rate Cards',
};

async function RateCardsContent({ searchParams }: RateCardsPageProps) {
  const params = await searchParams;

  const filter: RateCardFilter = {
    search: params.search,
    categoryId: params.categoryId,
    pricingType: params.pricingType as PricingType | undefined,
    isActive: params.isActive ? params.isActive === 'true' : undefined,
    page: params.page ? parseInt(params.page) : 1,
    limit: params.limit ? parseInt(params.limit) : 20,
  };

  const [rateCards, categories, stats] = await Promise.all([
    getRateCards(filter),
    getCategories(),
    getRateCardStats(),
  ]);

  return (
    <RateCardList
      initialData={rateCards}
      categories={categories}
      stats={stats}
    />
  );
}

export default async function RateCardsPage(props: RateCardsPageProps) {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rate Cards</h1>
          <p className="text-muted-foreground">
            Manage your service and product pricing
          </p>
        </div>
        <CategoryManager categories={categories} />
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </div>
        }
      >
        <RateCardsContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
