import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBlock, BLOCK_TEMPLATES } from '@/lib/quotes/types';
import type { HeaderBlock, TextBlock, ServiceItemBlock } from '@/lib/quotes/types';

// Mock crypto.randomUUID
beforeEach(() => {
  vi.stubGlobal('crypto', {
    randomUUID: () => 'test-uuid-1234',
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BLOCK_TEMPLATES', () => {
  it('contains all expected block types', () => {
    const blockTypes = BLOCK_TEMPLATES.map((t) => t.type);
    expect(blockTypes).toContain('header');
    expect(blockTypes).toContain('text');
    expect(blockTypes).toContain('service-item');
    expect(blockTypes).toContain('service-group');
    expect(blockTypes).toContain('image');
    expect(blockTypes).toContain('divider');
    expect(blockTypes).toContain('spacer');
    expect(blockTypes).toContain('columns');
    expect(blockTypes).toContain('table');
    expect(blockTypes).toContain('signature');
  });

  it('has 10 block templates', () => {
    expect(BLOCK_TEMPLATES).toHaveLength(10);
  });

  it('each template has required properties', () => {
    for (const template of BLOCK_TEMPLATES) {
      expect(template).toHaveProperty('type');
      expect(template).toHaveProperty('label');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('icon');
      expect(template).toHaveProperty('defaultContent');
    }
  });

  it('header template has correct default content', () => {
    const headerTemplate = BLOCK_TEMPLATES.find((t) => t.type === 'header');
    expect(headerTemplate?.defaultContent).toEqual({
      text: 'Section Title',
      level: 2,
      alignment: 'left',
    });
  });

  it('service-item template has correct default content', () => {
    const serviceTemplate = BLOCK_TEMPLATES.find((t) => t.type === 'service-item');
    expect(serviceTemplate?.defaultContent).toEqual({
      name: 'Service Name',
      description: '',
      quantity: 1,
      rate: 0,
      unit: 'unit',
      taxRate: null,
      rateCardId: null,
    });
  });

  it('signature template has correct default content', () => {
    const signatureTemplate = BLOCK_TEMPLATES.find((t) => t.type === 'signature');
    expect(signatureTemplate?.defaultContent).toEqual({
      label: 'Client Signature',
      required: true,
      signatureData: null,
      signedAt: null,
      signerName: null,
    });
  });
});

describe('createBlock', () => {
  it('creates a header block with default content', () => {
    const block = createBlock<HeaderBlock>('header');

    expect(block.id).toBe('test-uuid-1234');
    expect(block.type).toBe('header');
    expect(block.content.text).toBe('Section Title');
    expect(block.content.level).toBe(2);
    expect(block.content.alignment).toBe('left');
    expect(block.createdAt).toBeDefined();
    expect(block.updatedAt).toBeDefined();
  });

  it('creates a text block with default content', () => {
    const block = createBlock<TextBlock>('text');

    expect(block.type).toBe('text');
    expect(block.content.html).toBe('<p>Enter your text here...</p>');
    expect(block.content.alignment).toBe('left');
  });

  it('creates a service-item block with default content', () => {
    const block = createBlock<ServiceItemBlock>('service-item');

    expect(block.type).toBe('service-item');
    expect(block.content.name).toBe('Service Name');
    expect(block.content.quantity).toBe(1);
    expect(block.content.rate).toBe(0);
  });

  it('allows overriding default content', () => {
    const block = createBlock<HeaderBlock>('header', {
      text: 'Custom Title',
      level: 1,
    });

    expect(block.content.text).toBe('Custom Title');
    expect(block.content.level).toBe(1);
    expect(block.content.alignment).toBe('left'); // Default preserved
  });

  it('throws error for unknown block type', () => {
    expect(() => {
      // @ts-expect-error Testing invalid type
      createBlock('unknown-type');
    }).toThrow('Unknown block type: unknown-type');
  });

  it('sets timestamps on creation', () => {
    const before = new Date().toISOString();
    const block = createBlock<HeaderBlock>('header');
    const after = new Date().toISOString();

    expect(block.createdAt >= before).toBe(true);
    expect(block.createdAt <= after).toBe(true);
    expect(block.updatedAt).toBe(block.createdAt);
  });
});

describe('Block type discrimination', () => {
  it('can discriminate header block', () => {
    const block = createBlock<HeaderBlock>('header');

    if (block.type === 'header') {
      expect(block.content.level).toBeDefined();
      expect(block.content.text).toBeDefined();
    }
  });

  it('can discriminate service-item block', () => {
    const block = createBlock<ServiceItemBlock>('service-item');

    if (block.type === 'service-item') {
      expect(block.content.quantity).toBeDefined();
      expect(block.content.rate).toBeDefined();
    }
  });
});
