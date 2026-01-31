import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkspaceSettingsForm } from '@/components/settings/workspace-settings-form';
import { DangerZone } from '@/components/settings/danger-zone';
import { getWorkspaceSettings, getCurrentUserRole } from '@/lib/settings/actions';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Workspace - Settings',
};

export default async function WorkspaceSettingsPage() {
  const currentUserRole = await getCurrentUserRole();

  // Only owners can access workspace settings
  if (currentUserRole !== 'owner') {
    redirect('/settings');
  }

  const workspace = await getWorkspaceSettings();

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Workspace Settings</h1>
          <p className="text-muted-foreground">
            Manage your workspace configuration
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>
              Basic workspace information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkspaceSettingsForm initialData={workspace} />
          </CardContent>
        </Card>

        <DangerZone workspaceId={workspace?.id || ''} />
      </div>
    </div>
  );
}
