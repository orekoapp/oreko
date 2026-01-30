import { TableSkeleton } from '@/components/shared';

export default function InvoicesLoading() {
  return (
    <div className="p-6">
      <TableSkeleton rows={8} />
    </div>
  );
}
