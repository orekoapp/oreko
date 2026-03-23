'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  makeChartCurrencyFormatter,
  formatChartDate,
  formatFullCurrency,
} from '@/lib/dashboard/chart-utils';
import type { RevenueDataPoint, DashboardPeriod } from '@/lib/dashboard/types';

interface RevenueChartProps {
  data: RevenueDataPoint[];
  period: DashboardPeriod;
  onPeriodChange?: (period: DashboardPeriod) => void;
  isLoading?: boolean;
  showPeriodSelector?: boolean;
  className?: string;
  currency?: string;
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--primary-500)',
  },
} satisfies ChartConfig;

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
  className,
  currency = 'USD',
}: RevenueChartProps) {
  // Filter data based on selected period
  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoff: Date;
    switch (period) {
      case '7d':
        cutoff = new Date(now.getTime() - 7 * 86400000);
        break;
      case '30d':
        cutoff = new Date(now.getTime() - 30 * 86400000);
        break;
      case '90d':
        cutoff = new Date(now.getTime() - 90 * 86400000);
        break;
      case '12m':
        cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'all':
      default:
        cutoff = new Date(0);
    }
    const filtered = data.filter((point) => new Date(point.date) >= cutoff);

    // For 12m / all, aggregate by month for cleaner display
    if (period === '12m' || period === 'all') {
      const monthly = new Map<string, { date: string; revenue: number; invoiceCount: number }>();
      for (const point of filtered) {
        const monthKey = point.date.substring(0, 7);
        const existing = monthly.get(monthKey);
        if (existing) {
          existing.revenue += point.revenue;
          existing.invoiceCount += point.invoiceCount;
        } else {
          monthly.set(monthKey, { date: `${monthKey}-01`, revenue: point.revenue, invoiceCount: point.invoiceCount });
        }
      }
      return Array.from(monthly.values());
    }

    // For 90d, aggregate by week
    if (period === '90d') {
      const weekly = new Map<string, { date: string; revenue: number; invoiceCount: number }>();
      for (const point of filtered) {
        const d = new Date(point.date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const weekKey = weekStart.toISOString().split('T')[0]!;
        const existing = weekly.get(weekKey);
        if (existing) {
          existing.revenue += point.revenue;
          existing.invoiceCount += point.invoiceCount;
        } else {
          weekly.set(weekKey, { date: weekKey, revenue: point.revenue, invoiceCount: point.invoiceCount });
        }
      }
      return Array.from(weekly.values());
    }

    return filtered;
  }, [data, period]);

  const totalRevenue = useMemo(() => {
    return filteredData.reduce((sum, point) => sum + point.revenue, 0);
  }, [filteredData]);

  const chartData = useMemo(() => {
    return filteredData.map((point) => ({
      ...point,
      formattedDate: formatChartDate(point.date, period),
    }));
  }, [filteredData, period]);

  const isEmpty = chartData.length === 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          {!isEmpty && (
            <p className="text-2xl font-semibold tracking-tight mt-1">
              {formatFullCurrency(totalRevenue, currency)}
            </p>
          )}
        </div>
        {showPeriodSelector && onPeriodChange && (
          <Select value={period} onValueChange={(v) => onPeriodChange(v as DashboardPeriod)}>
            <SelectTrigger className="h-7 w-[100px] text-xs">
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
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {isEmpty ? (
          <div className="flex h-[280px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No revenue data for this period</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                  <stop offset="40%" stopColor="var(--color-revenue)" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="strokeRevenue" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--primary-400)" />
                  <stop offset="100%" stopColor="var(--primary-600)" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-[11px]"
              />
              <YAxis
                tickFormatter={makeChartCurrencyFormatter(currency)}
                tickLine={false}
                axisLine={false}
                width={65}
                className="text-[11px]"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="natural"
                dataKey="revenue"
                stroke="url(#strokeRevenue)"
                strokeWidth={2}
                fill="url(#fillRevenue)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
