/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { QuoteBlock } from '@/lib/quotes/types';
import type { PublicQuoteData } from '@/lib/quotes/portal-actions';

interface QuoteBlockRendererProps {
  block: QuoteBlock;
  quote: PublicQuoteData;
}

export function QuoteBlockRenderer({ block: rawBlock, quote }: QuoteBlockRendererProps) {
  const block = { ...rawBlock, content: rawBlock.content as any };
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
            'prose prose-sm max-w-none dark:prose-invert',
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

    case 'service-group':
      return (
        <div className="space-y-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <h3 className="font-semibold">{block.content.title || (block.content as any).name}</h3>
            {block.content.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {block.content.description}
              </p>
            )}
          </div>
          {block.content.items && block.content.items.length > 0 && (
            <div className="ml-4 space-y-2">
              {block.content.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.content?.name}</p>
                    {item.content?.description && (
                      <p className="text-xs text-muted-foreground">
                        {item.content.description}
                      </p>
                    )}
                  </div>
                  {quote.settings.showLineItemPrices && (
                    <div className="ml-4 text-right">
                      <p className="text-xs text-muted-foreground">
                        {item.content.quantity} x {formatCurrency(item.content.rate)}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(item.content.quantity * item.content.rate)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'table':
      return (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {block.content.headers && block.content.headers.map((header: string, i: number) => (
                  <TableHead key={i} className="font-semibold">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.content.rows && block.content.rows.map((row: string[], rowIndex: number) => (
                <TableRow key={rowIndex} className={block.content.striped && rowIndex % 2 === 1 ? 'bg-muted/20' : ''}>
                  {row.map((cell: string, cellIndex: number) => (
                    <TableCell key={cellIndex}>{cell || '-'}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );

    case 'columns':
      return (
        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2',
            block.content.gap === 'sm' && 'gap-2',
            block.content.gap === 'md' && 'gap-4',
            block.content.gap === 'lg' && 'gap-6'
          )}
        >
          {/* Support both FE format (leftContent/rightContent) and ALL format (columns array) */}
          {block.content.columns && Array.isArray(block.content.columns) ? (
            block.content.columns.map((col: { blocks?: QuoteBlock[] }, idx: number) => (
              <div key={idx} className="space-y-4">
                {col.blocks?.map((childBlock: QuoteBlock) => (
                  <QuoteBlockRenderer key={childBlock.id} block={childBlock} quote={quote} />
                ))}
              </div>
            ))
          ) : (
            <>
              <div className="space-y-4">
                {block.content.leftContent?.map((childBlock: QuoteBlock) => (
                  <QuoteBlockRenderer key={childBlock.id} block={childBlock} quote={quote} />
                ))}
              </div>
              <div className="space-y-4">
                {block.content.rightContent?.map((childBlock: QuoteBlock) => (
                  <QuoteBlockRenderer key={childBlock.id} block={childBlock} quote={quote} />
                ))}
              </div>
            </>
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
          style={{
            // Bug #56: Apply thickness and color from block content
            borderTopWidth: block.content.thickness ? `${block.content.thickness}px` : undefined,
            borderColor: block.content.color || undefined,
          }}
        />
      );

    case 'spacer': {
      // Bug #57: Match builder spacer heights (sm=16, md=32, lg=64, xl=96)
      const spacerHeights = {
        sm: '16px',
        md: '32px',
        lg: '64px',
        xl: '96px',
      };
      return <div style={{ height: spacerHeights[block.content.height as keyof typeof spacerHeights] }} />;
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
      if (block.content.signatureData) {
        return (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/50">
            <p className="mb-2 text-sm font-medium text-green-800 dark:text-green-200">Signed</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.content.signatureData}
              alt="Signature"
              className="max-h-16"
            />
            {block.content.signerName && (
              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                {block.content.signerName}
              </p>
            )}
          </div>
        );
      }
      return (
        <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-center">
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
