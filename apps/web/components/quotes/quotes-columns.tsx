'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions, RowAction } from '@/components/ui/data-table/data-table-row-actions';
import { QuoteListItem } from '@/lib/quotes/types';
import { Eye, Pencil, Send, Link2, FileOutput, Copy, Download, Trash2 } from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  draft: 'border-gray-300 text-gray-600 bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-900',
  sent: 'border-blue-300 text-blue-600 bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:bg-blue-950',
  viewed: 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:bg-yellow-950',
  accepted: 'border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-950',
  declined: 'border-red-300 text-red-600 bg-red-50 dark:border-red-600 dark:text-red-400 dark:bg-red-950',
  expired: 'border-orange-300 text-orange-600 bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:bg-orange-950',
  converted: 'border-purple-300 text-purple-600 bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:bg-purple-950',
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

interface QuoteColumnsOptions {
  onView?: (quote: QuoteListItem) => void;
  onEdit?: (quote: QuoteListItem) => void;
  onDuplicate?: (quote: QuoteListItem) => void;
  onDelete?: (quote: QuoteListItem) => void;
  onDownload?: (quote: QuoteListItem) => void;
  onSend?: (quote: QuoteListItem) => void;
  onCopyLink?: (quote: QuoteListItem) => void;
  onConvertToInvoice?: (quote: QuoteListItem) => void;
}

export function getQuoteColumns(options: QuoteColumnsOptions = {}): ColumnDef<QuoteListItem>[] {
  const {
    onView, onEdit, onDuplicate, onDelete, onDownload,
    onSend, onCopyLink, onConvertToInvoice,
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
      accessorKey: 'quoteNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quote ID" />
      ),
      cell: ({ row }) => {
        return (
          <Link href={`/quotes/${row.original.id}`} className="font-medium text-primary hover:underline">
            #{row.getValue('quoteNumber')}
          </Link>
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

        return (
          <Badge
            variant="outline"
            className={`capitalize ${statusColors[status] || statusColors.draft}`}
          >
            {status}
          </Badge>
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

        if (!client) {
          return (
            <div className="text-muted-foreground italic">No client</div>
          );
        }

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
        if (!client) return false;
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
        return (
          <div className="font-medium">{formatCurrency(row.getValue('total'))}</div>
        );
      },
    },
    {
      accessorKey: 'issueDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Issue Date" />
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
      accessorKey: 'expirationDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expires" />
      ),
      cell: ({ row }) => {
        const expirationDate = row.getValue('expirationDate') as string | null;
        return (
          <div className="text-muted-foreground">
            {expirationDate ? formatDate(expirationDate) : '-'}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const quote = row.original;
        const actions: RowAction<QuoteListItem>[] = [];

        if (onView) {
          actions.push({
            label: 'View',
            icon: <Eye className="mr-2 h-4 w-4" />,
            onClick: onView,
          });
        }
        if (onEdit) {
          actions.push({
            label: 'Edit',
            icon: <Pencil className="mr-2 h-4 w-4" />,
            onClick: onEdit,
          });
        }
        if (onSend) {
          actions.push({
            label: 'Send Quote',
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
        if (onConvertToInvoice && quote.status !== 'converted' && quote.status !== 'declined') {
          actions.push({
            label: 'Convert to Invoice',
            icon: <FileOutput className="mr-2 h-4 w-4" />,
            onClick: onConvertToInvoice,
            separator: true,
          });
        }
        if (onDuplicate) {
          actions.push({
            label: 'Duplicate',
            icon: <Copy className="mr-2 h-4 w-4" />,
            onClick: onDuplicate,
            separator: !onConvertToInvoice || quote.status === 'converted' || quote.status === 'declined',
          });
        }
        if (onDownload) {
          actions.push({
            label: 'Download PDF',
            icon: <Download className="mr-2 h-4 w-4" />,
            onClick: onDownload,
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
            row={quote}
            actions={actions}
            onView={onView}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
}

export const quoteStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'expired', label: 'Expired' },
  { value: 'converted', label: 'Converted' },
];
