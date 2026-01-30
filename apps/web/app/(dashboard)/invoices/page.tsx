import Link from 'next/link';
import { Plus, Receipt, Search, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getInvoices } from '@/lib/invoices/actions';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-yellow-100 text-yellow-700',
  partial: 'bg-purple-100 text-purple-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  voided: 'bg-gray-200 text-gray-500',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

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

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{invoice.title}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[invoice.status] || statusColors.draft}`}
                      >
                        {invoice.status}
                      </span>
                      {invoice.isOverdue && invoice.status !== 'paid' && invoice.status !== 'voided' && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.invoiceNumber} &bull; {invoice.client.name}
                      {invoice.client.company && ` (${invoice.client.company})`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(invoice.total)}</p>
                  {invoice.amountDue > 0 && invoice.amountDue !== invoice.total && (
                    <p className="text-sm text-orange-600">
                      Due: {formatCurrency(invoice.amountDue)}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Due {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {invoices.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No invoices yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first invoice or convert a quote to an invoice
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/invoices/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/quotes">
                  View Quotes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
