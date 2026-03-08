import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInvoices } from '@/lib/invoices/actions';
import { InvoicesDataTable } from '@/components/invoices/invoices-data-table';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Invoices',
  description: 'Manage and track your invoices and payments',
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();

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

      <InvoicesDataTable data={invoices} />
    </div>
  );
}
