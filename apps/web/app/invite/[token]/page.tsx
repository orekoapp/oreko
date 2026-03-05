import { redirect } from 'next/navigation';
import { createHash } from 'crypto';
import { prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';
import { InviteAcceptClient } from './invite-accept-client';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  // Hash the incoming token to look up (tokens are stored as hashes)
  const tokenHash = createHash('sha256').update(token).digest('hex');

  // Look up the invitation
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token: tokenHash },
    include: {
      workspace: { select: { name: true } },
      invitedBy: { select: { name: true } },
    },
  });

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-destructive">Invalid Invitation</h1>
          <p className="text-muted-foreground">
            This invitation link is invalid or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (invitation.acceptedAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold">Already Accepted</h1>
          <p className="text-muted-foreground">
            This invitation has already been accepted.
          </p>
          <a href="/dashboard" className="text-primary hover:underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (new Date() > invitation.expiresAt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-destructive">Invitation Expired</h1>
          <p className="text-muted-foreground">
            This invitation has expired. Please ask the workspace owner to send a new one.
          </p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  const session = await auth();

  if (!session?.user) {
    // Redirect to login with callback — use encoded callbackUrl to avoid
    // leaking raw token in login page server logs and browser history
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`);
  }

  // Check email match
  const emailMatch = session.user.email?.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md space-y-6 p-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Workspace Invitation</h1>
          <p className="text-muted-foreground">
            {invitation.invitedBy.name || 'A team member'} has invited you to join{' '}
            <strong>{invitation.workspace.name}</strong> as a <strong>{invitation.role}</strong>.
          </p>
        </div>

        {!emailMatch ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
            <p className="text-sm text-destructive">
              This invitation was sent to <strong>{invitation.email}</strong>, but you&apos;re
              logged in as <strong>{session.user.email}</strong>. Please log in with the correct
              account.
            </p>
          </div>
        ) : (
          <InviteAcceptClient token={token} workspaceName={invitation.workspace.name} />
        )}
      </div>
    </div>
  );
}
