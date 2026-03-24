'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { createQuoteColumns } from './quote-columns';
import { duplicateQuote, deleteQuote } from '@/lib/quotes/actions';
import type { QuoteListItem } from '@/lib/quotes/types';

interface QuoteTableProps {
  quotes: QuoteListItem[];
  isLoading?: boolean;
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
  { value: 'converted', label: 'Converted' },
];

export function QuoteTable({ quotes, isLoading = false }: QuoteTableProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleView = (quote: QuoteListItem) => {
    router.push(`/quotes/${quote.id}`);
  };

  const handleEdit = (quote: QuoteListItem) => {
    router.push(`/quotes/${quote.id}/edit`);
  };

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

  const handleDownload = (quote: QuoteListItem) => {
    // Open PDF in new tab
    window.open(`/api/download/quote/${quote.id}`, '_blank');
  };

  const columns = createQuoteColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDuplicate: handleDuplicate,
    onDelete: handleDelete,
    onDownload: handleDownload,
  });

  return (
    <DataTable
      columns={columns}
      data={quotes}
      filterKey="client"
      filterPlaceholder="Search quotes..."
      statusOptions={statusOptions}
      statusFilterKey="status"
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center gap-2">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No quotes found</p>
        </div>
      }
    />
  );
}
