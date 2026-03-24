export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiKeys } from '@/lib/api-keys/actions';
import { ApiKeysManager } from '@/components/settings/api-keys-manager';

export const metadata = {
  title: 'API Keys',
};

async function ApiKeysContent() {
  const keys = await getApiKeys();
  return <ApiKeysManager keys={keys} />;
}

export default function ApiKeysPage() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">API Keys</h3>
        <p className="text-sm text-muted-foreground">
          Manage API keys for external integrations. Keys are shown only once when created.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <ApiKeysContent />
      </Suspense>
    </div>
  );
}
