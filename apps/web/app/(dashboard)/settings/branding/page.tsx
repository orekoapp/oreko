import { BrandingSettingsForm } from '@/components/settings';
import { getBrandingSettings, getBusinessProfile } from '@/lib/settings/actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Branding - Settings',
};

export default async function BrandingSettingsPage() {
  const [branding, businessProfile] = await Promise.all([
    getBrandingSettings(),
    getBusinessProfile(),
  ]);

  return <BrandingSettingsForm initialData={branding} businessData={businessProfile} />;
}
