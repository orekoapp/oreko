import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  QuoteBlock,
  QuoteDocument,
  QuoteSettings,
  QuoteTotals,
  ServiceItemBlock,
} from '@/lib/quotes/types';
import { createBlock } from '@/lib/quotes/types';

interface QuoteBuilderState {
  // Document state
  document: QuoteDocument | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;

  // Selection state
  selectedBlockId: string | null;
  hoveredBlockId: string | null;

  // UI state
  showBlocksPanel: boolean;
  showPropertiesPanel: boolean;
  previewMode: boolean;
  zoom: number;

  // Undo/Redo
  history: QuoteBlock[][];
  historyIndex: number;
}

interface QuoteBuilderActions {
  // Document actions
  initDocument: (doc: QuoteDocument) => void;
  resetDocument: () => void;
  updateTitle: (title: string) => void;
  updateNotes: (notes: string) => void;
  updateTerms: (terms: string) => void;
  updateSettings: (settings: Partial<QuoteSettings>) => void;

  // Block actions
  addBlock: (block: QuoteBlock, index?: number) => void;
  addBlockAfter: (blockId: string, newBlock: QuoteBlock) => void;
  updateBlock: (blockId: string, content: Partial<QuoteBlock['content']>) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  duplicateBlock: (blockId: string) => void;

  // Selection actions
  selectBlock: (blockId: string | null) => void;
  setHoveredBlock: (blockId: string | null) => void;

  // UI actions
  toggleBlocksPanel: () => void;
  togglePropertiesPanel: () => void;
  togglePreviewMode: () => void;
  setZoom: (zoom: number) => void;

  // Save actions
  setSaving: (saving: boolean) => void;
  markSaved: () => void;
  markDirty: () => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Calculations
  recalculateTotals: () => void;
}

type QuoteBuilderStore = QuoteBuilderState & QuoteBuilderActions;

const DEFAULT_SETTINGS: QuoteSettings = {
  requireSignature: true,
  autoConvertToInvoice: false,
  depositRequired: false,
  depositType: 'percentage',
  depositValue: 50,
  showLineItemPrices: true,
  allowPartialAcceptance: false,
  currency: 'USD',
  taxInclusive: false,
};

const DEFAULT_TOTALS: QuoteTotals = {
  subtotal: 0,
  discountType: null,
  discountValue: null,
  discountAmount: 0,
  taxTotal: 0,
  total: 0,
};

const createEmptyDocument = (): QuoteDocument => ({
  id: '',
  workspaceId: '',
  clientId: '',
  quoteNumber: '',
  status: 'draft',
  title: 'Untitled Quote',
  issueDate: new Date().toISOString().split('T')[0] ?? new Date().toISOString().slice(0, 10),
  expirationDate: null,
  blocks: [
    createBlock('header', { text: 'Project Proposal', level: 1, alignment: 'left' }),
    createBlock('text', {
      html: '<p>Thank you for considering our services. Please find our proposal below.</p>',
      alignment: 'left',
    }),
    createBlock('divider', { style: 'solid', thickness: 1, color: '#e5e7eb' }),
    createBlock('header', { text: 'Services', level: 2, alignment: 'left' }),
  ],
  settings: DEFAULT_SETTINGS,
  totals: DEFAULT_TOTALS,
  notes: '',
  terms: '',
  internalNotes: '',
});

