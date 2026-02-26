'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { sendQuote, duplicateQuote } from '@/lib/quotes/actions';

interface QuoteDetailActionsProps {
  quoteId: string;
  status: string;
}

export function SendQuoteButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await sendQuote(quoteId);
      if (result.success) {
        if (result.emailSent) {
          toast.success('Quote sent and email delivered');
        } else {
          toast.warning('Quote marked as sent, but email delivery failed. Please check your email configuration.');
        }
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to send quote');
      }
    } catch {
      toast.error('Failed to send quote');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button size="sm" onClick={handleSend} disabled={isSending}>
      {isSending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Send to Client
    </Button>
  );
}

export function DuplicateQuoteButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const result = await duplicateQuote(quoteId);
      if (result.success && result.quoteId) {
        toast.success('Quote duplicated');
        router.push(`/quotes/${result.quoteId}`);
      }
    } catch {
      toast.error('Failed to duplicate quote');
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={isDuplicating}>
      {isDuplicating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Copy className="mr-2 h-4 w-4" />
      )}
      Duplicate
    </Button>
  );
}
