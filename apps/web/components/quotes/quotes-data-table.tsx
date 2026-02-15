'use client';

import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table/data-table';
import { getQuoteColumns, quoteStatusOptions } from './quotes-columns';
import { QuoteListItem } from '@/lib/quotes/types';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface QuotesDataTableProps {
  data: QuoteListItem[];
}

export function QuotesDataTable({ data }: QuotesDataTableProps) {
  const router = useRouter();

  const columns = getQuoteColumns({
    onView: (quote) => {
      router.push(`/quotes/${quote.id}`);
    },
    onEdit: (quote) => {
      router.push(`/quotes/${quote.id}/edit`);
    },
    onDuplicate: (quote) => {
      // TODO: Implement duplicate functionality
      console.log('Duplicate quote:', quote.id);
    },
    onDelete: (quote) => {
      // TODO: Implement delete with confirmation modal
      console.log('Delete quote:', quote.id);
    },
    onDownload: (quote) => {
      // TODO: Implement PDF download
      console.log('Download quote:', quote.id);
    },
  });

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No quotes yet</h3>
      <p className="text-muted-foreground mb-4">
        Create your first quote to get started
      </p>
      <Button asChild>
        <Link href="/quotes/new">
          <Plus className="mr-2 h-4 w-4" />
          Create Quote
        </Link>
      </Button>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      filterKey="client"
      filterPlaceholder="Search quotes..."
      statusOptions={quoteStatusOptions}
      statusFilterKey="status"
      pageSizes={[10, 25, 50, 100]}
      emptyState={emptyState}
    />
  );
}
