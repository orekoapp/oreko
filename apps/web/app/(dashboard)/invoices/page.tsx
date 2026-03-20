import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getInvoices } from '@/lib/invoices/actions';
import { getRecurringInvoiceIds } from '@/lib/invoices/recurring';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { InvoicesDataTable } from '@/components/invoices/invoices-data-table';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Invoices',
  description: 'Create, send, and track invoices for your clients.',
};

// Low #71: Suspense boundary for streaming — header shows immediately, data loads async
export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your invoices and track payments
          </p>
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <InvoicesContent />
      </Suspense>
    </div>
  );
}

async function InvoicesContent() {
  const [invoices, { workspaceId }] = await Promise.all([
    getInvoices(),
    getCurrentUserWorkspace(),
  ]);
  const recurringIds = await getRecurringInvoiceIds(workspaceId);
  return <InvoicesDataTable data={invoices} recurringInvoiceIds={recurringIds} />;
}

function TableSkeleton() {
  return (
    <div className="rounded-md border p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1 max-w-[200px]" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
