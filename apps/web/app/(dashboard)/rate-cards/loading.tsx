import { CardGridSkeleton } from '@/components/shared';

export default function RateCardsLoading() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
      </div>
      <CardGridSkeleton cards={6} />
    </div>
  );
}
