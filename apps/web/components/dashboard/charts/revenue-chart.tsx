'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from './chart-card';
import { RevenueTooltip } from './chart-tooltip';
import {
  CHART_COLORS,
  formatChartCurrency,
  formatChartDate,
  formatFullCurrency,
} from '@/lib/dashboard/chart-utils';
import type { RevenueDataPoint, DashboardPeriod } from '@/lib/dashboard/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RevenueChartProps {
  data: RevenueDataPoint[];
  period: DashboardPeriod;
  onPeriodChange?: (period: DashboardPeriod) => void;
  isLoading?: boolean;
  showPeriodSelector?: boolean;
  height?: number;
  className?: string;
}

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '12m', label: '12 Months' },
];

export function RevenueChart({
  data,
  period,
  onPeriodChange,
  isLoading = false,
  showPeriodSelector = true,
  height = 300,
  className,
}: RevenueChartProps) {
  // Calculate total revenue for the period
  const totalRevenue = useMemo(() => {
    return data.reduce((sum, point) => sum + point.revenue, 0);
  }, [data]);

  // Format data for chart
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      formattedDate: formatChartDate(point.date, period),
    }));
  }, [data, period]);

  const isEmpty = data.length === 0;

  const periodSelector = showPeriodSelector && onPeriodChange && (
    <Select value={period} onValueChange={(v) => onPeriodChange(v as DashboardPeriod)}>
      <SelectTrigger className="w-[100px] h-8" data-testid="period-selector">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <ChartCard
      title="Revenue Trend"
      description={isEmpty ? undefined : `Total: ${formatFullCurrency(totalRevenue)}`}
      className={className}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="No revenue data for this period"
      actions={periodSelector}
    >
      <div style={{ height }} data-testid="revenue-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              tickFormatter={formatChartCurrency}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={60}
              className="text-muted-foreground"
            />
            <Tooltip content={<RevenueTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              fill="url(#revenueGradient)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
