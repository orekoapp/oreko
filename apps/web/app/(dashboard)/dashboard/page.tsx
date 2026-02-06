import { Suspense } from 'react';
import Link from 'next/link';
import { FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { RecentQuotes, RecentInvoices } from '@/components/dashboard/recent-items';
import { AnalyticsSection } from '@/components/dashboard/analytics-section';
import { getDashboardData, getConversionFunnelData, getPaymentAgingData } from '@/lib/dashboard/actions';

export const metadata = {
  title: 'Dashboard',
  description: 'Your QuoteCraft dashboard',
};

async function DashboardContent() {
  // Fetch all dashboard data in parallel
  const [data, conversionFunnelData, paymentAgingData] = await Promise.all([
    getDashboardData(),
    getConversionFunnelData(),
    getPaymentAgingData(),
  ]);

  return (
    <>
      {/* Stats Cards */}
      <StatsCards stats={data.stats} />

      {/* Analytics Charts Section */}
      <AnalyticsSection
        revenueData={data.revenueData}
        quoteStatusCounts={data.quoteStatusCounts}
        invoiceStatusCounts={data.invoiceStatusCounts}
        conversionFunnelData={conversionFunnelData}
        paymentAgingData={paymentAgingData}
      />

      {/* Recent Items Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RecentQuotes quotes={data.recentQuotes} />
          <RecentInvoices invoices={data.recentInvoices} />
        </div>
        <div>
          <RecentActivity activities={data.recentActivity} />
        </div>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      {/* Analytics Section Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-[350px]" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>

      {/* Recent Items Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-96" />
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your business overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <Link href="/quotes/new">
              <FileText className="mr-2 h-4 w-4" />
              New Quote
            </Link>
          </Button>
          <Button size="sm" asChild className="flex-1 sm:flex-none">
            <Link href="/invoices/new">
              <Receipt className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
