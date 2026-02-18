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
  FolderKanban,
  ArrowUpDown,
  Power,
  PowerOff,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { deleteProject, deactivateProject, reactivateProject } from '@/lib/projects/actions';
import type { ProjectWithCounts } from '@/lib/projects/types';
import { toast } from 'sonner';

interface ProjectListProps {
  projects: {
    projects: ProjectWithCounts[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export function ProjectList({ projects }: ProjectListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const [status, setStatus] = React.useState(searchParams.get('status') || 'active');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = React.useState<string[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const currentPage = projects.pagination.page;
  const totalPages = projects.pagination.totalPages;

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
      router.push(`/projects?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = React.useCallback(() => {
    updateFilters({ search, page: null });
  }, [search, updateFilters]);

  const handleStatusChange = React.useCallback(
    (value: string) => {
      setStatus(value);
      updateFilters({ status: value === 'all' ? null : value, page: null });
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
    const idsToDelete = bulkDeleteIds.length > 0 ? bulkDeleteIds : deleteId ? [deleteId] : [];
    if (idsToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      for (const id of idsToDelete) {
        await deleteProject(id);
      }
      toast.success(idsToDelete.length > 1 ? `${idsToDelete.length} projects deleted` : 'Project deleted successfully');
      setDeleteId(null);
      setBulkDeleteIds([]);
      setSelected([]);
      router.refresh();
    } catch {
      toast.error('Failed to delete project(s)');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (projectId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateProject(projectId);
        toast.success('Project deactivated');
      } else {
        await reactivateProject(projectId);
        toast.success('Project reactivated');
      }
      router.refresh();
    } catch {
      toast.error('Failed to update project status');
    }
  };

  const toggleAll = () => {
    if (selected.length === projects.projects.length) {
      setSelected([]);
    } else {
      setSelected(projects.projects.map((p) => p.id));
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
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selected.length > 0 && (
          <Button variant="destructive" size="sm" onClick={() => {
            setBulkDeleteIds([...selected]);
            setDeleteId(selected[0] ?? null);
          }}>
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
                  checked={selected.length === projects.projects.length && projects.projects.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3" onClick={() => handleSort('name')}>
                  Project
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleSort('quotes')}>
                  Quotes
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleSort('invoices')}>
                  Invoices
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FolderKanban className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No projects found</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/projects/new">Create your first project</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              projects.projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(project.id)}
                      onCheckedChange={() => toggleOne(project.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/projects/${project.id}`} className="flex items-center gap-3 hover:underline">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <FolderKanban className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/clients/${project.client.id}`} className="hover:underline">
                      <p className="text-sm">{project.client.company || project.client.name}</p>
                      {project.client.company && project.client.company !== project.client.name && (
                        <p className="text-xs text-muted-foreground">{project.client.name}</p>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{project._count.quotes}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{project._count.invoices}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.isActive ? 'default' : 'secondary'}>
                      {project.isActive ? 'Active' : 'Inactive'}
                    </Badge>
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
                          <Link href={`/projects/${project.id}`}>
                            <FolderKanban className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/quotes/new?projectId=${project.id}&clientId=${project.client.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Create Quote
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/invoices/new?projectId=${project.id}&clientId=${project.client.id}`}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Create Invoice
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleActive(project.id, project.isActive)}>
                          {project.isActive ? (
                            <>
                              <PowerOff className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Power className="mr-2 h-4 w-4" />
                              Reactivate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(project.id)}
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
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
              Associated quotes and invoices will remain but will no longer be linked to this project.
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
