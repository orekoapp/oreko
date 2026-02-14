'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data - will be replaced with server actions
const mockConversionData = {
  currentRate: 62.8,
  previousRate: 58.2,
  acceptedCount: 34,
  totalSentCount: 54,
};

export function ConversionRateCard() {
  const data = mockConversionData;

  const trend = useMemo(() => {
    const change = data.currentRate - data.previousRate;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
    };
  }, [data]);

  const chartData = useMemo(() => {
    return [
      { name: 'Converted', value: data.currentRate, fill: '#22C55E' },
      { name: 'Remaining', value: 100 - data.currentRate, fill: '#E5E7EB' },
    ];
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Radial Chart */}
          <div className="relative h-[100px] w-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{data.currentRate}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 text-right">
            <div className="flex items-center justify-end gap-1 text-sm">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={trend.isPositive ? 'text-green-500' : 'text-red-500'}>
                {trend.isPositive ? '+' : '-'}{trend.value}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {data.acceptedCount} of {data.totalSentCount} quotes
            </p>
            <p className="text-xs text-muted-foreground">vs prev period</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
