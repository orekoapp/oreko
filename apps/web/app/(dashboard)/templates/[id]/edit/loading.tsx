import { Skeleton } from '@/components/ui/skeleton';

export default function EditTemplateLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
