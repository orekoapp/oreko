'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createQuote, updateQuote, sendQuote } from '@/lib/quotes/actions';
import type { ClientInfo } from './useQuoteForm';

interface UseQuoteSaveOptions {
  document: {
    id: string;
    clientId: string;
    projectId: string | null;
    title: string;
    blocks: any[];
    notes: string;
    terms: string;
    internalNotes: string;
  } | null;
  client: ClientInfo | null;
}

export function useQuoteSave({ document, client }: UseQuoteSaveOptions) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  const handleSave = async () => {
    // Bug #168: Prevent double-submit race condition
    if (!document || isLoading || isSending) return;

    setIsLoading(true);
    try {
      if (document.id.startsWith('temp-')) {
        const result = await createQuote({
          clientId: client?.id || document.clientId,
          projectId: document.projectId,
          title: document.title,
          blocks: document.blocks,
        });

        if (result.success && result.quote) {
          toast.success('Quote saved as draft');
          router.push(`/quotes/${result.quote.id}`);
        }
      } else {
        const result = await updateQuote(document.id, {
          title: document.title,
          blocks: document.blocks,
          notes: document.notes,
          terms: document.terms,
          internalNotes: document.internalNotes,
        });

        if (result.success) {
          toast.success('Quote saved successfully');
        }
      }
    } catch {
      toast.error('Failed to save quote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendQuote = async () => {
    // Bug #168: Prevent double-submit race condition
    if (!document || !client || isSending || isLoading) return;

    setIsSending(true);
    try {
      let quoteId = document.id;

      if (document.id.startsWith('temp-')) {
        const createResult = await createQuote({
          clientId: client.id,
          projectId: document.projectId,
          title: document.title,
          blocks: document.blocks,
        });

        if (!createResult.success || !createResult.quote) {
          throw new Error('Failed to create quote');
        }
        quoteId = createResult.quote.id;
      }

      const result = await sendQuote(quoteId);

      if (result.success) {
        if (result.emailSent) {
          toast.success('Quote sent and email delivered');
        } else {
          toast.warning('Quote marked as sent, but email delivery failed. Please check your email configuration.');
        }
        router.push(`/quotes/${quoteId}`);
      } else {
        throw new Error(result.error || 'Failed to send quote');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send quote');
    } finally {
      setIsSending(false);
      setShowSendConfirm(false);
    }
  };

  return {
    isLoading,
    isSending,
    showSendConfirm,
    setShowSendConfirm,
    handleSave,
    handleSendQuote,
  };
}
