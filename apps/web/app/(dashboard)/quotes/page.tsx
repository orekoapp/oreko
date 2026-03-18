import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getQuotes } from '@/lib/quotes/actions';
import { QuotesDataTable } from '@/components/quotes/quotes-data-table';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Quotes',
  description: 'Manage and track your quotes',
};

// Low #70: Suspense boundary for streaming — header shows immediately, data loads async
export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">
            Create and manage your quotes and proposals
          </p>
        </div>
        <Button asChild>
          <Link href="/quotes/new">
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <QuotesContent />
      </Suspense>
    </div>
  );
}

async function QuotesContent() {
  const { quotes } = await getQuotes();
  return <QuotesDataTable data={quotes} />;
}

function TableSkeleton() {
  return (
    <div className="rounded-md border p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1 max-w-[200px]" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
