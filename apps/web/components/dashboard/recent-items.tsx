'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { RecentQuote, RecentInvoice } from '@/lib/dashboard/types';

interface RecentQuotesProps {
  quotes: RecentQuote[];
}

interface RecentInvoicesProps {
  invoices: RecentInvoice[];
}

const quoteStatusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  viewed: 'default',
  accepted: 'default',
  declined: 'destructive',
  expired: 'outline',
};

const invoiceStatusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'default',
  viewed: 'default',
  paid: 'default',
  partial: 'outline',
  overdue: 'destructive',
  void: 'outline',
};

const quoteStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  sent: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  viewed: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  accepted: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  declined: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  expired: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

const invoiceStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
  sent: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  viewed: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  paid: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  partial: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  overdue: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  void: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

export function RecentQuotes({ quotes }: RecentQuotesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Quotes</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/quotes">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No quotes yet
          </p>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{quote.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {quote.clientName}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <span className="font-semibold">
                    {formatCurrency(quote.total)}
                  </span>
                  <Badge className={quoteStatusColors[quote.status] || ''}>
                    {quote.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Invoices</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/invoices">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No invoices yet
          </p>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {invoice.clientName} • Due {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-semibold">
                      {formatCurrency(invoice.total)}
                    </span>
                    {invoice.amountPaid > 0 && invoice.amountPaid < invoice.total && (
                      <p className="text-xs text-muted-foreground">
                        Paid: {formatCurrency(invoice.amountPaid)}
                      </p>
                    )}
                  </div>
                  <Badge className={invoiceStatusColors[invoice.status] || ''}>
                    {invoice.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
