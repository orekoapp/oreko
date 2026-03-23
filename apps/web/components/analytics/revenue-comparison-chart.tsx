'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { MonthlyComparisonData } from '@/lib/dashboard/types';

interface RevenueComparisonChartProps {
  data?: MonthlyComparisonData[];
  currency?: string;
}

const chartConfig = {
  thisYear: {
    label: 'This Year',
    color: 'var(--primary-500)',
  },
  lastYear: {
    label: 'Last Year',
    color: 'var(--primary-200)',
  },
} satisfies ChartConfig;

export function RevenueComparisonChart({ data: propData, currency = 'USD' }: RevenueComparisonChartProps) {
  const chartData = useMemo(() => {
    if (!propData || propData.length === 0) {
      return [];
    }
    return propData.slice(-6).map((item) => ({
      month: item.month.slice(0, 3),
      thisYear: item.revenue,
      lastYear: item.prevYearRevenue ?? 0,
    }));
  }, [propData]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Revenue Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">No comparison data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Year-over-year data will appear once you have 12+ months of history.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Revenue Comparison</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-[11px]"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-[11px]"
              tickFormatter={(value) => {
                const symbol = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 })
                  .formatToParts(0)
                  .find(p => p.type === 'currency')?.value ?? '$';
                return `${symbol}${value / 1000}k`;
              }}
              width={40}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="thisYear"
              fill="var(--color-thisYear)"
              radius={[4, 4, 0, 0]}
              barSize={14}
            />
            <Bar
              dataKey="lastYear"
              fill="var(--color-lastYear)"
              radius={[4, 4, 0, 0]}
              barSize={14}
            />
          </BarChart>
        </ChartContainer>
        <div className="mt-2 flex items-center justify-center gap-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <span>This Year</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary/20" />
            <span>Last Year</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
