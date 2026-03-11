'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import {
  deleteContractTemplate,
  duplicateContractTemplate,
  getContractTemplateById,
  updateContractTemplate,
} from '@/lib/contracts/actions';
import type {
  ContractTemplateListItem,
  ContractTemplateDetail,
  ContractVariable,
} from '@/lib/contracts/types';
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
import { ContractEditor } from './contract-editor';

interface ContractTemplateListProps {
  templates: ContractTemplateListItem[];
  searchQuery?: string;
}

export function ContractTemplateList({
  templates,
}: ContractTemplateListProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedRows, setSelectedRows] = useState<ContractTemplateListItem[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit dialog state
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplateDetail | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editVariables, setEditVariables] = useState<ContractVariable[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [showNewFieldInput, setShowNewFieldInput] = useState(false);

  const handleOpenEdit = async (templateId: string) => {
    setIsLoadingTemplate(true);
    try {
      const template = await getContractTemplateById(templateId);
      if (template) {
        setEditingTemplate(template);
        setEditName(template.name);
        setEditContent(template.content);
        setEditVariables(template.variables);
      } else {
        toast.error('Template not found');
      }
    } catch {
      toast.error('Failed to load template');
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const handleCloseEdit = () => {
    setEditingTemplate(null);
    setShowNewFieldInput(false);
    setNewFieldName('');
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    if (!editName.trim()) {
      toast.error('Template name is required');
      return;
    }
    setIsSaving(true);
    try {
      await updateContractTemplate({
        id: editingTemplate.id,
        name: editName,
        content: editContent,
        variables: editVariables,
      });
      toast.success('Template updated');
      handleCloseEdit();
      router.refresh();
    } catch {
      toast.error('Failed to update template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddVariable = () => {
    if (!newFieldName.trim()) return;
    const key = newFieldName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const newVar: ContractVariable = {
      key: key || `field_${editVariables.length + 1}`,
      label: newFieldName.trim(),
      type: 'text',
      required: false,
    };
    setEditVariables([...editVariables, newVar]);
    setNewFieldName('');
    setShowNewFieldInput(false);
  };

  const handleRemoveVariable = (index: number) => {
    setEditVariables(editVariables.filter((_, i) => i !== index));
  };

  const handleDeleteFromDialog = () => {
    if (!editingTemplate) return;
    setDeleteId(editingTemplate.id);
    handleCloseEdit();
  };

  const handleDuplicate = (template: ContractTemplateListItem) => {
    startTransition(async () => {
      try {
        await duplicateContractTemplate(template.id);
        toast.success('Template duplicated');
        router.refresh();
      } catch {
        toast.error('Failed to duplicate template');
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteContractTemplate(deleteId);
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
      await Promise.all(selectedRows.map((t) => deleteContractTemplate(t.id)));
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
      await Promise.all(selectedRows.map((t) => duplicateContractTemplate(t.id)));
      toast.success(`${selectedRows.length} template(s) duplicated`);
      setSelectedRows([]);
      router.refresh();
    } catch {
      toast.error('Failed to duplicate templates');
    }
  };

  const columns: ColumnDef<ContractTemplateListItem>[] = [
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
      cell: ({ row }) => {
        const template = row.original;
        return (
          <button
            type="button"
            className="font-medium text-primary hover:underline text-left"
            onClick={() => handleOpenEdit(template.id)}
          >
            {template.name}
          </button>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatDate(row.original.updatedAt)}
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: () => (
        <Badge variant="outline" className="capitalize">
          Manual Entry
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          row={row.original}
          onView={(t) => handleOpenEdit(t.id)}
          onEdit={(t) => handleOpenEdit(t.id)}
          onDuplicate={handleDuplicate}
          onDelete={(t) => setDeleteId(t.id)}
        />
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No contract templates</h3>
      <p className="text-muted-foreground mb-4">
        Create your first contract template to get started.
      </p>
      <Button asChild>
        <Link href="/templates/new">
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Link>
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
        data={templates}
        filterKey="name"
        filterPlaceholder="Search templates..."
        pageSizes={[10, 25, 50, 100]}
        emptyState={emptyState}
        onRowSelect={setSelectedRows}
      />

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent className="!flex !flex-col !max-w-[860px] !max-h-[90vh] !p-0 !gap-0 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4">
            <DialogHeader className="space-y-1">
              <DialogTitle>Edit contract template</DialogTitle>
              <DialogDescription>
                Template changes will not affect previously signed contracts.
              </DialogDescription>
            </DialogHeader>
          </div>

          <Separator />

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto bg-muted/20">
            <div className="p-6 space-y-5">
              {/* Template Name + Delete */}
              <div className="flex items-center justify-between gap-4">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-base font-semibold !bg-transparent outline-none border-none shadow-none flex-1 placeholder:text-muted-foreground/40"
                  placeholder="Template name"
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

              {/* Contract Editor */}
              <div className="[&_.ProseMirror]:!min-h-[150px] [&_.ProseMirror]:!max-h-[220px] [&_.ProseMirror]:overflow-y-auto [&_.prose]:!prose-sm [&_.prose_h2]:text-base [&_.prose_h2]:font-semibold [&_.prose_h3]:text-sm [&_.prose_h3]:font-semibold [&_.prose_p]:text-sm">
                <ContractEditor
                  key={editingTemplate?.id}
                  content={editContent}
                  onChange={setEditContent}
                  variables={editVariables}
                />
              </div>

              {/* Add Custom Field */}
              {showNewFieldInput ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Field name (e.g., Event Address)"
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddVariable();
                      }
                      if (e.key === 'Escape') {
                        setShowNewFieldInput(false);
                        setNewFieldName('');
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddVariable}
                    disabled={!newFieldName.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewFieldInput(false);
                      setNewFieldName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full border border-dashed border-border rounded-md py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-1.5"
                  onClick={() => setShowNewFieldInput(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Custom Field
                </button>
              )}

              {/* Variable Badges */}
              {editVariables.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {editVariables.map((variable, index) => (
                    <div
                      key={variable.key}
                      className="group inline-flex items-center rounded-md border bg-background px-2.5 py-1 text-xs font-medium cursor-default"
                    >
                      {variable.label}
                      <button
                        type="button"
                        onClick={() => handleRemoveVariable(index)}
                        className="ml-1.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Save / Cancel */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  onClick={handleSaveTemplate}
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
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contract template? This action
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
