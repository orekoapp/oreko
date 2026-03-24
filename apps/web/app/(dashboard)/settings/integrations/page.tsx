export const dynamic = 'force-dynamic';

import { IntegrationsManager } from '@/components/settings/integrations-manager';
import { getIntegrations } from '@/lib/settings/actions';

export const metadata = {
  title: 'Integrations - Settings',
};

export default async function IntegrationsSettingsPage() {
  const integrations = await getIntegrations();

  return (
    <div className="space-y-4">
      <IntegrationsManager initialData={integrations} />
    </div>
  );
}
