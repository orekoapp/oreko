'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Loader2, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import type { QuoteBlock, ServiceItemBlock } from '@/lib/quotes/types';
import { createBlock } from '@/lib/quotes/types';
import { getRateCardsForSelection } from '@/lib/rate-cards/actions';
import type { RateCardSelection } from '@/lib/rate-cards/types';

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

  const [rateCardDialogOpen, setRateCardDialogOpen] = useState(false);
  const [rateCards, setRateCards] = useState<RateCardSelection[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rateCardDialogOpen) {
      setLoading(true);
      setError(null);
      setSelectedIds(new Set());
      getRateCardsForSelection()
        .then((data) => {
          setRateCards(data);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load rate cards');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [rateCardDialogOpen]);

  const handleToggleRateCard = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedIds.size === rateCards.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rateCards.map((rc) => rc.id)));
    }
  };

  const handleImportSelected = () => {
    for (const id of selectedIds) {
      const rc = rateCards.find((r) => r.id === id);
      if (!rc) continue;

      const block = createBlock<ServiceItemBlock>('service-item', {
        name: rc.name,
        description: rc.description || '',
        rate: rc.rate,
        quantity: 1,
        unit: rc.unit || 'unit',
        rateCardId: rc.id,
      });
      onAddBlock(block);
    }
    setRateCardDialogOpen(false);
  };

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

  // Group rate cards by category for display
  const groupedRateCards = rateCards.reduce<
    Array<{ categoryName: string | null; categoryColor: string | null; items: RateCardSelection[] }>
  >((groups, rc) => {
    const existing = groups.find((g) => g.categoryName === rc.categoryName);
    if (existing) {
      existing.items.push(rc);
    } else {
      groups.push({
        categoryName: rc.categoryName,
        categoryColor: rc.categoryColor,
        items: [rc],
      });
    }
    return groups;
  }, []);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Line Items</CardTitle>
          <Dialog open={rateCardDialogOpen} onOpenChange={setRateCardDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Import from Rate Cards
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Import from Rate Cards</DialogTitle>
                <DialogDescription>
                  Select rate cards to add as line items to your quote.
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto min-h-0 py-2">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading rate cards...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-destructive">
                    <p>{error}</p>
                  </div>
                ) : rateCards.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileSpreadsheet className="mx-auto h-10 w-10 mb-3 opacity-50" />
                    <p className="font-medium">No rate cards found</p>
                    <p className="text-sm mt-1">
                      Create rate cards in Settings &rarr; Rate Cards.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Select all */}
                    <div className="flex items-center gap-2 px-1">
                      <Checkbox
                        id="select-all-rate-cards"
                        checked={selectedIds.size === rateCards.length && rateCards.length > 0}
                        onCheckedChange={handleToggleAll}
                      />
                      <label
                        htmlFor="select-all-rate-cards"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Select all ({rateCards.length})
                      </label>
                    </div>

                    <Separator />

                    {/* Grouped rate cards */}
                    {groupedRateCards.map((group) => (
                      <div key={group.categoryName || '__uncategorized'}>
                        {group.categoryName && (
                          <div className="flex items-center gap-2 mb-2 px-1">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: group.categoryColor || '#6b7280' }}
                            />
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {group.categoryName}
                            </span>
                          </div>
                        )}
                        <div className="space-y-1">
                          {group.items.map((rc) => (
                            <label
                              key={rc.id}
                              className="flex items-start gap-3 rounded-md border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                            >
                              <Checkbox
                                checked={selectedIds.has(rc.id)}
                                onCheckedChange={() => handleToggleRateCard(rc.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm truncate">{rc.name}</span>
                                  <span className="text-sm font-semibold whitespace-nowrap">
                                    {formatCurrency(rc.rate)}
                                    {rc.unit ? `/${rc.unit}` : ''}
                                  </span>
                                </div>
                                {rc.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                    {rc.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {rc.pricingType}
                                  </Badge>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setRateCardDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportSelected}
                  disabled={selectedIds.size === 0}
                >
                  Add Selected ({selectedIds.size})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
