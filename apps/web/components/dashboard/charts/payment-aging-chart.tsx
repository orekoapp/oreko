'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartCard } from './chart-card';
import { AgingTooltip } from './chart-tooltip';
import {
  AGING_COLORS,
  formatChartCurrency,
  formatFullCurrency,
  getAgingLabel,
} from '@/lib/dashboard/chart-utils';
import type { PaymentAgingData } from '@/lib/dashboard/types';

interface PaymentAgingChartProps {
  data: PaymentAgingData;
  isLoading?: boolean;
  className?: string;
  height?: number;
  onBucketClick?: (bucket: string) => void;
}

const BUCKETS = [
  { key: 'current', label: 'Current', color: AGING_COLORS.current },
  { key: 'days1to30', label: '1-30 Days', color: AGING_COLORS.days1to30 },
  { key: 'days31to60', label: '31-60 Days', color: AGING_COLORS.days31to60 },
  { key: 'days61to90', label: '61-90 Days', color: AGING_COLORS.days61to90 },
  { key: 'days90plus', label: '90+ Days', color: AGING_COLORS.days90plus },
];

export function PaymentAgingChart({
  data,
  isLoading = false,
  className,
  height = 280,
  onBucketClick,
}: PaymentAgingChartProps) {
  const chartData = useMemo(() => {
    return BUCKETS.map((bucket) => ({
      name: bucket.label,
      key: bucket.key,
      value: data[bucket.key as keyof PaymentAgingData] as number,
      fill: bucket.color,
    }));
  }, [data]);

  const isEmpty = data.totalOutstanding === 0;

  return (
    <ChartCard
      title="Payment Aging"
      description={
        isEmpty
          ? undefined
          : `Total Outstanding: ${formatFullCurrency(data.totalOutstanding)}`
      }
      className={className}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="No outstanding invoices"
    >
      <div style={{ height }} data-testid="payment-aging-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickFormatter={formatChartCurrency}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null;
                const item = payload[0].payload;
                const percentage =
                  data.totalOutstanding > 0
                    ? ((item.value / data.totalOutstanding) * 100).toFixed(1)
                    : '0';
                return (
                  <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <p className="text-sm">
                      Amount: <span className="font-medium">{formatFullCurrency(item.value)}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {percentage}% of total
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              animationDuration={500}
              onClick={(data) => onBucketClick?.(data.key)}
              style={{ cursor: onBucketClick ? 'pointer' : 'default' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
