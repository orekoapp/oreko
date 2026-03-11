import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientsDataTable } from '@/components/clients';
import { getClients } from '@/lib/clients/actions';

interface ClientsPageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Clients',
};

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      <Suspense fallback={<ListLoading />}>
        <ClientListWrapper searchParams={params} />
      </Suspense>
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

  return <ClientsDataTable data={clients} />;
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
