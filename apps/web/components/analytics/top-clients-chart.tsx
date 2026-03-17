'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

// Use opacity steps of primary color for a cohesive palette
const BAR_OPACITIES = [1, 0.85, 0.7, 0.55, 0.4];

export function TopClientsChart({ data: propData }: TopClientsChartProps) {
  const chartData = useMemo(() => {
    if (!propData || propData.length === 0) return [];
    return propData;
  }, [propData]);

  const totalRevenue = chartData.reduce((sum, client) => sum + client.revenue, 0);
  const maxRevenue = chartData.length > 0 ? chartData[0]!.revenue : 1;

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium">Top Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
            No client revenue data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-sm font-medium">Top Clients</CardTitle>
          <span className="text-xs text-muted-foreground/60">
            {formatCurrency(totalRevenue)} total
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {chartData.map((client, i) => {
            const pct = (client.revenue / maxRevenue) * 100;
            const sharePct = totalRevenue > 0 ? ((client.revenue / totalRevenue) * 100).toFixed(0) : '0';
            return (
              <div key={client.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate">{client.name}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-muted-foreground/60 tabular-nums">{sharePct}%</span>
                    <span className="font-medium tabular-nums">{formatCurrency(client.revenue)}</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(pct, 3)}%`,
                      background: 'linear-gradient(90deg, var(--primary-400), var(--primary-600))',
                      opacity: BAR_OPACITIES[i] ?? 0.3,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
