import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { RecentQuotes, RecentInvoices } from '@/components/dashboard/recent-items';
import { AnalyticsSection } from '@/components/dashboard/analytics-section';
import { getDashboardData } from '@/lib/dashboard/actions';
import { getWorkspaceCurrency } from '@/lib/settings/actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard',
  description: 'Your Oreko dashboard',
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

async function DashboardContent() {
  const [data, currency] = await Promise.all([
    getDashboardData(),
    getWorkspaceCurrency(),
  ]);

  return (
    <>
      {/* Stats Cards */}
      <StatsCards stats={data.stats} revenueData={data.revenueData} currency={currency} />

      {/* Revenue Chart (full width) */}
      <AnalyticsSection revenueData={data.revenueData} currency={currency} />

      {/* Activity + Recent Items (2-column layout) */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <RecentActivity activities={data.recentActivity} currency={currency} />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="flex-1 min-h-0">
            <RecentQuotes quotes={data.recentQuotes} currency={currency} />
          </div>
          <div className="flex-1 min-h-0">
            <RecentInvoices invoices={data.recentInvoices} currency={currency} />
          </div>
        </div>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      {/* Stats Cards Skeleton — single bordered row */}
      <Skeleton className="h-24 rounded-lg" />

      {/* Analytics Section Skeleton */}
      <Skeleton className="h-[350px]" />

      {/* Activity + Recent Items Skeleton */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Skeleton className="h-96" />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {formatToday()} &mdash; Here&apos;s how your business is doing.
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
