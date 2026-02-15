'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions';
import { InvoiceListItem } from '@/lib/invoices/types';
import { AlertCircle } from 'lucide-react';

const statusColors: Record<string, string> = {
  draft: 'border-gray-300 text-gray-600 bg-gray-50',
  sent: 'border-blue-300 text-blue-600 bg-blue-50',
  viewed: 'border-yellow-300 text-yellow-700 bg-yellow-50',
  partial: 'border-purple-300 text-purple-600 bg-purple-50',
  paid: 'bg-green-500 text-white border-green-500',
  overdue: 'bg-red-500 text-white border-red-500',
  voided: 'border-gray-300 text-gray-500 bg-gray-100',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface InvoiceColumnsOptions {
  onView?: (invoice: InvoiceListItem) => void;
  onEdit?: (invoice: InvoiceListItem) => void;
  onDelete?: (invoice: InvoiceListItem) => void;
  onDownload?: (invoice: InvoiceListItem) => void;
}

export function getInvoiceColumns(options: InvoiceColumnsOptions = {}): ColumnDef<InvoiceListItem>[] {
  const { onView, onEdit, onDelete, onDownload } = options;

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
        <DataTableColumnHeader column={column} title="Invoice ID" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium text-primary">
            #{row.getValue('invoiceNumber')}
          </div>
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
        const isOverdue = row.original.isOverdue && status !== 'paid' && status !== 'voided';

        return (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`capitalize ${statusColors[status] || statusColors.draft}`}
            >
              {status}
            </Badge>
            {isOverdue && (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="h-3 w-3" />
              </span>
            )}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'client',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
      cell: ({ row }) => {
        const client = row.original.client;
        const initials = client.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {initials}
            </div>
            <div>
              <div className="font-medium">{client.name}</div>
              {client.email && (
                <div className="text-sm text-muted-foreground">{client.email}</div>
              )}
            </div>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const client = row.original.client;
        const searchValue = value.toLowerCase();
        return (
          client.name.toLowerCase().includes(searchValue) ||
          (client.email?.toLowerCase().includes(searchValue) ?? false)
        );
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

        return (
          <div>
            <div className="font-medium">{formatCurrency(total)}</div>
            {amountDue > 0 && amountDue !== total && (
              <div className="text-sm text-orange-600">
                Due: {formatCurrency(amountDue)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'issueDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Issued Date" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">
            {formatDate(row.getValue('issueDate'))}
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
        return (
          <div className="text-muted-foreground">
            {formatDate(row.getValue('dueDate'))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            row={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        );
      },
    },
  ];
}

export const invoiceStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'voided', label: 'Voided' },
];
