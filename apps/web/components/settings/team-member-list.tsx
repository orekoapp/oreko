'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Shield, User, Eye, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { updateMemberRole, removeMember, type WorkspaceMemberData, type WorkspaceMemberRole } from '@/lib/settings/actions';

const roleIcons: Record<WorkspaceMemberRole, React.ReactNode> = {
  owner: <Crown className="h-4 w-4 text-yellow-500" />,
  admin: <Shield className="h-4 w-4 text-blue-500" />,
  member: <User className="h-4 w-4 text-gray-500" />,
  viewer: <Eye className="h-4 w-4 text-gray-400" />,
};

const roleLabels: Record<WorkspaceMemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

interface TeamMemberListProps {
  members: WorkspaceMemberData[];
  currentUserRole: WorkspaceMemberRole;
}

export function TeamMemberList({ members, currentUserRole }: TeamMemberListProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleRoleChange = async (memberId: string, newRole: WorkspaceMemberRole) => {
    setUpdating(memberId);
    setError(null);

    try {
      const result = await updateMemberRole(memberId, newRole);
      if (!result.success) {
        setError(result.error || 'Failed to update role');
      }
      router.refresh();
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    setUpdating(memberId);
    setError(null);

    try {
      const result = await removeMember(memberId);
      if (!result.success) {
        setError(result.error || 'Failed to remove member');
      }
      router.refresh();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {members.map((member) => (
        <Card key={member.id} data-testid="team-member-card">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={member.user.avatarUrl || undefined} />
                <AvatarFallback>
                  {member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {member.user.name || member.user.email}
                </p>
                <p className="text-sm text-muted-foreground">{member.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {canManageTeam && member.role !== 'owner' ? (
                <Select
                  value={member.role}
                  onValueChange={(value) => handleRoleChange(member.id, value as WorkspaceMemberRole)}
                  disabled={updating === member.id}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUserRole === 'owner' && (
                      <SelectItem value="owner">
                        <div className="flex items-center gap-2">
                          {roleIcons.owner}
                          Owner
                        </div>
                      </SelectItem>
                    )}
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        {roleIcons.admin}
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="member">
                      <div className="flex items-center gap-2">
                        {roleIcons.member}
                        Member
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div className="flex items-center gap-2">
                        {roleIcons.viewer}
                        Viewer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 text-sm">
                  {roleIcons[member.role]}
                  {roleLabels[member.role]}
                </div>
              )}

              {canManageTeam && member.role !== 'owner' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={updating === member.id}>
                      {updating === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleRemove(member.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      Remove from workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {members.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No team members yet</p>
        </div>
      )}
    </div>
  );
}
