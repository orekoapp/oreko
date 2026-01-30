'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { TextBlock } from '@/lib/quotes/types';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';

interface TextBlockContentProps {
  block: TextBlock;
}

export function TextBlockContent({ block }: TextBlockContentProps) {
  const { updateBlock, selectedBlockId, previewMode } = useQuoteBuilderStore();
  const isEditing = selectedBlockId === block.id && !previewMode;
  const editorRef = useRef<HTMLDivElement>(null);

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  }[block.content.alignment];

  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (editorRef.current) {
      updateBlock(block.id, { html: editorRef.current.innerHTML });
    }
  };

  if (isEditing) {
    return (
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          'min-h-[1.5em] outline-none prose prose-sm max-w-none',
          alignmentClass
        )}
        onBlur={handleBlur}
        dangerouslySetInnerHTML={{ __html: block.content.html }}
      />
    );
  }

  return (
    <div
      className={cn('prose prose-sm max-w-none', alignmentClass)}
      dangerouslySetInnerHTML={{ __html: block.content.html }}
    />
  );
}
