'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table/data-table';
import { BulkAction } from '@/components/ui/data-table/data-table-toolbar';
import { getInvoiceColumns, invoiceStatusOptions } from './invoices-columns';
import { InvoiceListItem } from '@/lib/invoices/types';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { deleteInvoice, duplicateInvoice } from '@/lib/invoices/actions';

interface InvoicesDataTableProps {
  data: InvoiceListItem[];
}

export function InvoicesDataTable({ data }: InvoicesDataTableProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

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

  const columns = getInvoiceColumns({
    onView: (invoice) => {
      router.push(`/invoices/${invoice.id}`);
    },
    onEdit: (invoice) => {
      router.push(`/invoices/${invoice.id}/edit`);
    },
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    onDownload: (invoice) => {
      window.open(`/api/pdf/invoice/${invoice.id}`, '_blank');
    },
  });

  const bulkActions: BulkAction<InvoiceListItem>[] = [
    {
      label: 'Delete',
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      variant: 'destructive',
      onClick: async (rows) => {
        const drafts = rows.filter((r) => r.status === 'draft');
        if (drafts.length === 0) {
          toast.error('Only draft invoices can be deleted');
          return;
        }
        setIsProcessing(true);
        try {
          let deleted = 0;
          for (const invoice of drafts) {
            const result = await deleteInvoice(invoice.id);
            if (result.success) deleted++;
          }
          toast.success(`${deleted} invoice(s) deleted`);
          router.refresh();
        } catch {
          toast.error('Failed to delete invoices');
        } finally {
          setIsProcessing(false);
        }
      },
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No invoices yet</h3>
      <p className="text-muted-foreground mb-4">
        Create your first invoice or convert a quote to an invoice
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/quotes">View Quotes</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      filterKey="client"
      filterPlaceholder="Search invoices..."
      statusOptions={invoiceStatusOptions}
      statusFilterKey="status"
      pageSizes={[10, 25, 50, 100]}
      emptyState={emptyState}
      onRowClick={(invoice) => router.push(`/invoices/${invoice.id}`)}
      bulkActions={bulkActions}
    />
  );
}
