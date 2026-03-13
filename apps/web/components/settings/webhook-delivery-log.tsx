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

interface WebhookDeliveryLogProps {
  endpointId: string;
  onClose: () => void;
}

export function WebhookDeliveryLog({ onClose }: WebhookDeliveryLogProps) {
  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delivery Log</DialogTitle>
          <DialogDescription>
            Webhook delivery logs are not yet available.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
