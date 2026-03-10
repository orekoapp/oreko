'use client';

import * as React from 'react';
import { Plus, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { deleteWebhookEndpoint, updateWebhookEndpoint } from '@/lib/webhooks/actions';
import { WebhookEndpointForm } from './webhook-endpoint-form';
import { WebhookDeliveryLog } from './webhook-delivery-log';
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

interface WebhookEndpointsListProps {
  initialEndpoints: EndpointItem[];
}

export function WebhookEndpointsList({ initialEndpoints }: WebhookEndpointsListProps) {
  const [endpoints, setEndpoints] = React.useState<EndpointItem[]>(initialEndpoints);
  const [showForm, setShowForm] = React.useState(false);
  const [editingEndpoint, setEditingEndpoint] = React.useState<EndpointItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [viewDeliveriesId, setViewDeliveriesId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [createdSecret, setCreatedSecret] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deleteWebhookEndpoint(deleteId);
      if (result.success) {
        setEndpoints((prev) => prev.filter((ep) => ep.id !== deleteId));
        toast.success('Webhook endpoint deleted');
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete webhook endpoint');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (endpoint: EndpointItem) => {
    try {
      const result = await updateWebhookEndpoint(endpoint.id, {
        isActive: !endpoint.isActive,
      });
      if (result.success) {
        setEndpoints((prev) =>
          prev.map((ep) =>
            ep.id === endpoint.id ? { ...ep, isActive: !ep.isActive } : ep
          )
        );
        toast.success(endpoint.isActive ? 'Webhook disabled' : 'Webhook enabled');
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update webhook endpoint');
    }
  };

  const handleCreated = (endpoint: EndpointItem & { secret?: string }) => {
    setEndpoints((prev) => [endpoint, ...prev]);
    setShowForm(false);
    if (endpoint.secret) {
      setCreatedSecret(endpoint.secret);
    }
  };

  const handleUpdated = (endpoint: EndpointItem) => {
    setEndpoints((prev) =>
      prev.map((ep) => (ep.id === endpoint.id ? endpoint : ep))
    );
    setEditingEndpoint(null);
  };

  return (
    <div className="space-y-6">
      {/* Secret display (shown once after creation) */}
      {createdSecret && (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-base">Webhook Secret Created</CardTitle>
            <CardDescription>
              Copy this secret now. It will not be shown again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="block rounded bg-muted p-3 font-mono text-sm break-all">
              {createdSecret}
            </code>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(createdSecret);
                  toast.success('Secret copied to clipboard');
                }}
              >
                Copy
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCreatedSecret(null)}
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Webhook Endpoints</CardTitle>
            <CardDescription>
              Send real-time event notifications to external services
            </CardDescription>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingEndpoint(null); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Endpoint
          </Button>
        </CardHeader>
        <CardContent>
          {endpoints.length === 0 && !showForm ? (
            <p className="py-8 text-center text-muted-foreground">
              No webhook endpoints configured. Add one to start receiving event notifications.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {endpoints.map((endpoint) => (
                  <TableRow key={endpoint.id}>
                    <TableCell className="font-mono text-sm max-w-[300px] truncate">
                      {endpoint.url}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {endpoint.events.length <= 3 ? (
                          endpoint.events.map((event) => (
                            <Badge key={event} variant="secondary" className="text-xs">
                              {event}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {endpoint.events.length} events
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={endpoint.isActive ? 'default' : 'outline'}>
                        {endpoint.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewDeliveriesId(endpoint.id)}
                          title="View deliveries"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(endpoint)}
                          title={endpoint.isActive ? 'Disable' : 'Enable'}
                        >
                          {endpoint.isActive ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingEndpoint(endpoint);
                            setShowForm(true);
                          }}
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(endpoint.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit form dialog */}
      {showForm && (
        <WebhookEndpointForm
          endpoint={editingEndpoint}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
          onCancel={() => { setShowForm(false); setEditingEndpoint(null); }}
        />
      )}

      {/* Delivery log dialog */}
      {viewDeliveriesId && (
        <WebhookDeliveryLog
          endpointId={viewDeliveriesId}
          onClose={() => setViewDeliveriesId(null)}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook Endpoint</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this webhook endpoint and all its delivery history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
