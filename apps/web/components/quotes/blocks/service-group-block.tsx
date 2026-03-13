'use client';

import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceGroupBlock, ServiceItemBlock } from '@/lib/quotes/types';
import { createBlock } from '@/lib/quotes/types';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ServiceItemBlockContent } from './service-item-block';

interface ServiceGroupBlockContentProps {
  block: ServiceGroupBlock;
}

export function ServiceGroupBlockContent({ block }: ServiceGroupBlockContentProps) {
  const { updateBlock, selectedBlockId, previewMode, document } = useQuoteBuilderStore();
  const isEditing = selectedBlockId === block.id && !previewMode;
  const showPrices = document?.settings.showLineItemPrices ?? true;
  const currency = document?.settings.currency ?? 'USD';

  const groupTotal = block.content.items.reduce(
    (sum, item) => sum + item.content.quantity * item.content.rate,
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleChange = (field: keyof typeof block.content, value: string | boolean) => {
    updateBlock(block.id, { [field]: value });
  };

  const handleToggleCollapse = () => {
    updateBlock(block.id, { collapsed: !block.content.collapsed });
  };

  const handleAddItem = () => {
    const newItem = createBlock<ServiceItemBlock>('service-item', {
      name: 'New Service',
      description: '',
      quantity: 1,
      rate: 0,
      unit: 'unit',
      taxRate: null,
      rateCardId: null,
    });
    updateBlock(block.id, { items: [...block.content.items, newItem] });
  };

  const handleUpdateItem = (itemIndex: number, content: Partial<ServiceItemBlock['content']>) => {
    const updatedItems = block.content.items.map((item, idx) =>
      idx === itemIndex
        ? { ...item, content: { ...item.content, ...content }, updatedAt: new Date().toISOString() }
        : item
    );
    updateBlock(block.id, { items: updatedItems });
  };

  const handleRemoveItem = (itemIndex: number) => {
    const updatedItems = block.content.items.filter((_, idx) => idx !== itemIndex);
    updateBlock(block.id, { items: updatedItems });
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border border-border bg-card text-card-foreground">
        <div className="flex items-center gap-3 border-b p-4">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleToggleCollapse}>
            {block.content.collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <div className="flex-1">
            <Input
              value={block.content.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Group title"
              className="font-medium text-foreground"
            />
          </div>
          {showPrices && (
            <div className="text-right font-semibold">{formatCurrency(groupTotal)}</div>
          )}
        </div>

        {!block.content.collapsed && (
          <div className="space-y-3 p-4">
            <Input
              value={block.content.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Group description (optional)"
              className="text-sm text-foreground"
            />

            <div className="space-y-2">
              {block.content.items.map((item, index) => (
                <div key={item.id} className="relative group">
                  <ServiceItemBlockContent block={item} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -right-2 -top-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => handleRemoveItem(index)}
                  >
                    &times;
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={handleAddItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Item to Group
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={handleToggleCollapse}
      >
        {block.content.collapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
        <div className="flex-1">
          <h4 className="font-medium">{block.content.title || 'Untitled Group'}</h4>
          {block.content.description && (
            <p className="mt-1 text-sm text-muted-foreground">{block.content.description}</p>
          )}
        </div>
        {showPrices && (
          <div className="text-right">
            <span className="text-sm text-muted-foreground">{block.content.items.length} items</span>
            <div className="font-semibold">{formatCurrency(groupTotal)}</div>
          </div>
        )}
      </div>

      {!block.content.collapsed && block.content.items.length > 0 && (
        <div className="border-t p-4 space-y-2">
          {block.content.items.map((item) => (
            <ServiceItemBlockContent key={item.id} block={item} />
          ))}
        </div>
      )}
    </div>
  );
}
