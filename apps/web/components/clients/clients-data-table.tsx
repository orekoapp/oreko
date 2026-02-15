'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { getClientColumns, clientTypeOptions } from './clients-columns';
import { ClientListItem, PaginatedClients } from '@/lib/clients/types';
import { User, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { deleteClient, deleteClients } from '@/lib/clients/actions';
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

interface ClientsDataTableProps {
  data: PaginatedClients;
}

export function ClientsDataTable({ data }: ClientsDataTableProps) {
  const router = useRouter();
  const [selectedRows, setSelectedRows] = useState<ClientListItem[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (selectedRows.length === 0) return;

    setIsDeleting(true);
    try {
      const result = await deleteClients(selectedRows.map((c) => c.id));
      toast.success(`${result.deleted} clients deleted successfully`);
      setSelectedRows([]);
      router.refresh();
    } catch {
      toast.error('Failed to delete clients');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = getClientColumns({
    onView: (client) => {
      router.push(`/clients/${client.id}`);
    },
    onEdit: (client) => {
      router.push(`/clients/${client.id}/edit`);
    },
    onDelete: (client) => {
      setDeleteId(client.id);
    },
    onCreateQuote: (client) => {
      router.push(`/quotes/new?clientId=${client.id}`);
    },
    onCreateInvoice: (client) => {
      router.push(`/invoices/new?clientId=${client.id}`);
    },
  });

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <User className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No clients found</h3>
      <p className="text-muted-foreground mb-4">
        Add your first client to get started
      </p>
      <Button asChild>
        <Link href="/clients/new">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
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
        data={data.data}
        filterKey="name"
        filterPlaceholder="Search clients..."
        statusOptions={clientTypeOptions}
        statusFilterKey="type"
        pageSizes={[10, 25, 50, 100]}
        emptyState={emptyState}
        onRowSelect={setSelectedRows}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be
              undone. All associated quotes and invoices will remain but will no
              longer be linked to this client.
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
