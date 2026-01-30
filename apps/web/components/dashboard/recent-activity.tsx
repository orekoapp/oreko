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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  client_created: Eye,
};

const activityColors: Record<ActivityItem['type'], string> = {
  quote_created: 'text-blue-500 bg-blue-500/10',
  quote_sent: 'text-yellow-500 bg-yellow-500/10',
  quote_accepted: 'text-green-500 bg-green-500/10',
  quote_declined: 'text-red-500 bg-red-500/10',
  quote_expired: 'text-gray-500 bg-gray-500/10',
  invoice_created: 'text-violet-500 bg-violet-500/10',
  invoice_sent: 'text-yellow-500 bg-yellow-500/10',
  invoice_paid: 'text-green-500 bg-green-500/10',
  invoice_overdue: 'text-red-500 bg-red-500/10',
  client_created: 'text-teal-500 bg-teal-500/10',
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            No recent activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            const href = activity.relatedType === 'quote'
              ? `/quotes/${activity.relatedId}`
              : activity.relatedType === 'invoice'
                ? `/invoices/${activity.relatedId}`
                : '#';

            return (
              <Link
                key={activity.id}
                href={href}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <div className={`rounded-full p-2 ${colorClass.split(' ')[1]}`}>
                  <Icon className={`h-4 w-4 ${colorClass.split(' ')[0]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{activity.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {activity.clientName && (
                      <span className="truncate">{activity.clientName}</span>
                    )}
                    {activity.amount && activity.amount > 0 && (
                      <>
                        <span>•</span>
                        <span>{formatCurrency(activity.amount / 100)}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(activity.date)}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
