'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { getClientById } from '@/lib/clients/actions';

export interface ClientInfo {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

export function useQuoteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');

  const {
    document,
    isDirty,
    isSaving,
    initDocument,
    updateTitle,
    updateProjectId,
    updateNotes,
    updateTerms,
    updateInternalNotes,
    addBlock,
    updateBlock,
    removeBlock,
  } = useQuoteBuilderStore();

  const [client, setClient] = useState<ClientInfo | null>(null);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [expirationDays, setExpirationDays] = useState('30');
  const [taxRate, setTaxRate] = useState('0');

  // Bug #79: Track initialization to prevent re-init loops
  const hasInitializedRef = useRef(false);

  // Initialize document if not exists or has empty ID (from resetDocument())
  useEffect(() => {
    if (hasInitializedRef.current && document?.id) return;
    if (!document || !document.id) {
      const now = new Date().toISOString();
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);

      initDocument({
        id: `temp-${Date.now()}`,
        workspaceId: 'default',
        clientId: clientId || '',
        projectId: null,
        quoteNumber: 'DRAFT',
        status: 'draft',
        title: 'New Quote',
        issueDate: now,
        expirationDate: expDate.toISOString(),
        blocks: [],
        settings: {
          requireSignature: true,
          autoConvertToInvoice: false,
          depositRequired: false,
          depositType: 'percentage',
          depositValue: 50,
          showLineItemPrices: true,
          allowPartialAcceptance: false,
          currency: 'USD',
          taxInclusive: false,
        },
        totals: {
          subtotal: 0,
          discountType: null,
          discountValue: null,
          discountAmount: 0,
          taxTotal: 0,
          total: 0,
        },
        notes: '',
        terms: '',
        internalNotes: '',
      });
      hasInitializedRef.current = true;
    }
  }, [document, initDocument, clientId]);

  // Load client info
  useEffect(() => {
    if (clientId) {
      getClientById(clientId)
        .then((result) => {
          if (result) {
            setClient({
              id: result.id,
              name: result.name,
              email: result.email,
              company: result.company,
            });
          }
        })
        .catch(() => toast.error('Failed to load client details'));
    }
  }, [clientId]);

  // Sync form state with document
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setProjectId(document.projectId);
    }
  }, [document]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateTitle(newTitle);
  };

  const handleProjectChange = (newProjectId: string | null) => {
    setProjectId(newProjectId);
    updateProjectId(newProjectId);
  };

  const handleClientChange = useCallback((newClient: ClientInfo | null) => {
    setClient(newClient);
    if (newClient) {
      const url = new URL(window.location.href);
      url.searchParams.set('clientId', newClient.id);
      router.replace(url.pathname + url.search);
    }
  }, [router]);

  return {
    document,
    isDirty,
    isSaving,
    client,
    title,
    projectId,
    expirationDays,
    taxRate,
    setExpirationDays,
    setTaxRate,
    handleTitleChange,
    handleProjectChange,
    handleClientChange,
    updateNotes,
    updateTerms,
    updateInternalNotes,
    addBlock,
    updateBlock,
    removeBlock,
  };
}
