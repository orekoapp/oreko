'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, ChevronDown, ChevronRight, Package } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { createBlock } from '@/lib/quotes/types';
import { formatCurrency } from '@/lib/utils';
import { getRateCardsForSelection } from '@/lib/rate-cards/actions';
import type { RateCardSelection } from '@/lib/rate-cards/types';

const PRICING_TYPE_LABELS: Record<string, string> = {
  fixed: 'Fixed',
  hourly: '/hr',
  daily: '/day',
  weekly: '/wk',
  monthly: '/mo',
  per_unit: '/unit',
};

export function RateCardPanel() {
  const [rateCards, setRateCards] = useState<RateCardSelection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { addBlock } = useQuoteBuilderStore();

  useEffect(() => {
    async function fetchRateCards() {
      try {
        const result = await getRateCardsForSelection();
        setRateCards(result);
        // Expand all categories by default
        const categories = new Set(
          result.map((rc) => rc.categoryId || 'uncategorized')
        );
        setExpandedCategories(categories);
      } catch (error) {
        console.error('Failed to fetch rate cards:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRateCards();
  }, []);

  // Filter and group rate cards
  const groupedRateCards = (() => {
    const filtered = search
      ? rateCards.filter(
          (rc) =>
            rc.name.toLowerCase().includes(search.toLowerCase()) ||
            rc.description?.toLowerCase().includes(search.toLowerCase())
        )
      : rateCards;

    const groups = new Map<string, RateCardSelection[]>();

    filtered.forEach((rc) => {
      const key = rc.categoryId || 'uncategorized';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(rc);
    });

    return Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === 'uncategorized') return 1;
      if (b[0] === 'uncategorized') return -1;
      const aName = a[1][0]?.categoryName || '';
      const bName = b[1][0]?.categoryName || '';
      return aName.localeCompare(bName);
    });
  })();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleAddRateCard = (rateCard: RateCardSelection) => {
    const block = createBlock('service-item', {
      name: rateCard.name,
      description: rateCard.description || '',
      quantity: 1,
      rate: rateCard.rate,
      unit: rateCard.pricingType === 'hourly' ? 'hour' : 'unit',
      taxRate: null,
      rateCardId: rateCard.id,
    });
    addBlock(block);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-64 flex-col border-r bg-card">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Rate Cards</h2>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div data-testid="rate-card-panel" className="flex h-full w-64 flex-col border-r bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold">Rate Cards</h2>
        <p className="text-xs text-muted-foreground">Click or drag to add</p>
      </div>

      {/* Search */}
      <div className="border-b p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {groupedRateCards.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No rate cards found' : 'No rate cards available'}
            </p>
          ) : (
            groupedRateCards.map(([categoryId, items]) => {
              const isExpanded = expandedCategories.has(categoryId);
              const categoryName = items[0]?.categoryName || 'Uncategorized';
              const categoryColor = items[0]?.categoryColor;

              return (
                <div key={categoryId}>
                  {/* Category Header */}
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                    onClick={() => toggleCategory(categoryId)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    {categoryColor && (
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: categoryColor }}
                      />
                    )}
                    <span className="font-medium">{categoryName}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {items.length}
                    </span>
                  </button>

                  {/* Rate Card Items */}
                  {isExpanded && (
                    <div className="ml-2 mt-1 space-y-1">
                      {items.map((rateCard) => (
                        <DraggableRateCard
                          key={rateCard.id}
                          rateCard={rateCard}
                          onAdd={() => handleAddRateCard(rateCard)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface DraggableRateCardProps {
  rateCard: RateCardSelection;
  onAdd: () => void;
}

function DraggableRateCard({ rateCard, onAdd }: DraggableRateCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `ratecard-${rateCard.id}`,
    data: {
      type: 'ratecard',
      rateCard,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid="rate-card-item"
      className={cn(
        'group flex cursor-grab items-center justify-between rounded-md border bg-background p-2 text-sm transition-all hover:border-primary hover:shadow-sm active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-primary'
      )}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Package className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <span className="truncate font-medium">{rateCard.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold text-muted-foreground">
          {formatCurrency(rateCard.rate)}
          {PRICING_TYPE_LABELS[rateCard.pricingType] || ''}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
