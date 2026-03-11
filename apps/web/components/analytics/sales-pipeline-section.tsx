'use client';

import { useMemo } from 'react';
import { DateRange } from 'react-day-picker';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { QuoteStatusCounts, ConversionFunnelData } from '@/lib/dashboard/types';

interface SalesPipelineSectionProps {
  dateRange?: DateRange;
  conversionRate: number;
  avgDealValue: number;
  quoteStatusCounts: QuoteStatusCounts;
  conversionFunnel: ConversionFunnelData;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function RadialProgress({ value, label }: { value: number; label: string }) {
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="pipelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary-400)" />
            <stop offset="100%" stopColor="var(--primary-600)" />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--primary-100)"
          strokeWidth={strokeWidth}
          className="dark:stroke-[var(--primary-950)]"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#pipelineGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold tabular-nums">{label}</span>
      </div>
    </div>
  );
}

const STATUS_ITEMS = [
  { key: 'draft', label: 'Draft', color: 'bg-slate-400' },
  { key: 'sent', label: 'Sent', color: 'bg-blue-500' },
  { key: 'viewed', label: 'Viewed', color: 'bg-amber-400' },
  { key: 'accepted', label: 'Accepted', color: 'bg-emerald-500' },
  { key: 'declined', label: 'Declined', color: 'bg-red-500' },
  { key: 'expired', label: 'Expired', color: 'bg-orange-400' },
] as const;

export function SalesPipelineSection({
  conversionRate,
  avgDealValue,
  quoteStatusCounts,
  conversionFunnel,
}: SalesPipelineSectionProps) {
  const totalQuotes = conversionFunnel.quotesCreated;
  const acceptedQuotes = conversionFunnel.quotesAccepted;
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
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium">Sales Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Conversion + Key Metrics */}
        <div className="flex items-center gap-6">
          <RadialProgress
            value={conversionRate}
            label={`${conversionRate.toFixed(0)}%`}
          />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">Avg Deal</p>
              <p className="text-lg font-semibold">{formatCurrency(avgDealValue)}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">Quotes</p>
                <p className="text-lg font-semibold">{totalQuotes}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">Won</p>
                <p className="text-lg font-semibold text-emerald-600">{acceptedQuotes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quotes by Status - Horizontal Bars */}
        <div className="space-y-2.5">
          <h4 className="text-xs text-muted-foreground/70 uppercase tracking-wider">By Status</h4>
          {STATUS_ITEMS.map((item) => {
            const count = quoteStatusCounts[item.key] ?? 0;
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium tabular-nums">{count}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${item.color}`}
                    style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
