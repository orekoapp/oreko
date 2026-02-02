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
  LabelList,
} from 'recharts';
import { ChartCard } from './chart-card';
import { CHART_COLORS, formatPercentage } from '@/lib/dashboard/chart-utils';
import type { ConversionFunnelData } from '@/lib/dashboard/types';

interface ConversionFunnelProps {
  data: ConversionFunnelData;
  isLoading?: boolean;
  className?: string;
  height?: number;
}

const FUNNEL_COLORS = [
  CHART_COLORS.primary,
  '#60A5FA', // Blue-400
  '#93C5FD', // Blue-300
  CHART_COLORS.success,
  '#4ADE80', // Green-400
  '#86EFAC', // Green-300
];

const STAGES = [
  { key: 'quotesCreated', label: 'Quotes Created' },
  { key: 'quotesSent', label: 'Sent' },
  { key: 'quotesViewed', label: 'Viewed' },
  { key: 'quotesAccepted', label: 'Accepted' },
  { key: 'invoicesCreated', label: 'Invoiced' },
  { key: 'invoicesPaid', label: 'Paid' },
];

export function ConversionFunnel({
  data,
  isLoading = false,
  className,
  height = 300,
}: ConversionFunnelProps) {
  const chartData = useMemo(() => {
    const maxValue = data.quotesCreated || 1;

    return STAGES.map((stage, index) => {
      const value = data[stage.key as keyof ConversionFunnelData];
      const prevStage = index > 0 ? STAGES[index - 1] : null;
      const prevValue = prevStage
        ? data[prevStage.key as keyof ConversionFunnelData]
        : value;
      const conversionRate = prevValue > 0 ? (value / prevValue) * 100 : 0;
      const totalRate = maxValue > 0 ? (value / maxValue) * 100 : 0;

      return {
        name: stage.label,
        value,
        conversionRate,
        totalRate,
        fill: FUNNEL_COLORS[index],
      };
    });
  }, [data]);

  const isEmpty = data.quotesCreated === 0;

  // Calculate overall conversion rate
  const overallConversion = useMemo(() => {
    if (data.quotesCreated === 0) return 0;
    return (data.invoicesPaid / data.quotesCreated) * 100;
  }, [data]);

  return (
    <ChartCard
      title="Conversion Funnel"
      description={isEmpty ? undefined : `Overall: ${formatPercentage(overallConversion)} conversion`}
      className={className}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="No funnel data available"
    >
      <div style={{ height }} data-testid="conversion-funnel">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={75}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null;
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Count: <span className="font-medium">{item.value}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Step Rate: <span className="font-medium">{formatPercentage(item.conversionRate)}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Rate: <span className="font-medium">{formatPercentage(item.totalRate)}</span>
                    </p>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              animationDuration={500}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                className="fill-foreground text-xs"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
