'use client';

import { DollarSign, TrendingUp, AlertCircle, Target } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats, RevenueSparklinePoint } from '@/lib/dashboard/types';

interface StatsCardsProps {
  stats: DashboardStats;
  revenueSparkline?: RevenueSparklinePoint[];
}

function MiniBarChart({ data }: { data: RevenueSparklinePoint[] }) {
  if (data.length === 0) return null;
  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Bar
            dataKey="revenue"
            fill="hsl(var(--primary))"
            radius={[2, 2, 0, 0]}
            opacity={0.7}
            minPointSize={3}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatsCards({ stats, revenueSparkline = [] }: StatsCardsProps) {
  const cards = [
    {
      title: 'Revenue this Month',
      value: formatCurrency(stats.revenueThisMonth),
      description: undefined,
      icon: DollarSign,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
      sparkline: true,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      description: `${formatCurrency(stats.revenueThisMonth)} this month`,
      icon: TrendingUp,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      sparkline: true,
    },
    {
      title: 'Outstanding',
      value: formatCurrency(stats.outstandingAmount),
      description: stats.overdueAmount > 0
        ? `${formatCurrency(stats.overdueAmount)} overdue`
        : undefined,
      icon: AlertCircle,
      iconColor: stats.overdueAmount > 0 ? 'text-red-500' : 'text-yellow-500',
      bgColor: stats.overdueAmount > 0 ? 'bg-red-500/10' : 'bg-yellow-500/10',
      sparkline: false,
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      description: 'Quotes accepted',
      icon: Target,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      sparkline: false,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-full p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.description && (
                  <p className={`text-xs ${card.iconColor === 'text-red-500' ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {card.description}
                  </p>
                )}
              </div>
              {card.sparkline && revenueSparkline.length > 0 && (
                <MiniBarChart data={revenueSparkline} />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
