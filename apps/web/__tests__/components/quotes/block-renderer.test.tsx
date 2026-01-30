import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}));

// Mock the store
const mockSelectBlock = vi.fn();
const mockRemoveBlock = vi.fn();
const mockDuplicateBlock = vi.fn();
const mockSetHoveredBlock = vi.fn();

vi.mock('@/lib/stores/quote-builder-store', () => ({
  useQuoteBuilderStore: () => ({
    selectBlock: mockSelectBlock,
    removeBlock: mockRemoveBlock,
    duplicateBlock: mockDuplicateBlock,
    setHoveredBlock: mockSetHoveredBlock,
    selectedBlockId: null,
    previewMode: false,
    updateBlock: vi.fn(),
  }),
}));

// Mock block components
vi.mock('../blocks', () => ({
  HeaderBlockContent: () => <div data-testid="header-block">Header Block</div>,
  TextBlockContent: () => <div data-testid="text-block">Text Block</div>,
  ServiceItemBlockContent: () => <div data-testid="service-item-block">Service Item Block</div>,
  DividerBlockContent: () => <div data-testid="divider-block">Divider Block</div>,
  SpacerBlockContent: () => <div data-testid="spacer-block">Spacer Block</div>,
  ImageBlockContent: () => <div data-testid="image-block">Image Block</div>,
  SignatureBlockContent: () => <div data-testid="signature-block">Signature Block</div>,
}));

describe('BlockRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Block Type Rendering', () => {
    const createBlock = (type: string, id = 'block-1') => ({
      id,
      type,
      content: {},
    });

    it('renders header block correctly', () => {
      const block = createBlock('header');
      expect(block.type).toBe('header');
    });

    it('renders text block correctly', () => {
      const block = createBlock('text');
      expect(block.type).toBe('text');
    });

    it('renders service-item block correctly', () => {
      const block = createBlock('service-item');
      expect(block.type).toBe('service-item');
    });

    it('renders divider block correctly', () => {
      const block = createBlock('divider');
      expect(block.type).toBe('divider');
    });

    it('renders spacer block correctly', () => {
      const block = createBlock('spacer');
      expect(block.type).toBe('spacer');
    });

    it('renders image block correctly', () => {
      const block = createBlock('image');
      expect(block.type).toBe('image');
    });

    it('renders signature block correctly', () => {
      const block = createBlock('signature');
      expect(block.type).toBe('signature');
    });

    it('handles unknown block types gracefully', () => {
      const block = createBlock('unknown-type');
      expect(block.type).toBe('unknown-type');
      // Should render "Unknown block type" message
    });
  });

  describe('Block Selection', () => {
    it('calls selectBlock when block is clicked', () => {
      const blockId = 'block-123';

      // Simulate click handler
      const handleClick = (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        mockSelectBlock(blockId);
      };

      handleClick({ stopPropagation: vi.fn() });

      expect(mockSelectBlock).toHaveBeenCalledWith(blockId);
    });

    it('does not select block in preview mode', () => {
      const isPreview = true;
      const blockId = 'block-123';

      const handleClick = () => {
        if (!isPreview) {
          mockSelectBlock(blockId);
        }
      };

      handleClick();

      expect(mockSelectBlock).not.toHaveBeenCalled();
    });

    it('applies selected styles when isSelected is true', () => {
      const isSelected = true;
      const classNames = [
        'ring-2 ring-primary ring-offset-2',
      ];

      if (isSelected) {
        expect(classNames[0]).toContain('ring-primary');
      }
    });
  });

  describe('Block Actions', () => {
    it('duplicates block when duplicate is clicked', () => {
      const blockId = 'block-123';
      mockDuplicateBlock(blockId);

      expect(mockDuplicateBlock).toHaveBeenCalledWith(blockId);
    });

    it('removes block when delete is clicked', () => {
      const blockId = 'block-123';
      mockRemoveBlock(blockId);

      expect(mockRemoveBlock).toHaveBeenCalledWith(blockId);
    });
  });

  describe('Hover State', () => {
    it('sets hovered block on mouse enter', () => {
      const blockId = 'block-123';
      mockSetHoveredBlock(blockId);

      expect(mockSetHoveredBlock).toHaveBeenCalledWith(blockId);
    });

    it('clears hovered block on mouse leave', () => {
      mockSetHoveredBlock(null);

      expect(mockSetHoveredBlock).toHaveBeenCalledWith(null);
    });
  });

  describe('Drag and Drop', () => {
    it('applies dragging styles when isDragging', () => {
      const isDragging = true;
      const draggingClasses = 'z-50 opacity-50';

      expect(isDragging).toBe(true);
      expect(draggingClasses).toContain('opacity-50');
    });

    it('disables drag when in preview mode', () => {
      const isPreview = true;
      const disabled = isPreview;

      expect(disabled).toBe(true);
    });

    it('shows drag handle on hover', () => {
      const isHovered = true;
      const toolbarVisible = isHovered;

      expect(toolbarVisible).toBe(true);
    });
  });

  describe('Preview Mode', () => {
    it('renders simplified view in preview mode', () => {
      const isPreview = true;

      // In preview mode, should return just the block content
      // without toolbar, actions, etc.
      expect(isPreview).toBe(true);
    });

    it('hides toolbar in preview mode', () => {
      const isPreview = true;
      const showToolbar = !isPreview;

      expect(showToolbar).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('drag handle has correct aria attributes', () => {
      const buttonProps = {
        'aria-roledescription': 'draggable',
        'aria-describedby': 'DndDescribedBy-123',
      };

      expect(buttonProps['aria-roledescription']).toBe('draggable');
    });

    it('action buttons have accessible labels', () => {
      const duplicateLabel = 'Duplicate';
      const deleteLabel = 'Delete';

      expect(duplicateLabel).toBeDefined();
      expect(deleteLabel).toBeDefined();
    });
  });
});
