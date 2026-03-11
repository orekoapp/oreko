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
  quote_accepted: CheckCircle,
  quote_declined: XCircle,
  quote_expired: Clock,
  invoice_created: Receipt,
  invoice_sent: Send,
  invoice_paid: CheckCircle,
  invoice_overdue: AlertCircle,
  invoice_viewed: Eye,
  quote_viewed: Eye,
  client_created: Eye,
};

const activityColors: Record<ActivityItem['type'], string> = {
  quote_created: 'text-[var(--primary-500)]',
  quote_sent: 'text-[var(--primary-400)]',
  quote_accepted: 'text-emerald-500',
  quote_declined: 'text-destructive',
  quote_expired: 'text-muted-foreground',
  invoice_created: 'text-[var(--primary-600)]',
  invoice_sent: 'text-[var(--primary-400)]',
  invoice_paid: 'text-emerald-500',
  invoice_overdue: 'text-destructive',
  invoice_viewed: 'text-[var(--primary-300)]',
  quote_viewed: 'text-[var(--primary-300)]',
  client_created: 'text-[var(--primary-300)]',
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No recent activity
          </p>
        ) : (
          <div className="relative">
            <div
              className="absolute left-[9px] top-1 bottom-1 w-px"
              style={{
                background:
                  'linear-gradient(to bottom, var(--primary-200), transparent)',
              }}
            />

            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type];
                const color = activityColors[activity.type];
                const href =
                  activity.relatedType === 'quote'
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
                    <div className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-card ring-2 ring-card">
                      <Icon className={`h-3 w-3 ${color}`} />
                    </div>
                    <div className="min-w-0 flex-1 -mt-0.5">
                      <p className="text-sm leading-snug group-hover:text-primary transition-colors">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70 mt-0.5">
                        <span>{formatRelativeTime(activity.date)}</span>
                        {activity.amount && activity.amount > 0 && (
                          <>
                            <span>&middot;</span>
                            <span className="tabular-nums">
                              {formatCurrency(activity.amount)}
                            </span>
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
