'use client';

import { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RevenueChart,
  QuoteStatusChart,
  InvoiceStatusChart,
  ConversionFunnel,
  PaymentAgingChart,
  ClientDistributionChart,
  MonthlyComparisonChart,
} from '@/components/dashboard/charts';
import type {
  DashboardData,
  DashboardPeriod,
  ConversionFunnelData,
  PaymentAgingData,
  ClientDistributionData,
  MonthlyComparisonData,
} from '@/lib/dashboard/types';

interface AnalyticsPageContentProps {
  dashboardData: DashboardData;
  conversionFunnelData: ConversionFunnelData;
  paymentAgingData: PaymentAgingData;
  clientDistributionData: ClientDistributionData[];
  monthlyComparisonData: MonthlyComparisonData[];
}

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
];

export function AnalyticsPageContent({
  dashboardData,
  conversionFunnelData,
  paymentAgingData,
  clientDistributionData,
  monthlyComparisonData,
}: AnalyticsPageContentProps) {
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const handleExport = () => {
    // Generate CSV export
    const data = {
      period,
      stats: dashboardData.stats,
      quoteStatus: dashboardData.quoteStatusCounts,
      invoiceStatus: dashboardData.invoiceStatusCounts,
    };

    const csv = generateCSV(data);
    downloadCSV(csv, `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Business insights and performance metrics
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as DashboardPeriod)}>
            <SelectTrigger className="w-[160px]" data-testid="date-filter">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <RevenueChart
            data={dashboardData.revenueData}
            period={period}
            onPeriodChange={setPeriod}
            showPeriodSelector={false}
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <QuoteStatusChart data={dashboardData.quoteStatusCounts} />
            <InvoiceStatusChart data={dashboardData.invoiceStatusCounts} />
            <ConversionFunnel data={conversionFunnelData} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <PaymentAgingChart data={paymentAgingData} />
            <ClientDistributionChart data={clientDistributionData} />
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6 mt-6">
          <RevenueChart
            data={dashboardData.revenueData}
            period={period}
            onPeriodChange={setPeriod}
            height={400}
          />
          <MonthlyComparisonChart data={monthlyComparisonData} height={350} />
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <QuoteStatusChart
              data={dashboardData.quoteStatusCounts}
              className="h-full"
            />
            <ConversionFunnel data={conversionFunnelData} />
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <InvoiceStatusChart
              data={dashboardData.invoiceStatusCounts}
              className="h-full"
            />
            <PaymentAgingChart data={paymentAgingData} />
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6 mt-6">
          <ClientDistributionChart
            data={clientDistributionData}
            height={400}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper functions for CSV export
function generateCSV(data: Record<string, unknown>): string {
  const lines: string[] = [];

  // Header
  lines.push('Metric,Value');

  // Stats
  const stats = data.stats as Record<string, number>;
  if (stats) {
    Object.entries(stats).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
      const formattedValue = typeof value === 'number' && key.toLowerCase().includes('revenue')
        ? `$${value.toFixed(2)}`
        : value;
      lines.push(`${formattedKey},${formattedValue}`);
    });
  }

  // Quote Status
  lines.push('');
  lines.push('Quote Status,Count');
  const quoteStatus = data.quoteStatus as Record<string, number>;
  if (quoteStatus) {
    Object.entries(quoteStatus).forEach(([status, count]) => {
      lines.push(`${status},${count}`);
    });
  }

  // Invoice Status
  lines.push('');
  lines.push('Invoice Status,Count');
  const invoiceStatus = data.invoiceStatus as Record<string, number>;
  if (invoiceStatus) {
    Object.entries(invoiceStatus).forEach(([status, count]) => {
      lines.push(`${status},${count}`);
    });
  }

  return lines.join('\n');
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
