import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getQuotes } from '@/lib/quotes/actions';
import { QuotesDataTable } from '@/components/quotes/quotes-data-table';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Quotes',
};

export default async function QuotesPage() {
  const { quotes } = await getQuotes();

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

      <QuotesDataTable data={quotes} />
    </div>
  );
}
