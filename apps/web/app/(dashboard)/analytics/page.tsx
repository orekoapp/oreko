import { Suspense } from 'react';
import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { AnalyticsSkeleton } from '@/components/analytics/analytics-skeleton';
import {
  getAnalyticsStats,
  getQuoteStatusCounts,
  getConversionFunnelData,
  getPaymentAgingData,
  getTopClientsByRevenue,
  getClientLTVData,
  getRevenueForecast,
  getMonthlyComparisonData,
} from '@/lib/dashboard/actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'View your business analytics and insights',
};

async function AnalyticsContent() {
  // Fetch all analytics data in parallel
  const [
    stats,
    quoteStatusCounts,
    conversionFunnel,
    paymentAging,
    topClients,
    clientLTV,
    revenueForecast,
    monthlyComparison,
  ] = await Promise.all([
    getAnalyticsStats(),
    getQuoteStatusCounts(),
    getConversionFunnelData(),
    getPaymentAgingData(),
    getTopClientsByRevenue(5),
    getClientLTVData(5),
    getRevenueForecast(6, 3),
    getMonthlyComparisonData(12),
  ]);

  return (
    <AnalyticsDashboard
      stats={stats}
      quoteStatusCounts={quoteStatusCounts}
      conversionFunnel={conversionFunnel}
      paymentAging={paymentAging}
      topClients={topClients}
      clientLTV={clientLTV.clients}
      revenueForecast={revenueForecast}
      monthlyComparison={monthlyComparison}
    />
  );
}

export default async function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed insights into your business performance.
        </p>
      </div>

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
