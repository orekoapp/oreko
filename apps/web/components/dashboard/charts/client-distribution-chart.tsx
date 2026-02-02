'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartCard } from './chart-card';
import { CHART_PALETTE, formatChartCurrency, formatFullCurrency } from '@/lib/dashboard/chart-utils';
import type { ClientDistributionData } from '@/lib/dashboard/types';
import { Button } from '@/components/ui/button';

interface ClientDistributionChartProps {
  data: ClientDistributionData[];
  isLoading?: boolean;
  className?: string;
  height?: number;
}

type ViewMode = 'clients' | 'revenue';

export function ClientDistributionChart({
  data,
  isLoading = false,
  className,
  height = 300,
}: ClientDistributionChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('clients');

  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) =>
      viewMode === 'clients'
        ? b.clientCount - a.clientCount
        : b.totalRevenue - a.totalRevenue
    );

    return sorted.slice(0, 10).map((item, index) => ({
      ...item,
      value: viewMode === 'clients' ? item.clientCount : item.totalRevenue,
      fill: CHART_PALETTE[index % CHART_PALETTE.length],
    }));
  }, [data, viewMode]);

  const total = useMemo(() => {
    return viewMode === 'clients'
      ? data.reduce((sum, item) => sum + item.clientCount, 0)
      : data.reduce((sum, item) => sum + item.totalRevenue, 0);
  }, [data, viewMode]);

  const isEmpty = data.length === 0;

  const modeToggle = (
    <div className="flex gap-1">
      <Button
        variant={viewMode === 'clients' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 text-xs"
        onClick={() => setViewMode('clients')}
      >
        Clients
      </Button>
      <Button
        variant={viewMode === 'revenue' ? 'default' : 'ghost'}
        size="sm"
        className="h-7 text-xs"
        onClick={() => setViewMode('revenue')}
      >
        Revenue
      </Button>
    </div>
  );

  return (
    <ChartCard
      title="Client Distribution"
      description={
        isEmpty
          ? undefined
          : `${data.length} regions, ${viewMode === 'clients' ? `${total} clients` : formatFullCurrency(total)}`
      }
      className={className}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="No client location data"
      actions={modeToggle}
    >
      <div style={{ height }} data-testid="client-distribution-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis
              type="number"
              tickFormatter={viewMode === 'revenue' ? formatChartCurrency : undefined}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="region"
              type="category"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={75}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null;
                const item = payload[0].payload as ClientDistributionData & { fill: string; value: number };
                const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';

                return (
                  <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="font-medium">{item.region}</span>
                    </div>
                    <p className="text-sm">
                      Clients: <span className="font-medium">{item.clientCount}</span>
                    </p>
                    <p className="text-sm">
                      Revenue: <span className="font-medium">{formatFullCurrency(item.totalRevenue)}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {percentage}% of total
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
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
