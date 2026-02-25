'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn, formatCurrency } from '@/lib/utils';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { BlockRenderer } from './block-renderer';
import { ScrollArea } from '@/components/ui/scroll-area';

export function DocumentCanvas() {
  const { document, zoom, previewMode, selectedBlockId, selectBlock } =
    useQuoteBuilderStore();

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Deselect if clicking on canvas background
    if (e.target === e.currentTarget) {
      selectBlock(null);
    }
  };

  return (
    <ScrollArea className="flex-1 bg-muted/30">
      <div
        className="flex justify-center p-8"
        onClick={handleCanvasClick}
      >
        <div
          ref={setNodeRef}
          className={cn(
            'document-paper relative w-full max-w-[816px] min-h-[1056px] bg-white shadow-lg transition-all',
            isOver && 'ring-2 ring-primary ring-offset-2',
            previewMode && 'pointer-events-none'
          )}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Document Content */}
          <div className="p-12">
            {/* Header with Logo and Business Info */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{document.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Quote #{document.quoteNumber || 'DRAFT'}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">Issue Date</p>
                <p className="text-muted-foreground">
                  {new Date(document.issueDate).toLocaleDateString()}
                </p>
                {document.expirationDate && (
                  <>
                    <p className="mt-2 font-medium">Valid Until</p>
                    <p className="text-muted-foreground">
                      {new Date(document.expirationDate).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Blocks */}
            <SortableContext
              items={document.blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {document.blocks.map((block, index) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    index={index}
                    isSelected={selectedBlockId === block.id}
                    isPreview={previewMode}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Empty State */}
            {document.blocks.length === 0 && (
              <div
                className={cn(
                  'flex h-32 items-center justify-center rounded-lg border-2 border-dashed',
                  isOver ? 'border-primary bg-primary/5' : 'border-muted'
                )}
              >
                <p className="text-muted-foreground">
                  Drag blocks here to start building your quote
                </p>
              </div>
            )}

            {/* Totals Section */}
            {document.blocks.some((b) => b.type === 'service-item') && (
              <div className="mt-8 border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(document.totals.subtotal)}</span>
                    </div>
                    {document.totals.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(document.totals.discountAmount)}</span>
                      </div>
                    )}
                    {document.totals.taxTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>{formatCurrency(document.totals.taxTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(document.totals.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Terms */}
            {(document.notes || document.terms) && (
              <div className="mt-8 space-y-4 text-sm">
                {document.notes && (
                  <div>
                    <h3 className="font-medium">Notes</h3>
                    <p className="text-muted-foreground">{document.notes}</p>
                  </div>
                )}
                {document.terms && (
                  <div>
                    <h3 className="font-medium">Terms & Conditions</h3>
                    <p className="text-muted-foreground">{document.terms}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
