'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import type { QuoteBlock } from '@/lib/quotes/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Block-specific renderers
import {
  HeaderBlockContent,
  TextBlockContent,
  ServiceItemBlockContent,
  DividerBlockContent,
  SpacerBlockContent,
  ImageBlockContent,
  SignatureBlockContent,
} from '../blocks';

interface BlockRendererProps {
  block: QuoteBlock;
  index: number;
  isSelected: boolean;
  isPreview: boolean;
}

export function BlockRenderer({ block, index, isSelected, isPreview }: BlockRendererProps) {
  const { selectBlock, removeBlock, duplicateBlock, setHoveredBlock } =
    useQuoteBuilderStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    disabled: isPreview,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreview) {
      selectBlock(block.id);
    }
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'header':
        return <HeaderBlockContent block={block} />;
      case 'text':
        return <TextBlockContent block={block} />;
      case 'service-item':
        return <ServiceItemBlockContent block={block} />;
      case 'divider':
        return <DividerBlockContent block={block} />;
      case 'spacer':
        return <SpacerBlockContent block={block} />;
      case 'image':
        return <ImageBlockContent block={block} />;
      case 'signature':
        return <SignatureBlockContent block={block} />;
      default:
        return (
          <div className="rounded bg-muted p-4 text-center text-sm text-muted-foreground">
            Unknown block type: {block.type}
          </div>
        );
    }
  };

  if (isPreview) {
    return <div className="relative">{renderBlockContent()}</div>;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={block.type === 'service-item' ? 'quote-line-item' : undefined}
      className={cn(
        'group relative rounded-lg transition-all',
        isDragging && 'z-50 opacity-50',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        !isSelected && 'hover:ring-1 hover:ring-muted-foreground/20'
      )}
      onClick={handleClick}
      onMouseEnter={() => setHoveredBlock(block.id)}
      onMouseLeave={() => setHoveredBlock(null)}
    >
      {/* Block Toolbar */}
      <div
        className={cn(
          'absolute -left-10 top-0 flex flex-col gap-1 opacity-0 transition-opacity',
          (isSelected || isDragging) && 'opacity-100',
          'group-hover:opacity-100'
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Block Actions */}
      <div
        className={cn(
          'absolute -right-10 top-0 flex flex-col gap-1 opacity-0 transition-opacity',
          isSelected && 'opacity-100',
          'group-hover:opacity-100'
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => duplicateBlock(block.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => removeBlock(block.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Block Content */}
      <div className="relative">{renderBlockContent()}</div>
    </div>
  );
}
