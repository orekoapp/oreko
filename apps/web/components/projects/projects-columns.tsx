'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions';
import { FolderKanban, FileText, Receipt, Pencil, Trash2, Power, PowerOff, CheckCircle2, XCircle } from 'lucide-react';

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  client: {
    id: string;
    name: string;
    company: string | null;
    email: string;
  };
  _count: {
    quotes: number;
    invoices: number;
    contractInstances: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectColumnsOptions {
  onView?: (project: ProjectListItem) => void;
  onEdit?: (project: ProjectListItem) => void;
  onDelete?: (project: ProjectListItem) => void;
  onCreateQuote?: (project: ProjectListItem) => void;
  onCreateInvoice?: (project: ProjectListItem) => void;
  onToggleActive?: (project: ProjectListItem) => void;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getProjectColumns(options: ProjectColumnsOptions = {}): ColumnDef<ProjectListItem>[] {
  const { onView, onEdit, onDelete, onCreateQuote, onCreateInvoice, onToggleActive } = options;

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
        <DataTableColumnHeader column={column} title="Project" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium text-primary">
            {row.original.name}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const project = row.original;
        const searchValue = value.toLowerCase();
        return (
          project.name.toLowerCase().includes(searchValue) ||
          (project.client.company?.toLowerCase().includes(searchValue) ?? false) ||
          project.client.name.toLowerCase().includes(searchValue)
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge
            variant="outline"
            className={`gap-1 ${
              isActive
                ? 'border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-950'
                : 'border-gray-300 text-gray-600 bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-900'
            }`}
          >
            {isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (value === 'active') return row.original.isActive === true;
        if (value === 'inactive') return row.original.isActive === false;
        return true;
      },
    },
    {
      accessorKey: 'client',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
      cell: ({ row }) => {
        const client = row.original.client;
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
              <div className="font-medium">{displayName}</div>
              {client.email && (
                <div className="text-sm text-muted-foreground">{client.email}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const project = row.original;
        return (
          <DataTableRowActions
            row={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            actions={[
              ...(onView ? [{ label: 'View Details', icon: <FolderKanban className="mr-2 h-4 w-4" />, onClick: onView }] : []),
              ...(onEdit ? [{ label: 'Edit', icon: <Pencil className="mr-2 h-4 w-4" />, onClick: onEdit }] : []),
              ...(onCreateQuote ? [{ label: 'Create Quote', icon: <FileText className="mr-2 h-4 w-4" />, onClick: onCreateQuote, separator: true }] : []),
              ...(onCreateInvoice ? [{ label: 'Create Invoice', icon: <Receipt className="mr-2 h-4 w-4" />, onClick: onCreateInvoice }] : []),
              ...(onToggleActive ? [{
                label: project.isActive ? 'Deactivate' : 'Reactivate',
                icon: project.isActive
                  ? <PowerOff className="mr-2 h-4 w-4" />
                  : <Power className="mr-2 h-4 w-4" />,
                onClick: onToggleActive,
                separator: true,
              }] : []),
              ...(onDelete ? [{ label: 'Delete', icon: <Trash2 className="mr-2 h-4 w-4" />, onClick: onDelete, variant: 'destructive' as const, separator: !onToggleActive }] : []),
            ]}
          />
        );
      },
    },
  ];
}

export const projectStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
