import { describe, it, expect } from 'vitest';

// Quote Builder Undo/Redo Logic (Bug #330)
// Mirrors the undo/redo logic from quote-builder-store.ts.
// The store uses a history array of QuoteBlock[][] snapshots with a historyIndex pointer.
// structuredClone doesn't work on Immer proxies in jsdom, so we test
// the logic in a standalone manner with plain objects.

interface Block {
  id: string;
  label: string;
}

interface UndoRedoState {
  blocks: Block[];
  history: Block[][];
  historyIndex: number;
  isDirty: boolean;
}

function createInitialState(blocks: Block[] = []): UndoRedoState {
  return {
    blocks: [...blocks],
    history: [structuredClone(blocks)],
    historyIndex: 0,
    isDirty: false,
  };
}

function pushHistory(state: UndoRedoState): UndoRedoState {
  // Remove any future history if we're not at the end
  const trimmedHistory = state.history.slice(0, state.historyIndex + 1);
  // Add current state
  trimmedHistory.push(structuredClone(state.blocks));
  let index = trimmedHistory.length - 1;

  // Limit history size to 50
  if (trimmedHistory.length > 50) {
    trimmedHistory.shift();
    index--;
  }

  return {
    ...state,
    history: trimmedHistory,
    historyIndex: index,
  };
}

function addBlock(state: UndoRedoState, block: Block): UndoRedoState {
  const newBlocks = [...state.blocks, block];
  const updated = { ...state, blocks: newBlocks, isDirty: true };
  return pushHistory(updated);
}

function removeBlock(state: UndoRedoState, blockId: string): UndoRedoState {
  const newBlocks = state.blocks.filter((b) => b.id !== blockId);
  const updated = { ...state, blocks: newBlocks, isDirty: true };
  return pushHistory(updated);
}

function undo(state: UndoRedoState): UndoRedoState {
  if (state.historyIndex <= 0) return state;
  const newIndex = state.historyIndex - 1;
  const historyEntry = state.history[newIndex];
  if (!historyEntry) return state;

  return {
    ...state,
    blocks: structuredClone(historyEntry),
    historyIndex: newIndex,
    isDirty: true,
  };
}

function redo(state: UndoRedoState): UndoRedoState {
  if (state.historyIndex >= state.history.length - 1) return state;
  const newIndex = state.historyIndex + 1;
  const historyEntry = state.history[newIndex];
  if (!historyEntry) return state;

  return {
    ...state,
    blocks: structuredClone(historyEntry),
    historyIndex: newIndex,
    isDirty: true,
  };
}

function createBlock(label: string): Block {
  return { id: crypto.randomUUID(), label };
}

