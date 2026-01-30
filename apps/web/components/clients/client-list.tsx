'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  Receipt,
  Search,
  Building2,
  User,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { deleteClient, deleteClients } from '@/lib/clients/actions';
import { formatCurrency } from '@/lib/utils';
import type { ClientListItem, PaginatedClients } from '@/lib/clients/types';
import { toast } from 'sonner';

interface ClientListProps {
  clients: PaginatedClients;
}

export function ClientList({ clients }: ClientListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const [type, setType] = React.useState(searchParams.get('type') || 'all');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const currentPage = clients.meta.page;
  const totalPages = clients.meta.totalPages;

  const updateFilters = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '' || value === 'all') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`/clients?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = React.useCallback(() => {
    updateFilters({ search, page: null });
  }, [search, updateFilters]);

  const handleTypeChange = React.useCallback(
    (value: string) => {
      setType(value);
      updateFilters({ type: value === 'all' ? null : value, page: null });
    },
    [updateFilters]
  );

  const handleSort = React.useCallback(
    (sortBy: string) => {
      const currentSortBy = searchParams.get('sortBy');
      const currentSortOrder = searchParams.get('sortOrder') || 'desc';
      const newSortOrder = currentSortBy === sortBy && currentSortOrder === 'asc' ? 'desc' : 'asc';
      updateFilters({ sortBy, sortOrder: newSortOrder });
    },
    [searchParams, updateFilters]
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteClient(deleteId);
      toast.success('Client deleted successfully');
      setDeleteId(null);
      router.refresh();
    } catch {
      toast.error('Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;

    setIsDeleting(true);
    try {
      const result = await deleteClients(selected);
      toast.success(`${result.deleted} clients deleted successfully`);
      setSelected([]);
      router.refresh();
    } catch {
      toast.error('Failed to delete clients');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleAll = () => {
    if (selected.length === clients.data.length) {
      setSelected([]);
    } else {
      setSelected(clients.data.map((c) => c.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selected.length > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete {selected.length}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selected.length === clients.data.length && clients.data.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3" onClick={() => handleSort('name')}>
                  Client
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleSort('totalQuotes')}>
                  Quotes
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleSort('totalInvoices')}>
                  Invoices
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No clients found</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/clients/new">Add your first client</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.data.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(client.id)}
                      onCheckedChange={() => toggleOne(client.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/clients/${client.id}`} className="flex items-center gap-3 hover:underline">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {client.type === 'company' ? (
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{client.company || client.name}</p>
                        {client.company && (
                          <p className="text-sm text-muted-foreground">{client.name}</p>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{client.email}</p>
                      {client.phone && (
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{client.totalQuotes}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{client.totalInvoices}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(client.totalRevenue / 100)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/clients/${client.id}`}>
                            <User className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/clients/${client.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/quotes/new?clientId=${client.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Create Quote
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/invoices/new?clientId=${client.id}`}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Create Invoice
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(client.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={currentPage > 1 ? `?page=${currentPage - 1}` : '#'}
                aria-disabled={currentPage <= 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink href={`?page=${page}`} isActive={page === currentPage}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={currentPage < totalPages ? `?page=${currentPage + 1}` : '#'}
                aria-disabled={currentPage >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
              All associated quotes and invoices will remain but will no longer be linked to this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
