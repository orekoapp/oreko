'use client';

import { ColumnDef } from '@tanstack/react-table';
import { AlertCircle, Receipt } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from '@/components/ui/data-table';
import type { InvoiceListItem } from '@/lib/invoices/types';

const statusColors: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  draft: { variant: 'secondary' },
  sent: { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600' },
  viewed: { variant: 'default', className: 'bg-yellow-500 hover:bg-yellow-600' },
  partial: { variant: 'default', className: 'bg-purple-500 hover:bg-purple-600' },
  paid: { variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
  overdue: { variant: 'destructive' },
  voided: { variant: 'outline' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

interface CreateInvoiceColumnsProps {
  onView?: (invoice: InvoiceListItem) => void;
  onEdit?: (invoice: InvoiceListItem) => void;
  onDuplicate?: (invoice: InvoiceListItem) => void;
  onDelete?: (invoice: InvoiceListItem) => void;
  onDownload?: (invoice: InvoiceListItem) => void;
}

export function createInvoiceColumns({
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onDownload,
}: CreateInvoiceColumnsProps = {}): ColumnDef<InvoiceListItem>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'invoiceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice" />
      ),
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <Link href={`/invoices/${invoice.id}`} className="flex items-center gap-3 hover:underline">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{invoice.title}</p>
              <p className="text-xs text-muted-foreground">{invoice.invoiceNumber}</p>
            </div>
          </Link>
        );
      },
    },
    {
      accessorKey: 'client',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
      cell: ({ row }) => {
        const client = row.original.client;
        return (
          <div>
            <p className="text-sm">{client.company || client.name}</p>
            {client.company && (
              <p className="text-xs text-muted-foreground">{client.name}</p>
            )}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const client = row.original.client;
        const searchValue = value.toLowerCase();
        return (
          client.name.toLowerCase().includes(searchValue) ||
          (client.company?.toLowerCase().includes(searchValue) ?? false)
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const isOverdue = row.original.isOverdue;
        const statusConfig = statusColors[status] ?? statusColors.draft;

        return (
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig?.variant ?? 'secondary'} className={statusConfig?.className}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            {isOverdue && status !== 'paid' && status !== 'voided' && (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
              </span>
            )}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value === row.getValue(id);
      },
    },
    {
      accessorKey: 'total',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const total = row.getValue('total') as number;
        const amountDue = row.original.amountDue;
        const hasPartialPayment = amountDue > 0 && amountDue !== total;

        return (
          <div className="text-right whitespace-nowrap">
            <p className="font-medium">{formatCurrency(total)}</p>
            {hasPartialPayment && (
              <p className="text-xs text-orange-600">
                Due: {formatCurrency(amountDue)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'dueDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => {
        const dueDate = new Date(row.getValue('dueDate') as string);
        return (
          <div className="text-sm text-muted-foreground">
            {dueDate.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const status = row.original.status;
        const canDelete = status === 'draft' || status === 'voided';
        return (
          <DataTableRowActions
            row={row.original}
            onView={onView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={canDelete ? onDelete : undefined}
            onDownload={onDownload}
          />
        );
      },
    },
  ];
}
