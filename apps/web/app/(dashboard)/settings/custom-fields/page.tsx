export const dynamic = 'force-dynamic';

import { CustomFieldsManager } from '@/components/settings/custom-fields-manager';
import { getCustomFields } from '@/lib/settings/actions';

export const metadata = {
  title: 'Custom Fields',
};

export default async function CustomFieldsSettingsPage() {
  const customFields = await getCustomFields();

  return (
    <div className="space-y-4">
      <CustomFieldsManager initialData={customFields} />
    </div>
  );
}
