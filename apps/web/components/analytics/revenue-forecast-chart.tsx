'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ForecastDataPoint } from '@/lib/dashboard/types';

interface RevenueForecastChartProps {
  dateRange?: DateRange;
  forecastData?: ForecastDataPoint[];
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const chartConfig = {
  projected: {
    label: 'Projected',
    color: 'var(--primary-300)',
  },
  actual: {
    label: 'Actual',
    color: 'var(--primary-500)',
  },
} satisfies ChartConfig;

export function RevenueForecastChart({ forecastData }: RevenueForecastChartProps) {
  const data = useMemo(() => {
    if (!forecastData || forecastData.length === 0) {
      return [];
    }
    return forecastData.map((point) => ({
      month: format(new Date(point.date + '-01'), 'MMM'),
      projected: point.forecast ?? point.actual ?? 0,
      actual: point.isProjection ? null : point.actual,
    }));
  }, [forecastData]);

  const totalProjected = data.reduce((sum, d) => sum + d.projected, 0);
  const totalActual = data.reduce((sum, d) => sum + (d.actual || 0), 0);
  const variance = totalProjected > 0 ? ((totalActual - totalProjected) / totalProjected) * 100 : 0;

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Revenue Forecast</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
            No forecast data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Revenue Forecast</CardTitle>
          </div>
          <p className="text-2xl font-semibold tracking-tight mt-1">
            {formatCurrency(totalActual || totalProjected)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1">
          <span className="text-xs text-muted-foreground">Variance</span>
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              variance >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {variance >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(variance).toFixed(1)}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="forecastFillProjected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-projected)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="var(--color-projected)" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="forecastFillActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-actual)" stopOpacity={0.3} />
                <stop offset="40%" stopColor="var(--color-actual)" stopOpacity={0.08} />
                <stop offset="100%" stopColor="var(--color-actual)" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="forecastStrokeActual" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--primary-400)" />
                <stop offset="100%" stopColor="var(--primary-600)" />
              </linearGradient>
            </defs>
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
              tickFormatter={(value) => `$${value / 1000}k`}
              width={50}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              type="monotone"
              dataKey="projected"
              name="Projected"
              stroke="var(--color-projected)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#forecastFillProjected)"
            />
            <Area
              type="natural"
              dataKey="actual"
              name="Actual"
              stroke="url(#forecastStrokeActual)"
              strokeWidth={2}
              fill="url(#forecastFillActual)"
              connectNulls={false}
            />
          </AreaChart>
        </ChartContainer>
        <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 border-t-[1.5px] border-dashed border-primary/50" />
            <span>Projected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-5 rounded-full bg-primary" />
            <span>Actual</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
