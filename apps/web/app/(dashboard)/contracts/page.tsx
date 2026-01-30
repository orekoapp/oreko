import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ContractInstanceList } from '@/components/contracts/contract-instance-list';
import { getContractInstances } from '@/lib/contracts/actions';

export const metadata = {
  title: 'Contracts',
  description: 'Manage your contract instances',
};

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

async function ContractListContent({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; page?: string };
}) {
  const { data: instances } = await getContractInstances({
    search: searchParams.search,
    status: searchParams.status,
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
  });

  return (
    <ContractInstanceList
      instances={instances}
      searchQuery={searchParams.search}
      statusFilter={searchParams.status}
    />
  );
}

function ContractListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default async function ContractsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">
            View and manage contracts sent to your clients.
          </p>
        </div>
        <Button asChild>
          <Link href="/contracts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Contract
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ContractListSkeleton />}>
        <ContractListContent searchParams={params} />
      </Suspense>
    </div>
  );
}
