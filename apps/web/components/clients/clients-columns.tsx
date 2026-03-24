'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions';
import { ClientListItem } from '@/lib/clients/types';
import { User, FileText, Receipt, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ClientColumnsOptions {
  onView?: (client: ClientListItem) => void;
  onEdit?: (client: ClientListItem) => void;
  onDelete?: (client: ClientListItem) => void;
  onCreateQuote?: (client: ClientListItem) => void;
  onCreateInvoice?: (client: ClientListItem) => void;
  currency?: string;
}

export function getClientColumns(options: ClientColumnsOptions = {}): ColumnDef<ClientListItem>[] {
  const { onView, onEdit, onDelete, onCreateQuote, onCreateInvoice, currency = 'USD' } = options;

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
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
      cell: ({ row }) => {
        const client = row.original;
        const displayName = client.company || client.name;
        const initials = displayName
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
              <div className="font-medium text-primary">{displayName}</div>
              <div className="text-sm text-muted-foreground">{client.email}</div>
            </div>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const client = row.original;
        const searchValue = value.toLowerCase();
        return (
          client.name.toLowerCase().includes(searchValue) ||
          (client.company?.toLowerCase().includes(searchValue) ?? false) ||
          (client.email?.toLowerCase().includes(searchValue) ?? false)
        );
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <Badge variant="outline" className="capitalize">
            {type}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: 'revenue',
      accessorKey: 'totalRevenue',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Revenue" />
      ),
      cell: ({ row }) => {
        const revenue = row.original.totalRevenue as number;
        return (
          <div className="font-medium">{formatCurrency(revenue, currency)}</div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        // Low #89: Disable quick actions since custom actions array already has view/delete
        return (
          <DataTableRowActions
            row={row.original}
            showQuickActions={false}
            actions={[
              ...(onView ? [{ label: 'View Details', icon: <User className="mr-2 h-4 w-4" />, onClick: onView }] : []),
              ...(onEdit ? [{ label: 'Edit', icon: <Pencil className="mr-2 h-4 w-4" />, onClick: onEdit }] : []),
              ...(onCreateQuote ? [{ label: 'Create Quote', icon: <FileText className="mr-2 h-4 w-4" />, onClick: onCreateQuote, separator: true }] : []),
              ...(onCreateInvoice ? [{ label: 'Create Invoice', icon: <Receipt className="mr-2 h-4 w-4" />, onClick: onCreateInvoice }] : []),
              ...(onDelete ? [{ label: 'Delete', icon: <Trash2 className="mr-2 h-4 w-4" />, onClick: onDelete, variant: 'destructive' as const, separator: true }] : []),
            ]}
          />
        );
      },
    },
  ];
}

export const clientTypeOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'company', label: 'Company' },
];
