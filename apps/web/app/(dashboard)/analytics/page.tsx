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
} from '@/lib/dashboard/actions';

export const metadata: Metadata = {
  title: 'Analytics | QuoteCraft',
  description: 'View your business analytics and insights',
};

async function AnalyticsContent() {
  // Fetch all analytics data in parallel
  const [stats, quoteStatusCounts, conversionFunnel, paymentAging] = await Promise.all([
    getAnalyticsStats(),
    getQuoteStatusCounts(),
    getConversionFunnelData(),
    getPaymentAgingData(),
  ]);

  return (
    <AnalyticsDashboard
      stats={stats}
      quoteStatusCounts={quoteStatusCounts}
      conversionFunnel={conversionFunnel}
      paymentAging={paymentAging}
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
