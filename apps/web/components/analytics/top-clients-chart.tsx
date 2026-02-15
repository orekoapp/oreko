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
  Cell,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

interface TopClient {
  name: string;
  revenue: number;
}

interface TopClientsChartProps {
  data?: TopClient[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TopClientsChart({ data: propData }: TopClientsChartProps) {
  const chartData = useMemo(() => {
    if (!propData || propData.length === 0) {
      return [];
    }
    return propData.map((client, index) => ({
      ...client,
      color: COLORS[index % COLORS.length],
    }));
  }, [propData]);

  const totalRevenue = chartData.reduce((sum, client) => sum + client.revenue, 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Revenue</CardTitle>
          <CardDescription>Your highest-value clients this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No client revenue data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Clients by Revenue</CardTitle>
        <CardDescription>
          Your highest-value clients this period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                width={100}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload[0]) return null;
                  const item = payload[0].payload;
                  const percentage = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : '0';
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-primary">{formatCurrency(item.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{percentage}% of total</p>
                    </div>
                  );
                }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar
                dataKey="revenue"
                radius={[0, 4, 4, 0]}
                barSize={24}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total from top {chartData.length}</span>
            <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
