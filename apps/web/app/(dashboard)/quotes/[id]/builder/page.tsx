'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { createBlock, type BlockType, type QuoteBlock } from '@/lib/quotes/types';
import { useAutoSave, useBuilderKeyboardShortcuts } from '@/lib/quotes/hooks';
import { getQuote } from '@/lib/quotes/actions';
import { BlocksPanel } from '@/components/quotes/builder/blocks-panel';
import { RateCardPanel } from '@/components/quotes/builder/rate-card-panel';
import { DocumentCanvas } from '@/components/quotes/builder/document-canvas';
import { PropertiesPanel } from '@/components/quotes/builder/properties-panel';
import { BuilderToolbar } from '@/components/quotes/builder/builder-toolbar';

export default function EditQuoteBuilderPage() {
  const params = useParams();
  const quoteId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const {
    document,
    showBlocksPanel,
    showPropertiesPanel,
    showRateCardPanel,
    addBlock,
    moveBlock,
    initDocument,
  } = useQuoteBuilderStore();

  const [activeBlock, setActiveBlock] = useState<QuoteBlock | null>(null);
  const [activeTemplateType, setActiveTemplateType] = useState<BlockType | null>(null);

  // Auto-save functionality
  useAutoSave(quoteId);

  // Keyboard shortcuts
  useBuilderKeyboardShortcuts();

  // Hide panels on mobile on first load
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const store = useQuoteBuilderStore.getState();
      if (store.showBlocksPanel) store.toggleBlocksPanel();
      if (store.showPropertiesPanel) store.togglePropertiesPanel();
      if (store.showRateCardPanel) store.toggleRateCardPanel();
    }
  }, []);

  // Load quote on mount
  useEffect(() => {
    async function loadQuote() {
      try {
        setIsLoading(true);
        const quote = await getQuote(quoteId);
        if (quote) {
          initDocument(quote);
        } else {
          setError('Quote not found');
        }
      } catch (err) {
        setError('Failed to load quote');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuote();
  }, [quoteId, initDocument]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id);

    if (activeId.startsWith('template-')) {
      const blockType = activeId.replace('template-', '') as BlockType;
      setActiveTemplateType(blockType);
      return;
    }

    const block = document?.blocks.find((b) => b.id === activeId);
    if (block) {
      setActiveBlock(block);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveBlock(null);
    setActiveTemplateType(null);

    if (!over || !document) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith('template-')) {
      const blockType = activeId.replace('template-', '') as BlockType;
      const newBlock = createBlock(blockType);

      if (overId === 'canvas') {
        addBlock(newBlock);
      } else {
        const overIndex = document.blocks.findIndex((b) => b.id === overId);
        if (overIndex !== -1) {
          addBlock(newBlock, overIndex + 1);
        } else {
          addBlock(newBlock);
        }
      }
      return;
    }

    if (activeId !== overId) {
      const oldIndex = document.blocks.findIndex((b) => b.id === activeId);
      const newIndex = document.blocks.findIndex((b) => b.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        moveBlock(oldIndex, newIndex);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <a href="/quotes" className="text-primary hover:underline">
            Back to Quotes
          </a>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Quote not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <BuilderToolbar />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="relative flex flex-1 overflow-hidden">
          {showBlocksPanel && <BlocksPanel />}
          {showRateCardPanel && <RateCardPanel />}

          <DocumentCanvas />

          {showPropertiesPanel && <PropertiesPanel />}
        </div>

        <DragOverlay>
          {activeTemplateType && (
            <div className="rounded-lg border-2 border-dashed border-primary bg-primary/5 p-4 text-center">
              <p className="text-sm font-medium capitalize">
                {activeTemplateType.replace('-', ' ')}
              </p>
            </div>
          )}
          {activeBlock && (
            <div className="rounded-lg border bg-card p-4 shadow-lg opacity-80">
              <p className="text-sm font-medium capitalize">
                {activeBlock.type.replace('-', ' ')} Block
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
