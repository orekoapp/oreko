'use client';

import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table/data-table';
import { getInvoiceColumns, invoiceStatusOptions } from './invoices-columns';
import { InvoiceListItem } from '@/lib/invoices/types';
import { Receipt, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface InvoicesDataTableProps {
  data: InvoiceListItem[];
}

export function InvoicesDataTable({ data }: InvoicesDataTableProps) {
  const router = useRouter();

  const columns = getInvoiceColumns({
    onView: (invoice) => {
      router.push(`/invoices/${invoice.id}`);
    },
    onEdit: (invoice) => {
      router.push(`/invoices/${invoice.id}/edit`);
    },
    onDelete: (invoice) => {
      // TODO: Implement delete with confirmation modal
      console.log('Delete invoice:', invoice.id);
    },
    onDownload: (invoice) => {
      // TODO: Implement PDF download
      console.log('Download invoice:', invoice.id);
    },
  });

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
      filterPlaceholder="Search clients..."
      statusOptions={invoiceStatusOptions}
      statusFilterKey="status"
      pageSizes={[10, 25, 50, 100]}
      emptyState={emptyState}
    />
  );
}
