'use client';

import { useMemo } from 'react';
import type { QuoteBlock, ServiceItemBlock } from '@/lib/quotes/types';

export function useQuoteTotals(blocks: QuoteBlock[] | undefined, taxRate: string) {
  const serviceItems = useMemo(() => {
    return (blocks || []).filter(
      (b): b is ServiceItemBlock => b.type === 'service-item'
    );
  }, [blocks]);

  const subtotal = useMemo(() => {
    return serviceItems.reduce(
      (sum, item) => sum + item.content.quantity * item.content.rate,
      0
    );
  }, [serviceItems]);

  const taxAmount = subtotal * (parseFloat(taxRate) / 100);
  const total = subtotal + taxAmount;

  return {
    serviceItems,
    subtotal,
    taxAmount,
    total,
  };
}
