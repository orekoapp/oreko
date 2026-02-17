'use client';

import {
  FileText,
  Receipt,
  Users,
  DollarSign,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/lib/dashboard/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      description: `${formatCurrency(stats.revenueThisMonth)} this month`,
      icon: DollarSign,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Outstanding',
      value: formatCurrency(stats.outstandingAmount),
      description: stats.overdueAmount > 0
        ? `${formatCurrency(stats.overdueAmount)} overdue`
        : 'No overdue invoices',
      icon: AlertCircle,
      iconColor: stats.overdueAmount > 0 ? 'text-red-500' : 'text-yellow-500',
      bgColor: stats.overdueAmount > 0 ? 'bg-red-500/10' : 'bg-yellow-500/10',
    },
    {
      title: 'Total Quotes',
      value: stats.totalQuotes.toString(),
      description: `${stats.quotesThisMonth} this month`,
      icon: FileText,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices.toString(),
      description: `${stats.invoicesThisMonth} this month`,
      icon: Receipt,
      iconColor: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Total Clients',
      value: stats.totalClients.toString(),
      description: 'Active clients',
      icon: Users,
      iconColor: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      description: 'Quotes accepted',
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-full p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
