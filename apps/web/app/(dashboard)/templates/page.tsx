import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContractTemplateList } from '@/components/contracts/contract-template-list';
import { getContractTemplates } from '@/lib/contracts/actions';

export const metadata = {
  title: 'Contract Templates',
  description: 'Manage your contract templates',
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

async function TemplateListContent({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const { data: templates } = await getContractTemplates({
    search: searchParams.search,
    page: searchParams.page ? parseInt(searchParams.page, 10) : 1,
    isTemplate: true,
  });

  return (
    <ContractTemplateList
      templates={templates}
      searchQuery={searchParams.search}
    />
  );
}

function TemplateListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

export default async function TemplatesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contract Templates</h1>
        <p className="text-muted-foreground">
          Create and manage reusable contract templates for your clients.
        </p>
      </div>

      <Suspense fallback={<TemplateListSkeleton />}>
        <TemplateListContent searchParams={params} />
      </Suspense>
    </div>
  );
}
