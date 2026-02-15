'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlyComparisonData } from '@/lib/dashboard/types';

interface RevenueComparisonChartProps {
  data?: MonthlyComparisonData[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RevenueComparisonChart({ data: propData }: RevenueComparisonChartProps) {
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
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No revenue comparison data available
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
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `$${value / 1000}k`}
                width={45}
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
              <Bar
                dataKey="thisYear"
                name="This Year"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="lastYear"
                name="Last Year"
                fill="#94A3B8"
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-500" />
            <span className="text-muted-foreground">This Year</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-400" />
            <span className="text-muted-foreground">Last Year</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
