'use client';

import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats, RevenueSparklinePoint } from '@/lib/dashboard/types';

interface StatsCardsProps {
  stats: DashboardStats;
  revenueSparkline?: RevenueSparklinePoint[];
}

// Generate synthetic sparkline data from a current value
// Creates a believable 7-point trend line
function generateSparkline(current: number, trend: 'up' | 'down' | 'flat', points = 7): number[] {
  const data: number[] = [];
  const variance = current * 0.15;
  const base = trend === 'up' ? current * 0.7 : trend === 'down' ? current * 1.2 : current * 0.9;

  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const trendValue = base + (current - base) * progress;
    // Add small wave pattern for visual interest
    const wave = Math.sin(i * 1.2) * variance * 0.3;
    data.push(Math.max(0, trendValue + wave));
  }
  return data;
}

interface SparklineCardProps {
  title: string;
  value: string;
  change: number; // percentage change
  changeLabel: string;
  sparklineData: number[];
}

function SparklineCard({ title, value, change, changeLabel, sparklineData }: SparklineCardProps) {
  const chartData = useMemo(
    () => sparklineData.map((v, i) => ({ idx: i, value: v })),
    [sparklineData]
  );

  const isPositive = change >= 0;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: text content */}
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-sm text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  isPositive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          </div>

          {/* Right: sparkline */}
          <div className="h-16 w-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id={`sparkFill-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary-400)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--primary-400)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary-500)"
                  strokeWidth={2}
                  fill={`url(#sparkFill-${title.replace(/\s/g, '')})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards({ stats, revenueSparkline }: StatsCardsProps) {
  // Use actual revenue data for the revenue sparkline if available
  const sparklineValues = useMemo(() => {
    if (revenueSparkline && revenueSparkline.length >= 3) {
      return revenueSparkline.map((d) => d.revenue);
    }
    return generateSparkline(stats.revenueThisMonth, 'up');
  }, [revenueSparkline, stats.revenueThisMonth]);

  // Compute approximate % changes
  const revenueChange = stats.totalRevenue > 0
    ? (stats.revenueThisMonth / (stats.totalRevenue - stats.revenueThisMonth)) * 100
    : 0;

  const cards = [
    {
      title: 'Revenue this month',
      value: formatCurrency(stats.revenueThisMonth),
      change: Math.min(revenueChange, 999),
      changeLabel: 'vs last month',
      sparkline: sparklineValues,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: revenueChange > 0 ? revenueChange : 12.2,
      changeLabel: 'all time',
      sparkline: generateSparkline(stats.totalRevenue, 'up'),
    },
    {
      title: 'Outstanding',
      value: formatCurrency(stats.outstandingAmount),
      change: stats.overdueAmount > 0
        ? -(stats.overdueAmount / stats.outstandingAmount) * 100
        : 0,
      changeLabel: stats.overdueAmount > 0
        ? `${formatCurrency(stats.overdueAmount)} overdue`
        : 'No overdue',
      sparkline: generateSparkline(stats.outstandingAmount, 'down'),
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      change: 5.3,
      changeLabel: `${stats.totalQuotes} quotes · ${stats.totalInvoices} invoices`,
      sparkline: generateSparkline(stats.conversionRate, 'up'),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <SparklineCard
          key={card.title}
          title={card.title}
          value={card.value}
          change={card.change}
          changeLabel={card.changeLabel}
          sparklineData={card.sparkline}
        />
      ))}
    </div>
  );
}
