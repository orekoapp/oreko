import { TeamMemberList } from '@/components/settings/team-member-list';
import { InviteMemberButton } from '@/components/settings/invite-member-button';
import { getWorkspaceMembers, getCurrentUserRole, getPendingInvitations } from '@/lib/settings/actions';
import { PendingInvitations } from '@/components/settings/pending-invitations';

export const metadata = {
  title: 'Team - Settings',
};

export default async function TeamSettingsPage() {
  const [members, currentUserRole, pendingInvitations] = await Promise.all([
    getWorkspaceMembers(),
    getCurrentUserRole(),
    getPendingInvitations(),
  ]);

  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="space-y-4">
      {canManageTeam && (
        <div className="flex justify-end">
          <InviteMemberButton />
        </div>
      )}

      <TeamMemberList
        members={members}
        currentUserRole={currentUserRole}
      />

      {canManageTeam && pendingInvitations.length > 0 && (
        <div className="mt-8">
          <PendingInvitations invitations={pendingInvitations} />
        </div>
      )}
    </div>
  );
}