export const useQuoteBuilderStore = create<QuoteBuilderStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        document: null,
        isDirty: false,
        isSaving: false,
        lastSavedAt: null,
        selectedBlockId: null,
        hoveredBlockId: null,
        showBlocksPanel: true,
        showPropertiesPanel: true,
        previewMode: false,
        zoom: 100,
        history: [],
        historyIndex: -1,

        // Document actions
        initDocument: (doc) => {
          set((state) => {
            state.document = doc;
            state.isDirty = false;
            state.selectedBlockId = null;
            state.history = [doc.blocks];
            state.historyIndex = 0;
          });
        },

        resetDocument: () => {
          set((state) => {
            state.document = createEmptyDocument();
            state.isDirty = false;
            state.selectedBlockId = null;
            state.history = [state.document.blocks];
            state.historyIndex = 0;
          });
        },

        updateTitle: (title) => {
          set((state) => {
            if (state.document) {
              state.document.title = title;
              state.isDirty = true;
            }
          });
        },

        updateNotes: (notes) => {
          set((state) => {
            if (state.document) {
              state.document.notes = notes;
              state.isDirty = true;
            }
          });
        },

        updateTerms: (terms) => {
          set((state) => {
            if (state.document) {
              state.document.terms = terms;
              state.isDirty = true;
            }
          });
        },

        updateSettings: (settings) => {
          set((state) => {
            if (state.document) {
              state.document.settings = { ...state.document.settings, ...settings };
              state.isDirty = true;
            }
          });
        },

        // Block actions
        addBlock: (block, index) => {
          set((state) => {
            if (state.document) {
              if (index !== undefined) {
                state.document.blocks.splice(index, 0, block);
              } else {
                state.document.blocks.push(block);
              }
              state.isDirty = true;
              state.selectedBlockId = block.id;
            }
          });
          get().pushHistory();
          get().recalculateTotals();
        },

        addBlockAfter: (blockId, newBlock) => {
          set((state) => {
            if (state.document) {
              const index = state.document.blocks.findIndex((b: QuoteBlock) => b.id === blockId);
              if (index !== -1) {
                state.document.blocks.splice(index + 1, 0, newBlock);
                state.isDirty = true;
                state.selectedBlockId = newBlock.id;
              }
            }
          });
          get().pushHistory();
          get().recalculateTotals();
        },

        updateBlock: (blockId, content) => {
          set((state) => {
            if (state.document) {
              const block = state.document.blocks.find((b: QuoteBlock) => b.id === blockId);
              if (block) {
                block.content = { ...block.content, ...content } as typeof block.content;
                block.updatedAt = new Date().toISOString();
                state.isDirty = true;
              }
            }
          });
          get().recalculateTotals();
        },

        removeBlock: (blockId) => {
          set((state) => {
            if (state.document) {
              const index = state.document.blocks.findIndex((b: QuoteBlock) => b.id === blockId);
              if (index !== -1) {
                state.document.blocks.splice(index, 1);
                state.isDirty = true;
                if (state.selectedBlockId === blockId) {
                  state.selectedBlockId = null;
                }
              }
            }
          });
          get().pushHistory();
          get().recalculateTotals();
        },

        moveBlock: (fromIndex, toIndex) => {
          set((state) => {
            if (state.document) {
              const [removed] = state.document.blocks.splice(fromIndex, 1);
              if (removed) {
                state.document.blocks.splice(toIndex, 0, removed);
                state.isDirty = true;
              }
            }
          });
          get().pushHistory();
        },

        duplicateBlock: (blockId) => {
          set((state) => {
            if (state.document) {
              const index = state.document.blocks.findIndex((b: QuoteBlock) => b.id === blockId);
              if (index !== -1) {
                const original = state.document.blocks[index];
                const duplicate = {
                  ...JSON.parse(JSON.stringify(original)),
                  id: crypto.randomUUID(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                state.document.blocks.splice(index + 1, 0, duplicate);
                state.isDirty = true;
                state.selectedBlockId = duplicate.id;
              }
            }
          });
          get().pushHistory();
          get().recalculateTotals();
        },

        // Selection actions
        selectBlock: (blockId) => {
          set((state) => {
            state.selectedBlockId = blockId;
          });
        },

        setHoveredBlock: (blockId) => {
          set((state) => {
            state.hoveredBlockId = blockId;
          });
        },

        // UI actions
        toggleBlocksPanel: () => {
          set((state) => {
            state.showBlocksPanel = !state.showBlocksPanel;
          });
        },

        togglePropertiesPanel: () => {
          set((state) => {
            state.showPropertiesPanel = !state.showPropertiesPanel;
          });
        },

        togglePreviewMode: () => {
          set((state) => {
            state.previewMode = !state.previewMode;
            if (state.previewMode) {
              state.selectedBlockId = null;
            }
          });
        },

        setZoom: (zoom) => {
          set((state) => {
            state.zoom = Math.min(Math.max(zoom, 50), 200);
          });
        },

        // Save actions
        setSaving: (saving) => {
          set((state) => {
            state.isSaving = saving;
          });
        },

        markSaved: () => {
          set((state) => {
            state.isDirty = false;
            state.isSaving = false;
            state.lastSavedAt = new Date().toISOString();
          });
        },

        markDirty: () => {
          set((state) => {
            state.isDirty = true;
          });
        },

        // Undo/Redo
        pushHistory: () => {
          set((state) => {
            if (state.document) {
              // Remove any future history if we're not at the end
              state.history = state.history.slice(0, state.historyIndex + 1);
              // Add current state
              state.history.push(JSON.parse(JSON.stringify(state.document.blocks)));
              state.historyIndex = state.history.length - 1;
              // Limit history size
              if (state.history.length > 50) {
                state.history.shift();
                state.historyIndex--;
              }
            }
          });
        },

        undo: () => {
          set((state) => {
            if (state.document && state.historyIndex > 0) {
              state.historyIndex--;
              state.document.blocks = JSON.parse(
                JSON.stringify(state.history[state.historyIndex])
              );
              state.isDirty = true;
            }
          });
          get().recalculateTotals();
        },

        redo: () => {
          set((state) => {
            if (state.document && state.historyIndex < state.history.length - 1) {
              state.historyIndex++;
              state.document.blocks = JSON.parse(
                JSON.stringify(state.history[state.historyIndex])
              );
              state.isDirty = true;
            }
          });
          get().recalculateTotals();
        },

        // Calculations
        recalculateTotals: () => {
          set((state) => {
            if (!state.document) return;

            let subtotal = 0;
            let taxTotal = 0;

            // Calculate from service items
            const calculateItems = (blocks: QuoteBlock[]) => {
              for (const block of blocks) {
                if (block.type === 'service-item') {
                  const item = block as ServiceItemBlock;
                  const lineTotal = item.content.quantity * item.content.rate;
                  subtotal += lineTotal;
                  if (item.content.taxRate) {
                    taxTotal += lineTotal * (item.content.taxRate / 100);
                  }
                }
                if (block.type === 'service-group') {
                  calculateItems((block.content as { items: QuoteBlock[] }).items);
                }
              }
            };

            calculateItems(state.document.blocks);

            // Apply discount
            let discountAmount = 0;
            if (
              state.document.totals.discountType &&
              state.document.totals.discountValue
            ) {
              if (state.document.totals.discountType === 'percentage') {
                discountAmount = subtotal * (state.document.totals.discountValue / 100);
              } else {
                discountAmount = state.document.totals.discountValue;
              }
            }

            state.document.totals.subtotal = subtotal;
            state.document.totals.discountAmount = discountAmount;
            state.document.totals.taxTotal = taxTotal;
            state.document.totals.total = subtotal - discountAmount + taxTotal;
          });
        },
      })),
      {
        name: 'quote-builder',
        partialize: (state) => ({
          showBlocksPanel: state.showBlocksPanel,
          showPropertiesPanel: state.showPropertiesPanel,
          zoom: state.zoom,
        }),
      }
    ),
    { name: 'QuoteBuilder' }
  )
);
