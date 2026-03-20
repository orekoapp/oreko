'use client';

import { useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { ArrowUpRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { QuoteStatusCounts, ConversionFunnelData } from '@/lib/dashboard/types';

interface SalesPipelineSectionProps {
  dateRange?: DateRange;
  conversionRate: number;
  avgDealValue: number;
  quoteStatusCounts: QuoteStatusCounts;
  conversionFunnel: ConversionFunnelData;
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_ITEMS = [
  { key: 'accepted', label: 'Accepted', color: 'bg-emerald-500' },
  { key: 'sent', label: 'Sent', color: 'bg-blue-500' },
  { key: 'viewed', label: 'Viewed', color: 'bg-amber-400' },
  { key: 'draft', label: 'Draft', color: 'bg-slate-400' },
  { key: 'declined', label: 'Declined', color: 'bg-red-400' },
  { key: 'expired', label: 'Expired', color: 'bg-orange-400' },
] as const;

export function SalesPipelineSection({
  conversionRate,
  avgDealValue,
  quoteStatusCounts,
  conversionFunnel,
}: SalesPipelineSectionProps) {
  const totalQuotes = conversionFunnel.quotesCreated;
  const wonQuotes = conversionFunnel.quotesAccepted;
  const maxCount = useMemo(() => {
    return Math.max(
      quoteStatusCounts.draft,
      quoteStatusCounts.sent,
      quoteStatusCounts.viewed,
      quoteStatusCounts.accepted,
      quoteStatusCounts.declined,
      quoteStatusCounts.expired,
      1
    );
  }, [quoteStatusCounts]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-sm font-medium">Sales Pipeline</CardTitle>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
            <span className="font-medium">{conversionRate.toFixed(0)}% win rate</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key metrics row */}
        <div className="flex items-center gap-6 mb-5">
          <div>
            <p className="text-2xl font-semibold tracking-tight">{totalQuotes}</p>
            <p className="text-xs text-muted-foreground">Total quotes</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">{wonQuotes}</p>
            <p className="text-xs text-muted-foreground">Won</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-semibold tracking-tight">{formatCurrency(avgDealValue)}</p>
            <p className="text-xs text-muted-foreground">Avg deal</p>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="space-y-2.5">
          {STATUS_ITEMS.map((item) => {
            const count = quoteStatusCounts[item.key] ?? 0;
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={item.key} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16 shrink-0">{item.label}</span>
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${item.color}`}
                    style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                  />
                </div>
                <span className="text-xs font-medium tabular-nums w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
