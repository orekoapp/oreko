'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { acceptInvitation } from '@/lib/settings/actions';

interface InviteAcceptClientProps {
  tokenHash: string;
  workspaceName: string;
}

// Bug #89: Accept tokenHash instead of raw token — no sensitive data in client props
export function InviteAcceptClient({ tokenHash, workspaceName }: InviteAcceptClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = () => {
    startTransition(async () => {
      const result = await acceptInvitation(tokenHash, { isHashed: true });
      if (result.success) {
        setAccepted(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError(result.error || 'Failed to accept invitation');
      }
    });
  };

  if (accepted) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
        <p className="text-lg font-medium">Welcome to {workspaceName}!</p>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <Button onClick={handleAccept} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Accept Invitation
        </Button>
        <Button variant="outline" onClick={() => router.push('/dashboard')} disabled={isPending}>
          Decline
        </Button>
      </div>
    </div>
  );
}
