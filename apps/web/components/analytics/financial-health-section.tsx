'use client';

import { useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PaymentAgingData } from '@/lib/dashboard/types';

interface FinancialHealthSectionProps {
  dateRange?: DateRange;
  outstandingAmount: number;
  overdueAmount: number;
  revenueThisMonth: number;
  paymentAging: PaymentAgingData;
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const AGING_BUCKETS_CONFIG = [
  { label: 'Current', color: 'bg-emerald-500', dot: 'bg-emerald-500' },
  { label: '1-30 Days', color: 'bg-amber-400', dot: 'bg-amber-400' },
  { label: '31-60 Days', color: 'bg-orange-500', dot: 'bg-orange-500' },
  { label: '60+ Days', color: 'bg-red-500', dot: 'bg-red-500' },
] as const;

export function FinancialHealthSection({
  outstandingAmount,
  overdueAmount,
  revenueThisMonth,
  paymentAging,
}: FinancialHealthSectionProps) {
  const collectionRate = outstandingAmount > 0
    ? Math.min(100, (revenueThisMonth / (revenueThisMonth + outstandingAmount)) * 100)
    : 100;

  const agingBuckets = useMemo(() => {
    const total = paymentAging.totalOutstanding || 1;
    return [
      { amount: paymentAging.current, percentage: (paymentAging.current / total) * 100 },
      { amount: paymentAging.days1to30, percentage: (paymentAging.days1to30 / total) * 100 },
      { amount: paymentAging.days31to60, percentage: (paymentAging.days31to60 / total) * 100 },
      {
        amount: paymentAging.days61to90 + paymentAging.days90plus,
        percentage: ((paymentAging.days61to90 + paymentAging.days90plus) / total) * 100,
      },
    ];
  }, [paymentAging]);

  const healthStatus = useMemo(() => {
    if (outstandingAmount === 0) return { label: 'Healthy', color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 };
    const overdueRatio = (overdueAmount / outstandingAmount) * 100;
    if (overdueRatio < 10) return { label: 'Healthy', color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 };
    if (overdueRatio < 25) return { label: 'Fair', color: 'text-amber-500', icon: Clock };
    return { label: 'Needs Attention', color: 'text-red-500 dark:text-red-400', icon: AlertTriangle };
  }, [outstandingAmount, overdueAmount]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
          <div className={cn('flex items-center gap-1.5 text-xs font-medium', healthStatus.color)}>
            <healthStatus.icon className="h-3 w-3" />
            <span>{healthStatus.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key metrics row */}
        <div className="flex items-center gap-6 mb-5">
          <div>
            <p className="text-2xl font-semibold tracking-tight">{formatCurrency(outstandingAmount)}</p>
            <p className="text-xs text-muted-foreground">Outstanding</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-semibold tracking-tight text-red-500 dark:text-red-400">{formatCurrency(overdueAmount)}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-semibold tracking-tight">{collectionRate.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Collection rate</p>
          </div>
        </div>

        {/* Aging breakdown */}
        <div className="space-y-2.5">
          {agingBuckets.map((bucket, i) => {
            const config = AGING_BUCKETS_CONFIG[i]!;
            return (
              <div key={config.label} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-20 shrink-0">
                  <span className={`h-1.5 w-1.5 rounded-full ${config.dot} shrink-0`} />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${config.color}`}
                    style={{ width: `${Math.max(bucket.percentage, bucket.amount > 0 ? 3 : 0)}%` }}
                  />
                </div>
                <span className="text-xs font-medium tabular-nums w-14 text-right">
                  {formatCurrency(bucket.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
