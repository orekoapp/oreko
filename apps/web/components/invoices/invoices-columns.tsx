'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions, RowAction } from '@/components/ui/data-table/data-table-row-actions';
import { InvoiceListItem } from '@/lib/invoices/types';
import { AlertCircle, Pencil, Send, Link2, Copy, Download, DollarSign, RefreshCw, Trash2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  draft: 'border-gray-300 text-gray-600 bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-900',
  sent: 'border-blue-300 text-blue-600 bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:bg-blue-950',
  viewed: 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:bg-yellow-950',
  partial: 'border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:bg-amber-950',
  paid: 'border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-950',
  overdue: 'border-red-300 text-red-600 bg-red-50 dark:border-red-600 dark:text-red-400 dark:bg-red-950',
  voided: 'border-gray-300 text-gray-500 bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-900',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  partial: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
  voided: 'Voided',
};

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
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
  onDuplicate?: (invoice: InvoiceListItem) => void;
  onDownload?: (invoice: InvoiceListItem) => void;
  onSend?: (invoice: InvoiceListItem) => void;
  onCopyLink?: (invoice: InvoiceListItem) => void;
  onRecordPayment?: (invoice: InvoiceListItem) => void;
  onRecurringSettings?: (invoice: InvoiceListItem) => void;
  recurringInvoiceIds?: Set<string>;
}

export function getInvoiceColumns(options: InvoiceColumnsOptions = {}): ColumnDef<InvoiceListItem>[] {
  const {
    onView, onEdit, onDelete, onDuplicate, onDownload,
    onSend, onCopyLink, onRecordPayment, onRecurringSettings,
    recurringInvoiceIds,
  } = options;

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
      id: 'Invoice ID',
      accessorKey: 'invoiceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice ID" />
      ),
      cell: ({ row }) => {
        const isRecurring = recurringInvoiceIds?.has(row.original.id);
        return (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="font-medium text-primary hover:underline text-left"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(row.original);
              }}
            >
              #{row.original.invoiceNumber}
            </button>
            {isRecurring && (
              <span title="Recurring invoice">
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
            )}
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
              {statusLabels[status] || status}
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
        const status = row.original.status;
        const curr = row.original.currency;

        return (
          <div className="whitespace-nowrap">
            <div className="font-medium">{formatCurrency(total, curr)}</div>
            {status === 'partial' && amountDue > 0 && (
              <div className="text-sm text-amber-600">
                {formatCurrency(amountDue, curr)} remaining
              </div>
            )}
            {status !== 'partial' && amountDue > 0 && amountDue !== total && (
              <div className="text-sm text-orange-600">
                Due: {formatCurrency(amountDue, curr)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'Issued Date',
      accessorKey: 'issueDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Issued Date" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">
            {formatDate(row.original.issueDate)}
          </div>
        );
      },
    },
    {
      id: 'Due Date',
      accessorKey: 'dueDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">
            {formatDate(row.original.dueDate)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original;
        const actions: RowAction<InvoiceListItem>[] = [];

        if (onEdit && invoice.status === 'draft') {
          actions.push({
            label: 'Edit',
            icon: <Pencil className="mr-2 h-4 w-4" />,
            onClick: onEdit,
          });
        }
        if (onSend) {
          const isSent = invoice.status !== 'draft';
          actions.push({
            label: isSent ? 'Resend Invoice' : 'Send Invoice',
            icon: <Send className="mr-2 h-4 w-4" />,
            onClick: onSend,
            separator: true,
          });
        }
        if (onCopyLink) {
          actions.push({
            label: 'Copy Link',
            icon: <Link2 className="mr-2 h-4 w-4" />,
            onClick: onCopyLink,
          });
        }
        if (onDuplicate) {
          actions.push({
            label: 'Duplicate',
            icon: <Copy className="mr-2 h-4 w-4" />,
            onClick: onDuplicate,
            separator: true,
          });
        }
        if (onDownload) {
          actions.push({
            label: 'Download PDF',
            icon: <Download className="mr-2 h-4 w-4" />,
            onClick: onDownload,
          });
        }
        if (onRecordPayment && invoice.status !== 'paid' && invoice.status !== 'voided') {
          actions.push({
            label: 'Record Payment',
            icon: <DollarSign className="mr-2 h-4 w-4" />,
            onClick: onRecordPayment,
            separator: true,
          });
        }
        if (onRecurringSettings) {
          actions.push({
            label: 'Recurring Settings',
            icon: <RefreshCw className="mr-2 h-4 w-4" />,
            onClick: onRecurringSettings,
          });
        }
        if (onDelete) {
          actions.push({
            label: 'Delete',
            icon: <Trash2 className="mr-2 h-4 w-4" />,
            onClick: onDelete,
            variant: 'destructive',
            separator: true,
          });
        }

        return (
          <DataTableRowActions
            row={invoice}
            actions={actions}
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
  { value: 'partial', label: 'Partially Paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'voided', label: 'Voided' },
];
