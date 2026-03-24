'use client';

import * as React from 'react';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getWebhookDeliveries } from '@/lib/webhooks/actions';

interface DeliveryItem {
  id: string;
  eventType: string;
  status: string;
  statusCode: number | null;
  attempts: number;
  createdAt: string;
}

interface WebhookDeliveryLogProps {
  endpointId: string;
  onClose: () => void;
}

function isSuccess(status: string) {
  return status === 'success' || status === 'delivered';
}

function StatusIcon({ status }: { status: string }) {
  if (isSuccess(status)) return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === 'failed') return <XCircle className="h-4 w-4 text-red-500" />;
  return <Clock className="h-4 w-4 text-yellow-500" />;
}

function StatusBadge({ status, statusCode }: { status: string; statusCode: number | null }) {
  const variant = isSuccess(status) ? 'default' : status === 'failed' ? 'destructive' : 'secondary';
  return (
    <div className="flex items-center gap-2">
      <StatusIcon status={status} />
      <Badge variant={variant}>
        {isSuccess(status) ? 'Delivered' : status === 'failed' ? 'Failed' : 'Pending'}
      </Badge>
      {statusCode && (
        <span className="text-xs text-muted-foreground font-mono">{statusCode}</span>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function WebhookDeliveryLog({ endpointId, onClose }: WebhookDeliveryLogProps) {
  const [deliveries, setDeliveries] = React.useState<DeliveryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getWebhookDeliveries(endpointId);
        setDeliveries(data);
      } catch {
        // silently fail — empty list shown
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [endpointId]);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Delivery Log</DialogTitle>
          <DialogDescription>
            Recent webhook delivery attempts for this endpoint.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : deliveries.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              No deliveries yet. Webhooks will appear here once events are triggered.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {delivery.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={delivery.status} statusCode={delivery.statusCode} />
                    </TableCell>
                    <TableCell className="text-sm">
                      {delivery.attempts}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(delivery.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
