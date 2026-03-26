'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImageBlock } from '@/lib/quotes/types';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageBlockContentProps {
  block: ImageBlock;
}

export function ImageBlockContent({ block }: ImageBlockContentProps) {
  const { updateBlock, selectedBlockId, previewMode } = useQuoteBuilderStore();
  const isEditing = selectedBlockId === block.id && !previewMode;
  const [urlInput, setUrlInput] = useState(block.content.src);

  // Bug #52: Sync urlInput when block.content.src changes from outside
  useEffect(() => {
    setUrlInput(block.content.src);
  }, [block.content.src]);

  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[block.content.alignment];

  const handleUrlSubmit = () => {
    // Bug #65: Validate URL to prevent javascript: protocol injection
    const trimmedUrl = urlInput.trim();
    if (trimmedUrl && !trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('data:image/')) {
      return; // Reject invalid URLs silently
    }
    // Bug #62: Block SVG data URIs to prevent XSS (SVG can contain JavaScript)
    if (trimmedUrl.toLowerCase().startsWith('data:image/svg')) {
      return; // Reject SVG data URIs silently
    }
    updateBlock(block.id, { src: trimmedUrl });
  };

  const widthStyle =
    block.content.width === 'full'
      ? { width: '100%' }
      : { width: `${block.content.width}px`, maxWidth: '100%' };

  if (!block.content.src) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 p-8',
          isEditing && 'border-primary'
        )}
      >
        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
        {isEditing ? (
          <div className="w-full max-w-md space-y-2">
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter image URL..."
                className="flex-1"
              />
              <Button onClick={handleUrlSubmit} size="sm">
                Add
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              or drag and drop an image here
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Click to add an image</p>
        )}
      </div>
    );
  }

  // Bug #122: Validate image src protocol at render time
  const isAllowedSrc = (src: string) => {
    const s = src.trim().toLowerCase();
    if (s.startsWith('http://') || s.startsWith('https://')) return true;
    if (s.startsWith('data:image/') && !s.startsWith('data:image/svg')) return true;
    return false;
  };

  if (!isAllowedSrc(block.content.src)) {
    return null;
  }

  return (
    <div className={cn('flex', alignmentClass)}>
      <figure style={widthStyle}>
        <div className="relative overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.content.src}
            alt={block.content.alt || 'Quote image'}
            className="w-full h-auto object-cover"
          />
        </div>
        {block.content.caption && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {block.content.caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
}
