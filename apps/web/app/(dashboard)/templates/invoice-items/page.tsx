'use client';

import { useState } from 'react';
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

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  taxable: boolean;
  createdAt: Date;
}

const mockInvoiceItems: InvoiceItem[] = [
  { id: '1', name: 'Project Fee', description: 'Flat project fee for deliverables', duration: '-', price: 0, taxable: true, createdAt: new Date('2026-02-10') },
  { id: '2', name: 'Web Design & Development', description: 'Full website design and development services', duration: '-', price: 150, taxable: true, createdAt: new Date('2026-02-10') },
  { id: '3', name: 'Virtual Assistant Services', description: 'Remote administrative and support tasks', duration: '-', price: 0, taxable: false, createdAt: new Date('2026-02-10') },
  { id: '4', name: 'Travel Fees', description: 'Travel and transportation costs', duration: '-', price: 300, taxable: false, createdAt: new Date('2026-02-10') },
  { id: '5', name: 'Studio/Office Space Rental', description: 'Hourly rental of studio or office space', duration: '1hr', price: 100, taxable: true, createdAt: new Date('2026-02-10') },
  { id: '6', name: 'Studio Time', description: 'Professional studio session time', duration: '2hrs', price: 400, taxable: true, createdAt: new Date('2026-02-10') },
  { id: '7', name: 'Software Development', description: 'Custom software and application development', duration: '-', price: 0, taxable: true, createdAt: new Date('2026-02-10') },
  { id: '8', name: 'Social Media Management', description: 'Social media strategy and content management', duration: '-', price: 75, taxable: true, createdAt: new Date('2026-02-10') },
  { id: '9', name: 'Search Engine Optimization (SEO)', description: 'SEO audits, keyword research, and optimization', duration: '-', price: 0, taxable: true, createdAt: new Date('2026-02-10') },
  { id: '10', name: 'Consulting/Coaching Session', description: 'One-on-one consulting or coaching session', duration: '1hr', price: 50, taxable: true, createdAt: new Date('2026-02-10') },
  { id: '11', name: 'Production Time', description: 'Video, audio, or content production time', duration: '-', price: 1000, taxable: true, createdAt: new Date('2026-02-10') },
  { id: '12', name: 'Processing Fee', description: 'Administrative processing and handling fee', duration: '-', price: 15, taxable: false, createdAt: new Date('2026-02-10') },
  { id: '13', name: 'Brand Strategy Session', description: 'Brand positioning, messaging, and identity planning', duration: '2hrs', price: 250, taxable: true, createdAt: new Date('2026-02-10') },
  { id: '14', name: 'Photography', description: 'Professional photography services', duration: '1hr', price: 200, taxable: true, createdAt: new Date('2026-02-10') },
  { id: '15', name: 'Content Writing', description: 'Blog posts, articles, and website copy', duration: '-', price: 85, taxable: true, createdAt: new Date('2026-02-10') },
];

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatRelativeDate(date: Date) {
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

export default function InvoiceItemsPage() {
  const items = mockInvoiceItems;
  const [selectedRows, setSelectedRows] = useState<InvoiceItem[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit dialog state
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editTaxable, setEditTaxable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = (item: InvoiceItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDescription(item.description);
    setEditDuration(item.duration);
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
    // Mock save
    toast.success('Item updated');
    handleCloseEdit();
    setIsSaving(false);
  };

  const handleDeleteFromDialog = () => {
    if (!editingItem) return;
    setDeleteId(editingItem.id);
    handleCloseEdit();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    // Mock delete
    toast.success('Item deleted');
    setDeleteId(null);
    setIsDeleting(false);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    setIsDeleting(true);
    // Mock bulk delete
    toast.success(`${selectedRows.length} item(s) deleted`);
    setSelectedRows([]);
    setIsDeleting(false);
  };

  const handleBulkDuplicate = async () => {
    if (selectedRows.length === 0) return;
    // Mock bulk duplicate
    toast.success(`${selectedRows.length} item(s) duplicated`);
    setSelectedRows([]);
  };

  const columns: ColumnDef<InvoiceItem>[] = [
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
          {row.original.duration}
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
          {formatCurrency(row.original.price)}
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
          onView={(item) => handleOpenEdit(item)}
          onEdit={(item) => handleOpenEdit(item)}
          onDelete={(item) => setDeleteId(item.id)}
        />
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No invoice items</h3>
      <p className="text-muted-foreground mb-4">
        Create reusable line items for your invoices.
      </p>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Create Item
      </Button>
    </div>
  );

  return (
    <>
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDuplicate}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
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

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent className="!flex !flex-col !max-w-[860px] !max-h-[90vh] !p-0 !gap-0 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4">
            <DialogHeader className="space-y-1">
              <DialogTitle>Edit invoice item</DialogTitle>
              <DialogDescription>
                Update this reusable line item for your invoices.
              </DialogDescription>
            </DialogHeader>
          </div>

          <Separator />

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto bg-muted/20">
            <div className="p-6 space-y-5">
              {/* Item Name + Delete */}
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

              {/* Description */}
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

              {/* Price & Duration */}
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

              {/* Taxable toggle */}
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

              {/* Save / Cancel */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  onClick={handleSaveItem}
                  disabled={isSaving}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                >
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
