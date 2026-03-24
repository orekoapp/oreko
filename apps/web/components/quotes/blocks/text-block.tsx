'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
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

  // Bug #51: Include block.content.html in deps to avoid stale closure in contentEditable
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isEditing, block.content.html]);

  const handleBlur = () => {
    if (editorRef.current) {
      // Sanitize user input before storing
      updateBlock(block.id, { html: sanitizeHtml(editorRef.current.innerHTML) });
    }
  };

  // Sanitize HTML content using DOMPurify to prevent XSS
  const safeHtml = sanitizeHtml(block.content.html || '');

  // Set initial content via ref to avoid controlled/uncontrolled conflict with contentEditable
  const initializedRef = useRef(false);
  useEffect(() => {
    if (isEditing && editorRef.current && !initializedRef.current) {
      editorRef.current.innerHTML = safeHtml;
      initializedRef.current = true;
    }
    if (!isEditing) {
      initializedRef.current = false;
    }
  }, [isEditing, safeHtml]);

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
      />
    );
  }

  return (
    <div
      className={cn('prose prose-sm max-w-none', alignmentClass)}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
