'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { getProjectColumns, projectStatusOptions, type ProjectListItem } from './projects-columns';
import { FolderKanban, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { deleteProject, deactivateProject, reactivateProject } from '@/lib/projects/actions';
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

interface ProjectsDataTableProps {
  data: ProjectListItem[];
}

export function ProjectsDataTable({ data }: ProjectsDataTableProps) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<ProjectListItem[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteProject(deleteId);
      toast.success('Project deleted successfully');
      setDeleteId(null);
      router.refresh();
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    setIsDeleting(true);
    try {
      for (const row of selectedRows) {
        await deleteProject(row.id);
      }
      toast.success(`${selectedRows.length} projects deleted successfully`);
      setSelectedRows([]);
      router.refresh();
    } catch {
      toast.error('Failed to delete projects');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (project: ProjectListItem) => {
    try {
      if (project.isActive) {
        await deactivateProject(project.id);
        toast.success('Project deactivated');
      } else {
        await reactivateProject(project.id);
        toast.success('Project reactivated');
      }
      router.refresh();
    } catch {
      toast.error('Failed to update project status');
    }
  };

  const columns = getProjectColumns({
    onView: (project) => {
      router.push(`/projects/${project.id}`);
    },
    onEdit: (project) => {
      router.push(`/projects/${project.id}/edit`);
    },
    onDelete: (project) => {
      setDeleteId(project.id);
    },
    onCreateQuote: (project) => {
      router.push(`/quotes/new?projectId=${project.id}&clientId=${project.client.id}`);
    },
    onCreateInvoice: (project) => {
      router.push(`/invoices/new?projectId=${project.id}&clientId=${project.client.id}`);
    },
    onToggleActive: handleToggleActive,
  });

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No projects found</h3>
      <p className="text-muted-foreground mb-4">
        Create your first project to organize your work
      </p>
      <Button asChild>
        <Link href="/projects/new">
          <Plus className="mr-2 h-4 w-4" />
          New Project
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
        filterPlaceholder="Search projects..."
        statusOptions={projectStatusOptions}
        statusFilterKey="isActive"
        pageSizes={[10, 25, 50, 100]}
        emptyState={emptyState}
        onRowSelect={setSelectedRows}
        onRowClick={(project) => router.push(`/projects/${project.id}`)}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be
              undone. Associated quotes and invoices will remain but will no
              longer be linked to this project.
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
