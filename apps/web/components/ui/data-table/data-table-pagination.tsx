'use client';

import { Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (pageCount <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 0; i < pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);

      if (pageIndex > 2) {
        pages.push('ellipsis');
      }

      // Show pages around current page
      const start = Math.max(1, pageIndex - 1);
      const end = Math.min(pageCount - 2, pageIndex + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (pageIndex < pageCount - 3) {
        pages.push('ellipsis');
      }

      // Always show last page
      if (!pages.includes(pageCount - 1)) {
        pages.push(pageCount - 1);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center justify-center text-sm text-muted-foreground whitespace-nowrap">
          {/* Bug #108: Show "No entries" when table is empty instead of "Showing 1 to 0" */}
          {table.getFilteredRowModel().rows.length === 0
            ? 'No entries'
            : `Showing ${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to ${Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )} of ${table.getFilteredRowModel().rows.length} entries`}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {/* Page number buttons */}
          <div className="hidden items-center space-x-1 md:flex">
            {getPageNumbers().map((page, index) =>
              page === 'ellipsis' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-8 items-center justify-center text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={pageIndex === page ? 'default' : 'outline'}
                  className="h-8 w-8 p-0"
                  onClick={() => table.setPageIndex(page)}
                >
                  {page + 1}
                </Button>
              )
            )}
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
