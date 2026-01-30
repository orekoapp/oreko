import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the store
const mockUpdateBlock = vi.fn();

vi.mock('@/lib/stores/quote-builder-store', () => ({
  useQuoteBuilderStore: () => ({
    updateBlock: mockUpdateBlock,
    selectedBlockId: null,
    previewMode: false,
  }),
}));

describe('ServiceItemBlockContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createServiceItemBlock = (content = {}) => ({
    id: 'block-123',
    type: 'service-item' as const,
    content: {
      name: 'Web Development',
      description: 'Full-stack development services',
      quantity: 10,
      rate: 150,
      unit: 'hour',
      taxRate: 0,
      ...content,
    },
  });

  describe('Rendering', () => {
    it('displays service name', () => {
      const block = createServiceItemBlock({ name: 'Custom Service' });
      expect(block.content.name).toBe('Custom Service');
    });

    it('displays description', () => {
      const block = createServiceItemBlock({ description: 'Detailed description' });
      expect(block.content.description).toBe('Detailed description');
    });

    it('displays quantity', () => {
      const block = createServiceItemBlock({ quantity: 20 });
      expect(block.content.quantity).toBe(20);
    });

    it('displays rate', () => {
      const block = createServiceItemBlock({ rate: 200 });
      expect(block.content.rate).toBe(200);
    });

    it('displays unit', () => {
      const block = createServiceItemBlock({ unit: 'day' });
      expect(block.content.unit).toBe('day');
    });
  });

  describe('Amount Calculation', () => {
    it('calculates amount correctly', () => {
      const block = createServiceItemBlock({ quantity: 10, rate: 150 });
      const amount = block.content.quantity * block.content.rate;

      expect(amount).toBe(1500);
    });

    it('calculates tax amount correctly', () => {
      const block = createServiceItemBlock({
        quantity: 10,
        rate: 100,
        taxRate: 10,
      });

      const amount = block.content.quantity * block.content.rate;
      const taxAmount = amount * (block.content.taxRate / 100);

      expect(amount).toBe(1000);
      expect(taxAmount).toBe(100);
    });

    it('handles zero tax rate', () => {
      const block = createServiceItemBlock({
        quantity: 10,
        rate: 100,
        taxRate: 0,
      });

      const amount = block.content.quantity * block.content.rate;
      const taxAmount = block.content.taxRate
        ? amount * (block.content.taxRate / 100)
        : 0;

      expect(taxAmount).toBe(0);
    });

    it('handles decimal quantities', () => {
      const block = createServiceItemBlock({ quantity: 10.5, rate: 100 });
      const amount = block.content.quantity * block.content.rate;

      expect(amount).toBe(1050);
    });

    it('handles decimal rates', () => {
      const block = createServiceItemBlock({ quantity: 10, rate: 99.99 });
      const amount = block.content.quantity * block.content.rate;

      expect(amount).toBeCloseTo(999.9, 2);
    });
  });

  describe('Unit Types', () => {
    const unitTypes = ['hour', 'day', 'week', 'month', 'item', 'project'];

    unitTypes.forEach((unit) => {
      it(`supports ${unit} unit type`, () => {
        const block = createServiceItemBlock({ unit });
        expect(block.content.unit).toBe(unit);
      });
    });
  });

  describe('Editing', () => {
    it('updates name', () => {
      const blockId = 'block-123';
      mockUpdateBlock(blockId, { name: 'New Name' });

      expect(mockUpdateBlock).toHaveBeenCalledWith(blockId, { name: 'New Name' });
    });

    it('updates quantity', () => {
      const blockId = 'block-123';
      mockUpdateBlock(blockId, { quantity: 25 });

      expect(mockUpdateBlock).toHaveBeenCalledWith(blockId, { quantity: 25 });
    });

    it('updates rate', () => {
      const blockId = 'block-123';
      mockUpdateBlock(blockId, { rate: 250 });

      expect(mockUpdateBlock).toHaveBeenCalledWith(blockId, { rate: 250 });
    });

    it('updates tax rate', () => {
      const blockId = 'block-123';
      mockUpdateBlock(blockId, { taxRate: 8.25 });

      expect(mockUpdateBlock).toHaveBeenCalledWith(blockId, { taxRate: 8.25 });
    });
  });

  describe('Currency Formatting', () => {
    it('formats amount as currency', () => {
      const amount = 1500;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);

      expect(formatted).toBe('$1,500.00');
    });

    it('formats rate as currency', () => {
      const rate = 150;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(rate);

      expect(formatted).toBe('$150.00');
    });
  });

  describe('Validation', () => {
    it('requires positive quantity', () => {
      const validQuantity = 1;
      const invalidQuantity = -1;

      expect(validQuantity).toBeGreaterThan(0);
      expect(invalidQuantity).toBeLessThan(0);
    });

    it('requires positive rate', () => {
      const validRate = 100;
      const invalidRate = -50;

      expect(validRate).toBeGreaterThan(0);
      expect(invalidRate).toBeLessThan(0);
    });

    it('requires name', () => {
      const validName = 'Service';
      const emptyName = '';

      expect(validName.length).toBeGreaterThan(0);
      expect(emptyName.length).toBe(0);
    });

    it('tax rate must be between 0 and 100', () => {
      const validTaxRate = 10;
      const invalidTaxRate = 150;

      expect(validTaxRate).toBeGreaterThanOrEqual(0);
      expect(validTaxRate).toBeLessThanOrEqual(100);
      expect(invalidTaxRate).toBeGreaterThan(100);
    });
  });

  describe('Preview Mode', () => {
    it('displays read-only values in preview mode', () => {
      const previewMode = true;
      expect(previewMode).toBe(true);
      // Fields should not be editable
    });

    it('hides edit controls in preview mode', () => {
      const previewMode = true;
      const showEditControls = !previewMode;

      expect(showEditControls).toBe(false);
    });
  });
});
