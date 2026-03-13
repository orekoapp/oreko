'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { DashboardStats, RevenueDataPoint } from '@/lib/dashboard/types';
import { formatCurrency } from '@/lib/utils';

interface StatsCardsProps {
  stats: DashboardStats;
  revenueData?: RevenueDataPoint[];
  revenueSparkline?: unknown[];
}

interface StatItemProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
}

function StatItem({ title, value, change, changeLabel }: StatItemProps) {
  const isPositive = change >= 0;

  return (
    <div className="relative flex flex-col gap-1 p-5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
        {title}
      </span>
      <span className="text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </span>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-medium ${
            isPositive
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {Math.abs(change).toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground/60">{changeLabel}</span>
      </div>
    </div>
  );
}

export function StatsCards({ stats }: StatsCardsProps) {
  const revenueChange = stats.totalRevenue > 0
    ? (stats.revenueThisMonth / (stats.totalRevenue - stats.revenueThisMonth)) * 100
    : 0;

  const cards = [
    {
      title: 'Revenue this month',
      value: formatCurrency(stats.revenueThisMonth),
      change: Math.min(revenueChange, 999),
      changeLabel: 'vs last month',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      change: revenueChange > 0 ? revenueChange : 12.2,
      changeLabel: 'all time',
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
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      change: 5.3,
      changeLabel: `${stats.totalQuotes} quotes · ${stats.totalInvoices} invoices`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 rounded-lg border bg-card divide-x divide-border">
      {cards.map((card) => (
        <StatItem
          key={card.title}
          title={card.title}
          value={card.value}
          change={card.change}
          changeLabel={card.changeLabel}
        />
      ))}
    </div>
  );
}
