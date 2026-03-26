'use client';

import { useState, useTransition } from 'react';
import { Loader2, Mail, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cancelInvitation, resendInvitation } from '@/lib/settings/actions';
import type { PendingInvitation } from '@/lib/settings/actions';

interface PendingInvitationsProps {
  invitations: PendingInvitation[];
}

export function PendingInvitations({ invitations: initialInvitations }: PendingInvitationsProps) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleCancel = (id: string) => {
    setActionId(id);
    startTransition(async () => {
      const result = await cancelInvitation(id);
      if (result.success) {
        setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      }
      setActionId(null);
    });
  };

  const handleResend = (id: string) => {
    setActionId(id);
    startTransition(async () => {
      const result = await resendInvitation(id);
      if (result.success) {
        toast.success('Invitation resent successfully');
      } else {
        toast.error(result.error || 'Failed to resend invitation');
      }
      setActionId(null);
    });
  };

  if (invitations.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Pending Invitations</h2>
      <div className="space-y-3">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{inv.email}</p>
                <p className="text-xs text-muted-foreground">
                  Expires {new Date(inv.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{inv.role}</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleResend(inv.id)}
                disabled={isPending && actionId === inv.id}
                title="Resend invitation"
              >
                {isPending && actionId === inv.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleCancel(inv.id)}
                disabled={isPending && actionId === inv.id}
                title="Cancel invitation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
