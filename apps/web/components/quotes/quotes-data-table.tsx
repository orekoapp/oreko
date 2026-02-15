'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table/data-table';
import { getQuoteColumns, quoteStatusOptions } from './quotes-columns';
import { QuoteListItem } from '@/lib/quotes/types';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { duplicateQuote, deleteQuote } from '@/lib/quotes/actions';

interface QuotesDataTableProps {
  data: QuoteListItem[];
}

export function QuotesDataTable({ data }: QuotesDataTableProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDuplicate = async (quote: QuoteListItem) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await duplicateQuote(quote.id);
      if (result.success && result.quoteId) {
        toast.success('Quote duplicated successfully');
        router.push(`/quotes/${result.quoteId}`);
      } else {
        toast.error('Failed to duplicate quote');
      }
    } catch (error) {
      toast.error('Failed to duplicate quote');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (quote: QuoteListItem) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await deleteQuote(quote.id);
      if (result.success) {
        toast.success('Quote deleted successfully');
        router.refresh();
      } else {
        toast.error('Failed to delete quote');
      }
    } catch (error) {
      toast.error('Failed to delete quote');
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = getQuoteColumns({
    onView: (quote) => {
      router.push(`/quotes/${quote.id}`);
    },
    onEdit: (quote) => {
      router.push(`/quotes/${quote.id}/edit`);
    },
    onDuplicate: handleDuplicate,
    onDelete: handleDelete,
    onDownload: (quote) => {
      window.open(`/api/pdf/quote/${quote.id}`, '_blank');
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
