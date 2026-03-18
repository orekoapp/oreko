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
  showRateCardPanel: boolean;
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
  updateProjectId: (projectId: string | null) => void;
  updateNotes: (notes: string) => void;
  updateTerms: (terms: string) => void;
  updateInternalNotes: (internalNotes: string) => void;
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
  toggleRateCardPanel: () => void;
  togglePreviewMode: () => void;
  setZoom: (zoom: number) => void;

  // Save actions
  setSaving: (saving: boolean) => void;
  markSaved: () => void;
  markDirty: () => void;
  updateDocumentId: (id: string, quoteNumber?: string) => void;

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
  projectId: null,
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
        showRateCardPanel: false,
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

        updateProjectId: (projectId) => {
          set((state) => {
            if (state.document) {
              state.document.projectId = projectId;
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

        updateInternalNotes: (internalNotes) => {
          set((state) => {
            if (state.document) {
              state.document.internalNotes = internalNotes;
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
                // Bug #182: Clamp negative quantity and rate at input time
                const updated = { ...content } as Record<string, unknown>;
                if ('quantity' in updated && typeof updated.quantity === 'number' && updated.quantity < 0) {
                  updated.quantity = 0;
                }
                if ('rate' in updated && typeof updated.rate === 'number' && updated.rate < 0) {
                  updated.rate = 0;
                }
                block.content = { ...block.content, ...updated } as typeof block.content;
                block.updatedAt = new Date().toISOString();
                state.isDirty = true;
              }
            }
          });
          get().pushHistory(); // Bug #50: Push undo history on block updates
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
                const original = state.document.blocks[index]!;
                const duplicate: QuoteBlock = {
                  ...structuredClone(original) as QuoteBlock,
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

        toggleRateCardPanel: () => {
          set((state) => {
            state.showRateCardPanel = !state.showRateCardPanel;
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

        updateDocumentId: (id, quoteNumber) => {
          set((state) => {
            if (state.document) {
              state.document.id = id;
              if (quoteNumber) {
                state.document.quoteNumber = quoteNumber;
              }
            }
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
              const historyEntry = state.history[state.historyIndex];
              if (historyEntry) {
                state.document.blocks = JSON.parse(JSON.stringify(historyEntry));
              }
              state.isDirty = true;
            }
          });
          get().recalculateTotals();
        },

        redo: () => {
          set((state) => {
            if (state.document && state.historyIndex < state.history.length - 1) {
              state.historyIndex++;
              const historyEntry = state.history[state.historyIndex];
              if (historyEntry) {
                state.document.blocks = JSON.parse(JSON.stringify(historyEntry));
              }
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

            // Calculate from service items (clamp negative values to 0)
            const calculateItems = (blocks: QuoteBlock[]) => {
              for (const block of blocks) {
                if (block.type === 'service-item') {
                  const item = block as ServiceItemBlock;
                  const quantity = Math.max(0, item.content.quantity || 0);
                  const rate = Math.max(0, item.content.rate || 0);
                  const lineTotal = quantity * rate;
                  subtotal += lineTotal;
                  if (item.content.taxRate) {
                    taxTotal += lineTotal * (Math.max(0, item.content.taxRate) / 100);
                  }
                }
                if (block.type === 'service-group') {
                  calculateItems((block.content as { items: QuoteBlock[] }).items);
                }
              }
            };

            calculateItems(state.document.blocks);

            // Apply discount (with bounds: percentage 0-100%, fixed 0-subtotal)
            let discountAmount = 0;
            if (
              state.document.totals.discountType &&
              state.document.totals.discountValue
            ) {
              const discountValue = Math.max(0, state.document.totals.discountValue);
              if (state.document.totals.discountType === 'percentage') {
                discountAmount = subtotal * (Math.min(100, discountValue) / 100);
              } else {
                discountAmount = Math.min(subtotal, discountValue);
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
          // Persist document for auto-save (draft recovery)
          document: state.document,
          isDirty: state.isDirty,
          lastSavedAt: state.lastSavedAt,
          // UI preferences
          showBlocksPanel: state.showBlocksPanel,
          showPropertiesPanel: state.showPropertiesPanel,
          showRateCardPanel: state.showRateCardPanel,
          zoom: state.zoom,
        }),
        // Don't persist to localStorage if document is empty or saved
        skipHydration: false,
        // Bug #66: On hydration, check if persisted document ID matches current URL.
        // If not, the store will be re-initialized by initDocument() with the correct data.
        onRehydrateStorage: () => {
          return (state) => {
            if (state?.document?.id && typeof window !== 'undefined') {
              // Check if URL contains a quote ID that differs from persisted doc
              const urlMatch = window.location.pathname.match(/\/quotes\/([^/]+)/);
              const urlQuoteId = urlMatch?.[1];
              if (urlQuoteId && urlQuoteId !== state.document.id && !state.document.id.startsWith('temp-')) {
                // Reset persisted state - the page will call initDocument with correct data
                state.document = null;
                state.isDirty = false;
                state.selectedBlockId = null;
              }
            }
          };
        },
      }
    ),
    { name: 'QuoteBuilder' }
  )
);
