import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: { role: 'button', tabIndex: 0 },
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
const mockUpdateBlock = vi.fn();

vi.mock('@/lib/stores/quote-builder-store', () => ({
  useQuoteBuilderStore: () => ({
    selectBlock: mockSelectBlock,
    removeBlock: mockRemoveBlock,
    duplicateBlock: mockDuplicateBlock,
    setHoveredBlock: mockSetHoveredBlock,
    selectedBlockId: null,
    previewMode: false,
    updateBlock: mockUpdateBlock,
  }),
}));

// Mock block components with identifiable content
vi.mock('@/components/quotes/blocks', () => ({
  HeaderBlockContent: ({ block }: any) => <div data-testid="header-block">{block.content.text}</div>,
  TextBlockContent: ({ block }: any) => <div data-testid="text-block">Text Block</div>,
  ServiceItemBlockContent: ({ block }: any) => <div data-testid="service-item-block">{block.content.name}</div>,
  ServiceGroupBlockContent: ({ block }: any) => <div data-testid="service-group-block">{block.content.title}</div>,
  DividerBlockContent: () => <div data-testid="divider-block">Divider</div>,
  SpacerBlockContent: () => <div data-testid="spacer-block">Spacer</div>,
  ImageBlockContent: ({ block }: any) => <div data-testid="image-block">{block.content.alt}</div>,
  ColumnsBlockContent: () => <div data-testid="columns-block">Columns</div>,
  TableBlockContent: () => <div data-testid="table-block">Table</div>,
  SignatureBlockContent: () => <div data-testid="signature-block">Signature</div>,
}));

import { BlockRenderer } from '@/components/quotes/builder/block-renderer';
import type { QuoteBlock } from '@/lib/quotes/types';

function createTestBlock(type: string, id = 'block-1', contentOverrides = {}): QuoteBlock {
  const now = new Date().toISOString();
  const defaults: Record<string, any> = {
    header: { text: 'Test Header', level: 2, alignment: 'left' },
    text: { html: '<p>Test text</p>', alignment: 'left' },
    'service-item': { name: 'Test Service', description: '', quantity: 1, rate: 100, unit: 'hour', taxRate: null, rateCardId: null },
    'service-group': { title: 'Test Group', description: '', collapsed: false, items: [] },
    divider: { style: 'solid', thickness: 1, color: '#e5e7eb' },
    spacer: { height: 'md' },
    image: { src: '', alt: 'Test image', width: 'full', alignment: 'center', caption: '' },
    columns: { ratio: '50-50', gap: 'md', leftContent: [], rightContent: [] },
    table: { headers: ['Col 1'], rows: [['Cell 1']], striped: true, bordered: true },
    signature: { label: 'Signature', required: true, signatureData: null, signedAt: null, signerName: null },
  };

  return {
    id,
    type,
    content: { ...defaults[type], ...contentOverrides },
    createdAt: now,
    updatedAt: now,
  } as QuoteBlock;
}

describe('BlockRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Block Type Rendering', () => {
    it('renders header block correctly', () => {
      const block = createTestBlock('header', 'h1', { text: 'My Header' });
      render(<BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />);
      expect(screen.getByTestId('header-block')).toHaveTextContent('My Header');
    });

    it('renders text block correctly', () => {
      const block = createTestBlock('text');
      render(<BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />);
      expect(screen.getByTestId('text-block')).toBeInTheDocument();
    });

    it('renders service-item block correctly', () => {
      const block = createTestBlock('service-item', 'si-1', { name: 'Dev Work' });
      render(<BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />);
      expect(screen.getByTestId('service-item-block')).toHaveTextContent('Dev Work');
    });

    it('renders service-group block correctly', () => {
      const block = createTestBlock('service-group', 'sg-1', { title: 'Phase 1' });
      render(<BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />);
      expect(screen.getByTestId('service-group-block')).toHaveTextContent('Phase 1');
    });

    it('renders divider block correctly', () => {
      const block = createTestBlock('divider');
      render(<BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />);
      expect(screen.getByTestId('divider-block')).toBeInTheDocument();
    });

    it('renders spacer block correctly', () => {
      const block = createTestBlock('spacer');
      render(<BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />);
      expect(screen.getByTestId('spacer-block')).toBeInTheDocument();
    });

    it('renders image block correctly', () => {
      const block = createTestBlock('image', 'img-1', { alt: 'Logo' });
      render(<BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />);
      expect(screen.getByTestId('image-block')).toHaveTextContent('Logo');
    });

    it('renders columns block correctly', () => {
      const block = createTestBlock('columns');
      render(<BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />);
      expect(screen.getByTestId('columns-block')).toBeInTheDocument();
    });

    it('renders table block correctly', () => {
      const block = createTestBlock('table');
      render(<BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />);
      expect(screen.getByTestId('table-block')).toBeInTheDocument();
    });

    it('renders signature block correctly', () => {
      const block = createTestBlock('signature');
      render(<BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />);
      expect(screen.getByTestId('signature-block')).toBeInTheDocument();
    });
  });

  describe('Block Selection', () => {
    it('calls selectBlock when block is clicked', () => {
      const block = createTestBlock('header', 'block-123');
      const { container } = render(
        <BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />
      );
      fireEvent.click(container.firstChild!);
      expect(mockSelectBlock).toHaveBeenCalledWith('block-123');
    });

    it('does not select block in preview mode', () => {
      const block = createTestBlock('header', 'block-123');
      const { container } = render(
        <BlockRenderer block={block} index={0} isSelected={false} isPreview={true} />
      );
      fireEvent.click(container.firstChild!);
      expect(mockSelectBlock).not.toHaveBeenCalled();
    });
  });

  describe('Hover State', () => {
    it('sets hovered block on mouse enter', () => {
      const block = createTestBlock('header', 'block-456');
      const { container } = render(
        <BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />
      );
      fireEvent.mouseEnter(container.firstChild!);
      expect(mockSetHoveredBlock).toHaveBeenCalledWith('block-456');
    });

    it('clears hovered block on mouse leave', () => {
      const block = createTestBlock('header', 'block-456');
      const { container } = render(
        <BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />
      );
      fireEvent.mouseLeave(container.firstChild!);
      expect(mockSetHoveredBlock).toHaveBeenCalledWith(null);
    });
  });

  describe('Preview Mode', () => {
    it('renders simplified view in preview mode', () => {
      const block = createTestBlock('header', 'block-1', { text: 'Preview Header' });
      const { container } = render(
        <BlockRenderer block={block} index={0} isSelected={false} isPreview={true} />
      );
      // In preview mode, only block content is rendered, no toolbar/actions
      expect(screen.getByTestId('header-block')).toHaveTextContent('Preview Header');
      // Should not have the actions dropdown
      expect(screen.queryByLabelText('Block options')).not.toBeInTheDocument();
    });

    it('hides toolbar in preview mode', () => {
      const block = createTestBlock('text');
      render(
        <BlockRenderer block={block} index={0} isSelected={false} isPreview={true} />
      );
      // No drag handle or action buttons in preview
      expect(screen.queryByLabelText('Block options')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('action menu has accessible label', () => {
      const block = createTestBlock('text');
      render(
        <BlockRenderer block={block} index={0} isSelected={false} isPreview={false} />
      );
      expect(screen.getByLabelText('Block options')).toBeInTheDocument();
    });
  });
});
