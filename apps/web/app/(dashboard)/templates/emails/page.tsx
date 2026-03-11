import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getEmailTemplates } from '@/lib/email/actions';
import { EmailTemplatesDataTable } from '@/components/email/email-templates-data-table';

export const metadata = {
  title: 'Email Templates',
};

async function EmailTemplateContent() {
  const templates = await getEmailTemplates();

  return <EmailTemplatesDataTable data={templates} />;
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
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EmailTemplatesPage() {
  return (
    <Suspense fallback={<TemplateListSkeleton />}>
      <EmailTemplateContent />
    </Suspense>
  );
}
