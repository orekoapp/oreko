import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, Users, Building2, User, FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientList } from '@/components/clients';
import { getClients, getClientStats } from '@/lib/clients/actions';

interface ClientsPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export const metadata = {
  title: 'Clients',
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Manage your clients and contacts</p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      <Suspense fallback={<StatsLoading />}>
        <ClientStats />
      </Suspense>

      <div className="mt-6">
        <Suspense fallback={<ListLoading />}>
          <ClientListWrapper searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}

async function ClientStats() {
  const stats = await getClientStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Users className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <User className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Individuals</p>
            <p className="text-2xl font-bold">{stats.individuals}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Building2 className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Companies</p>
            <p className="text-2xl font-bold">{stats.companies}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Active Quotes</p>
            <p className="text-2xl font-bold">{stats.withActiveQuotes}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
            <p className="text-2xl font-bold">{stats.withUnpaidInvoices}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function ClientListWrapper({
  searchParams,
}: {
  searchParams: {
    search?: string;
    type?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}) {
  const clients = await getClients({
    search: searchParams.search,
    type: searchParams.type as 'individual' | 'company' | undefined,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    sortBy: searchParams.sortBy,
    sortOrder: (searchParams.sortOrder as 'asc' | 'desc') || 'desc',
  });

  return <ClientList clients={clients} />;
}

function StatsLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-3 p-4">
            <Skeleton className="h-8 w-8 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ListLoading() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
