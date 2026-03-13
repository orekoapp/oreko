import { BusinessProfileForm } from '@/components/settings';
import { getBusinessProfile } from '@/lib/settings/actions';

export const metadata = {
  title: 'Business Profile - Settings',
};

export default async function BusinessSettingsPage() {
  const profile = await getBusinessProfile();

  return <BusinessProfileForm initialData={profile} />;
}
