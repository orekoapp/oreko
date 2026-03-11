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
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ForecastDataPoint } from '@/lib/dashboard/types';

interface RevenueForecastChartProps {
  dateRange?: DateRange;
  forecastData?: ForecastDataPoint[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

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
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium">Revenue Forecast</CardTitle>
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
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">Revenue Forecast</CardTitle>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground/60">Variance</span>
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-medium ${
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="forecastFillProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-300)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--primary-300)" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="forecastFillActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-500)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--primary-500)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/50" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                className="text-[11px]"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-[11px]"
                tickFormatter={(value) => `$${value / 1000}k`}
                width={50}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload) return null;
                  return (
                    <div className="rounded-lg border bg-card px-3 py-2 shadow-sm">
                      <p className="text-xs font-medium mb-1">{label}</p>
                      {payload.map((entry, index) => (
                        entry.value !== null && (
                          <p key={index} className="text-xs" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value as number)}
                          </p>
                        )
                      ))}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="projected"
                name="Projected"
                stroke="var(--primary-300)"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#forecastFillProjected)"
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="var(--primary-500)"
                strokeWidth={2}
                fill="url(#forecastFillActual)"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground/70">
          <div className="flex items-center gap-2">
            <span className="h-px w-5 border-t-[1.5px] border-dashed" style={{ borderColor: 'var(--primary-300)' }} />
            <span>Projected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-px w-5" style={{ borderTop: '1.5px solid var(--primary-500)' }} />
            <span>Actual</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
