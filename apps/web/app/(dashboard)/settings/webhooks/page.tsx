export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWebhookEndpoints } from '@/lib/webhooks/actions';
import { WebhookEndpointsList } from '@/components/settings/webhook-endpoints-list';

export const metadata = {
  title: 'Webhooks - Settings',
};

export default async function WebhooksSettingsPage() {
  const endpoints = await getWebhookEndpoints();

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">
            Configure outbound webhooks to integrate with external services
          </p>
        </div>
      </div>

      <WebhookEndpointsList initialEndpoints={endpoints} />
    </div>
  );
}
