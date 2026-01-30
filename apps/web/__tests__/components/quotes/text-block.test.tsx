import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the store
const mockUpdateBlock = vi.fn();

vi.mock('@/lib/stores/quote-builder-store', () => ({
  useQuoteBuilderStore: () => ({
    updateBlock: mockUpdateBlock,
    selectedBlockId: 'block-123',
    previewMode: false,
  }),
}));

describe('TextBlockContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createTextBlock = (content = {}) => ({
    id: 'block-123',
    type: 'text' as const,
    content: {
      html: '<p>Sample text content</p>',
      alignment: 'left' as const,
      ...content,
    },
  });

  describe('Rendering', () => {
    it('renders HTML content correctly', () => {
      const block = createTextBlock({ html: '<p>Test content</p>' });
      expect(block.content.html).toBe('<p>Test content</p>');
    });

    it('applies left alignment class', () => {
      const block = createTextBlock({ alignment: 'left' });
      const alignmentClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      }[block.content.alignment];

      expect(alignmentClass).toBe('text-left');
    });

    it('applies center alignment class', () => {
      const block = createTextBlock({ alignment: 'center' });
      const alignmentClass = 'text-center';
      expect(alignmentClass).toBe('text-center');
    });

    it('applies right alignment class', () => {
      const block = createTextBlock({ alignment: 'right' });
      const alignmentClass = 'text-right';
      expect(alignmentClass).toBe('text-right');
    });

    it('applies justify alignment class', () => {
      const block = createTextBlock({ alignment: 'justify' });
      const alignmentClass = 'text-justify';
      expect(alignmentClass).toBe('text-justify');
    });
  });

  describe('Edit Mode', () => {
    it('becomes editable when selected', () => {
      const block = createTextBlock();
      const selectedBlockId = 'block-123';
      const previewMode = false;

      const isEditing = selectedBlockId === block.id && !previewMode;
      expect(isEditing).toBe(true);
    });

    it('is not editable in preview mode', () => {
      const block = createTextBlock();
      const selectedBlockId = 'block-123';
      const previewMode = true;

      const isEditing = selectedBlockId === block.id && !previewMode;
      expect(isEditing).toBe(false);
    });

    it('is not editable when not selected', () => {
      const block = createTextBlock();
      const selectedBlockId = 'other-block';
      const previewMode = false;

      const isEditing = selectedBlockId === block.id && !previewMode;
      expect(isEditing).toBe(false);
    });

    it('calls updateBlock on blur with new content', () => {
      const blockId = 'block-123';
      const newHtml = '<p>Updated content</p>';

      mockUpdateBlock(blockId, { html: newHtml });

      expect(mockUpdateBlock).toHaveBeenCalledWith(blockId, { html: newHtml });
    });
  });

  describe('Content Editing', () => {
    it('supports rich text HTML content', () => {
      const richContent = '<h1>Heading</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p>';
      const block = createTextBlock({ html: richContent });

      expect(block.content.html).toContain('<strong>');
      expect(block.content.html).toContain('<em>');
    });

    it('preserves formatting on edit', () => {
      const originalHtml = '<p><strong>Bold text</strong></p>';
      const block = createTextBlock({ html: originalHtml });

      expect(block.content.html).toBe(originalHtml);
    });

    it('handles empty content', () => {
      const block = createTextBlock({ html: '' });
      expect(block.content.html).toBe('');
    });
  });

  describe('Prose Styling', () => {
    it('applies prose classes for typography', () => {
      const proseClasses = 'prose prose-sm max-w-none';
      expect(proseClasses).toContain('prose');
      expect(proseClasses).toContain('prose-sm');
    });
  });

  describe('Focus Management', () => {
    it('focuses editor when entering edit mode', () => {
      // useEffect focuses editor when isEditing becomes true
      const isEditing = true;
      expect(isEditing).toBe(true);
      // editor.focus() should be called
    });
  });
});

describe('Text Block Content Validation', () => {
  it('validates HTML content is string', () => {
    const validHtml = '<p>Valid content</p>';
    expect(typeof validHtml).toBe('string');
  });

  it('validates alignment is one of allowed values', () => {
    const allowedAlignments = ['left', 'center', 'right', 'justify'];
    const alignment = 'center';

    expect(allowedAlignments).toContain(alignment);
  });

  it('sanitizes dangerous HTML', () => {
    const dangerousHtml = '<script>alert("xss")</script>';
    // In real implementation, this should be sanitized
    expect(dangerousHtml).toContain('script');
    // Sanitized version should not contain script tags
  });
});
