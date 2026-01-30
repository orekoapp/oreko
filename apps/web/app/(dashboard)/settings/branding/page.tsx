import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandingSettingsForm } from '@/components/settings';
import { getBrandingSettings } from '@/lib/settings/actions';

export const metadata = {
  title: 'Branding - Settings',
};

export default async function BrandingSettingsPage() {
  const branding = await getBrandingSettings();

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Branding</h1>
          <p className="text-muted-foreground">
            Customize your brand appearance
          </p>
        </div>
      </div>

      <BrandingSettingsForm initialData={branding} />
    </div>
  );
}
