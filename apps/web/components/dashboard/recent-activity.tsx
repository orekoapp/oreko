'use client';

import Link from 'next/link';
import {
  FileText,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Eye,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import type { ActivityItem } from '@/lib/dashboard/types';

interface RecentActivityProps {
  activities: ActivityItem[];
}

const activityIcons: Record<ActivityItem['type'], typeof FileText> = {
  quote_created: FileText,
  quote_sent: Send,
  quote_viewed: Eye,
  quote_accepted: CheckCircle,
  quote_declined: XCircle,
  quote_expired: Clock,
  invoice_created: Receipt,
  invoice_sent: Send,
  invoice_viewed: Eye,
  invoice_paid: CheckCircle,
  invoice_overdue: AlertCircle,
  client_created: Eye,
};

// Theme-derived activity icon colors
const activityColors: Record<ActivityItem['type'], string> = {
  quote_created: 'text-[var(--primary-500)]',
  quote_sent: 'text-[var(--primary-400)]',
  quote_viewed: 'text-[var(--primary-300)]',
  quote_accepted: 'text-[var(--chart-2)]',
  quote_declined: 'text-destructive',
  quote_expired: 'text-muted-foreground',
  invoice_created: 'text-[var(--primary-600)]',
  invoice_sent: 'text-[var(--primary-400)]',
  invoice_viewed: 'text-[var(--primary-300)]',
  invoice_paid: 'text-[var(--chart-2)]',
  invoice_overdue: 'text-destructive',
  client_created: 'text-[var(--primary-300)]',
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        <CardDescription className="text-xs">
          Latest updates across your workspace
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No recent activity
          </p>
        ) : (
          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-[9px] top-1 bottom-1 w-px" style={{ background: 'linear-gradient(to bottom, var(--primary-300), var(--primary-100))' }} />

            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type];
                const color = activityColors[activity.type];
                const href = activity.relatedType === 'quote'
                  ? `/quotes/${activity.relatedId}`
                  : activity.relatedType === 'invoice'
                    ? `/invoices/${activity.relatedId}`
                    : '#';

                return (
                  <Link
                    key={activity.id}
                    href={href}
                    className="group relative flex gap-3 rounded-md py-1 transition-colors"
                  >
                    <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background ring-[3px] ring-background">
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                    </div>
                    <div className="min-w-0 flex-1 -mt-0.5">
                      <p className="text-sm leading-snug group-hover:text-primary transition-colors">
                        {activity.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span>{formatRelativeTime(activity.date)}</span>
                        {activity.clientName && (
                          <>
                            <span>&middot;</span>
                            <span className="truncate">{activity.clientName}</span>
                          </>
                        )}
                        {activity.amount && activity.amount > 0 && (
                          <>
                            <span>&middot;</span>
                            <span className="tabular-nums">{formatCurrency(activity.amount)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
