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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const AGING_BUCKETS_CONFIG = [
  { label: 'Current', color: 'bg-emerald-500' },
  { label: '1-30 Days', color: 'bg-amber-400' },
  { label: '31-60 Days', color: 'bg-orange-500' },
  { label: '60+ Days', color: 'bg-red-500' },
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
    if (outstandingAmount === 0) return { label: 'Excellent', color: 'text-emerald-600', icon: CheckCircle2 };
    const overdueRatio = (overdueAmount / outstandingAmount) * 100;
    if (overdueRatio < 10) return { label: 'Excellent', color: 'text-emerald-600', icon: CheckCircle2 };
    if (overdueRatio < 25) return { label: 'Good', color: 'text-amber-500', icon: Clock };
    return { label: 'Attention', color: 'text-red-500', icon: AlertTriangle };
  }, [outstandingAmount, overdueAmount]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
          <div className={cn('flex items-center gap-1.5 text-xs font-medium', healthStatus.color)}>
            <healthStatus.icon className="h-3.5 w-3.5" />
            <span>{healthStatus.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics - 2x2 grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">Outstanding</p>
            <p className="text-lg font-semibold mt-0.5">{formatCurrency(outstandingAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">Overdue</p>
            <p className="text-lg font-semibold text-red-500 mt-0.5">{formatCurrency(overdueAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">Collected (MTD)</p>
            <p className="text-lg font-semibold text-emerald-600 mt-0.5">{formatCurrency(revenueThisMonth)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground/70 uppercase tracking-wider">Collection Rate</p>
            <p className="text-lg font-semibold mt-0.5">{collectionRate.toFixed(0)}%</p>
          </div>
        </div>

        {/* Aging Buckets */}
        <div className="space-y-2.5">
          <h4 className="text-xs text-muted-foreground/70 uppercase tracking-wider">Receivables Aging</h4>
          {agingBuckets.map((bucket, i) => {
            const config = AGING_BUCKETS_CONFIG[i]!;
            return (
              <div key={config.label} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${config.color}`} />
                    <span className="text-muted-foreground">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground/60 tabular-nums">{bucket.percentage.toFixed(0)}%</span>
                    <span className="font-medium tabular-nums w-16 text-right">
                      {formatCurrency(bucket.amount)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${config.color}`}
                    style={{ width: `${Math.max(bucket.percentage, bucket.amount > 0 ? 3 : 0)}%` }}
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
