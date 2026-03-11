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
    <div className="space-y-6">
      {canManageTeam && (
        <div className="flex justify-end">
          <InviteMemberButton />
        </div>
      )}

      <TeamMemberList
        members={members}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
