import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContractTemplateList } from '@/components/contracts/contract-template-list';
import { getContractTemplates } from '@/lib/contracts/actions';

export const metadata = {
  title: 'Contract Templates',
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

async function ContractTemplateContent({ searchParams }: { searchParams: { search?: string; page?: string } }) {
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
      <div className="rounded-md border">
        <div className="space-y-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ContractTemplatesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<TemplateListSkeleton />}>
      <ContractTemplateContent searchParams={params} />
    </Suspense>
  );
}
