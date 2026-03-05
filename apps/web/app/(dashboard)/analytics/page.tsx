import { Suspense } from 'react';
import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
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
  // Fetch all analytics data in parallel with individual error isolation
  const results = await Promise.allSettled([
    getAnalyticsStats(),
    getQuoteStatusCounts(),
    getConversionFunnelData(),
    getPaymentAgingData(),
    getTopClientsByRevenue(5),
    getClientLTVData(5),
    getRevenueForecast(6, 3),
    getMonthlyComparisonData(12),
  ]);

  const getValue = <T,>(result: PromiseSettledResult<T>, fallback: T): T =>
    result.status === 'fulfilled' ? result.value : fallback;

  const emptyStats = {
    totalQuotes: 0, totalInvoices: 0, totalClients: 0,
    totalRevenue: 0, outstandingAmount: 0, overdueAmount: 0,
    quotesThisMonth: 0, invoicesThisMonth: 0, revenueThisMonth: 0,
    conversionRate: 0, winRate: 0, collectionRate: 0,
    avgDealValue: 0, prevMonthRevenue: 0, prevMonthQuotes: 0,
  };

  return (
    <AnalyticsDashboard
      stats={getValue(results[0], emptyStats)}
      quoteStatusCounts={getValue(results[1], { draft: 0, sent: 0, viewed: 0, accepted: 0, declined: 0, expired: 0, converted: 0 })}
      conversionFunnel={getValue(results[2], { quotesCreated: 0, quotesSent: 0, quotesViewed: 0, quotesAccepted: 0, invoicesCreated: 0, invoicesPaid: 0 })}
      paymentAging={getValue(results[3], { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days90plus: 0, totalOutstanding: 0 })}
      topClients={getValue(results[4], [])}
      clientLTV={getValue(results[5], { clients: [], averageLTV: 0, totalClients: 0 })}
      revenueForecast={getValue(results[6], [])}
      monthlyComparison={getValue(results[7], [])}
    />
  );
}

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your business performance with detailed insights and reports.
        </p>
      </div>

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
