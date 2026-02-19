'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ChartCard } from './chart-card';
import {
  CHART_COLORS,
  formatChartCurrency,
  formatFullCurrency,
} from '@/lib/dashboard/chart-utils';
import type { MonthlyComparisonData } from '@/lib/dashboard/types';
import { Button } from '@/components/ui/button';

interface MonthlyComparisonChartProps {
  data: MonthlyComparisonData[];
  isLoading?: boolean;
  className?: string;
  height?: number;
}

type MetricType = 'revenue' | 'quotes' | 'invoices';

const METRICS: { key: MetricType; label: string; color: string }[] = [
  { key: 'revenue', label: 'Revenue', color: CHART_COLORS.primary },
  { key: 'quotes', label: 'Quotes', color: CHART_COLORS.secondary },
  { key: 'invoices', label: 'Invoices', color: CHART_COLORS.success },
];

export function MonthlyComparisonChart({
  data,
  isLoading = false,
  className,
  height = 300,
}: MonthlyComparisonChartProps) {
  const [metric, setMetric] = useState<MetricType>('revenue');

  const chartData = useMemo(() => {
    return data.map((item) => {
      let value: number;
      switch (metric) {
        case 'revenue':
          value = item.revenue;
          break;
        case 'quotes':
          value = item.quoteCount;
          break;
        case 'invoices':
          value = item.invoiceCount;
          break;
        default:
          value = 0;
      }

      // Extract short month name
      const shortMonth = item.month.split(' ')[0];

      return {
        ...item,
        shortMonth,
        value,
      };
    });
  }, [data, metric]);

  const currentMetric = METRICS.find((m) => m.key === metric)!;
  const isEmpty = data.length === 0;

  // Calculate total and average
  const { total, average } = useMemo(() => {
    if (chartData.length === 0) return { total: 0, average: 0 };
    const sum = chartData.reduce((acc, item) => acc + item.value, 0);
    return {
      total: sum,
      average: sum / chartData.length,
    };
  }, [chartData]);

  const metricToggle = (
    <div className="flex gap-1">
      {METRICS.map((m) => (
        <Button
          key={m.key}
          variant={metric === m.key ? 'default' : 'ghost'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setMetric(m.key)}
        >
          {m.label}
        </Button>
      ))}
    </div>
  );

  const formatValue = (value: number) => {
    if (metric === 'revenue') return formatFullCurrency(value);
    return value.toString();
  };

  const formatAxisValue = (value: number) => {
    if (metric === 'revenue') return formatChartCurrency(value);
    return value.toString();
  };

  return (
    <ChartCard
      title="Monthly Comparison"
      description={
        isEmpty
          ? undefined
          : `${data.length} months, Avg: ${formatValue(average)}`
      }
      className={className}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="No monthly data available"
      actions={metricToggle}
    >
      <div style={{ height }} data-testid="monthly-comparison-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis
              dataKey="shortMonth"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tickFormatter={formatAxisValue}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={60}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null;
                const item = payload[0].payload;

                return (
                  <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                    <p className="font-medium mb-1">{item.month}</p>
                    <p className="text-sm">
                      {currentMetric.label}:{' '}
                      <span className="font-medium">{formatValue(item.value)}</span>
                    </p>
                    <div className="mt-1 pt-1 border-t text-xs text-muted-foreground">
                      <p>Quotes: {item.quoteCount}</p>
                      <p>Invoices: {item.invoiceCount}</p>
                      <p>Clients: {item.clientCount}</p>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="value"
              fill={currentMetric.color}
              radius={[4, 4, 0, 0]}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
