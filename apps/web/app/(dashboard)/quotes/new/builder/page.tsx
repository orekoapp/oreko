'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
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
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { createBlock, type BlockType, type QuoteBlock } from '@/lib/quotes/types';
import { BlocksPanel } from '@/components/quotes/builder/blocks-panel';
import { RateCardPanel } from '@/components/quotes/builder/rate-card-panel';
import { DocumentCanvas } from '@/components/quotes/builder/document-canvas';
import { PropertiesPanel } from '@/components/quotes/builder/properties-panel';
import { BuilderToolbar } from '@/components/quotes/builder/builder-toolbar';

export default function QuoteBuilderPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');

  const {
    document,
    showBlocksPanel,
    showPropertiesPanel,
    showRateCardPanel,
    addBlock,
    moveBlock,
    resetDocument,
  } = useQuoteBuilderStore();

  const [activeBlock, setActiveBlock] = useState<QuoteBlock | null>(null);
  const [activeTemplateType, setActiveTemplateType] = useState<BlockType | null>(null);
  const hasInitialized = useRef(false);
  const clientIdSet = useRef(false);

  // Initialize document if not exists
  useEffect(() => {
    if (!document) {
      resetDocument();
    }
  }, [document, resetDocument]);

  // Set clientId on document when available
  useEffect(() => {
    if (clientId && document && !clientIdSet.current) {
      const store = useQuoteBuilderStore.getState();
      if (store.document && store.document.clientId !== clientId) {
        // Update the document with the clientId using immer
        useQuoteBuilderStore.setState((state) => {
          if (state.document) {
            state.document.clientId = clientId;
            state.isDirty = true;
          }
        });
        clientIdSet.current = true;
      }
    }
  }, [clientId, document]);

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

    // Check if dragging a template from blocks panel
    if (activeId.startsWith('template-')) {
      const blockType = activeId.replace('template-', '') as BlockType;
      setActiveTemplateType(blockType);
      return;
    }

    // Otherwise, dragging an existing block
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

    // Dropping a template
    if (activeId.startsWith('template-')) {
      const blockType = activeId.replace('template-', '') as BlockType;
      const newBlock = createBlock(blockType);

      // Find drop position
      if (overId === 'canvas') {
        // Drop at end
        addBlock(newBlock);
      } else {
        // Drop at specific position
        const overIndex = document.blocks.findIndex((b) => b.id === overId);
        if (overIndex !== -1) {
          addBlock(newBlock, overIndex + 1);
        } else {
          addBlock(newBlock);
        }
      }
      return;
    }

    // Reordering existing blocks
    if (activeId !== overId) {
      const oldIndex = document.blocks.findIndex((b) => b.id === activeId);
      const newIndex = document.blocks.findIndex((b) => b.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        moveBlock(oldIndex, newIndex);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Could add visual indicators here
  };

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading builder...</p>
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
        onDragOver={handleDragOver}
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
