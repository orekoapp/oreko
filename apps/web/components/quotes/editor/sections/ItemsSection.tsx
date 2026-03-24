'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { formatCurrency } from '@/lib/utils';
import type { QuoteBlock, ServiceItemBlock } from '@/lib/quotes/types';
import { createBlock } from '@/lib/quotes/types';

// ─── Saved Line Items (from templates/invoice-items) ─────
const savedLineItems = [
  { id: '1', name: 'Project Fee', description: 'Flat project fee for deliverables', price: 0 },
  { id: '2', name: 'Web Design & Development', description: 'Full website design and development services', price: 150 },
  { id: '3', name: 'Virtual Assistant Services', description: 'Remote administrative and support tasks', price: 0 },
  { id: '4', name: 'Travel Fees', description: 'Travel and transportation costs', price: 300 },
  { id: '5', name: 'Studio/Office Space Rental', description: 'Hourly rental of studio or office space', price: 100 },
  { id: '6', name: 'Studio Time', description: 'Professional studio session time', price: 400 },
  { id: '7', name: 'Software Development', description: 'Custom software and application development', price: 0 },
  { id: '8', name: 'Social Media Management', description: 'Social media strategy and content management', price: 75 },
  { id: '9', name: 'Search Engine Optimization (SEO)', description: 'SEO audits, keyword research, and optimization', price: 0 },
  { id: '10', name: 'Consulting/Coaching Session', description: 'One-on-one consulting or coaching session', price: 50 },
  { id: '11', name: 'Production Time', description: 'Video, audio, or content production time', price: 1000 },
  { id: '12', name: 'Processing Fee', description: 'Administrative processing and handling fee', price: 15 },
  { id: '13', name: 'Brand Strategy Session', description: 'Brand positioning, messaging, and identity planning', price: 250 },
  { id: '14', name: 'Photography', description: 'Professional photography services', price: 200 },
  { id: '15', name: 'Content Writing', description: 'Blog posts, articles, and website copy', price: 85 },
];

interface ItemsSectionProps {
  blocks: QuoteBlock[];
  onAddBlock: (block: QuoteBlock, index?: number) => void;
  onUpdateBlock: (blockId: string, content: Partial<QuoteBlock['content']>) => void;
  onRemoveBlock: (blockId: string) => void;
  currency?: string;
}

export function ItemsSection({
  blocks,
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
  currency = 'USD',
}: ItemsSectionProps) {
  const [addItemOpen, setAddItemOpen] = useState(false);

  // Filter to only service items
  const serviceItems = blocks.filter(
    (b): b is ServiceItemBlock => b.type === 'service-item'
  );

  const handleAddItem = () => {
    const newBlock = createBlock('service-item');
    onAddBlock(newBlock);
  };

  const handleAddSavedItem = (saved: typeof savedLineItems[number]) => {
    const newBlock = createBlock<ServiceItemBlock>('service-item', {
      name: saved.name,
      description: saved.description,
      rate: saved.price,
      quantity: 1,
    });
    onAddBlock(newBlock);
    setAddItemOpen(false);
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
        <CardTitle className="text-base">Line Items</CardTitle>
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
            serviceItems.map((item) => (
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
                  {formatCurrency(item.content.quantity * item.content.rate, currency)}
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

          {/* Add Items Dropdown */}
          <Popover open={addItemOpen} onOpenChange={setAddItemOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
                <ChevronDown className="ml-2 h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0"
              align="start"
              style={{ width: 'var(--radix-popover-trigger-width)' }}
            >
              <Command>
                <CommandInput placeholder="Search saved items..." />
                <CommandList className="max-h-[280px]">
                  <CommandEmpty>No items found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        handleAddItem();
                        setAddItemOpen(false);
                      }}
                      className="py-2.5"
                    >
                      <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Blank Item</span>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Saved Items">
                    {savedLineItems.map((saved) => (
                      <CommandItem
                        key={saved.id}
                        value={saved.name}
                        onSelect={() => handleAddSavedItem(saved)}
                        className="py-2.5"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{saved.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{saved.description}</p>
                        </div>
                        {saved.price > 0 && (
                          <span className="ml-3 shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                            ${saved.price.toFixed(2)}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
