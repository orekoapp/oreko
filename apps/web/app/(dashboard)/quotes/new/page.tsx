'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';

export default function NewQuotePage() {
  const router = useRouter();
  const { resetDocument, document } = useQuoteBuilderStore();

  useEffect(() => {
    // Reset the document store with a new empty document
    resetDocument();
  }, [resetDocument]);

  useEffect(() => {
    // Once document is initialized, redirect to the builder
    if (document) {
      // For now, use a temp ID. In production, this would be created via server action
      router.replace(`/quotes/new/builder`);
    }
  }, [document, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Creating new quote...</p>
      </div>
    </div>
  );
}
