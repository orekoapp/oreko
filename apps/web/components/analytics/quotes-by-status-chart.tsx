'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { QuoteStatusCounts } from '@/lib/dashboard/types';

const STATUS_CONFIG: { key: keyof QuoteStatusCounts; label: string; color: string; bg: string }[] = [
  { key: 'accepted', label: 'Accepted', color: 'bg-emerald-500', bg: 'bg-emerald-500/15' },
  { key: 'sent', label: 'Sent', color: 'bg-blue-500', bg: 'bg-blue-500/15' },
  { key: 'viewed', label: 'Viewed', color: 'bg-amber-500', bg: 'bg-amber-500/15' },
  { key: 'draft', label: 'Draft', color: 'bg-muted-foreground/40', bg: 'bg-muted-foreground/10' },
  { key: 'declined', label: 'Declined', color: 'bg-red-500', bg: 'bg-red-500/15' },
  { key: 'expired', label: 'Expired', color: 'bg-orange-500', bg: 'bg-orange-500/15' },
];

interface QuotesByStatusChartProps {
  data?: QuoteStatusCounts;
}

export function QuotesByStatusChart({ data }: QuotesByStatusChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return STATUS_CONFIG
      .map((cfg) => ({ ...cfg, count: data[cfg.key] ?? 0 }))
      .filter((item) => item.count > 0);
  }, [data]);

  const total = chartData.reduce((acc, item) => acc + item.count, 0);
  const maxCount = chartData.length > 0 ? Math.max(...chartData.map((d) => d.count)) : 1;

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium">Quotes by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
            No quote data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-sm font-medium">Quotes by Status</CardTitle>
          <span className="text-xs text-muted-foreground/60">
            {total} total
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {chartData.map((item) => {
            const pct = (item.count / maxCount) * 100;
            const sharePct = total > 0 ? ((item.count / total) * 100).toFixed(0) : '0';
            return (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-muted-foreground/60 tabular-nums">{sharePct}%</span>
                    <span className="font-medium tabular-nums">{item.count}</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${item.color}`}
                    style={{ width: `${Math.max(pct, 3)}%`, opacity: 0.7 }}
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
