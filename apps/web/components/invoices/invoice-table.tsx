'use client';

import { useRouter } from 'next/navigation';
import { Receipt } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { createInvoiceColumns } from './invoice-columns';
import type { InvoiceListItem } from '@/lib/invoices/types';

interface InvoiceTableProps {
  invoices: InvoiceListItem[];
  isLoading?: boolean;
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'voided', label: 'Voided' },
];

export function InvoiceTable({ invoices, isLoading = false }: InvoiceTableProps) {
  const router = useRouter();

  const handleView = (invoice: InvoiceListItem) => {
    router.push(`/invoices/${invoice.id}`);
  };

  const handleEdit = (invoice: InvoiceListItem) => {
    router.push(`/invoices/${invoice.id}/edit`);
  };

  const handleDuplicate = (invoice: InvoiceListItem) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate invoice:', invoice.id);
  };

  const handleDelete = (invoice: InvoiceListItem) => {
    // TODO: Implement delete functionality with confirmation
    console.log('Delete invoice:', invoice.id);
  };

  const handleDownload = (invoice: InvoiceListItem) => {
    // TODO: Implement PDF download
    console.log('Download invoice:', invoice.id);
  };

  const columns = createInvoiceColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDuplicate: handleDuplicate,
    onDelete: handleDelete,
    onDownload: handleDownload,
  });

  return (
    <DataTable
      columns={columns}
      data={invoices}
      filterKey="client"
      filterPlaceholder="Search invoices..."
      statusOptions={statusOptions}
      statusFilterKey="status"
      isLoading={isLoading}
      emptyState={
        <div className="flex flex-col items-center gap-2">
          <Receipt className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No invoices found</p>
        </div>
      }
    />
  );
}
