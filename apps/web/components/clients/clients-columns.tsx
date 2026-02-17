'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions';
import { ClientListItem } from '@/lib/clients/types';
import { Building2, User, FileText, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ClientColumnsOptions {
  onView?: (client: ClientListItem) => void;
  onEdit?: (client: ClientListItem) => void;
  onDelete?: (client: ClientListItem) => void;
  onCreateQuote?: (client: ClientListItem) => void;
  onCreateInvoice?: (client: ClientListItem) => void;
}

export function getClientColumns(options: ClientColumnsOptions = {}): ColumnDef<ClientListItem>[] {
  const { onView, onEdit, onDelete, onCreateQuote, onCreateInvoice } = options;

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
        const isCompany = client.type === 'company';

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              {isCompany ? (
                <Building2 className="h-5 w-5 text-muted-foreground" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="font-medium">{client.company || client.name}</div>
              {client.company && client.company !== client.name && (
                <div className="text-sm text-muted-foreground">{client.name}</div>
              )}
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
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contact" />
      ),
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div>
            <div className="text-sm">{client.email}</div>
            {client.phone && (
              <div className="text-sm text-muted-foreground">{client.phone}</div>
            )}
          </div>
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
      accessorKey: 'totalQuotes',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quotes" />
      ),
      cell: ({ row }) => {
        return (
          <Badge variant="secondary">{row.getValue('totalQuotes')}</Badge>
        );
      },
    },
    {
      accessorKey: 'totalInvoices',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoices" />
      ),
      cell: ({ row }) => {
        return (
          <Badge variant="secondary">{row.getValue('totalInvoices')}</Badge>
        );
      },
    },
    {
      accessorKey: 'totalRevenue',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Revenue" />
      ),
      cell: ({ row }) => {
        const revenue = row.getValue('totalRevenue') as number;
        return (
          <div className="font-medium">{formatCurrency(revenue)}</div>
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
            actions={[
              ...(onView ? [{ label: 'View Details', icon: <User className="mr-2 h-4 w-4" />, onClick: onView }] : []),
              ...(onEdit ? [{ label: 'Edit', icon: <span className="mr-2 h-4 w-4">✏️</span>, onClick: onEdit }] : []),
              ...(onCreateQuote ? [{ label: 'Create Quote', icon: <FileText className="mr-2 h-4 w-4" />, onClick: onCreateQuote, separator: true }] : []),
              ...(onCreateInvoice ? [{ label: 'Create Invoice', icon: <Receipt className="mr-2 h-4 w-4" />, onClick: onCreateInvoice }] : []),
              ...(onDelete ? [{ label: 'Delete', icon: <span className="mr-2 h-4 w-4">🗑️</span>, onClick: onDelete, variant: 'destructive' as const, separator: true }] : []),
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
