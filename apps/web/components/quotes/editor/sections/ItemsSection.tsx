'use client';

import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import type { QuoteBlock, ServiceItemBlock } from '@/lib/quotes/types';
import { createBlock } from '@/lib/quotes/types';
import Link from 'next/link';

interface ItemsSectionProps {
  blocks: QuoteBlock[];
  onAddBlock: (block: QuoteBlock, index?: number) => void;
  onUpdateBlock: (blockId: string, content: Partial<QuoteBlock['content']>) => void;
  onRemoveBlock: (blockId: string) => void;
}

export function ItemsSection({
  blocks,
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
}: ItemsSectionProps) {
  // Filter to only service items
  const serviceItems = blocks.filter(
    (b): b is ServiceItemBlock => b.type === 'service-item'
  );

  const handleAddItem = () => {
    const newBlock = createBlock('service-item');
    onAddBlock(newBlock);
  };

  const handleUpdateItem = (
    blockId: string,
    field: keyof ServiceItemBlock['content'],
    value: string | number
  ) => {
    onUpdateBlock(blockId, { [field]: value });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Line Items</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/rate-cards">
              Import from Rate Cards
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
            <div className="col-span-1"></div>
            <div className="col-span-4">ITEM</div>
            <div className="col-span-2 text-right">RATE</div>
            <div className="col-span-2 text-right">QTY</div>
            <div className="col-span-2 text-right">AMOUNT</div>
            <div className="col-span-1"></div>
          </div>

          <Separator />

          {/* Items */}
          {serviceItems.length > 0 ? (
            serviceItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-start group">
                <div className="col-span-1 flex items-center justify-center pt-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                </div>
                <div className="col-span-4">
                  <Input
                    placeholder="Item name"
                    value={item.content.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Description (optional)"
                    className="mt-1 text-sm"
                    value={item.content.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="text-right"
                    value={item.content.rate || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    className="text-right"
                    value={item.content.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-2 text-right py-2 font-medium">
                  {formatCurrency(item.content.quantity * item.content.rate)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => onRemoveBlock(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items added yet</p>
              <p className="text-sm">Click the button below to add your first item</p>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={handleAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
