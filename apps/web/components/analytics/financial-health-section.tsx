'use client';

import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { PaymentAgingData } from '@/lib/dashboard/types';

interface FinancialHealthSectionProps {
  outstandingAmount: number;
  overdueAmount: number;
  revenueThisMonth: number;
  paymentAging: PaymentAgingData;
}

// Format as currency (values are already in dollars)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function FinancialHealthSection({
  outstandingAmount,
  overdueAmount,
  revenueThisMonth,
  paymentAging,
}: FinancialHealthSectionProps) {
  // Calculate collection rate (collected vs total outstanding)
  const collectionRate = outstandingAmount > 0
    ? Math.min(100, (revenueThisMonth / (revenueThisMonth + outstandingAmount)) * 100)
    : 100;

  // Build aging buckets from real data
  const agingBuckets = useMemo(() => {
    const total = paymentAging.totalOutstanding || 1; // Avoid division by zero
    return [
      {
        bucket: 'Current',
        amount: paymentAging.current,
        percentage: (paymentAging.current / total) * 100,
        color: '#22C55E',
      },
      {
        bucket: '1-30 Days',
        amount: paymentAging.days1to30,
        percentage: (paymentAging.days1to30 / total) * 100,
        color: '#FACC15',
      },
      {
        bucket: '31-60 Days',
        amount: paymentAging.days31to60,
        percentage: (paymentAging.days31to60 / total) * 100,
        color: '#F97316',
      },
      {
        bucket: '60+ Days',
        amount: paymentAging.days61to90 + paymentAging.days90plus,
        percentage: ((paymentAging.days61to90 + paymentAging.days90plus) / total) * 100,
        color: '#EF4444',
      },
    ];
  }, [paymentAging]);

  const healthStatus = useMemo(() => {
    if (outstandingAmount === 0) return { label: 'Excellent', color: 'text-green-500', icon: CheckCircle2 };
    const overdueRatio = (overdueAmount / outstandingAmount) * 100;
    if (overdueRatio < 10) return { label: 'Excellent', color: 'text-green-500', icon: CheckCircle2 };
    if (overdueRatio < 25) return { label: 'Good', color: 'text-yellow-500', icon: Clock };
    return { label: 'Needs Attention', color: 'text-red-500', icon: AlertTriangle };
  }, [outstandingAmount, overdueAmount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Financial Health</span>
          <div className={cn('flex items-center gap-2 text-sm font-normal', healthStatus.color)}>
            <healthStatus.icon className="h-4 w-4" />
            <span>{healthStatus.label}</span>
          </div>
        </CardTitle>
        <CardDescription>
          Outstanding balances and payment collection metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Outstanding</span>
              <span className="font-semibold">{formatCurrency(outstandingAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overdue</span>
              <span className="font-semibold text-red-500">{formatCurrency(overdueAmount)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Collected (MTD)</span>
              <span className="font-semibold text-green-600">{formatCurrency(revenueThisMonth)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Collection Rate</span>
              <span className="font-semibold">{collectionRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Aging Buckets */}
        <div>
          <h4 className="mb-3 text-sm font-medium">Receivables Aging</h4>
          <div className="space-y-3">
            {agingBuckets.map((bucket) => (
              <div key={bucket.bucket} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: bucket.color }}
                    />
                    <span>{bucket.bucket}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{bucket.percentage.toFixed(1)}%</span>
                    <span className="w-20 text-right font-medium">
                      {formatCurrency(bucket.amount)}
                    </span>
                  </div>
                </div>
                <Progress
                  value={bucket.percentage}
                  className="h-2"
                  style={
                    {
                      '--progress-background': bucket.color,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
