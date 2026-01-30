'use client';

import { useState } from 'react';
import { XCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { declineQuote, type PublicQuoteData } from '@/lib/quotes/portal-actions';
import { toast } from 'sonner';

interface DeclineQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: PublicQuoteData;
  accessToken: string;
  onDeclined: () => void;
}

const DECLINE_REASONS = [
  { value: 'price', label: 'Price too high' },
  { value: 'scope', label: 'Scope doesn\'t match my needs' },
  { value: 'timing', label: 'Timeline doesn\'t work' },
  { value: 'competitor', label: 'Going with another provider' },
  { value: 'budget', label: 'Budget constraints' },
  { value: 'postponed', label: 'Project postponed' },
  { value: 'other', label: 'Other reason' },
];

export function DeclineQuoteDialog({
  open,
  onOpenChange,
  quote,
  accessToken,
  onDeclined,
}: DeclineQuoteDialogProps) {
  const [reason, setReason] = useState<string>('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await declineQuote({
        accessToken,
        reason: reason || undefined,
        comment: comment.trim() || undefined,
      });

      if (result.success) {
        toast.success('Quote declined');
        onDeclined();
      } else {
        toast.error(result.error || 'Failed to decline quote');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form state
      setReason('');
      setComment('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Decline Quote
          </DialogTitle>
          <DialogDescription>
            Let {quote.business.name} know why you&apos;re declining. This
            feedback helps them improve.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="decline-reason">Reason (optional)</Label>
            <Select value={reason} onValueChange={setReason} disabled={isSubmitting}>
              <SelectTrigger id="decline-reason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {DECLINE_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Comments */}
          <div className="space-y-2">
            <Label htmlFor="decline-comment">Additional comments (optional)</Label>
            <Textarea
              id="decline-comment"
              placeholder="Any additional feedback you'd like to share..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Declining...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Decline Quote
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
