'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Mail, Plus, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/ui/data-table/data-table-row-actions';
import { toast } from 'sonner';
import { deleteEmailTemplate, updateEmailTemplate } from '@/lib/email/actions';
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

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body?: string;
  type: string;
  isDefault: boolean;
  isActive: boolean;
  activity?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EmailTemplatesDataTableProps {
  data: EmailTemplate[];
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 30) return `${diffDays}d ago`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}mo ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years}y ago`;
}

export function EmailTemplatesDataTable({ data }: EmailTemplatesDataTableProps) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<EmailTemplate[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit dialog state
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditSubject(template.subject);
    setEditBody(template.body ?? '');
    setEditIsActive(template.isActive);
  };

  const handleCloseEdit = () => {
    setEditingTemplate(null);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    if (!editName.trim()) {
      toast.error('Template name is required');
      return;
    }
    setIsSaving(true);
    try {
      await updateEmailTemplate({
        id: editingTemplate.id,
        name: editName,
        subject: editSubject,
        body: editBody,
        isActive: editIsActive,
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

  const handleDeleteFromDialog = () => {
    if (!editingTemplate) return;
    setDeleteId(editingTemplate.id);
    handleCloseEdit();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteEmailTemplate(deleteId);
      toast.success('Template deleted');
      setDeleteId(null);
      router.refresh();
    } catch {
      toast.error('Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<EmailTemplate>[] = [
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
      accessorKey: 'subject',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.subject}
        </div>
      ),
    },
    {
      accessorKey: 'activity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Activity" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.activity ?? 'No activity'}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {formatRelativeDate(row.original.createdAt)}
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
          onDelete={(t) => setDeleteId(t.id)}
        />
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <Mail className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No email templates</h3>
      <p className="text-muted-foreground mb-4">
        Create email templates for quotes, invoices, and reminders.
      </p>
      <Button asChild>
        <Link href="/settings/emails/new">
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Link>
      </Button>
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
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
              <DialogTitle>Edit email template</DialogTitle>
              <DialogDescription>
                Customize this email template for your notifications.
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

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject Line</Label>
                <Input
                  id="edit-subject"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="Email subject..."
                />
                <p className="text-xs text-muted-foreground">
                  Use variables like {'{{business_name}}'}, {'{{quote_name}}'}, {'{{invoice_number}}'} for dynamic content.
                </p>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label>Body</Label>
                <RichTextEditor
                  value={editBody}
                  onChange={setEditBody}
                  placeholder="Email body content..."
                  showAttachment
                  onAttachment={() => toast.info('Attachment feature coming soon')}
                />
                <p className="text-xs text-muted-foreground">
                  Use variables like {'{{client_name}}'}, {'{{quote_link}}'}, {'{{invoice_link}}'} for personalized content.
                </p>
              </div>

              {/* Type (read-only) */}
              {editingTemplate && (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {editingTemplate.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Active toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this template for automated email notifications.
                  </p>
                </div>
                <Switch
                  checked={editIsActive}
                  onCheckedChange={setEditIsActive}
                />
              </div>

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
              Are you sure you want to delete this email template? This action
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
