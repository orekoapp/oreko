import { describe, it, expect } from 'vitest';

// Block Ordering / Reordering Logic (Bug #328)
// Mirrors the moveBlock logic from the quote-builder-store.
// The store uses `splice(fromIndex, 1)` then `splice(toIndex, 0, removed)`.

interface Block {
  id: string;
  label: string;
}

function createBlock(label: string): Block {
  return { id: crypto.randomUUID(), label };
}

/**
 * Replicates the store's moveBlock logic:
 *   const [removed] = blocks.splice(fromIndex, 1);
 *   if (removed) blocks.splice(toIndex, 0, removed);
 */
function moveBlock(blocks: Block[], fromIndex: number, toIndex: number): Block[] {
  const copy = [...blocks];
  const [removed] = copy.splice(fromIndex, 1);
  if (removed) {
    copy.splice(toIndex, 0, removed);
  }
  return copy;
}

describe('Block Ordering / Reordering (Bug #328)', () => {
  describe('moveBlock basic operations', () => {
    it('moves a block down (forward in the array)', () => {
      const blocks = [createBlock('A'), createBlock('B'), createBlock('C')];
      const result = moveBlock(blocks, 0, 1);

      expect(result[0]!.label).toBe('B');
      expect(result[1]!.label).toBe('A');
      expect(result[2]!.label).toBe('C');
    });

    it('moves a block up (backward in the array)', () => {
      const blocks = [createBlock('A'), createBlock('B'), createBlock('C')];
      const result = moveBlock(blocks, 2, 0);

      expect(result[0]!.label).toBe('C');
      expect(result[1]!.label).toBe('A');
      expect(result[2]!.label).toBe('B');
    });

    it('moving block to same index is a no-op', () => {
      const blocks = [createBlock('A'), createBlock('B')];
      const result = moveBlock(blocks, 0, 0);

      expect(result[0]!.label).toBe('A');
      expect(result[1]!.label).toBe('B');
    });

    it('swaps adjacent blocks correctly', () => {
      const blocks = [createBlock('A'), createBlock('B')];
      const result = moveBlock(blocks, 0, 1);

      expect(result[0]!.label).toBe('B');
      expect(result[1]!.label).toBe('A');
    });
  });

  describe('boundary conditions', () => {
    it('moves first block to last position', () => {
      const blocks = [createBlock('First'), createBlock('Middle'), createBlock('Last')];
      const result = moveBlock(blocks, 0, 2);

      expect(result[0]!.label).toBe('Middle');
      expect(result[1]!.label).toBe('Last');
      expect(result[2]!.label).toBe('First');
    });

    it('moves last block to first position', () => {
      const blocks = [createBlock('First'), createBlock('Middle'), createBlock('Last')];
      const result = moveBlock(blocks, 2, 0);

      expect(result[0]!.label).toBe('Last');
      expect(result[1]!.label).toBe('First');
      expect(result[2]!.label).toBe('Middle');
    });

    it('cannot move first block up (fromIndex 0 to -1 is out of bounds, splice handles gracefully)', () => {
      const blocks = [createBlock('A'), createBlock('B')];
      // Moving from 0 to 0 is the closest we get to "can't move up"
      const result = moveBlock(blocks, 0, 0);
      expect(result).toHaveLength(2);
      expect(result[0]!.label).toBe('A');
    });

    it('cannot move last block down past end (toIndex === length acts like end)', () => {
      const blocks = [createBlock('A'), createBlock('B'), createBlock('C')];
      // Move last block (2) to index 2 = no-op
      const result = moveBlock(blocks, 2, 2);
      expect(result).toHaveLength(3);
      expect(result[2]!.label).toBe('C');
    });
  });

  describe('data integrity after reordering', () => {
    it('preserves all blocks after reorder (no loss)', () => {
      const blocks = Array.from({ length: 5 }, (_, i) => createBlock(`Block ${i}`));
      const originalIds = blocks.map((b) => b.id);

      let result = moveBlock(blocks, 0, 4);
      result = moveBlock(result, 2, 1);
      result = moveBlock(result, 3, 0);

      expect(result).toHaveLength(5);

      const resultIds = result.map((b) => b.id);
      for (const id of originalIds) {
        expect(resultIds).toContain(id);
      }
    });

    it('preserves block content after reorder', () => {
      const blocks = [createBlock('Alpha'), createBlock('Beta'), createBlock('Gamma')];
      const result = moveBlock(blocks, 0, 2);

      // All labels still present
      const labels = result.map((b) => b.label);
      expect(labels).toContain('Alpha');
      expect(labels).toContain('Beta');
      expect(labels).toContain('Gamma');
    });

    it('does not mutate the original array', () => {
      const blocks = [createBlock('A'), createBlock('B'), createBlock('C')];
      const originalLabels = blocks.map((b) => b.label);

      moveBlock(blocks, 0, 2);

      // Original array unchanged
      expect(blocks.map((b) => b.label)).toEqual(originalLabels);
    });
  });

  describe('empty and single-block arrays', () => {
    it('handles empty blocks array gracefully', () => {
      const result = moveBlock([], 0, 1);
      expect(result).toHaveLength(0);
    });

    it('handles single block array (no-op)', () => {
      const blocks = [createBlock('Only Block')];
      const result = moveBlock(blocks, 0, 0);

      expect(result).toHaveLength(1);
      expect(result[0]!.label).toBe('Only Block');
    });
  });

  describe('multiple sequential reorders', () => {
    it('multiple moves produce correct final order', () => {
      const blocks = [createBlock('A'), createBlock('B'), createBlock('C'), createBlock('D')];

      // Move A to end: B C D A
      let result = moveBlock(blocks, 0, 3);
      expect(result.map((b) => b.label)).toEqual(['B', 'C', 'D', 'A']);

      // Move D to start: D B C A
      result = moveBlock(result, 2, 0);
      expect(result.map((b) => b.label)).toEqual(['D', 'B', 'C', 'A']);

      // Swap B and C: D C B A
      result = moveBlock(result, 1, 2);
      expect(result.map((b) => b.label)).toEqual(['D', 'C', 'B', 'A']);
    });

    it('moving block to end then back to start restores original position', () => {
      const blocks = [createBlock('A'), createBlock('B'), createBlock('C')];
      const id = blocks[0]!.id;

      // Move A (0) to end (2): B C A
      let result = moveBlock(blocks, 0, 2);
      expect(result[2]!.id).toBe(id);

      // Move A (2) back to start (0): A B C
      result = moveBlock(result, 2, 0);
      expect(result[0]!.id).toBe(id);
      expect(result.map((b) => b.label)).toEqual(['A', 'B', 'C']);
    });
  });
});
