'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createWebhookEndpoint, updateWebhookEndpoint } from '@/lib/webhooks/actions';
import { toast } from 'sonner';

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

const EVENT_GROUPS = [
  {
    label: 'Quotes',
    events: [
      { value: 'quote.created', label: 'Quote Created' },
      { value: 'quote.sent', label: 'Quote Sent' },
      { value: 'quote.accepted', label: 'Quote Accepted' },
      { value: 'quote.declined', label: 'Quote Declined' },
    ],
  },
  {
    label: 'Invoices',
    events: [
      { value: 'invoice.created', label: 'Invoice Created' },
      { value: 'invoice.sent', label: 'Invoice Sent' },
      { value: 'invoice.paid', label: 'Invoice Paid' },
      { value: 'invoice.voided', label: 'Invoice Voided' },
    ],
  },
  {
    label: 'Payments',
    events: [
      { value: 'payment.received', label: 'Payment Received' },
      { value: 'payment.refunded', label: 'Payment Refunded' },
    ],
  },
  {
    label: 'Other',
    events: [
      { value: 'client.created', label: 'Client Created' },
      { value: 'credit_note.issued', label: 'Credit Note Issued' },
    ],
  },
];

const ALL_EVENTS = EVENT_GROUPS.flatMap((g) => g.events.map((e) => e.value));

export function WebhookEndpointForm({ endpoint, onCreated, onUpdated, onCancel }: WebhookEndpointFormProps) {
  const isEditing = !!endpoint;
  const [url, setUrl] = React.useState(endpoint?.url || '');
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>(endpoint?.events || []);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const allSelected = selectedEvents.length === ALL_EVENTS.length;

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const toggleAll = () => {
    setSelectedEvents(allSelected ? [] : [...ALL_EVENTS]);
  };

  const toggleGroup = (groupEvents: string[]) => {
    const allGroupSelected = groupEvents.every((e) => selectedEvents.includes(e));
    if (allGroupSelected) {
      setSelectedEvents((prev) => prev.filter((e) => !groupEvents.includes(e)));
    } else {
      setSelectedEvents((prev) => [...new Set([...prev, ...groupEvents])]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    if (selectedEvents.length === 0) {
      setError('Select at least one event');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        const result = await updateWebhookEndpoint(endpoint.id, {
          url: url.trim(),
          events: selectedEvents,
        });
        if (result.success && result.endpoint) {
          toast.success('Webhook endpoint updated');
          onUpdated?.({
            id: result.endpoint.id,
            url: result.endpoint.url,
            events: result.endpoint.events,
            isActive: result.endpoint.isActive,
            createdAt: result.endpoint.createdAt.toISOString(),
            updatedAt: result.endpoint.updatedAt.toISOString(),
            totalDeliveries: endpoint.totalDeliveries,
          });
        } else {
          setError(result.error || 'Failed to update');
        }
      } else {
        const result = await createWebhookEndpoint({
          url: url.trim(),
          events: selectedEvents,
        });
        if (result.success && result.endpoint) {
          toast.success('Webhook endpoint created');
          onCreated?.({
            id: result.endpoint.id,
            url: result.endpoint.url,
            events: result.endpoint.events,
            isActive: result.endpoint.isActive,
            createdAt: result.endpoint.createdAt.toISOString(),
            updatedAt: result.endpoint.updatedAt.toISOString(),
            totalDeliveries: 0,
            secret: result.endpoint.secret,
          });
        } else {
          setError(result.error || 'Failed to create');
        }
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit' : 'Create'} Webhook Endpoint</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the URL or events for this webhook endpoint.'
                : 'Enter a URL and select which events should trigger this webhook.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input
                id="webhook-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/webhooks"
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be a publicly accessible HTTPS URL.
              </p>
            </div>

            {/* Events */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Events to subscribe</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto py-1"
                  onClick={toggleAll}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                {EVENT_GROUPS.map((group) => {
                  const groupEventValues = group.events.map((e) => e.value);
                  const allGroupSelected = groupEventValues.every((e) => selectedEvents.includes(e));
                  const someGroupSelected = groupEventValues.some((e) => selectedEvents.includes(e));

                  return (
                    <div key={group.label}>
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                          id={`group-${group.label}`}
                          checked={allGroupSelected}
                          ref={(el) => {
                            if (el) {
                              (el as unknown as HTMLInputElement).indeterminate = someGroupSelected && !allGroupSelected;
                            }
                          }}
                          onCheckedChange={() => toggleGroup(groupEventValues)}
                        />
                        <label
                          htmlFor={`group-${group.label}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {group.label}
                        </label>
                      </div>
                      <div className="ml-6 grid grid-cols-2 gap-2">
                        {group.events.map((event) => (
                          <div key={event.value} className="flex items-center gap-2">
                            <Checkbox
                              id={`event-${event.value}`}
                              checked={selectedEvents.includes(event.value)}
                              onCheckedChange={() => toggleEvent(event.value)}
                            />
                            <label
                              htmlFor={`event-${event.value}`}
                              className="text-sm text-muted-foreground cursor-pointer"
                            >
                              {event.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                {selectedEvents.length} of {ALL_EVENTS.length} events selected
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update' : 'Create'} Endpoint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
