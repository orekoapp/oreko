'use client';

import { ColumnDef } from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DataTableColumnHeader,
  DataTableRowActions,
} from '@/components/ui/data-table';
import type { QuoteListItem, QuoteStatus } from '@/lib/quotes/types';

const statusColors: Record<QuoteStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  draft: { variant: 'secondary' },
  sent: { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600' },
  viewed: { variant: 'default', className: 'bg-yellow-500 hover:bg-yellow-600' },
  accepted: { variant: 'default', className: 'bg-green-500 hover:bg-green-600' },
  declined: { variant: 'destructive' },
  expired: { variant: 'default', className: 'bg-orange-500 hover:bg-orange-600' },
  converted: { variant: 'default', className: 'bg-purple-500 hover:bg-purple-600' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

interface CreateQuoteColumnsProps {
  onView?: (quote: QuoteListItem) => void;
  onEdit?: (quote: QuoteListItem) => void;
  onDuplicate?: (quote: QuoteListItem) => void;
  onDelete?: (quote: QuoteListItem) => void;
  onDownload?: (quote: QuoteListItem) => void;
}

export function createQuoteColumns({
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onDownload,
}: CreateQuoteColumnsProps = {}): ColumnDef<QuoteListItem>[] {
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
        <DataTableColumnHeader column={column} title="Quote" />
      ),
      cell: ({ row }) => {
        const quote = row.original;
        return (
          <Link href={`/quotes/${quote.id}`} className="flex items-center gap-3 hover:underline">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{quote.title}</p>
              <p className="text-xs text-muted-foreground">{quote.quoteNumber}</p>
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
        if (!client) {
          return (
            <div className="text-muted-foreground italic">No client</div>
          );
        }
        return (
          <div>
            <p className="text-sm">{client.name}</p>
            {client.email && (
              <p className="text-xs text-muted-foreground">{client.email}</p>
            )}
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
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as QuoteStatus;
        const statusConfig = statusColors[status] || statusColors.draft;

        return (
          <Badge variant={statusConfig.variant} className={statusConfig.className}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
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
        return (
          <div className="text-right font-medium">
            {formatCurrency(total)}
          </div>
        );
      },
    },
    {
      accessorKey: 'issueDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const issueDate = new Date(row.getValue('issueDate') as string);
        return (
          <div className="text-sm text-muted-foreground">
            {issueDate.toLocaleDateString()}
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
        if (!expirationDate) {
          return <div className="text-sm text-muted-foreground">-</div>;
        }
        const date = new Date(expirationDate);
        const isExpired = date < new Date();
        return (
          <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-muted-foreground'}`}>
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const status = row.original.status;
        const canDelete = status === 'draft';
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
