'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConversionFunnelData } from '@/lib/dashboard/types';

interface ConversionRateCardProps {
  data?: {
    conversionRate: number;
    acceptedCount: number;
    totalSentCount: number;
    prevConversionRate?: number;
  };
  conversionFunnel?: ConversionFunnelData;
}

export function ConversionRateCard({ data: propData, conversionFunnel }: ConversionRateCardProps) {
  const data = useMemo(() => {
    if (propData) {
      return {
        currentRate: propData.conversionRate,
        previousRate: propData.prevConversionRate ?? null,
        acceptedCount: propData.acceptedCount,
        totalSentCount: propData.totalSentCount,
      };
    }
    if (conversionFunnel) {
      const totalSent = conversionFunnel.quotesSent || 1;
      const accepted = conversionFunnel.quotesAccepted;
      const rate = (accepted / totalSent) * 100;
      return {
        currentRate: rate,
        previousRate: rate,
        acceptedCount: accepted,
        totalSentCount: totalSent,
      };
    }
    return {
      currentRate: 0,
      previousRate: 0,
      acceptedCount: 0,
      totalSentCount: 0,
    };
  }, [propData, conversionFunnel]);

  const trend = useMemo(() => {
    if (data.previousRate === null) return null;
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
              <span className="text-lg font-bold">{data.currentRate.toFixed(1)}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 text-right">
            {trend && (
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
            )}
            <p className="text-xs text-muted-foreground">
              {data.acceptedCount} of {data.totalSentCount} quotes
            </p>
            {trend && <p className="text-xs text-muted-foreground">vs prev period</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
