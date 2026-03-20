'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Receipt, Plus, Trash2, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions';
import { toast } from 'sonner';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createSavedLineItem,
  updateSavedLineItem,
  deleteSavedLineItem,
  deleteSavedLineItems,
  type SavedLineItemData,
} from '@/lib/saved-items/actions';

interface InvoiceItemsClientProps {
  initialItems: SavedLineItemData[];
  currency?: string;
}

const durationOptions = [
  { value: '-', label: 'None' },
  { value: '30min', label: '30 minutes' },
  { value: '1hr', label: '1 hour' },
  { value: '2hrs', label: '2 hours' },
  { value: '3hrs', label: '3 hours' },
  { value: '4hrs', label: '4 hours' },
  { value: 'half-day', label: 'Half day' },
  { value: 'full-day', label: 'Full day' },
];

function formatCurrencyValue(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1mo ago';
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}

export function InvoiceItemsClient({ initialItems, currency = 'USD' }: InvoiceItemsClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<SavedLineItemData[]>(initialItems);
  const [selectedRows, setSelectedRows] = useState<SavedLineItemData[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createDuration, setCreateDuration] = useState('-');
  const [createPrice, setCreatePrice] = useState('');
  const [createTaxable, setCreateTaxable] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Edit dialog state
  const [editingItem, setEditingItem] = useState<SavedLineItemData | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editTaxable, setEditTaxable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenCreate = () => {
    setCreateName('');
    setCreateDescription('');
    setCreateDuration('-');
    setCreatePrice('');
    setCreateTaxable(true);
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createName.trim()) {
      toast.error('Item name is required');
      return;
    }
    setIsCreating(true);
    try {
      const result = await createSavedLineItem({
        name: createName,
        description: createDescription || undefined,
        price: parseFloat(createPrice) || 0,
        duration: createDuration === '-' ? undefined : createDuration,
        taxable: createTaxable,
      });
      if (result.success) {
        toast.success('Item created');
        setCreateOpen(false);
        router.refresh();
        // Optimistic: add to local state
        if (result.item) {
          setItems((prev) => [{
            id: result.item!.id,
            name: result.item!.name,
            description: result.item!.description,
            price: result.item!.price,
            duration: result.item!.duration,
            taxable: result.item!.taxable,
            createdAt: new Date().toISOString(),
          }, ...prev]);
        }
      } else {
        toast.error(result.error || 'Failed to create item');
      }
    } catch {
      toast.error('Failed to create item');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (item: SavedLineItemData) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDescription(item.description || '');
    setEditDuration(item.duration || '-');
    setEditPrice(item.price.toString());
    setEditTaxable(item.taxable);
  };

  const handleCloseEdit = () => {
    setEditingItem(null);
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;
    if (!editName.trim()) {
      toast.error('Item name is required');
      return;
    }
    setIsSaving(true);
    try {
      const result = await updateSavedLineItem(editingItem.id, {
        name: editName,
        description: editDescription,
        price: parseFloat(editPrice) || 0,
        duration: editDuration === '-' ? undefined : editDuration,
        taxable: editTaxable,
      });
      if (result.success) {
        toast.success('Item updated');
        handleCloseEdit();
        // Update local state
        setItems((prev) => prev.map((i) => i.id === editingItem.id ? {
          ...i,
          name: editName,
          description: editDescription || null,
          price: parseFloat(editPrice) || 0,
          duration: editDuration === '-' ? null : editDuration,
          taxable: editTaxable,
        } : i));
      } else {
        toast.error(result.error || 'Failed to update item');
      }
    } catch {
      toast.error('Failed to update item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFromDialog = () => {
    if (!editingItem) return;
    setDeleteId(editingItem.id);
    handleCloseEdit();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deleteSavedLineItem(deleteId);
      if (result.success) {
        toast.success('Item deleted');
        setItems((prev) => prev.filter((i) => i.id !== deleteId));
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setDeleteId(null);
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    setIsDeleting(true);
    try {
      const ids = selectedRows.map((r) => r.id);
      const result = await deleteSavedLineItems(ids);
      if (result.success) {
        toast.success(`${selectedRows.length} item(s) deleted`);
        setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
        setSelectedRows([]);
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete items');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<SavedLineItemData>[] = [
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
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium text-primary hover:underline text-left"
          onClick={() => handleOpenEdit(row.original)}
        >
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: 'duration',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.duration || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatCurrencyValue(row.original.price, currency)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatRelativeDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          row={row.original}
          onEdit={(item) => handleOpenEdit(item)}
          onDelete={(item) => setDeleteId(item.id)}
        />
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No saved items</h3>
      <p className="text-muted-foreground mb-4">
        Create reusable line items for your quotes and invoices.
      </p>
      <Button onClick={handleOpenCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Item
      </Button>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Items</h1>
          <p className="text-muted-foreground">Reusable line items for quotes and invoices</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </div>

      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={items}
        filterKey="name"
        filterPlaceholder="Search items..."
        pageSizes={[10, 25, 50, 100]}
        emptyState={emptyState}
        onRowSelect={setSelectedRows}
      />

      {/* Create Item Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="!flex !flex-col !max-w-[860px] !max-h-[90vh] !p-0 !gap-0 overflow-hidden">
          <div className="p-6 pb-4">
            <DialogHeader className="space-y-1">
              <DialogTitle>New invoice item</DialogTitle>
              <DialogDescription>
                Create a reusable line item for your quotes and invoices.
              </DialogDescription>
            </DialogHeader>
          </div>
          <Separator />
          <div className="flex-1 overflow-y-auto bg-muted/20">
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Web Design"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Item description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-price">Price</Label>
                  <Input
                    id="create-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={createPrice}
                    onChange={(e) => setCreatePrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={createDuration} onValueChange={setCreateDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Taxable</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply tax to this line item on invoices.
                  </p>
                </div>
                <Switch
                  checked={createTaxable}
                  onCheckedChange={setCreateTaxable}
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
                <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={isCreating}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent className="!flex !flex-col !max-w-[860px] !max-h-[90vh] !p-0 !gap-0 overflow-hidden">
          <div className="p-6 pb-4">
            <DialogHeader className="space-y-1">
              <DialogTitle>Edit invoice item</DialogTitle>
              <DialogDescription>
                Update this reusable line item for your invoices.
              </DialogDescription>
            </DialogHeader>
          </div>
          <Separator />
          <div className="flex-1 overflow-y-auto bg-muted/20">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-base font-semibold !bg-transparent outline-none border-none shadow-none flex-1 placeholder:text-muted-foreground/40"
                  placeholder="Item name"
                />
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  onClick={handleDeleteFromDialog}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Item description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={editDuration} onValueChange={setEditDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Taxable</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply tax to this line item on invoices.
                  </p>
                </div>
                <Switch
                  checked={editTaxable}
                  onCheckedChange={setEditTaxable}
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button onClick={handleSaveItem} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button variant="outline" onClick={handleCloseEdit} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice item? This action
              cannot be undone.
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
    </>
  );
}
