'use client';

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

// Mock data - will be replaced with server actions
const mockRevenueData = [
  { month: 'Jan', thisYear: 32000, lastYear: 28000 },
  { month: 'Feb', thisYear: 28000, lastYear: 31000 },
  { month: 'Mar', thisYear: 35000, lastYear: 29000 },
  { month: 'Apr', thisYear: 41000, lastYear: 33000 },
  { month: 'May', thisYear: 38000, lastYear: 36000 },
  { month: 'Jun', thisYear: 45000, lastYear: 38000 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RevenueComparisonChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Revenue Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockRevenueData}
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
