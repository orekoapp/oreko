'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions';
import { ContractInstanceListItem } from '@/lib/contracts/types';
import { FileText, Mail, Eye, CheckCircle2, Clock, Send } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  draft: {
    label: 'Draft',
    className: 'border-gray-300 text-gray-600 bg-gray-50',
    icon: <FileText className="h-3 w-3" />,
  },
  sent: {
    label: 'Sent',
    className: 'border-blue-300 text-blue-600 bg-blue-50',
    icon: <Mail className="h-3 w-3" />,
  },
  viewed: {
    label: 'Viewed',
    className: 'border-yellow-300 text-yellow-700 bg-yellow-50',
    icon: <Eye className="h-3 w-3" />,
  },
  signed: {
    label: 'Signed',
    className: 'bg-green-500 text-white border-green-500',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  expired: {
    label: 'Expired',
    className: 'bg-red-500 text-white border-red-500',
    icon: <Clock className="h-3 w-3" />,
  },
};

interface ContractColumnsOptions {
  onView?: (contract: ContractInstanceListItem) => void;
  onSend?: (contract: ContractInstanceListItem) => void;
  onDelete?: (contract: ContractInstanceListItem) => void;
}

export function getContractColumns(
  options: ContractColumnsOptions = {}
): ColumnDef<ContractInstanceListItem>[] {
  const { onView, onSend, onDelete } = options;

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
      accessorKey: 'contractName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contract" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium">{row.getValue('contractName')}</div>
        );
      },
      filterFn: (row, id, value) => {
        const searchValue = value.toLowerCase();
        const contractName = (row.getValue('contractName') as string).toLowerCase();
        const clientName = row.original.clientName.toLowerCase();
        return contractName.includes(searchValue) || clientName.includes(searchValue);
      },
    },
    {
      accessorKey: 'clientName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
      cell: ({ row }) => {
        const clientName = row.getValue('clientName') as string;
        const initials = clientName
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
            <div className="font-medium">{clientName}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'quoteName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quote" />
      ),
      cell: ({ row }) => {
        const quoteName = row.getValue('quoteName') as string | null;
        return (
          <div className="text-muted-foreground">{quoteName || '-'}</div>
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
        const config = statusConfig[status] ?? statusConfig.draft;

        return (
          <Badge variant="outline" className={`gap-1 ${config.className}`}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'signedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Signed" />
      ),
      cell: ({ row }) => {
        const signedAt = row.getValue('signedAt') as Date | null;
        return (
          <div className="text-muted-foreground">
            {signedAt ? formatDate(signedAt) : '-'}
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
            {formatDate(row.getValue('createdAt'))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const contract = row.original;
        const isDraft = contract.status === 'draft';

        return (
          <DataTableRowActions
            row={contract}
            onView={onView}
            onDelete={onDelete}
            actions={[
              ...(onView
                ? [
                    {
                      label: 'View',
                      icon: <Eye className="mr-2 h-4 w-4" />,
                      onClick: onView,
                    },
                  ]
                : []),
              ...(isDraft && onSend
                ? [
                    {
                      label: 'Send to Client',
                      icon: <Send className="mr-2 h-4 w-4" />,
                      onClick: onSend,
                      separator: true,
                    },
                  ]
                : []),
              ...(onDelete
                ? [
                    {
                      label: 'Delete',
                      icon: <span className="mr-2 h-4 w-4">🗑️</span>,
                      onClick: onDelete,
                      variant: 'destructive' as const,
                      separator: true,
                    },
                  ]
                : []),
            ]}
          />
        );
      },
    },
  ];
}

export const contractStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'signed', label: 'Signed' },
  { value: 'expired', label: 'Expired' },
];
