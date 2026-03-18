'use client';

import * as React from 'react';
import { Table } from '@tanstack/react-table';
import { Search, X, Columns3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface BulkAction<TData> {
  label: string;
  icon?: React.ReactNode;
  onClick: (rows: TData[]) => void;
  variant?: 'default' | 'destructive' | 'outline';
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterKey?: string;
  filterPlaceholder?: string;
  statusOptions?: { value: string; label: string }[];
  statusFilterKey?: string;
  pageSizes?: number[];
  showPageSizeSelector?: boolean;
  bulkActions?: BulkAction<TData>[];
}

export function DataTableToolbar<TData>({
  table,
  filterKey,
  filterPlaceholder = 'Search...',
  statusOptions,
  statusFilterKey = 'status',
  pageSizes = [10, 25, 50, 100],
  showPageSizeSelector = true,
  bulkActions,
}: DataTableToolbarProps<TData>) {
  const [searchValue, setSearchValue] = React.useState('');
  const debouncedSearchRef = React.useRef<NodeJS.Timeout | null>(null);
  // Low #84: Use ref for table to avoid unstable dependency in useCallback
  const tableRef = React.useRef(table);
  tableRef.current = table;

  // Debounced search (300ms as per spec)
  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearchValue(value);

      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }

      debouncedSearchRef.current = setTimeout(() => {
        if (filterKey) {
          tableRef.current.getColumn(filterKey)?.setFilterValue(value);
        }
      }, 300);
    },
    [filterKey]
  );

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }
    };
  }, []);

  const isFiltered =
    table.getState().columnFilters.length > 0 || searchValue.length > 0;

  const statusColumn = statusOptions?.length ? table.getColumn(statusFilterKey) : null;
  const currentStatusFilter = statusColumn?.getFilterValue() as string | undefined;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Show dropdown - page size selector */}
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show</span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-9 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom">
                {pageSizes.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {filterKey && (
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={filterPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
        )}
        {statusOptions && statusOptions.length > 0 && (
          <Select
            value={currentStatusFilter ?? 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                statusColumn?.setFilterValue(undefined);
              } else {
                statusColumn?.setFilterValue(value);
              }
            }}
          >
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchValue('');
              table.resetColumnFilters();
            }}
            className="h-9 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
        {/* Column visibility toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Columns3 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center space-x-2">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <>
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{' '}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            {bulkActions?.map((action) => (
              <Button
                key={action.label}
                variant={action.variant || 'outline'}
                size="sm"
                className="h-8"
                onClick={() => {
                  const selectedRows = table
                    .getFilteredSelectedRowModel()
                    .rows.map((row) => row.original);
                  action.onClick(selectedRows);
                }}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
