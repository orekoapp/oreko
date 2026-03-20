'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  Receipt,
  Plus,
  Trash2,
  Copy,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  createInvoiceTemplate,
  deleteInvoiceTemplate,
  duplicateInvoiceTemplate,
  updateInvoiceTemplate,
} from '@/lib/invoices/actions';
import type { InvoiceTemplateListItem, InvoiceTemplateLineItem } from '@/lib/invoices/actions';
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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const paymentTermsLabel: Record<string, string> = {
  due_on_receipt: 'Due on Receipt',
  net7: 'Net 7',
  net15: 'Net 15',
  net30: 'Net 30',
  net45: 'Net 45',
  net60: 'Net 60',
};

type TemplateLineItem = InvoiceTemplateLineItem;

function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

interface InvoiceTemplatesDataTableProps {
  data: InvoiceTemplateListItem[];
}

export function InvoiceTemplatesDataTable({ data }: InvoiceTemplatesDataTableProps) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<InvoiceTemplateListItem[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit dialog state
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplateListItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLineItems, setEditLineItems] = useState<TemplateLineItem[]>([]);
  const [editPaymentTerms, setEditPaymentTerms] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    setEditName('');
    setEditPaymentTerms('net30');
    setEditLineItems([]);
  };

  const handleOpenEdit = (template: InvoiceTemplateListItem) => {
    setIsCreating(false);
    setEditingTemplate(template);
    setEditName(template.name);
    setEditPaymentTerms(template.paymentTerms);
    setEditLineItems(template.lineItems ?? []);
  };

  const handleCloseEdit = () => {
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleSaveTemplate = async () => {
    if (!editName.trim()) {
      toast.error('Template name is required');
      return;
    }
    setIsSaving(true);
    try {
      if (isCreating) {
        const result = await createInvoiceTemplate({
          name: editName,
          paymentTerms: editPaymentTerms,
          lineItems: editLineItems,
        });
        if (!result.success) {
          toast.error(result.error || 'Failed to create template');
          return;
        }
        toast.success('Template created');
      } else if (editingTemplate) {
        const result = await updateInvoiceTemplate({
          id: editingTemplate.id,
          name: editName,
          description: editingTemplate.description,
          paymentTerms: editPaymentTerms,
          currency: editingTemplate.currency,
          lineItems: editLineItems,
          isDefault: editingTemplate.isDefault,
        });
        if (!result.success) {
          toast.error(result.error || 'Failed to update template');
          return;
        }
        toast.success('Template updated');
      }
      handleCloseEdit();
      router.refresh();
    } catch {
      toast.error('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFromDialog = () => {
    if (!editingTemplate) return;
    setDeleteId(editingTemplate.id);
    handleCloseEdit();
  };

  const handleAddLineItem = () => {
    const newItem: TemplateLineItem = {
      id: `li-new-${Date.now()}`,
      name: 'New Item',
      description: 'Item description',
      rate: 0,
      qty: 1,
      taxable: true,
    };
    setEditLineItems([...editLineItems, newItem]);
  };

  const handleUpdateLineItem = (id: string, field: keyof TemplateLineItem, value: string | number | boolean) => {
    setEditLineItems(editLineItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveLineItem = (id: string) => {
    setEditLineItems(editLineItems.filter((item) => item.id !== id));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteInvoiceTemplate(deleteId);
      toast.success('Template deleted');
      setDeleteId(null);
      router.refresh();
    } catch {
      toast.error('Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    setIsDeleting(true);
    try {
      await Promise.all(selectedRows.map((t) => deleteInvoiceTemplate(t.id)));
      toast.success(`${selectedRows.length} template(s) deleted`);
      setSelectedRows([]);
      router.refresh();
    } catch {
      toast.error('Failed to delete templates');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDuplicate = async () => {
    if (selectedRows.length === 0) return;
    try {
      await Promise.all(selectedRows.map((t) => duplicateInvoiceTemplate(t.id)));
      toast.success(`${selectedRows.length} template(s) duplicated`);
      setSelectedRows([]);
      router.refresh();
    } catch {
      toast.error('Failed to duplicate templates');
    }
  };

  const columns: ColumnDef<InvoiceTemplateListItem>[] = [
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
      accessorKey: 'paymentTerms',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Terms" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {paymentTermsLabel[row.original.paymentTerms] ?? row.original.paymentTerms}
        </Badge>
      ),
    },
    {
      accessorKey: 'currency',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Currency" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.original.currency}</div>
      ),
    },
    {
      accessorKey: 'usageCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Used" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.usageCount} time{row.original.usageCount !== 1 ? 's' : ''}
        </div>
      ),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatDate(row.original.updatedAt)}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          row={row.original}
          onView={(t) => handleOpenEdit(t)}
          onEdit={(t) => handleOpenEdit(t)}
          onDuplicate={(t) => {
            duplicateInvoiceTemplate(t.id).then(() => {
              toast.success('Template duplicated');
              router.refresh();
            }).catch(() => toast.error('Failed to duplicate'));
          }}
          onDelete={(t) => setDeleteId(t.id)}
        />
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No invoice templates</h3>
      <p className="text-muted-foreground mb-4">
        Create your first invoice template to streamline your billing workflow.
      </p>
      <Button onClick={handleOpenCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Template
      </Button>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div />
        <Button onClick={handleOpenCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

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
        data={data}
        filterKey="name"
        filterPlaceholder="Search templates..."
        pageSizes={[10, 25, 50, 100]}
        emptyState={emptyState}
        onRowSelect={setSelectedRows}
      />

      {/* Edit Template Dialog - Invoice Builder Style */}
      <Dialog open={!!editingTemplate || isCreating} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent className="!flex !flex-col !max-w-[860px] !max-h-[90vh] !p-0 !gap-0 overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {isCreating ? 'New Invoice Template' : 'Invoice Template'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isCreating
                ? 'Create a reusable template to speed up invoice creation.'
                : 'Your invoice templates are available when creating invoices.'}
            </p>
          </div>

          <Separator />

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-8">
              {/* Template Name */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Template Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Coaching Invoice"
                  className="h-11"
                />
              </div>

              {/* Add Enhancements */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold hover:opacity-70 transition-opacity"
                  >
                    Add Enhancements
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  <DropdownMenuItem>Discount</DropdownMenuItem>
                  <DropdownMenuItem>Tax</DropdownMenuItem>
                  <DropdownMenuItem>Late Fee</DropdownMenuItem>
                  <DropdownMenuItem>Notes</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Items Section */}
              <div>
                <h3 className="text-base font-semibold mb-4">Items</h3>

                {/* Items Table Header */}
                {editLineItems.length > 0 && (
                  <div className="grid grid-cols-[1fr,100px,70px,32px] gap-3 mb-3 px-3">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Items
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Rate
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Qty
                    </span>
                    <span />
                  </div>
                )}

                {/* Line Items */}
                <div className="space-y-0 mb-5">
                  {editLineItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        'group px-3 py-3 transition-colors hover:bg-muted/30',
                        index !== editLineItems.length - 1 && 'border-b border-border/40'
                      )}
                    >
                      <div className="grid grid-cols-[1fr,100px,70px,32px] gap-3 items-center">
                        <Input
                          value={item.name}
                          onChange={(e) => handleUpdateLineItem(item.id, 'name', e.target.value)}
                          className="h-9 border-0 shadow-none px-0 text-sm font-medium focus-visible:ring-0 !bg-transparent"
                          placeholder="Item name"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate || ''}
                          onChange={(e) => handleUpdateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                          className="h-9 text-sm"
                          placeholder="0"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={item.qty || ''}
                          onChange={(e) => handleUpdateLineItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                          className="h-9 text-sm"
                          placeholder="1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveLineItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={item.description}
                        onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                        className="h-7 text-xs text-muted-foreground border-0 shadow-none px-0 mt-0.5 focus-visible:ring-0 !bg-transparent"
                        placeholder="Add a description..."
                      />
                    </div>
                  ))}
                </div>

                {/* Add Items Button */}
                <Button
                  variant="outline"
                  className="w-full h-11 border-dashed border-2 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary-50/50 transition-all"
                  onClick={handleAddLineItem}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Items
                </Button>
              </div>

              {/* Payment Method Section */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold">Payment Method</h3>
                <p className="text-sm text-muted-foreground">
                  Payment methods are setup in your settings page.
                </p>
              </div>

              {/* Payment Terms */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Payment Terms</Label>
                <Select value={editPaymentTerms} onValueChange={setEditPaymentTerms}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(paymentTermsLabel).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex items-center justify-between">
                {!isCreating ? (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
                    onClick={handleDeleteFromDialog}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete template
                  </button>
                ) : <div />}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCloseEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCreating ? 'Create Template' : 'Save Template'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice template? This action
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
