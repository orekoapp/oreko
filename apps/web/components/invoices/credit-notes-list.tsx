'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { issueCreditNote } from '@/lib/credit-notes/actions';

interface CreditNoteItem {
  id: string;
  creditNoteNumber: string;
  reason: string;
  amount: number;
  currency: string;
  status: string;
  issuedAt: string | null;
  createdAt: string;
}

interface CreditNotesListProps {
  creditNotes: CreditNoteItem[];
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  issued: 'default',
  voided: 'destructive',
};

function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function CreditNotesList({ creditNotes }: CreditNotesListProps) {
  const router = useRouter();
  const [issuingId, setIssuingId] = useState<string | null>(null);

  if (creditNotes.length === 0) {
    return null;
  }

  const handleIssue = async (creditNoteId: string) => {
    setIssuingId(creditNoteId);
    try {
      const result = await issueCreditNote(creditNoteId);
      if (result.success) {
        toast.success('Credit note issued');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to issue credit note');
      }
    } finally {
      setIssuingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {creditNotes.map((cn) => (
        <div key={cn.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
          <div className="flex items-start gap-3 min-w-0">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{cn.creditNoteNumber}</span>
                <Badge variant={statusVariants[cn.status] ?? 'outline'}>
                  {cn.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{cn.reason}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(cn.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-sm">{formatCurrency(cn.amount, cn.currency)}</span>
            {cn.status === 'draft' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleIssue(cn.id)}
                disabled={issuingId === cn.id}
              >
                {issuingId === cn.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Issue'
                )}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
