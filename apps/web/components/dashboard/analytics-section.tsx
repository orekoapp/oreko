'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  RevenueChart,
  QuoteStatusChart,
  InvoiceStatusChart,
  ConversionFunnel,
  PaymentAgingChart,
} from './charts';
import type {
  RevenueDataPoint,
  QuoteStatusCounts,
  InvoiceStatusCounts,
  DashboardPeriod,
  ConversionFunnelData,
  PaymentAgingData,
} from '@/lib/dashboard/types';

interface AnalyticsSectionProps {
  revenueData: RevenueDataPoint[];
  quoteStatusCounts: QuoteStatusCounts;
  invoiceStatusCounts: InvoiceStatusCounts;
  conversionFunnelData?: ConversionFunnelData;
  paymentAgingData?: PaymentAgingData;
}

export function AnalyticsSection({
  revenueData,
  quoteStatusCounts,
  invoiceStatusCounts,
  conversionFunnelData,
  paymentAgingData,
}: AnalyticsSectionProps) {
  const [revenuePeriod, setRevenuePeriod] = useState<DashboardPeriod>('30d');

  return (
    <div className="space-y-6" data-testid="analytics-section">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            View All
          </Link>
        </Button>
      </div>

      {/* Revenue Chart */}
      <RevenueChart
        data={revenueData}
        period={revenuePeriod}
        onPeriodChange={setRevenuePeriod}
      />

      {/* Status Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuoteStatusChart data={quoteStatusCounts} />
        <InvoiceStatusChart data={invoiceStatusCounts} />
        {conversionFunnelData && (
          <ConversionFunnel data={conversionFunnelData} />
        )}
      </div>

      {/* Payment Aging (if data available) */}
      {paymentAgingData && paymentAgingData.totalOutstanding > 0 && (
        <PaymentAgingChart data={paymentAgingData} />
      )}
    </div>
  );
}
