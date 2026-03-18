'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions, RowAction } from '@/components/ui/data-table/data-table-row-actions';
import { ContractInstanceListItem } from '@/lib/contracts/types';
import { FileText, Mail, Eye, CheckCircle2, Clock, Hourglass, Pencil, Send, Link2, Download, Trash2, PenLine, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  draft: {
    label: 'Draft',
    className: 'border-gray-300 text-gray-600 bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-900',
    icon: <FileText className="h-3 w-3" />,
  },
  sent: {
    label: 'Sent',
    className: 'border-blue-300 text-blue-600 bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:bg-blue-950',
    icon: <Mail className="h-3 w-3" />,
  },
  viewed: {
    label: 'Viewed',
    className: 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:bg-yellow-950',
    icon: <Eye className="h-3 w-3" />,
  },
  pending: {
    label: 'Pending',
    className: 'border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:bg-amber-950',
    icon: <Hourglass className="h-3 w-3" />,
  },
  signed: {
    label: 'Signed',
    className: 'border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-950',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  expired: {
    label: 'Expired',
    className: 'border-red-300 text-red-600 bg-red-50 dark:border-red-600 dark:text-red-400 dark:bg-red-950',
    icon: <Clock className="h-3 w-3" />,
  },
};

interface ContractColumnsOptions {
  onView?: (contract: ContractInstanceListItem) => void;
  onEdit?: (contract: ContractInstanceListItem) => void;
  onSend?: (contract: ContractInstanceListItem) => void;
  onCountersign?: (contract: ContractInstanceListItem) => void;
  onResend?: (contract: ContractInstanceListItem) => void;
  onCopyLink?: (contract: ContractInstanceListItem) => void;
  onDownload?: (contract: ContractInstanceListItem) => void;
  onDelete?: (contract: ContractInstanceListItem) => void;
}

export function getContractColumns(
  options: ContractColumnsOptions = {}
): ColumnDef<ContractInstanceListItem>[] {
  const { onView, onEdit, onSend, onCountersign, onResend, onCopyLink, onDownload, onDelete } = options;

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
      id: 'contract',
      accessorKey: 'contractName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Contract" />
      ),
      cell: ({ row }) => {
        const quoteName = row.original.quoteName;
        return (
          <div>
            <div className="font-medium text-primary">
              {row.original.contractName}
            </div>
            {quoteName && (
              <div className="text-sm text-muted-foreground">{quoteName}</div>
            )}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const searchValue = value.toLowerCase();
        const contractName = (row.original.contractName as string).toLowerCase();
        const clientName = row.original.clientName.toLowerCase();
        const clientEmail = row.original.clientEmail?.toLowerCase() ?? '';
        return contractName.includes(searchValue) || clientName.includes(searchValue) || clientEmail.includes(searchValue);
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const config = statusConfig[status] || statusConfig.draft || {
          label: 'Unknown',
          className: 'border-gray-300 text-gray-600 bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-900',
          icon: <FileText className="h-3 w-3" />,
        };

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
      id: 'client',
      accessorKey: 'clientName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Client" />
      ),
      cell: ({ row }) => {
        const clientName = row.original.clientName;
        const clientEmail = row.original.clientEmail;
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
            <div>
              <div className="font-medium">{clientName}</div>
              {clientEmail && (
                <div className="text-sm text-muted-foreground">{clientEmail}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'created',
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
        const contract = row.original;
        const actions: RowAction<ContractInstanceListItem>[] = [];

        if (onView) {
          actions.push({
            label: 'View',
            icon: <Eye className="mr-2 h-4 w-4" />,
            onClick: onView,
          });
        }
        if (onEdit && contract.status === 'draft') {
          actions.push({
            label: 'Edit',
            icon: <Pencil className="mr-2 h-4 w-4" />,
            onClick: onEdit,
          });
        }
        if (onCountersign && contract.status === 'pending') {
          actions.push({
            label: 'Countersign',
            icon: <PenLine className="mr-2 h-4 w-4" />,
            onClick: onCountersign,
            separator: true,
          });
        }
        if (onSend && contract.status === 'draft') {
          actions.push({
            label: 'Send Contract',
            icon: <Send className="mr-2 h-4 w-4" />,
            onClick: onSend,
            separator: true,
          });
        }
        if (onResend && contract.status !== 'draft' && contract.status !== 'signed') {
          actions.push({
            label: 'Resend',
            icon: <RefreshCw className="mr-2 h-4 w-4" />,
            onClick: onResend,
          });
        }
        if (onCopyLink) {
          actions.push({
            label: 'Copy Link',
            icon: <Link2 className="mr-2 h-4 w-4" />,
            onClick: onCopyLink,
          });
        }
        if (onDownload) {
          actions.push({
            label: 'Download PDF',
            icon: <Download className="mr-2 h-4 w-4" />,
            onClick: onDownload,
            separator: true,
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
            row={contract}
            actions={actions}
            onView={onView}
            onDelete={onDelete}
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
  { value: 'pending', label: 'Pending Countersign' },
  { value: 'signed', label: 'Signed' },
  { value: 'expired', label: 'Expired' },
];
