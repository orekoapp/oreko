'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { DateRange } from 'react-day-picker';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Mock data - will be replaced with server actions
const mockPipelineData = {
  conversionRate: 62.8,
  prevPeriodConversionRate: 58.2,
  avgDealValue: 2506,
  quotesByStatus: [
    { status: 'Draft', count: 12, color: '#94A3B8' },
    { status: 'Sent', count: 24, color: '#3B82F6' },
    { status: 'Viewed', count: 18, color: '#FACC15' },
    { status: 'Accepted', count: 34, color: '#22C55E' },
    { status: 'Declined', count: 8, color: '#EF4444' },
    { status: 'Expired', count: 6, color: '#F97316' },
  ],
};

interface SalesPipelineSectionProps {
  dateRange?: DateRange;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SalesPipelineSection({ dateRange }: SalesPipelineSectionProps) {
  const data = mockPipelineData;

  const conversionTrend = useMemo(() => {
    const change = data.conversionRate - data.prevPeriodConversionRate;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  }, [data]);

  // Calculate radial chart data
  const radialData = useMemo(() => {
    return [
      { name: 'Conversion', value: data.conversionRate, fill: '#22C55E' },
      { name: 'Remaining', value: 100 - data.conversionRate, fill: '#E5E7EB' },
    ];
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sales Pipeline</span>
          <div className="flex items-center gap-2 text-sm font-normal">
            {conversionTrend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span
              className={
                conversionTrend.isPositive ? 'text-green-500' : 'text-red-500'
              }
            >
              {conversionTrend.isPositive ? '+' : '-'}
              {conversionTrend.value}%
            </span>
            <span className="text-muted-foreground">vs prev period</span>
          </div>
        </CardTitle>
        <CardDescription>
          Quote conversion efficiency and pipeline analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Conversion Rate Radial + Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Radial Chart */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative h-[160px] w-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={radialData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {radialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{data.conversionRate}%</span>
                <span className="text-xs text-muted-foreground">Conversion</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Average Deal Value</p>
              <p className="text-xl font-bold">{formatCurrency(data.avgDealValue)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Quotes</p>
              <p className="text-xl font-bold">
                {data.quotesByStatus.reduce((acc, s) => acc + s.count, 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Accepted Quotes</p>
              <p className="text-xl font-bold text-green-600">
                {data.quotesByStatus.find((s) => s.status === 'Accepted')?.count || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Quotes by Status Bar Chart */}
        <div>
          <h4 className="mb-4 text-sm font-medium">Quotes by Status</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.quotesByStatus}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="status"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={70}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload[0]) return null;
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.status}</span>
                        </div>
                        <p className="text-sm">
                          Count: <span className="font-medium">{item.count}</span>
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} animationDuration={500}>
                  {data.quotesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
