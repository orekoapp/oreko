'use client';

import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { createQuoteColumns } from './quote-columns';
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

  const handleView = (quote: QuoteListItem) => {
    router.push(`/quotes/${quote.id}`);
  };

  const handleEdit = (quote: QuoteListItem) => {
    router.push(`/quotes/${quote.id}/builder`);
  };

  const handleDuplicate = (quote: QuoteListItem) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate quote:', quote.id);
  };

  const handleDelete = (quote: QuoteListItem) => {
    // TODO: Implement delete functionality with confirmation
    console.log('Delete quote:', quote.id);
  };

  const handleDownload = (quote: QuoteListItem) => {
    // TODO: Implement PDF download
    console.log('Download quote:', quote.id);
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
