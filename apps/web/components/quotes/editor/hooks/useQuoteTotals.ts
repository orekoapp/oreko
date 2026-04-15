'use client';

import { useMemo } from 'react';
import type { QuoteBlock, ServiceItemBlock } from '@/lib/quotes/types';

// Legacy editor hook. The visual builder store handles tax via recalculateTotals().
// This hook is used by the legacy QuoteEditor form view.
// Bug #72 fix: Now uses per-item taxRate when available, falling back to global taxRate.
export function useQuoteTotals(blocks: QuoteBlock[] | undefined, taxRate: string) {
  const serviceItems = useMemo(() => {
    return (blocks || []).filter(
      (b): b is ServiceItemBlock => b.type === 'service-item'
    );
  }, [blocks]);

  const subtotal = useMemo(() => {
    return Math.round(serviceItems.reduce(
      (sum, item) => sum + Math.round(item.content.quantity * item.content.rate * 100) / 100,
      0
    ) * 100) / 100;
  }, [serviceItems]);

  const globalTaxRate = parseFloat(taxRate) || 0;

  const taxAmount = useMemo(() => {
    return Math.round(serviceItems.reduce((sum, item) => {
      const lineTotal = Math.round(item.content.quantity * item.content.rate * 100) / 100;
      const itemTaxRate = item.content.taxRate != null ? item.content.taxRate : globalTaxRate;
      return sum + lineTotal * (itemTaxRate / 100);
    }, 0) * 100) / 100;
  }, [serviceItems, globalTaxRate]);

  const total = subtotal + taxAmount;

  return {
    serviceItems,
    subtotal,
    taxAmount,
    total,
  };
}
