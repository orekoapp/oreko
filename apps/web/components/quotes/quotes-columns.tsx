'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions';
import { QuoteListItem } from '@/lib/quotes/types';

const statusColors: Record<string, string> = {
  draft: 'border-gray-300 text-gray-600 bg-gray-50',
  sent: 'border-blue-300 text-blue-600 bg-blue-50',
  viewed: 'border-yellow-300 text-yellow-700 bg-yellow-50',
  accepted: 'border-green-300 text-green-600 bg-green-50',
  declined: 'border-red-300 text-red-600 bg-red-50',
  expired: 'border-orange-300 text-orange-600 bg-orange-50',
  converted: 'border-purple-300 text-purple-600 bg-purple-50',
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

interface QuoteColumnsOptions {
  onView?: (quote: QuoteListItem) => void;
  onEdit?: (quote: QuoteListItem) => void;
  onDuplicate?: (quote: QuoteListItem) => void;
  onDelete?: (quote: QuoteListItem) => void;
  onDownload?: (quote: QuoteListItem) => void;
}

export function getQuoteColumns(options: QuoteColumnsOptions = {}): ColumnDef<QuoteListItem>[] {
  const { onView, onEdit, onDuplicate, onDelete, onDownload } = options;

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
          <div className="font-medium text-primary">
            #{row.getValue('quoteNumber')}
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
        return (
          <DataTableRowActions
            row={row.original}
            onView={onView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onDownload={onDownload}
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
