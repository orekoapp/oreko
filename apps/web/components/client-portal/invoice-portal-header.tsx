'use client';

const statusColors: Record<string, { bg: string; text: string }> = {
  sent: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' },
  viewed: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300' },
  partial: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300' },
  paid: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' },
  overdue: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300' },
  voided: { bg: 'bg-gray-200 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400' },
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  const defaultStyle = { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' };
  const style = statusColors[status] ?? defaultStyle;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
