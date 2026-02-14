'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { DateRange } from 'react-day-picker';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with server actions
const mockFinancialData = {
  outstandingAmount: 34500,
  overdueAmount: 12300,
  collectedThisMonth: 28900,
  collectionRate: 78.5,
  agingBuckets: [
    { bucket: 'Current', amount: 22200, percentage: 64.3, color: '#22C55E' },
    { bucket: '1-30 Days', amount: 8500, percentage: 24.6, color: '#FACC15' },
    { bucket: '31-60 Days', amount: 2800, percentage: 8.1, color: '#F97316' },
    { bucket: '60+ Days', amount: 1000, percentage: 3.0, color: '#EF4444' },
  ],
  cashFlowTrend: [
    { month: 'Jan', inflow: 32000, outflow: 18000 },
    { month: 'Feb', inflow: 28000, outflow: 22000 },
    { month: 'Mar', inflow: 35000, outflow: 19000 },
    { month: 'Apr', inflow: 41000, outflow: 24000 },
    { month: 'May', inflow: 38000, outflow: 21000 },
    { month: 'Jun', inflow: 45000, outflow: 26000 },
  ],
};

interface FinancialHealthSectionProps {
  dateRange?: DateRange;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FinancialHealthSection({ dateRange }: FinancialHealthSectionProps) {
  const data = mockFinancialData;

  const healthStatus = useMemo(() => {
    const overdueRatio = (data.overdueAmount / data.outstandingAmount) * 100;
    if (overdueRatio < 10) return { label: 'Excellent', color: 'text-green-500', icon: CheckCircle2 };
    if (overdueRatio < 25) return { label: 'Good', color: 'text-yellow-500', icon: Clock };
    return { label: 'Needs Attention', color: 'text-red-500', icon: AlertTriangle };
  }, [data]);

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
              <span className="font-semibold">{formatCurrency(data.outstandingAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overdue</span>
              <span className="font-semibold text-red-500">{formatCurrency(data.overdueAmount)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Collected (MTD)</span>
              <span className="font-semibold text-green-600">{formatCurrency(data.collectedThisMonth)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Collection Rate</span>
              <span className="font-semibold">{data.collectionRate}%</span>
            </div>
          </div>
        </div>

        {/* Aging Buckets */}
        <div>
          <h4 className="mb-3 text-sm font-medium">Receivables Aging</h4>
          <div className="space-y-3">
            {data.agingBuckets.map((bucket) => (
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
                    <span className="text-muted-foreground">{bucket.percentage}%</span>
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

        {/* Cash Flow Trend */}
        <div>
          <h4 className="mb-4 text-sm font-medium">Cash Flow Trend</h4>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.cashFlowTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                  width={50}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload) return null;
                    return (
                      <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                        <p className="mb-1 font-medium">{label}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value as number)}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  name="Inflow"
                  stackId="1"
                  stroke="#22C55E"
                  fill="#22C55E"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  name="Outflow"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Inflow</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Outflow</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
