'use client';

import { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { CalendarIcon, TrendingUp, TrendingDown, DollarSign, FileText, Receipt } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const presets = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This month', value: 'month' },
  { label: 'This year', value: 'ytd' },
  { label: 'Custom', value: 'custom' },
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
  const [selectedPreset, setSelectedPreset] = useState('30d');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getDateRangeFromPreset('30d')
  );

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    if (value !== 'custom') {
      setDateRange(getDateRangeFromPreset(value));
    }
  };

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
      {/* Date Range Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[280px] justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} -{' '}
                    {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range);
                if (range?.from && range?.to) {
                  setSelectedPreset('custom');
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

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
          value={`${stats.conversionRate}%`}
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
            acceptedCount: quoteStatusCounts.accepted,
            totalSentCount: quoteStatusCounts.sent + quoteStatusCounts.viewed + quoteStatusCounts.accepted + quoteStatusCounts.declined,
          }}
          conversionFunnel={conversionFunnel}
        />
        <QuotesByStatusChart data={quoteStatusCounts} />
        <RevenueComparisonChart data={monthlyComparison} />
      </div>
    </div>
  );
}
