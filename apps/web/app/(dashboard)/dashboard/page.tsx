import { Suspense } from 'react';
import Link from 'next/link';
import { FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { RecentQuotes, RecentInvoices } from '@/components/dashboard/recent-items';
import { AnalyticsSection } from '@/components/dashboard/analytics-section';
import { getDashboardData, getConversionFunnelData } from '@/lib/dashboard/actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard',
  description: 'Your QuoteCraft dashboard',
};

async function DashboardContent() {
  const [data, conversionFunnelData] = await Promise.all([
    getDashboardData(),
    getConversionFunnelData(),
  ]);

  return (
    <>
      {/* Stats Cards */}
      <StatsCards stats={data.stats} revenueSparkline={data.revenueSparkline} />

      {/* Analytics Charts Section */}
      <AnalyticsSection
        revenueData={data.revenueData}
        conversionFunnelData={conversionFunnelData}
        winRate={data.stats.winRate}
        collectionRate={data.stats.collectionRate}
      />

      {/* Recent Items Section — 3-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <RecentActivity activities={data.recentActivity} />
        </div>
        <div>
          <RecentQuotes quotes={data.recentQuotes} />
        </div>
        <div>
          <RecentInvoices invoices={data.recentInvoices} />
        </div>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {/* Stats Cards Skeleton — 4 cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      {/* Analytics Section Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-[350px]" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>

      {/* Recent Items Skeleton — 3 columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
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
            Track your business performance and recent activity.
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
