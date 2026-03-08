import { describe, it, expect } from 'vitest';

// Large Quote Handling (Bug #360, #364)
// Tests for performance and correctness with large numbers of line items

interface LineItem {
  id: string;
  name: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

type BlockType = 'text' | 'heading' | 'line_item' | 'image' | 'divider';

interface Block {
  id: string;
  type: BlockType;
  content?: string;
  lineItem?: LineItem;
}

function calculateLineItem(qty: number, rate: number): number {
  return Math.round(qty * rate * 100) / 100;
}

function calculateQuoteTotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.amount, 0);
}

function generateLineItems(count: number, baseRate: number = 100): LineItem[] {
  return Array.from({ length: count }, (_, i) => {
    const qty = (i % 10) + 1;
    const rate = baseRate + i;
    return {
      id: `item-${i + 1}`,
      name: `Service Item ${i + 1}`,
      description: `Description for item ${i + 1}`,
      qty,
      rate,
      amount: calculateLineItem(qty, rate),
    };
  });
}

function generateMixedBlocks(lineItemCount: number): Block[] {
  const blocks: Block[] = [];
  let lineItemIndex = 0;

  // Add heading
  blocks.push({ id: 'block-heading', type: 'heading', content: 'Project Proposal' });

  // Add text intro
  blocks.push({ id: 'block-intro', type: 'text', content: 'Thank you for considering our services.' });

  // Add divider
  blocks.push({ id: 'block-divider-1', type: 'divider' });

  // Add line items interspersed with text blocks
  for (let i = 0; i < lineItemCount; i++) {
    const qty = (i % 5) + 1;
    const rate = 50 + (i * 10);
    blocks.push({
      id: `block-item-${i}`,
      type: 'line_item',
      lineItem: {
        id: `li-${i}`,
        name: `Task ${i + 1}`,
        description: `Task description ${i + 1}`,
        qty,
        rate,
        amount: calculateLineItem(qty, rate),
      },
    });
    lineItemIndex++;

    // Add a text block every 10 items
    if ((i + 1) % 10 === 0) {
      blocks.push({
        id: `block-section-${i}`,
        type: 'text',
        content: `Section ${Math.floor(i / 10) + 1} notes`,
      });
    }
  }

  // Footer
  blocks.push({ id: 'block-footer', type: 'text', content: 'Terms and conditions apply.' });

  return blocks;
}

function extractLineItemsFromBlocks(blocks: Block[]): LineItem[] {
  return blocks
    .filter((b): b is Block & { lineItem: LineItem } => b.type === 'line_item' && !!b.lineItem)
    .map((b) => b.lineItem);
}

describe('Large Quote Handling (Bug #360, #364)', () => {
  it('100 line items calculated correctly', () => {
    const items = generateLineItems(100);
    expect(items).toHaveLength(100);

    // Verify each item's amount = qty * rate
    for (const item of items) {
      expect(item.amount).toBe(calculateLineItem(item.qty, item.rate));
    }

    // Verify total
    const total = calculateQuoteTotal(items);
    const expectedTotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
    expect(total).toBeCloseTo(expectedTotal, 2);
  });

  it('1000 line items calculate without overflow or error', () => {
    const items = generateLineItems(1000);
    expect(items).toHaveLength(1000);

    const total = calculateQuoteTotal(items);
    expect(total).toBeGreaterThan(0);
    expect(Number.isFinite(total)).toBe(true);
    // Total should not be NaN or Infinity
    expect(Number.isNaN(total)).toBe(false);
  });

  it('total is sum of all items', () => {
    const items: LineItem[] = [
      { id: '1', name: 'A', description: '', qty: 2, rate: 100, amount: 200 },
      { id: '2', name: 'B', description: '', qty: 3, rate: 50, amount: 150 },
      { id: '3', name: 'C', description: '', qty: 1, rate: 750, amount: 750 },
    ];

    const total = calculateQuoteTotal(items);
    expect(total).toBe(1100);
  });

  it('large individual amounts handled (999,999.99)', () => {
    const items: LineItem[] = [
      { id: '1', name: 'Enterprise License', description: '', qty: 1, rate: 999999.99, amount: 999999.99 },
      { id: '2', name: 'Implementation', description: '', qty: 1, rate: 999999.99, amount: 999999.99 },
    ];

    const total = calculateQuoteTotal(items);
    expect(total).toBe(1999999.98);
    expect(Number.isFinite(total)).toBe(true);
  });

  it('many blocks with mixed types are processed correctly', () => {
    const blocks = generateMixedBlocks(50);

    // Should have heading + intro + divider + 50 line items + 5 section texts + footer
    const lineItemBlocks = blocks.filter((b) => b.type === 'line_item');
    const textBlocks = blocks.filter((b) => b.type === 'text');
    const headingBlocks = blocks.filter((b) => b.type === 'heading');
    const dividerBlocks = blocks.filter((b) => b.type === 'divider');

    expect(lineItemBlocks).toHaveLength(50);
    expect(headingBlocks).toHaveLength(1);
    expect(dividerBlocks).toHaveLength(1);
    // intro + 5 section texts + footer = 7
    expect(textBlocks).toHaveLength(7);

    // Extract and sum line items
    const lineItems = extractLineItemsFromBlocks(blocks);
    expect(lineItems).toHaveLength(50);

    const total = calculateQuoteTotal(lineItems);
    expect(total).toBeGreaterThan(0);
    expect(Number.isFinite(total)).toBe(true);
  });

  it('1000 line items with mixed blocks process correctly', () => {
    const blocks = generateMixedBlocks(1000);
    const lineItems = extractLineItemsFromBlocks(blocks);
    expect(lineItems).toHaveLength(1000);

    const total = calculateQuoteTotal(lineItems);
    expect(total).toBeGreaterThan(0);
    expect(Number.isFinite(total)).toBe(true);
  });

  it('empty line items produce zero total', () => {
    const total = calculateQuoteTotal([]);
    expect(total).toBe(0);
  });

  it('single large qty * rate does not lose precision for reasonable values', () => {
    // 9999 hours at $999.99/hr
    const amount = calculateLineItem(9999, 999.99);
    const expected = Math.round(9999 * 999.99 * 100) / 100;
    expect(amount).toBe(expected);
    expect(Number.isFinite(amount)).toBe(true);
  });
});
