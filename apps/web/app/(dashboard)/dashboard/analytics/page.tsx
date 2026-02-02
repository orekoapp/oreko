import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalyticsPageContent } from './analytics-content';
import {
  getDashboardData,
  getConversionFunnelData,
  getPaymentAgingData,
  getClientDistributionData,
  getMonthlyComparisonData,
} from '@/lib/dashboard/actions';

export const metadata = {
  title: 'Analytics',
  description: 'Business analytics and insights',
};

async function AnalyticsData() {
  const [
    dashboardData,
    conversionFunnelData,
    paymentAgingData,
    clientDistributionData,
    monthlyComparisonData,
  ] = await Promise.all([
    getDashboardData(),
    getConversionFunnelData(),
    getPaymentAgingData(),
    getClientDistributionData(),
    getMonthlyComparisonData(),
  ]);

  return (
    <AnalyticsPageContent
      dashboardData={dashboardData}
      conversionFunnelData={conversionFunnelData}
      paymentAgingData={paymentAgingData}
      clientDistributionData={clientDistributionData}
      monthlyComparisonData={monthlyComparisonData}
    />
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Tabs */}
      <Skeleton className="h-10 w-full max-w-md" />

      {/* Charts Grid */}
      <Skeleton className="h-[350px]" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="container max-w-full px-4 py-6 md:px-6">
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsData />
      </Suspense>
    </div>
  );
}
