'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { getContractColumns, contractStatusOptions } from './contracts-columns';
import { ContractInstanceListItem } from '@/lib/contracts/types';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { deleteContractInstance, sendContractInstance } from '@/lib/contracts/actions';
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

interface ContractsDataTableProps {
  data: ContractInstanceListItem[];
}

export function ContractsDataTable({ data }: ContractsDataTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSend = async (contract: ContractInstanceListItem) => {
    startTransition(async () => {
      try {
        await sendContractInstance(contract.id);
        toast.success('Contract sent successfully');
        router.refresh();
      } catch {
        toast.error('Failed to send contract');
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    startTransition(async () => {
      try {
        await deleteContractInstance(deleteId);
        toast.success('Contract deleted successfully');
        setDeleteId(null);
        router.refresh();
      } catch {
        toast.error('Failed to delete contract');
      }
    });
  };

  const columns = getContractColumns({
    onView: (contract) => {
      router.push(`/contracts/${contract.id}`);
    },
    onSend: handleSend,
    onDelete: (contract) => {
      setDeleteId(contract.id);
    },
  });

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No contracts</h3>
      <p className="text-muted-foreground mb-4">
        Create a contract from a template to get started
      </p>
      <Button asChild>
        <Link href="/contracts/new">
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Link>
      </Button>
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        filterKey="contractName"
        filterPlaceholder="Search contracts..."
        statusOptions={contractStatusOptions}
        statusFilterKey="status"
        pageSizes={[10, 25, 50, 100]}
        emptyState={emptyState}
        isLoading={isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contract? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
