import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { RecentQuotes, RecentInvoices } from '@/components/dashboard/recent-items';
import { AnalyticsSection } from '@/components/dashboard/analytics-section';
import {
  WinRateCard,
  CollectionRateCard,
  PipelineCard,
} from '@/components/dashboard/charts';
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

      {/* Revenue Chart (full width) */}
      <AnalyticsSection revenueData={data.revenueData} />

      {/* Metrics Row: Win Rate + Collection Rate + Pipeline */}
      <div className="grid gap-6 md:grid-cols-3">
        <WinRateCard data={data.quoteStatusCounts} />
        <CollectionRateCard data={data.invoiceStatusCounts} />
        {conversionFunnelData && (
          <PipelineCard data={conversionFunnelData} />
        )}
      </div>

      {/* Activity + Recent Quotes + Recent Invoices */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RecentActivity activities={data.recentActivity} />
        <RecentQuotes quotes={data.recentQuotes} />
        <RecentInvoices invoices={data.recentInvoices} />
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
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track your business performance and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/quotes/new">
              <Plus className="mr-1.5 h-4 w-4" />
              New Quote
            </Link>
          </Button>
          <Button size="sm" asChild className="gradient-accent border-0 text-white shadow-sm hover:opacity-90 transition-opacity">
            <Link href="/invoices/new">
              <Plus className="mr-1.5 h-4 w-4" />
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
