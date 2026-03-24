'use client';

import * as React from 'react';
import Link from 'next/link';
import { Webhook, Zap, Workflow, Settings2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { IntegrationData } from '@/lib/settings/types';

interface IntegrationsManagerProps {
  initialData: IntegrationData[];
}

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  webhooks: <Webhook className="h-6 w-6 text-blue-500" />,
  zapier: <Zap className="h-6 w-6 text-orange-500" />,
  n8n: <Workflow className="h-6 w-6 text-emerald-500" />,
  make: <Settings2 className="h-6 w-6 text-purple-500" />,
};

export function IntegrationsManager({ initialData }: IntegrationsManagerProps) {
  const webhooks = initialData.find((i) => i.provider === 'webhooks');
  const automationTools = initialData.filter((i) => i.provider !== 'webhooks');

  return (
    <>
      {/* Webhooks — Primary Integration */}
      {webhooks && (
        <Card>
          <CardHeader>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>
              Webhooks are the foundation for all integrations. Set up webhook endpoints to send
              real-time event data to external services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {PROVIDER_ICONS[webhooks.provider]}
                <div>
                  <span className="font-medium">{webhooks.name}</span>
                  <p className="text-sm text-muted-foreground">
                    {webhooks.description}
                  </p>
                </div>
              </div>
              <Button size="sm" asChild>
                <Link href="/settings/webhooks">
                  Configure
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automation Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Tools</CardTitle>
          <CardDescription>
            Connect QuoteCraft to thousands of apps using these automation platforms.
            All of them work through webhooks — configure a webhook first, then use
            the webhook URL as a trigger in your automation tool.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {automationTools.map((integration) => (
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
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            To get started, create a webhook in{' '}
            <Link href="/settings/webhooks" className="text-primary underline underline-offset-4 hover:text-primary/80">
              Webhook Settings
            </Link>
            , then paste the webhook URL into your automation tool as a trigger.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
