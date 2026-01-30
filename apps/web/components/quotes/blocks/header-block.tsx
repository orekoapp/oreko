'use client';

import { cn } from '@/lib/utils';
import type { HeaderBlock } from '@/lib/quotes/types';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { Input } from '@/components/ui/input';

interface HeaderBlockContentProps {
  block: HeaderBlock;
}

export function HeaderBlockContent({ block }: HeaderBlockContentProps) {
  const { updateBlock, selectedBlockId, previewMode } = useQuoteBuilderStore();
  const isEditing = selectedBlockId === block.id && !previewMode;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(block.id, { text: e.target.value });
  };

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[block.content.alignment];

  const HeadingTag = `h${block.content.level}` as 'h1' | 'h2' | 'h3';

  const headingClasses = {
    1: 'text-3xl font-bold',
    2: 'text-2xl font-semibold',
    3: 'text-xl font-medium',
  }[block.content.level];

  if (isEditing) {
    return (
      <Input
        value={block.content.text}
        onChange={handleTextChange}
        className={cn(
          'border-none bg-transparent p-0 focus-visible:ring-0',
          headingClasses,
          alignmentClass
        )}
        placeholder="Enter heading text..."
      />
    );
  }

  return (
    <HeadingTag className={cn(headingClasses, alignmentClass)}>
      {block.content.text || 'Section Title'}
    </HeadingTag>
  );
}
