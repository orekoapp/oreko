'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  deleteRateCard,
  duplicateRateCard,
  toggleRateCardActive,
} from '@/lib/rate-cards/actions';
import { formatCurrency } from '@/lib/utils';
import type {
  RateCardListItem,
  CategoryListItem,
  RateCardStats,
  PaginatedRateCards,
} from '@/lib/rate-cards/types';
import { toast } from 'sonner';

interface RateCardListProps {
  initialData: PaginatedRateCards;
  categories: CategoryListItem[];
  stats: RateCardStats;
}

const PRICING_TYPE_LABELS: Record<string, string> = {
  fixed: 'Fixed',
  hourly: '/hr',
  daily: '/day',
  weekly: '/wk',
  monthly: '/mo',
  per_unit: '/unit',
};

export function RateCardList({ initialData, categories, stats }: RateCardListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = React.useState(
    searchParams.get('categoryId') || ''
  );
  const [statusFilter, setStatusFilter] = React.useState(
    searchParams.get('isActive') || ''
  );
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const updateFilters = React.useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      params.delete('page'); // Reset page on filter change
      router.push(`/rate-cards?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    // Debounce search
    const timer = setTimeout(() => {
      updateFilters({ search: value });
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteRateCard(deleteId);
      toast.success('Rate card deleted');
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete rate card');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const result = await duplicateRateCard(id);
      toast.success('Rate card duplicated');
      router.push(`/rate-cards/${result.id}/edit`);
    } catch {
      toast.error('Failed to duplicate rate card');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await toggleRateCardActive(id);
      toast.success(currentStatus ? 'Rate card deactivated' : 'Rate card activated');
    } catch {
      toast.error('Failed to update rate card');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Rate Cards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
            <p className="text-sm text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rate cards..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value);
              updateFilters({ categoryId: value });
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    {category.color && (
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              updateFilters({ isActive: value });
            }}
          >
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button asChild>
          <Link href="/rate-cards/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Rate Card
          </Link>
        </Button>
      </div>

      {/* Rate Card Grid */}
      {initialData.data.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">No rate cards found</p>
            <Button asChild>
              <Link href="/rate-cards/new">
                <Plus className="mr-2 h-4 w-4" />
                Create your first rate card
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialData.data.map((rateCard) => (
            <Card
              key={rateCard.id}
              className={!rateCard.isActive ? 'opacity-60' : undefined}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {rateCard.categoryColor && (
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: rateCard.categoryColor }}
                        />
                      )}
                      <Link
                        href={`/rate-cards/${rateCard.id}/edit`}
                        className="font-medium hover:underline"
                      >
                        {rateCard.name}
                      </Link>
                    </div>
                    {rateCard.categoryName && (
                      <p className="text-sm text-muted-foreground">
                        {rateCard.categoryName}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/rate-cards/${rateCard.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(rateCard.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(rateCard.id, rateCard.isActive)}
                      >
                        {rateCard.isActive ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(rateCard.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {rateCard.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {rateCard.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-semibold">
                      {formatCurrency(rateCard.rate)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {PRICING_TYPE_LABELS[rateCard.pricingType] || ''}
                      {rateCard.unit && ` (${rateCard.unit})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!rateCard.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {rateCard.usageCount > 0 && (
                      <Badge variant="outline">{rateCard.usageCount} uses</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {initialData.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={initialData.meta.page <= 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', String(initialData.meta.page - 1));
              router.push(`/rate-cards?${params.toString()}`);
            }}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {initialData.meta.page} of {initialData.meta.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={initialData.meta.page >= initialData.meta.totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', String(initialData.meta.page + 1));
              router.push(`/rate-cards?${params.toString()}`);
            }}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rate Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rate card? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
