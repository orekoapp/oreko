'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartCard } from './chart-card';
import { StatusTooltip } from './chart-tooltip';
import {
  QUOTE_STATUS_COLORS,
  INVOICE_STATUS_COLORS,
  transformStatusToChartData,
  calculateTotal,
  getStatusLabel,
  formatPercentage,
} from '@/lib/dashboard/chart-utils';
import type { QuoteStatusCounts, InvoiceStatusCounts } from '@/lib/dashboard/types';

interface StatusChartProps {
  data: Record<string, number>;
  colors: Record<string, string>;
  title: string;
  description?: string;
  isLoading?: boolean;
  height?: number;
  className?: string;
  onSegmentClick?: (status: string) => void;
}

function StatusChart({
  data,
  colors,
  title,
  description,
  isLoading = false,
  height = 280,
  className,
  onSegmentClick,
}: StatusChartProps) {
  const chartData = useMemo(() => {
    const transformed = transformStatusToChartData(data, colors);
    const total = calculateTotal(data);
    return transformed.map((item) => ({ ...item, total }));
  }, [data, colors]);

  const total = useMemo(() => calculateTotal(data), [data]);
  const isEmpty = total === 0;

  // Find dominant status for center label
  const dominantStatus = useMemo(() => {
    if (isEmpty) return null;
    const sorted = [...chartData].sort((a, b) => b.value - a.value);
    return sorted[0];
  }, [chartData, isEmpty]);

  const handleClick = (entry: { name: string }) => {
    if (onSegmentClick) {
      // Convert label back to status key
      const statusKey = Object.keys(data).find(
        (key) => getStatusLabel(key) === entry.name
      );
      if (statusKey) onSegmentClick(statusKey);
    }
  };

  return (
    <ChartCard
      title={title}
      description={description}
      className={className}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage={`No ${title.toLowerCase()} data`}
    >
      <div style={{ height }} data-testid={`${title.toLowerCase().replace(' ', '-')}-chart`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              onClick={onSegmentClick ? handleClick : undefined}
              style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
              animationDuration={500}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<StatusTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
            {/* Center label */}
            {dominantStatus && (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground"
              >
                <tspan x="50%" dy="-0.5em" fontSize="24" fontWeight="bold">
                  {total}
                </tspan>
                <tspan x="50%" dy="1.5em" fontSize="12" className="fill-muted-foreground">
                  Total
                </tspan>
              </text>
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Quote Status Chart
interface QuoteStatusChartProps {
  data: QuoteStatusCounts;
  isLoading?: boolean;
  className?: string;
  onSegmentClick?: (status: string) => void;
}

export function QuoteStatusChart({
  data,
  isLoading,
  className,
  onSegmentClick,
}: QuoteStatusChartProps) {
  return (
    <StatusChart
      data={data as unknown as Record<string, number>}
      colors={QUOTE_STATUS_COLORS}
      title="Quote Status"
      isLoading={isLoading}
      className={className}
      onSegmentClick={onSegmentClick}
    />
  );
}

// Invoice Status Chart
interface InvoiceStatusChartProps {
  data: InvoiceStatusCounts;
  isLoading?: boolean;
  className?: string;
  onSegmentClick?: (status: string) => void;
}

export function InvoiceStatusChart({
  data,
  isLoading,
  className,
  onSegmentClick,
}: InvoiceStatusChartProps) {
  return (
    <StatusChart
      data={data as unknown as Record<string, number>}
      colors={INVOICE_STATUS_COLORS}
      title="Invoice Status"
      isLoading={isLoading}
      className={className}
      onSegmentClick={onSegmentClick}
    />
  );
}
