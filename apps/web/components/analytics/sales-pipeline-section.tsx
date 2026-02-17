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
import type { QuoteStatusCounts, ConversionFunnelData } from '@/lib/dashboard/types';

interface SalesPipelineSectionProps {
  dateRange?: DateRange;
  conversionRate: number;
  avgDealValue: number;
  quoteStatusCounts: QuoteStatusCounts;
  conversionFunnel: ConversionFunnelData;
}

// Format as currency (values are already in dollars)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function SalesPipelineSection({
  dateRange,
  conversionRate,
  avgDealValue,
  quoteStatusCounts,
  conversionFunnel,
}: SalesPipelineSectionProps) {
  // Build quotes by status from real data
  const quotesByStatus = useMemo(() => [
    { status: 'Draft', count: quoteStatusCounts.draft, color: '#94A3B8' },
    { status: 'Sent', count: quoteStatusCounts.sent, color: '#3B82F6' },
    { status: 'Viewed', count: quoteStatusCounts.viewed, color: '#FACC15' },
    { status: 'Accepted', count: quoteStatusCounts.accepted, color: '#22C55E' },
    { status: 'Declined', count: quoteStatusCounts.declined, color: '#EF4444' },
    { status: 'Expired', count: quoteStatusCounts.expired, color: '#F97316' },
  ], [quoteStatusCounts]);

  const totalQuotes = conversionFunnel.quotesCreated;
  const acceptedQuotes = conversionFunnel.quotesAccepted;

  // Calculate radial chart data
  const radialData = useMemo(() => {
    return [
      { name: 'Conversion', value: conversionRate, fill: '#22C55E' },
      { name: 'Remaining', value: 100 - conversionRate, fill: '#E5E7EB' },
    ];
  }, [conversionRate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Pipeline</CardTitle>
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
                <span className="text-2xl font-bold">{conversionRate.toFixed(1)}%</span>
                <span className="text-xs text-muted-foreground">Conversion</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Average Deal Value</p>
              <p className="text-xl font-bold">{formatCurrency(avgDealValue)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Quotes</p>
              <p className="text-xl font-bold">{totalQuotes}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Accepted Quotes</p>
              <p className="text-xl font-bold text-green-600">{acceptedQuotes}</p>
            </div>
          </div>
        </div>

        {/* Quotes by Status Bar Chart */}
        <div>
          <h4 className="mb-4 text-sm font-medium">Quotes by Status</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={quotesByStatus}
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
                  {quotesByStatus.map((entry, index) => (
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
