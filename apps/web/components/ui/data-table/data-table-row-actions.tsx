'use client';

import * as React from 'react';
import { MoreHorizontal, Download, Eye, Pencil, Copy, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface RowAction<TData> {
  label: string;
  icon?: React.ReactNode;
  onClick: (data: TData) => void;
  variant?: 'default' | 'destructive';
  separator?: boolean;
}

interface DataTableRowActionsProps<TData> {
  row: TData;
  actions?: RowAction<TData>[];
  onView?: (data: TData) => void;
  onEdit?: (data: TData) => void;
  onDuplicate?: (data: TData) => void;
  onDelete?: (data: TData) => void;
  onDownload?: (data: TData) => void;
  showQuickActions?: boolean;
}

export function DataTableRowActions<TData>({
  row,
  actions,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onDownload,
  showQuickActions = true,
}: DataTableRowActionsProps<TData>) {
  // Build default actions if not provided
  const defaultActions: RowAction<TData>[] = React.useMemo(() => {
    const result: RowAction<TData>[] = [];

    if (onView) {
      result.push({
        label: 'View',
        icon: <Eye className="mr-2 h-4 w-4" />,
        onClick: onView,
      });
    }

    if (onEdit) {
      result.push({
        label: 'Edit',
        icon: <Pencil className="mr-2 h-4 w-4" />,
        onClick: onEdit,
      });
    }

    if (onDuplicate) {
      result.push({
        label: 'Duplicate',
        icon: <Copy className="mr-2 h-4 w-4" />,
        onClick: onDuplicate,
      });
    }

    if (onDownload) {
      result.push({
        label: 'Download PDF',
        icon: <Download className="mr-2 h-4 w-4" />,
        onClick: onDownload,
        separator: true,
      });
    }

    if (onDelete) {
      result.push({
        label: 'Delete',
        icon: <Trash2 className="mr-2 h-4 w-4" />,
        onClick: onDelete,
        variant: 'destructive',
        separator: result.length > 0,
      });
    }

    return result;
  }, [onView, onEdit, onDuplicate, onDelete, onDownload]);

  const allActions = actions ?? defaultActions;

  if (allActions.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Dropdown menu for all actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {allActions.map((action, index) => (
            <React.Fragment key={action.label}>
              {action.separator && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => action.onClick(row)}
                className={
                  action.variant === 'destructive'
                    ? 'text-destructive focus:text-destructive'
                    : undefined
                }
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
