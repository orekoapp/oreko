'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  QuoteStatusCounts,
  InvoiceStatusCounts,
  ConversionFunnelData,
} from '@/lib/dashboard/types';

// ============================================
// Radial Progress Ring (SVG with gradient)
// ============================================

interface RadialProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  gradientId: string;
  label: string;
}

function RadialProgress({
  value,
  size = 80,
  strokeWidth = 6,
  gradientId,
  label,
}: RadialProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
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
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold tabular-nums">{label}</span>
      </div>
    </div>
  );
}

// ============================================
// Win Rate Card
// ============================================

interface WinRateCardProps {
  data: QuoteStatusCounts;
  className?: string;
}

export function WinRateCard({ data, className }: WinRateCardProps) {
  const { winRate, accepted, total } = useMemo(() => {
    const decided = data.accepted + data.declined + data.expired;
    const rate = decided > 0 ? (data.accepted / decided) * 100 : 0;
    return { winRate: rate, accepted: data.accepted, total: decided };
  }, [data]);

  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-5 p-5">
        <RadialProgress
          value={winRate}
          gradientId="winRateGradient"
          label={`${winRate.toFixed(0)}%`}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium">Win Rate</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {total > 0
              ? `${accepted} of ${total} decided`
              : 'No decided quotes yet'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Collection Rate Card
// ============================================

interface CollectionRateCardProps {
  data: InvoiceStatusCounts;
  className?: string;
}

export function CollectionRateCard({ data, className }: CollectionRateCardProps) {
  const { collectionRate, paid, billable } = useMemo(() => {
    const totalBillable = data.sent + data.viewed + data.paid + data.partial + data.overdue;
    const rate = totalBillable > 0 ? (data.paid / totalBillable) * 100 : 0;
    return { collectionRate: rate, paid: data.paid, billable: totalBillable };
  }, [data]);

  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-5 p-5">
        <RadialProgress
          value={collectionRate}
          gradientId="collectionRateGradient"
          label={`${collectionRate.toFixed(0)}%`}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium">Collection Rate</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {billable > 0
              ? `${paid} of ${billable} collected`
              : 'No billed invoices yet'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Pipeline Card (horizontal gradient bar)
// ============================================

interface PipelineCardProps {
  data: ConversionFunnelData;
  className?: string;
}

const PIPELINE_STAGES = [
  { key: 'quotesCreated', label: 'Created' },
  { key: 'quotesSent', label: 'Sent' },
  { key: 'quotesViewed', label: 'Viewed' },
  { key: 'quotesAccepted', label: 'Won' },
  { key: 'invoicesCreated', label: 'Invoiced' },
  { key: 'invoicesPaid', label: 'Paid' },
] as const;

const PIPELINE_OPACITIES = [1, 0.85, 0.7, 0.55, 0.42, 0.3];

export function PipelineCard({ data, className }: PipelineCardProps) {
  const maxValue = data.quotesCreated || 1;

  const stages = useMemo(() => {
    return PIPELINE_STAGES.map((stage, i) => {
      const value = data[stage.key];
      const pct = (value / maxValue) * 100;
      return { ...stage, value, pct, opacity: PIPELINE_OPACITIES[i] };
    });
  }, [data, maxValue]);

  const overallConversion = useMemo(() => {
    if (data.quotesCreated === 0) return 0;
    return (data.invoicesPaid / data.quotesCreated) * 100;
  }, [data]);

  const isEmpty = data.quotesCreated === 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2 p-5">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
          {!isEmpty && (
            <span className="text-xs text-muted-foreground">
              {overallConversion.toFixed(0)}% end-to-end
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-5 pb-5">
        {isEmpty ? (
          <div className="flex h-[100px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No pipeline data</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stages.map((stage) => (
              <div key={stage.key} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{stage.label}</span>
                  <span className="font-medium tabular-nums">{stage.value}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--primary-100)] dark:bg-[var(--primary-950)]">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(stage.pct, 2)}%`,
                      background: `linear-gradient(90deg, var(--primary-500), var(--primary-600))`,
                      opacity: stage.opacity,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
