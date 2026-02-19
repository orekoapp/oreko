'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText, Receipt } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { SalesPipelineSection } from './sales-pipeline-section';
import { FinancialHealthSection } from './financial-health-section';
import { ConversionRateCard } from './conversion-rate-card';
import { QuotesByStatusChart } from './quotes-by-status-chart';
import { RevenueComparisonChart } from './revenue-comparison-chart';
import { RevenueForecastChart } from './revenue-forecast-chart';
import { TopClientsChart } from './top-clients-chart';
import { ClientLifetimeValueCard } from './client-lifetime-value';

import type {
  AnalyticsStats,
  QuoteStatusCounts,
  ConversionFunnelData,
  PaymentAgingData,
  ForecastDataPoint,
  MonthlyComparisonData,
} from '@/lib/dashboard/types';

interface TopClient {
  name: string;
  revenue: number;
}

interface ClientLTV {
  id: string;
  name: string;
  email?: string;
  ltv: number;
  growth?: number;
  isGrowing?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend && (
              <>
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={trend.isPositive ? 'text-green-500' : 'text-red-500'}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              </>
            )}
            {description && <span>{description}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Format currency (values are already in dollars)
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

interface AnalyticsDashboardProps {
  stats: AnalyticsStats;
  quoteStatusCounts: QuoteStatusCounts;
  conversionFunnel: ConversionFunnelData;
  paymentAging: PaymentAgingData;
  topClients?: TopClient[];
  clientLTV?: ClientLTV[];
  revenueForecast?: ForecastDataPoint[];
  monthlyComparison?: MonthlyComparisonData[];
}

export function AnalyticsDashboard({
  stats,
  quoteStatusCounts,
  conversionFunnel,
  paymentAging,
  topClients,
  clientLTV,
  revenueForecast,
  monthlyComparison,
}: AnalyticsDashboardProps) {
  // Calculate trends
  const revenueTrend = useMemo(() => {
    const change = stats.prevMonthRevenue > 0
      ? ((stats.revenueThisMonth - stats.prevMonthRevenue) / stats.prevMonthRevenue) * 100
      : stats.revenueThisMonth > 0 ? 100 : 0;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
  }, [stats]);

  const quotesTrend = useMemo(() => {
    const change = stats.prevMonthQuotes > 0
      ? ((stats.quotesThisMonth - stats.prevMonthQuotes) / stats.prevMonthQuotes) * 100
      : stats.quotesThisMonth > 0 ? 100 : 0;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          trend={revenueTrend}
          description="vs last month"
        />
        <StatCard
          title="Total Quotes"
          value={stats.totalQuotes}
          icon={FileText}
          trend={quotesTrend}
          description="vs last month"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          description="Quotes to invoices"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(stats.outstandingAmount)}
          icon={Receipt}
          description={`${formatCurrency(stats.overdueAmount)} overdue`}
        />
      </div>

      {/* Sales Pipeline & Financial Health (P0 Features) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesPipelineSection
          conversionRate={stats.conversionRate}
          avgDealValue={stats.avgDealValue}
          quoteStatusCounts={quoteStatusCounts}
          conversionFunnel={conversionFunnel}
        />
        <FinancialHealthSection
          outstandingAmount={stats.outstandingAmount}
          overdueAmount={stats.overdueAmount}
          revenueThisMonth={stats.revenueThisMonth}
          paymentAging={paymentAging}
        />
      </div>

      {/* Revenue Forecast - Full Width */}
      <RevenueForecastChart forecastData={revenueForecast} />

      {/* Client Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopClientsChart data={topClients} />
        <ClientLifetimeValueCard data={clientLTV} />
      </div>

      {/* Secondary Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ConversionRateCard
          data={{
            conversionRate: stats.conversionRate,
            acceptedCount: quoteStatusCounts.accepted + quoteStatusCounts.converted,
            totalSentCount: quoteStatusCounts.sent + quoteStatusCounts.viewed + quoteStatusCounts.accepted + quoteStatusCounts.declined + quoteStatusCounts.expired + quoteStatusCounts.converted,
          }}
          conversionFunnel={conversionFunnel}
        />
        <QuotesByStatusChart data={quoteStatusCounts} />
        <RevenueComparisonChart data={monthlyComparison} />
      </div>
    </div>
  );
}
