import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusinessProfileForm } from '@/components/settings';
import { getBusinessProfile } from '@/lib/settings/actions';

export const metadata = {
  title: 'Business Profile - Settings',
};

export default async function BusinessSettingsPage() {
  const profile = await getBusinessProfile();

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Business Profile</h1>
          <p className="text-muted-foreground">
            Manage your business information
          </p>
        </div>
      </div>

      <BusinessProfileForm initialData={profile} />
    </div>
  );
}
