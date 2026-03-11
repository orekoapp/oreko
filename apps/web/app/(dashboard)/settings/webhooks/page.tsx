import { WebhooksManager } from '@/components/settings/webhooks-manager';
import { getWebhooks } from '@/lib/settings/actions';

export const metadata = {
  title: 'Webhooks - Settings',
};

export default async function WebhooksSettingsPage() {
  const webhooks = await getWebhooks();

  return (
    <div className="space-y-6">
      <WebhooksManager initialData={webhooks} />
    </div>
  );
}
