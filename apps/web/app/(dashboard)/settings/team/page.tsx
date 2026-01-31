import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamMemberList } from '@/components/settings/team-member-list';
import { InviteMemberButton } from '@/components/settings/invite-member-button';
import { getWorkspaceMembers, getCurrentUserRole } from '@/lib/settings/actions';

export const metadata = {
  title: 'Team - Settings',
};

export default async function TeamSettingsPage() {
  const [members, currentUserRole] = await Promise.all([
    getWorkspaceMembers(),
    getCurrentUserRole(),
  ]);

  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Team Members</h1>
            <p className="text-muted-foreground">
              Manage who has access to this workspace
            </p>
          </div>
        </div>
        {canManageTeam && <InviteMemberButton />}
      </div>

      <TeamMemberList
        members={members}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
