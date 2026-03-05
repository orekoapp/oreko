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

import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ForecastDataPoint } from '@/lib/dashboard/types';

interface RevenueForecastChartProps {
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

  // Calculate variance
  const totalProjected = data.reduce((sum, d) => sum + d.projected, 0);
  const totalActual = data.reduce((sum, d) => sum + (d.actual || 0), 0);
  const variance = totalProjected > 0 ? ((totalActual - totalProjected) / totalProjected) * 100 : 0;

  if (data.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
          <CardDescription>Projected quotes vs actual revenue collected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No forecast data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Revenue Forecast</CardTitle>
            <CardDescription>
              Projected quotes vs actual revenue collected
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Variance</p>
            <p className={`text-lg font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
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
                        entry.value !== null && (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
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
                name="Projected (Quotes)"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorProjected)"
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual Revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorActual)"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 border-t-2 border-dashed border-violet-500" />
            <span className="text-muted-foreground">Projected (Quotes)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 bg-blue-500" />
            <span className="text-muted-foreground">Actual Revenue</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
