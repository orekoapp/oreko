'use client';

import * as React from 'react';
import { Plus, Pencil, Trash2, X, Check, Copy, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  createWebhook,
  updateWebhook,
  deleteWebhook,
} from '@/lib/settings/actions';
import type { WebhookData, WebhookEvent } from '@/lib/settings/types';
import { WEBHOOK_EVENT_LABELS } from '@/lib/settings/types';
import { toast } from 'sonner';

interface WebhooksManagerProps {
  initialData: WebhookData[];
}

interface EditingWebhook {
  id?: string;
  name: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  isActive: boolean;
}

const ALL_EVENTS = Object.keys(WEBHOOK_EVENT_LABELS) as WebhookEvent[];

const EVENT_GROUPS = {
  Quotes: ALL_EVENTS.filter((e) => e.startsWith('quote.')),
  Invoices: ALL_EVENTS.filter((e) => e.startsWith('invoice.')),
  Clients: ALL_EVENTS.filter((e) => e.startsWith('client.')),
  Projects: ALL_EVENTS.filter((e) => e.startsWith('project.')),
  Payments: ALL_EVENTS.filter((e) => e.startsWith('payment.')),
};

export function WebhooksManager({ initialData }: WebhooksManagerProps) {
  const [webhooks, setWebhooks] = React.useState<WebhookData[]>(initialData);
  const [editingWebhook, setEditingWebhook] = React.useState<EditingWebhook | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showSecrets, setShowSecrets] = React.useState<Record<string, boolean>>({});

  const handleAddNew = () => {
    setEditingWebhook({
      name: '',
      url: '',
      secret: '',
      events: [],
      isActive: true,
    });
  };

  const handleEdit = (webhook: WebhookData) => {
    setEditingWebhook({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      secret: webhook.secret || '',
      events: [...webhook.events],
      isActive: webhook.isActive,
    });
  };

  const handleToggleEvent = (event: WebhookEvent) => {
    if (!editingWebhook) return;
    const current = editingWebhook.events;
    setEditingWebhook({
      ...editingWebhook,
      events: current.includes(event)
        ? current.filter((e) => e !== event)
        : [...current, event],
    });
  };

  const handleToggleGroup = (events: WebhookEvent[]) => {
    if (!editingWebhook) return;
    const allSelected = events.every((e) => editingWebhook.events.includes(e));
    if (allSelected) {
      setEditingWebhook({
        ...editingWebhook,
        events: editingWebhook.events.filter((e) => !events.includes(e)),
      });
    } else {
      const newEvents = new Set([...editingWebhook.events, ...events]);
      setEditingWebhook({
        ...editingWebhook,
        events: Array.from(newEvents),
      });
    }
  };

  const handleSave = async () => {
    if (!editingWebhook) return;

    if (!editingWebhook.name.trim()) {
      toast.error('Webhook name is required');
      return;
    }

    if (!editingWebhook.url.trim()) {
      toast.error('Endpoint URL is required');
      return;
    }

    try {
      new URL(editingWebhook.url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    if (editingWebhook.events.length === 0) {
      toast.error('Select at least one event');
      return;
    }

    setIsSaving(true);
    try {
      const input = {
        name: editingWebhook.name.trim(),
        url: editingWebhook.url.trim(),
        secret: editingWebhook.secret.trim() || undefined,
        events: editingWebhook.events,
        isActive: editingWebhook.isActive,
      };

      if (editingWebhook.id) {
        await updateWebhook({ ...input, id: editingWebhook.id });
        setWebhooks((prev) =>
          prev.map((w) =>
            w.id === editingWebhook.id
              ? { ...w, ...input, secret: input.secret || null, updatedAt: new Date() }
              : w
          )
        );
        toast.success('Webhook updated');
      } else {
        const result = await createWebhook(input);
        setWebhooks((prev) => [
          ...prev,
          {
            id: result.id,
            ...input,
            secret: input.secret || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        toast.success('Webhook created');
      }

      setEditingWebhook(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save webhook');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteWebhook(deleteId);
      setWebhooks((prev) => prev.filter((w) => w.id !== deleteId));
      toast.success('Webhook deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete webhook');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied to clipboard');
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Send real-time HTTP notifications to external services when events occur in your workspace.
              </CardDescription>
            </div>
            {!editingWebhook && (
              <Button onClick={handleAddNew} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Webhook
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Form */}
          {editingWebhook && (
            <div className="mb-6 rounded-lg border p-4">
              <div className="mb-4 text-sm font-medium">
                {editingWebhook.id ? 'Edit Webhook' : 'New Webhook'}
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-name">Name *</Label>
                    <Input
                      id="webhook-name"
                      value={editingWebhook.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingWebhook({ ...editingWebhook, name: e.target.value })
                      }
                      placeholder="e.g., Slack Notifications"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Endpoint URL *</Label>
                    <Input
                      id="webhook-url"
                      type="url"
                      value={editingWebhook.url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingWebhook({ ...editingWebhook, url: e.target.value })
                      }
                      placeholder="https://example.com/webhook"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Signing Secret</Label>
                  <Input
                    id="webhook-secret"
                    value={editingWebhook.secret}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingWebhook({ ...editingWebhook, secret: e.target.value })
                    }
                    placeholder="Optional secret for verifying webhook signatures"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to sign webhook payloads so you can verify they came from QuoteCraft.
                  </p>
                </div>

                {/* Event Selection */}
                <div className="space-y-3">
                  <Label>Events *</Label>
                  {Object.entries(EVENT_GROUPS).map(([group, events]) => (
                    <div key={group} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`group-${group}`}
                          checked={events.every((e) => editingWebhook.events.includes(e))}
                          onCheckedChange={() => handleToggleGroup(events)}
                        />
                        <Label
                          htmlFor={`group-${group}`}
                          className="cursor-pointer text-sm font-medium"
                        >
                          {group}
                        </Label>
                      </div>
                      <div className="ml-6 flex flex-wrap gap-x-6 gap-y-2">
                        {events.map((event) => (
                          <div key={event} className="flex items-center gap-2">
                            <Checkbox
                              id={`event-${event}`}
                              checked={editingWebhook.events.includes(event)}
                              onCheckedChange={() => handleToggleEvent(event)}
                            />
                            <Label
                              htmlFor={`event-${event}`}
                              className="cursor-pointer text-sm font-normal"
                            >
                              {WEBHOOK_EVENT_LABELS[event]}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="webhook-active"
                    checked={editingWebhook.isActive}
                    onCheckedChange={(checked: boolean) =>
                      setEditingWebhook({ ...editingWebhook, isActive: checked })
                    }
                  />
                  <Label htmlFor="webhook-active" className="cursor-pointer">
                    Active
                  </Label>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setEditingWebhook(null)}
                    disabled={isSaving}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Check className="mr-1 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Webhooks List */}
          {webhooks.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No webhooks configured. Add one to start receiving event notifications.
            </p>
          ) : (
            <div className="space-y-2">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className={`rounded-lg border p-4 ${
                    !webhook.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{webhook.name}</span>
                        {webhook.isActive ? (
                          <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground font-mono">
                        {webhook.url}
                      </p>
                      {webhook.secret && (
                        <p className="text-xs text-muted-foreground font-mono">
                          Secret: {webhook.secret}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {webhook.events.map((event: WebhookEvent) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {WEBHOOK_EVENT_LABELS[event]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(webhook)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this webhook? Event notifications will
              stop being sent to this endpoint. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
    </>
  );
}
