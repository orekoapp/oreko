'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface EndpointItem {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalDeliveries: number;
}

interface WebhookEndpointFormProps {
  endpoint?: EndpointItem | null;
  onCreated?: (endpoint: EndpointItem & { secret?: string }) => void;
  onUpdated?: (endpoint: EndpointItem) => void;
  onCancel: () => void;
}

export function WebhookEndpointForm({ endpoint, onCancel }: WebhookEndpointFormProps) {
  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{endpoint ? 'Edit' : 'Create'} Webhook Endpoint</DialogTitle>
          <DialogDescription>
            Webhook management is not yet available.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
