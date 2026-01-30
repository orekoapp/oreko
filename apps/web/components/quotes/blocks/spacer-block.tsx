'use client';

import { cn } from '@/lib/utils';
import type { SpacerBlock } from '@/lib/quotes/types';

interface SpacerBlockContentProps {
  block: SpacerBlock;
}

export function SpacerBlockContent({ block }: SpacerBlockContentProps) {
  const heightClass = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-16',
    xl: 'h-24',
  }[block.content.height];

  return (
    <div
      className={cn(
        heightClass,
        'group-hover:bg-muted/30 rounded transition-colors'
      )}
    />
  );
}
