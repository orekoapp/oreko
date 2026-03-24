'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTableToolbar, type BulkAction } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey?: string;
  filterPlaceholder?: string;
  statusOptions?: { value: string; label: string }[];
  statusFilterKey?: string;
  onRowSelect?: (rows: TData[]) => void;
  onRowClick?: (row: TData) => void;
  pageSizes?: number[];
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  bulkActions?: BulkAction<TData>[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  filterPlaceholder = 'Search...',
  statusOptions,
  statusFilterKey = 'status',
  onRowSelect,
  onRowClick,
  pageSizes = [10, 25, 50, 100],
  emptyState,
  isLoading = false,
  bulkActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Notify parent when row selection changes
  React.useEffect(() => {
    if (onRowSelect) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
      onRowSelect(selectedRows);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- HIGH #49: `table` is recreated every render; depend on `rowSelection` only
  }, [rowSelection, onRowSelect]);

  return (
    <div className="space-y-2">
      <div className="rounded-lg border">
        <div className="p-4">
          <DataTableToolbar
            table={table}
            filterKey={filterKey}
            filterPlaceholder={filterPlaceholder}
            statusOptions={statusOptions}
            statusFilterKey={statusFilterKey}
            pageSizes={pageSizes}
            bulkActions={bulkActions}
          />
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={onRowClick ? 'cursor-pointer' : ''}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        // Don't trigger row click for checkbox and actions columns
                        const columnId = cell.column.id;
                        if (columnId === 'select' || columnId === 'actions') {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyState || 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
