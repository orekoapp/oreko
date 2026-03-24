'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { RecentQuote, RecentInvoice } from '@/lib/dashboard/types';

interface RecentQuotesProps {
  quotes: RecentQuote[];
  currency?: string;
}

interface RecentInvoicesProps {
  invoices: RecentInvoice[];
  currency?: string;
}

const statusDot: Record<string, string> = {
  draft: 'bg-muted-foreground/40',
  sent: 'bg-blue-500',
  viewed: 'bg-amber-500',
  accepted: 'bg-emerald-500',
  declined: 'bg-red-500',
  expired: 'bg-muted-foreground/30',
  paid: 'bg-emerald-500',
  partial: 'bg-amber-500',
  overdue: 'bg-red-500',
  void: 'bg-muted-foreground/30',
};

export function RecentQuotes({ quotes, currency = 'USD' }: RecentQuotesProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Quotes</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" asChild>
            <Link href="/quotes">
              View all
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-3 flex-1 overflow-y-auto">
        {quotes.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No quotes yet
          </p>
        ) : (
          <div className="space-y-0">
            {quotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/quotes/${quote.id}`}
                className="group flex items-center justify-between py-2.5 border-t first:border-t-0 transition-colors hover:bg-muted/40 -mx-6 px-6"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[quote.status] || 'bg-muted-foreground/30'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {quote.title}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate">
                      {quote.clientName}
                    </p>
                  </div>
                </div>
                <div className="ml-3 flex items-center gap-3 shrink-0">
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {formatCurrency(quote.total, currency)}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] capitalize font-normal px-1.5 py-0"
                  >
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

export function RecentInvoices({ invoices, currency = 'USD' }: RecentInvoicesProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Invoices</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" asChild>
            <Link href="/invoices">
              View all
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-3 flex-1 overflow-y-auto">
        {invoices.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No invoices yet
          </p>
        ) : (
          <div className="space-y-0">
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="group flex items-center justify-between py-2.5 border-t first:border-t-0 transition-colors hover:bg-muted/40 -mx-6 px-6"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[invoice.status] || 'bg-muted-foreground/30'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate">
                      {invoice.clientName}
                    </p>
                  </div>
                </div>
                <div className="ml-3 flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {formatCurrency(invoice.total, currency)}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] capitalize font-normal px-1.5 py-0"
                  >
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
