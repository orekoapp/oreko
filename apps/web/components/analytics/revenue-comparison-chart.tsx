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
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium">Revenue Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
            No revenue comparison data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium">Revenue Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
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
                        <p key={index} className="text-xs" style={{ color: entry.color }}>
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
                fill="var(--primary-500)"
                radius={[3, 3, 0, 0]}
                barSize={12}
              />
              <Bar
                dataKey="lastYear"
                name="Last Year"
                fill="var(--primary-200)"
                radius={[3, 3, 0, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground/70">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--primary-500)' }} />
            <span>This Year</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--primary-200)' }} />
            <span>Last Year</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
