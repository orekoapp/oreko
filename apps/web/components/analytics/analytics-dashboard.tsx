'use client';

import { useState, useMemo } from 'react';
import { subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, DollarSign, FileText, Receipt, TrendingUp } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';

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

const PERIOD_OPTIONS = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'MTD', value: 'month' },
  { label: 'YTD', value: 'ytd' },
];

function getDateRangeFromPreset(preset: string): DateRange {
  const today = new Date();

  switch (preset) {
    case '7d':
      return { from: subDays(today, 7), to: today };
    case '30d':
      return { from: subDays(today, 30), to: today };
    case '90d':
      return { from: subDays(today, 90), to: today };
    case 'month':
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case 'ytd':
      return { from: startOfYear(today), to: today };
    default:
      return { from: subDays(today, 30), to: today };
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface StatItemProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  detail?: string;
}

function StatItem({ title, value, icon: Icon, trend, detail }: StatItemProps) {
  return (
    <div className="relative flex flex-col gap-1 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
          {title}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground/40" />
      </div>
      <span className="text-2xl font-semibold tracking-tight">{value}</span>
      <div className="flex items-center gap-1.5 mt-0.5">
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              trend.isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}%
          </span>
        )}
        {detail && (
          <span className="text-xs text-muted-foreground/60">{detail}</span>
        )}
      </div>
    </div>
  );
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
  const [selectedPreset, setSelectedPreset] = useState('30d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getDateRangeFromPreset('30d')
  );

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    setDateRange(getDateRangeFromPreset(value));
  };

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
    <div className="space-y-8">
      {/* Period Selector - Inline pills */}
      <div className="flex items-center gap-1 rounded-lg border bg-card p-1 w-fit">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handlePresetChange(option.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              selectedPreset === option.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 rounded-lg border bg-card divide-x divide-border">
        <StatItem
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          trend={revenueTrend}
          detail="vs last month"
        />
        <StatItem
          title="Total Quotes"
          value={stats.totalQuotes}
          icon={FileText}
          trend={quotesTrend}
          detail="vs last month"
        />
        <StatItem
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
          detail="Quotes to invoices"
        />
        <StatItem
          title="Outstanding"
          value={formatCurrency(stats.outstandingAmount)}
          icon={Receipt}
          detail={`${formatCurrency(stats.overdueAmount)} overdue`}
        />
      </div>

      {/* Sales Pipeline & Financial Health */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesPipelineSection
          dateRange={dateRange}
          conversionRate={stats.conversionRate}
          avgDealValue={stats.avgDealValue}
          quoteStatusCounts={quoteStatusCounts}
          conversionFunnel={conversionFunnel}
        />
        <FinancialHealthSection
          dateRange={dateRange}
          outstandingAmount={stats.outstandingAmount}
          overdueAmount={stats.overdueAmount}
          revenueThisMonth={stats.revenueThisMonth}
          paymentAging={paymentAging}
        />
      </div>

      {/* Revenue Forecast */}
      <RevenueForecastChart dateRange={dateRange} forecastData={revenueForecast} />

      {/* Client Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopClientsChart data={topClients} />
        <ClientLifetimeValueCard data={clientLTV} />
      </div>

      {/* Secondary Charts - Conversion rate is compact, pair with status; comparison gets full width below */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <ConversionRateCard
            data={{
              conversionRate: stats.conversionRate,
              acceptedCount: quoteStatusCounts.accepted,
              totalSentCount: quoteStatusCounts.sent + quoteStatusCounts.viewed + quoteStatusCounts.accepted + quoteStatusCounts.declined,
            }}
            conversionFunnel={conversionFunnel}
          />
          <QuotesByStatusChart data={quoteStatusCounts} />
        </div>
        <div className="lg:col-span-3">
          <RevenueComparisonChart data={monthlyComparison} />
        </div>
      </div>
    </div>
  );
}
