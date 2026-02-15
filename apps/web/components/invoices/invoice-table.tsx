'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { createInvoiceColumns } from './invoice-columns';
import { duplicateInvoice, deleteInvoice } from '@/lib/invoices/actions';
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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleView = (invoice: InvoiceListItem) => {
    router.push(`/invoices/${invoice.id}`);
  };

  const handleEdit = (invoice: InvoiceListItem) => {
    router.push(`/invoices/${invoice.id}/edit`);
  };

  const handleDuplicate = async (invoice: InvoiceListItem) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await duplicateInvoice(invoice.id);
      if (result.success && result.invoiceId) {
        toast.success('Invoice duplicated successfully');
        router.push(`/invoices/${result.invoiceId}`);
      } else {
        toast.error(result.error || 'Failed to duplicate invoice');
      }
    } catch (error) {
      toast.error('Failed to duplicate invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (invoice: InvoiceListItem) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await deleteInvoice(invoice.id);
      if (result.success) {
        toast.success('Invoice deleted successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete invoice');
      }
    } catch (error) {
      toast.error('Failed to delete invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (invoice: InvoiceListItem) => {
    // Open PDF in new tab
    window.open(`/api/pdf/invoice/${invoice.id}`, '_blank');
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
