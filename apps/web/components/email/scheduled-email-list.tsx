'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { cancelScheduledEmail } from '@/lib/email/actions';
import type { ScheduledEmailListItem } from '@/lib/email/types';

interface ScheduledEmailListProps {
  emails: ScheduledEmailListItem[];
}

type StatusConfigItem = {
  icon: typeof Clock;
  variant: 'default' | 'secondary' | 'destructive';
  label: string;
};

const statusConfig: Record<string, StatusConfigItem> = {
  pending: { icon: Clock, variant: 'secondary', label: 'Pending' },
  sent: { icon: CheckCircle, variant: 'default', label: 'Sent' },
  failed: { icon: AlertCircle, variant: 'destructive', label: 'Failed' },
  cancelled: { icon: XCircle, variant: 'secondary', label: 'Cancelled' },
};

const defaultConfig: StatusConfigItem = { icon: Clock, variant: 'secondary', label: 'Pending' };

export function ScheduledEmailList({ emails }: ScheduledEmailListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cancelId, setCancelId] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!cancelId) return;
    startTransition(async () => {
      try {
        await cancelScheduledEmail(cancelId);
        setCancelId(null);
        router.refresh();
      } catch (error) {
        console.error('Failed to cancel scheduled email:', error);
      }
    });
  };

  if (emails.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No scheduled emails</h3>
          <p className="text-muted-foreground text-center mt-1">
            Scheduled emails will appear here when you set up automated reminders.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Emails</CardTitle>
          <CardDescription>
            View and manage scheduled email notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((email) => {
                const config = statusConfig[email.status] ?? defaultConfig;
                const StatusIcon = config.icon;
                return (
                  <TableRow key={email.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{email.recipientName || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                          {email.recipientEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {email.subject}
                    </TableCell>
                    <TableCell>
                      {format(new Date(email.scheduledFor), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {email.status === 'pending' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setCancelId(email.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Scheduled Email</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this scheduled email? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Scheduled</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
