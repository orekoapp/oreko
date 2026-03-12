'use client';

import * as React from 'react';
import { ExternalLink, FileSpreadsheet, BookOpen, MessageSquare, Calendar, Zap, FolderOpen, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  connectIntegration,
  disconnectIntegration,
} from '@/lib/settings/actions';
import type { IntegrationData } from '@/lib/settings/types';
import { toast } from 'sonner';

interface IntegrationsManagerProps {
  initialData: IntegrationData[];
}

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  quickbooks: <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />,
  xero: <BookOpen className="h-6 w-6 text-muted-foreground" />,
  slack: <MessageSquare className="h-6 w-6 text-muted-foreground" />,
  google_calendar: <Calendar className="h-6 w-6 text-muted-foreground" />,
  zapier: <Zap className="h-6 w-6 text-muted-foreground" />,
  google_drive: <FolderOpen className="h-6 w-6 text-muted-foreground" />,
  dropbox: <Package className="h-6 w-6 text-muted-foreground" />,
};

export function IntegrationsManager({ initialData }: IntegrationsManagerProps) {
  const [integrations, setIntegrations] = React.useState<IntegrationData[]>(initialData);
  const [disconnectId, setDisconnectId] = React.useState<string | null>(null);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleConnect = async (integration: IntegrationData) => {
    setLoadingId(integration.id);
    try {
      await connectIntegration(integration.id);
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === integration.id
            ? { ...i, isConnected: true, connectedAt: new Date() }
            : i
        )
      );
      toast.success(`${integration.name} connected successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to connect ${integration.name}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectId) return;

    const integration = integrations.find((i) => i.id === disconnectId);
    setLoadingId(disconnectId);
    try {
      await disconnectIntegration(disconnectId);
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === disconnectId
            ? { ...i, isConnected: false, connectedAt: null, config: {} }
            : i
        )
      );
      toast.success(`${integration?.name} disconnected`);
      setDisconnectId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to disconnect integration');
    } finally {
      setLoadingId(null);
    }
  };

  const connectedIntegrations = integrations.filter((i) => i.isConnected);
  const availableIntegrations = integrations.filter((i) => !i.isConnected && i.isAvailable);
  const comingSoonIntegrations = integrations.filter((i) => !i.isAvailable);

  return (
    <>
      {/* Connected Integrations */}
      {connectedIntegrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected</CardTitle>
            <CardDescription>
              Integrations currently active in your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {connectedIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    {PROVIDER_ICONS[integration.provider]}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{integration.name}</span>
                        <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                          Connected
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                      {integration.connectedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Connected {integration.connectedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDisconnectId(integration.id)}
                    disabled={loadingId === integration.id}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>
            Connect your workspace with third-party services to automate workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableIntegrations.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              All available integrations are connected.
            </p>
          ) : (
            <div className="space-y-2">
              {availableIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    {PROVIDER_ICONS[integration.provider]}
                    <div>
                      <span className="font-medium">{integration.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleConnect(integration)}
                    disabled={loadingId === integration.id}
                  >
                    {loadingId === integration.id ? 'Connecting...' : 'Connect'}
                    {loadingId !== integration.id && (
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon */}
      {comingSoonIntegrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              These integrations are being developed and will be available soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {comingSoonIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between rounded-lg border p-4 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    {PROVIDER_ICONS[integration.provider]}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{integration.name}</span>
                        <Badge variant="secondary">Coming Soon</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disconnect Confirmation */}
      <AlertDialog open={!!disconnectId} onOpenChange={() => setDisconnectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect this integration? Any automations
              or syncing powered by this integration will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={loadingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingId ? 'Disconnecting...' : 'Disconnect'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
