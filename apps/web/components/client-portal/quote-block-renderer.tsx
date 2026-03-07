'use client';

import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import type { QuoteBlock } from '@/lib/quotes/types';
import type { PublicQuoteData } from '@/lib/quotes/portal-actions';

interface QuoteBlockRendererProps {
  block: QuoteBlock;
  quote: PublicQuoteData;
}

export function QuoteBlockRenderer({ block, quote }: QuoteBlockRendererProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.settings.currency,
    }).format(amount);
  };

  switch (block.type) {
    case 'header':
      return (
        <div
          className={cn(
            'py-2',
            block.content.alignment === 'center' && 'text-center',
            block.content.alignment === 'right' && 'text-right'
          )}
        >
          {block.content.level === 1 && (
            <h1 className="text-3xl font-bold">{block.content.text}</h1>
          )}
          {block.content.level === 2 && (
            <h2 className="text-2xl font-semibold">{block.content.text}</h2>
          )}
          {block.content.level === 3 && (
            <h3 className="text-xl font-medium">{block.content.text}</h3>
          )}
        </div>
      );

    case 'text':
      return (
        <div
          className={cn(
            'prose prose-sm max-w-none',
            block.content.alignment === 'center' && 'text-center',
            block.content.alignment === 'right' && 'text-right'
          )}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content.html || '') }}
        />
      );

    case 'service-item':
      return (
        <div className="flex items-start justify-between rounded-lg border p-4">
          <div className="flex-1">
            <p className="font-medium">{block.content.name}</p>
            {block.content.description && (
              <p className="text-sm text-muted-foreground">
                {block.content.description}
              </p>
            )}
          </div>
          {quote.settings.showLineItemPrices && (
            <div className="ml-4 text-right">
              <p className="text-sm text-muted-foreground">
                {block.content.quantity} x {formatCurrency(block.content.rate)}
              </p>
              <p className="font-semibold">
                {formatCurrency(block.content.quantity * block.content.rate)}
              </p>
            </div>
          )}
        </div>
      );

    case 'divider':
      return (
        <hr
          className={cn(
            'my-4',
            block.content.style === 'dashed' && 'border-dashed',
            block.content.style === 'dotted' && 'border-dotted'
          )}
        />
      );

    case 'spacer': {
      const spacerHeights = {
        sm: '16px',
        md: '32px',
        lg: '48px',
        xl: '64px',
      };
      return <div style={{ height: spacerHeights[block.content.height] }} />;
    }

    case 'image':
      if (!block.content.src) {
        return null;
      }
      return (
        <div
          className={cn(
            block.content.alignment === 'center' && 'flex justify-center',
            block.content.alignment === 'right' && 'flex justify-end'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.content.src}
            alt={block.content.alt || 'Quote image'}
            className="max-w-full rounded-lg"
            style={{
              width: block.content.width === 'full' ? '100%' : block.content.width,
            }}
          />
        </div>
      );

    case 'signature':
      // In the portal view, signature blocks are shown as placeholders
      // The actual signing happens in the accept dialog
      if (block.content.signatureData) {
        return (
          <div className="rounded-lg border bg-green-50 p-4">
            <p className="mb-2 text-sm font-medium text-green-800">Signed</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.content.signatureData}
              alt="Signature"
              className="max-h-16"
            />
            {block.content.signerName && (
              <p className="mt-2 text-sm text-green-700">
                {block.content.signerName}
              </p>
            )}
          </div>
        );
      }
      return (
        <div className="rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 p-6 text-center">
          <p className="font-medium text-primary">{block.content.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Signature required upon acceptance
          </p>
        </div>
      );

    default:
      return null;
  }
}