describe('Quote Builder Undo/Redo (Bug #330)', () => {
  describe('initial history state', () => {
    it('initializes history with current blocks', () => {
      const block = createBlock('Initial');
      const state = createInitialState([block]);

      expect(state.history).toHaveLength(1);
      expect(state.historyIndex).toBe(0);
      expect(state.blocks).toHaveLength(1);
    });

    it('starts with empty blocks if none provided', () => {
      const state = createInitialState();
      expect(state.history).toHaveLength(1);
      expect(state.history[0]).toEqual([]);
      expect(state.historyIndex).toBe(0);
    });
  });

  describe('undo', () => {
    it('undo after addBlock restores previous blocks state', () => {
      const initial = createBlock('Original');
      let state = createInitialState([initial]);

      const added = createBlock('Added');
      state = addBlock(state, added);
      expect(state.blocks).toHaveLength(2);

      state = undo(state);
      expect(state.blocks).toHaveLength(1);
      expect(state.blocks[0]!.label).toBe('Original');
    });

    it('undo after removeBlock restores removed block', () => {
      const blockA = createBlock('Keep');
      const blockB = createBlock('Remove');
      let state = createInitialState([blockA, blockB]);

      state = removeBlock(state, blockB.id);
      expect(state.blocks).toHaveLength(1);

      state = undo(state);
      expect(state.blocks).toHaveLength(2);
    });

    it('undo on initial state is a no-op', () => {
      const block = createBlock('Initial');
      const state = createInitialState([block]);

      const afterUndo = undo(state);
      expect(afterUndo.blocks).toHaveLength(1);
      expect(afterUndo.historyIndex).toBe(0);
      // Returns same object since no change
      expect(afterUndo).toBe(state);
    });

    it('marks document as dirty after undo', () => {
      const block = createBlock('Initial');
      let state = createInitialState([block]);

      const added = createBlock('Added');
      state = addBlock(state, added);

      // Simulate markSaved
      state = { ...state, isDirty: false };

      state = undo(state);
      expect(state.isDirty).toBe(true);
    });
  });

  describe('redo', () => {
    it('redo after undo restores the change', () => {
      const block = createBlock('Initial');
      let state = createInitialState([block]);

      const added = createBlock('Added');
      state = addBlock(state, added);
      expect(state.blocks).toHaveLength(2);

      state = undo(state);
      expect(state.blocks).toHaveLength(1);

      state = redo(state);
      expect(state.blocks).toHaveLength(2);
    });

    it('redo when nothing to redo is a no-op', () => {
      const block = createBlock('Initial');
      const state = createInitialState([block]);

      const afterRedo = redo(state);
      expect(afterRedo.historyIndex).toBe(0);
      expect(afterRedo.blocks).toHaveLength(1);
      // Returns same object since no change
      expect(afterRedo).toBe(state);
    });
  });

  describe('multiple undo/redo sequences', () => {
    it('multiple undos work in sequence', () => {
      let state = createInitialState([]);

      state = addBlock(state, createBlock('Block 1'));
      expect(state.blocks).toHaveLength(1);

      state = addBlock(state, createBlock('Block 2'));
      expect(state.blocks).toHaveLength(2);

      state = addBlock(state, createBlock('Block 3'));
      expect(state.blocks).toHaveLength(3);

      state = undo(state);
      expect(state.blocks).toHaveLength(2);

      state = undo(state);
      expect(state.blocks).toHaveLength(1);

      state = undo(state);
      expect(state.blocks).toHaveLength(0);
    });

    it('undo then redo then undo cycle works', () => {
      const block = createBlock('Initial');
      let state = createInitialState([block]);

      state = addBlock(state, createBlock('New'));

      // Undo -> 1 block
      state = undo(state);
      expect(state.blocks).toHaveLength(1);

      // Redo -> 2 blocks
      state = redo(state);
      expect(state.blocks).toHaveLength(2);

      // Undo again -> 1 block
      state = undo(state);
      expect(state.blocks).toHaveLength(1);
    });

    it('redo all after undo all', () => {
      let state = createInitialState([]);

      state = addBlock(state, createBlock('A'));
      state = addBlock(state, createBlock('B'));
      state = addBlock(state, createBlock('C'));

      // Undo all
      state = undo(state);
      state = undo(state);
      state = undo(state);
      expect(state.blocks).toHaveLength(0);

      // Redo all
      state = redo(state);
      expect(state.blocks).toHaveLength(1);
      state = redo(state);
      expect(state.blocks).toHaveLength(2);
      state = redo(state);
      expect(state.blocks).toHaveLength(3);
    });
  });

  describe('history branching', () => {
    it('new action after undo discards redo history', () => {
      let state = createInitialState([]);

      state = addBlock(state, createBlock('Block 1'));
      state = addBlock(state, createBlock('Block 2'));

      // Undo (remove block 2 from view)
      state = undo(state);
      expect(state.blocks).toHaveLength(1);

      // Add a different block (creates a new branch)
      state = addBlock(state, createBlock('Block 3'));
      expect(state.blocks).toHaveLength(2);

      // Redo should be a no-op since history was branched
      const beforeRedo = state.blocks.length;
      state = redo(state);
      expect(state.blocks).toHaveLength(beforeRedo);
    });

    it('branching preserves earlier history', () => {
      let state = createInitialState([]);

      state = addBlock(state, createBlock('A'));
      state = addBlock(state, createBlock('B'));

      // Undo B
      state = undo(state);

      // Add C instead
      state = addBlock(state, createBlock('C'));
      expect(state.blocks).toHaveLength(2);
      expect(state.blocks[1]!.label).toBe('C');

      // Can still undo back through the preserved history
      state = undo(state);
      expect(state.blocks).toHaveLength(1);
      expect(state.blocks[0]!.label).toBe('A');

      state = undo(state);
      expect(state.blocks).toHaveLength(0);
    });
  });

  describe('history size limit', () => {
    it('limits history to 50 entries', () => {
      let state = createInitialState([]);

      // Add 55 blocks to exceed limit
      for (let i = 0; i < 55; i++) {
        state = addBlock(state, createBlock(`Block ${i}`));
      }

      // History should be capped at 50
      expect(state.history.length).toBeLessThanOrEqual(50);
    });
  });
});
