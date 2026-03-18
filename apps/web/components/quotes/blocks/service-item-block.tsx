'use client';

import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ServiceItemBlock } from '@/lib/quotes/types';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { Input } from '@/components/ui/input';

interface ServiceItemBlockContentProps {
  block: ServiceItemBlock;
}

export function ServiceItemBlockContent({ block }: ServiceItemBlockContentProps) {
  const { updateBlock, selectedBlockId, previewMode, document } = useQuoteBuilderStore();
  const isEditing = selectedBlockId === block.id && !previewMode;
  const showPrices = document?.settings.showLineItemPrices ?? true;
  const currency = document?.settings.currency ?? 'USD';

  const lineTotal = block.content.quantity * block.content.rate;

  // Bug #81: Use document locale instead of hardcoded en-US
  const locale = document?.settings.locale ?? 'en-US';
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Bug #74: Debounce updateBlock calls to avoid excessive store updates
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleChange = useCallback((field: keyof typeof block.content, value: string | number | null) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateBlock(block.id, { [field]: value });
    }, 300);
  }, [block.id, updateBlock]);

  if (isEditing) {
    return (
      <div className="rounded-lg border border-border bg-card text-card-foreground p-4 space-y-3">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground">Service Name</label>
            <Input
              value={block.content.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Service name"
              className="mt-1 text-foreground"
            />
          </div>
          <div className="w-24">
            <label className="text-xs font-medium text-muted-foreground">Quantity</label>
            <Input
              type="number"
              value={block.content.quantity}
              onChange={(e) => handleChange('quantity', Math.max(1, parseFloat(e.target.value) || 1))}
              min={1}
              step="0.01"
              className="mt-1 text-foreground"
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-medium text-muted-foreground">Rate</label>
            <Input
              type="number"
              value={block.content.rate}
              onChange={(e) => handleChange('rate', parseFloat(e.target.value) || 0)}
              min={0}
              step="0.01"
              className="mt-1 text-foreground"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
            <Input
              value={block.content.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add a description..."
              className="mt-1 text-foreground"
            />
          </div>
          <div className="w-24">
            <label className="text-xs font-medium text-muted-foreground">Tax %</label>
            <Input
              type="number"
              value={block.content.taxRate ?? ''}
              onChange={(e) => handleChange('taxRate', e.target.value === '' ? null : parseFloat(e.target.value))}
              placeholder="0"
              min={0}
              max={100}
              step="0.01"
              className="mt-1 text-foreground"
            />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">
            {block.content.quantity} {block.content.unit} x {formatCurrency(block.content.rate)}
            {block.content.taxRate ? ` + ${block.content.taxRate}% tax` : ''}
          </span>
          <span className="font-semibold">{formatCurrency(lineTotal)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-medium">{block.content.name || 'Untitled Service'}</h4>
          {block.content.description && (
            <p className="mt-1 text-sm text-muted-foreground">{block.content.description}</p>
          )}
        </div>
        {showPrices && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {block.content.quantity} {block.content.unit} x {formatCurrency(block.content.rate)}
            </div>
            <div className="font-semibold">{formatCurrency(lineTotal)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
