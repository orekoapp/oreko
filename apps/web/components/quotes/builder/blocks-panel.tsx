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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BLOCK_TEMPLATES, type BlockType } from '@/lib/quotes/types';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold">Blocks</h2>
        <p className="text-xs text-muted-foreground">Drag blocks to the canvas</p>
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
