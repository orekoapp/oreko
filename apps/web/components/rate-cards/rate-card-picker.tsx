'use client';

import * as React from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/utils';
import type { RateCardSelection } from '@/lib/rate-cards/types';

interface RateCardPickerProps {
  rateCards: RateCardSelection[];
  selectedIds?: string[];
  onSelect: (rateCard: RateCardSelection) => void;
  trigger?: React.ReactNode;
}

const PRICING_TYPE_LABELS: Record<string, string> = {
  fixed: 'Fixed',
  hourly: '/hr',
  daily: '/day',
  weekly: '/wk',
  monthly: '/mo',
  per_unit: '/unit',
};

export function RateCardPicker({
  rateCards,
  selectedIds = [],
  onSelect,
  trigger,
}: RateCardPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Group rate cards by category
  const groupedRateCards = React.useMemo(() => {
    const filtered = search
      ? rateCards.filter(
          (rc) =>
            rc.name.toLowerCase().includes(search.toLowerCase()) ||
            rc.description?.toLowerCase().includes(search.toLowerCase())
        )
      : rateCards;

    const groups: Map<string | null, RateCardSelection[]> = new Map();

    filtered.forEach((rc) => {
      const key = rc.categoryId;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(rc);
    });

    // Sort groups: categories first (alphabetically), then uncategorized
    return Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === null) return 1;
      if (b[0] === null) return -1;
      const aName = a[1][0]?.categoryName || '';
      const bName = b[1][0]?.categoryName || '';
      return aName.localeCompare(bName);
    });
  }, [rateCards, search]);

  const handleSelect = (rateCard: RateCardSelection) => {
    onSelect(rateCard);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add from Rate Card
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Rate Card</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rate cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Rate Card List */}
          <ScrollArea className="h-[400px] pr-4">
            {groupedRateCards.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                {search ? 'No rate cards found' : 'No rate cards available'}
              </p>
            ) : (
              <div className="space-y-6">
                {groupedRateCards.map(([categoryId, items]) => (
                  <div key={categoryId || 'uncategorized'}>
                    {/* Category Header */}
                    <div className="mb-2 flex items-center gap-2">
                      {items[0]?.categoryColor && (
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: items[0].categoryColor }}
                        />
                      )}
                      <span className="text-sm font-medium text-muted-foreground">
                        {items[0]?.categoryName || 'Uncategorized'}
                      </span>
                    </div>

                    {/* Rate Cards */}
                    <div className="space-y-2">
                      {items.map((rateCard) => {
                        const isSelected = selectedIds.includes(rateCard.id);
                        return (
                          <button
                            key={rateCard.id}
                            type="button"
                            className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                              isSelected ? 'border-primary bg-primary/5' : ''
                            }`}
                            onClick={() => handleSelect(rateCard)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{rateCard.name}</span>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              {rateCard.description && (
                                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                  {rateCard.description}
                                </p>
                              )}
                            </div>
                            <div className="ml-4 text-right">
                              <span className="font-semibold">
                                {formatCurrency(rateCard.rate)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {PRICING_TYPE_LABELS[rateCard.pricingType] || ''}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
