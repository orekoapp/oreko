import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getInvoiceTemplates } from '@/lib/invoices/actions';
import { InvoiceTemplatesDataTable } from '@/components/invoices/invoice-templates-data-table';

export const metadata = {
  title: 'Invoice Templates',
};

async function InvoiceTemplateContent() {
  const { data: templates } = await getInvoiceTemplates();

  return <InvoiceTemplatesDataTable data={templates} />;
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
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InvoiceTemplatesPage() {
  return (
    <Suspense fallback={<TemplateListSkeleton />}>
      <InvoiceTemplateContent />
    </Suspense>
  );
}
