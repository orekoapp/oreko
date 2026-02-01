'use client';

import { useDraggable } from '@dnd-kit/core';
import {
  Heading,
  Type,
  Package,
  FolderOpen,
  ImageIcon,
  Minus,
  MoveVertical,
  Columns,
  Table,
  PenTool,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BLOCK_TEMPLATES, type BlockType } from '@/lib/quotes/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';

const BLOCK_ICONS: Record<BlockType, React.ComponentType<{ className?: string }>> = {
  header: Heading,
  text: Type,
  'service-item': Package,
  'service-group': FolderOpen,
  image: ImageIcon,
  divider: Minus,
  spacer: MoveVertical,
  columns: Columns,
  table: Table,
  signature: PenTool,
};

const BLOCK_CATEGORIES = [
  {
    name: 'Content',
    types: ['header', 'text', 'image'] as BlockType[],
  },
  {
    name: 'Services',
    types: ['service-item', 'service-group'] as BlockType[],
  },
  {
    name: 'Layout',
    types: ['divider', 'spacer', 'columns', 'table'] as BlockType[],
  },
  {
    name: 'Interactive',
    types: ['signature'] as BlockType[],
  },
];

export function BlocksPanel() {
  const { toggleBlocksPanel } = useQuoteBuilderStore();

  return (
    <div className="absolute md:relative left-0 top-0 z-20 flex h-full w-64 flex-col border-r bg-card shadow-lg md:shadow-none">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="font-semibold">Blocks</h2>
          <p className="text-xs text-muted-foreground">Drag blocks to the canvas</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          onClick={toggleBlocksPanel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {BLOCK_CATEGORIES.map((category) => (
            <div key={category.name}>
              <h3 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                {category.name}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {category.types.map((type) => {
                  const template = BLOCK_TEMPLATES.find((t) => t.type === type);
                  if (!template) return null;
                  return (
                    <DraggableBlock key={type} type={type} template={template} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface DraggableBlockProps {
  type: BlockType;
  template: (typeof BLOCK_TEMPLATES)[number];
}

function DraggableBlock({ type, template }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template-${type}`,
    data: {
      type: 'template',
      blockType: type,
    },
  });

  const Icon = BLOCK_ICONS[type];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex cursor-grab flex-col items-center justify-center gap-1 rounded-lg border bg-background p-3 text-center transition-all hover:border-primary hover:shadow-sm active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-primary'
      )}
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-xs font-medium">{template.label}</span>
    </div>
  );
}
