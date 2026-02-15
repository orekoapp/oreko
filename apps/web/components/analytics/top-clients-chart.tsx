'use client';

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

// Mock data - will be replaced with server actions
const mockTopClients = [
  { name: 'TechFlow Inc.', revenue: 45200, color: '#3B82F6' },
  { name: 'Acme Corp', revenue: 38500, color: '#8B5CF6' },
  { name: 'GlobalTech', revenue: 32100, color: '#EC4899' },
  { name: 'StartupXYZ', revenue: 28400, color: '#F59E0B' },
  { name: 'Digital Agency', revenue: 21800, color: '#10B981' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TopClientsChart() {
  const data = mockTopClients;
  const totalRevenue = data.reduce((sum, client) => sum + client.revenue, 0);

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
              data={data}
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
                  const data = payload[0].payload;
                  const percentage = ((data.revenue / totalRevenue) * 100).toFixed(1);
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                      <p className="font-medium">{data.name}</p>
                      <p className="text-sm text-primary">{formatCurrency(data.revenue)}</p>
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
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total from top 5</span>
            <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
