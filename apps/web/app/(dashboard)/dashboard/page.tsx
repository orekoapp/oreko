import { Suspense } from 'react';
import Link from 'next/link';
import { FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { RecentQuotes, RecentInvoices } from '@/components/dashboard/recent-items';
import { getDashboardData } from '@/lib/dashboard/actions';

export const metadata = {
  title: 'Dashboard',
  description: 'Your QuoteCraft dashboard',
};

async function DashboardContent() {
  const data = await getDashboardData();

  return (
    <>
      <StatsCards stats={data.stats} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
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
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s your business overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/quotes/new">
              <FileText className="mr-2 h-4 w-4" />
              New Quote
            </Link>
          </Button>
          <Button asChild>
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
