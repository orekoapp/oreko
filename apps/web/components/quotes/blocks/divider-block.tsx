'use client';

import { cn } from '@/lib/utils';
import type { DividerBlock } from '@/lib/quotes/types';

interface DividerBlockContentProps {
  block: DividerBlock;
}

export function DividerBlockContent({ block }: DividerBlockContentProps) {
  const thicknessClass = {
    1: 'border-t',
    2: 'border-t-2',
    3: 'border-t-4',
  }[block.content.thickness];

  const styleClass = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  }[block.content.style];

  return (
    <hr
      className={cn('my-2', thicknessClass, styleClass)}
      style={{ borderColor: block.content.color }}
    />
  );
}
