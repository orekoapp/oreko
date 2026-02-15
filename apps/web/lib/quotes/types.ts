/**
 * Quote Builder Block Types
 * These define the visual blocks that can be used in the quote builder
 */

export type BlockType =
  | 'header'
  | 'text'
  | 'service-item'
  | 'service-group'
  | 'image'
  | 'divider'
  | 'spacer'
  | 'columns'
  | 'table'
  | 'signature';

/**
 * Base block interface that all blocks extend
 */
export interface BaseBlock {
  id: string;
  type: BlockType;
  createdAt: string;
  updatedAt: string;
}

/**
 * Header block for titles and sections
 */
export interface HeaderBlock extends BaseBlock {
  type: 'header';
  content: {
    text: string;
    level: 1 | 2 | 3;
    alignment: 'left' | 'center' | 'right';
  };
}

/**
 * Rich text block
 */
export interface TextBlock extends BaseBlock {
  type: 'text';
  content: {
    html: string;
    alignment: 'left' | 'center' | 'right' | 'justify';
  };
}

/**
 * Service/line item block
 */
export interface ServiceItemBlock extends BaseBlock {
  type: 'service-item';
  content: {
    name: string;
    description: string;
    quantity: number;
    rate: number;
    unit: string;
    taxRate: number | null;
    rateCardId: string | null;
  };
}

/**
 * Service group (collapsible section of items)
 */
export interface ServiceGroupBlock extends BaseBlock {
  type: 'service-group';
  content: {
    title: string;
    description: string;
    collapsed: boolean;
    items: ServiceItemBlock[];
  };
}

/**
 * Image block
 */
export interface ImageBlock extends BaseBlock {
  type: 'image';
  content: {
    src: string;
    alt: string;
    width: number | 'full';
    alignment: 'left' | 'center' | 'right';
    caption: string;
  };
}

/**
 * Divider/separator block
 */
export interface DividerBlock extends BaseBlock {
  type: 'divider';
  content: {
    style: 'solid' | 'dashed' | 'dotted';
    thickness: 1 | 2 | 3;
    color: string;
  };
}

/**
 * Spacer block for vertical spacing
 */
export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  content: {
    height: 'sm' | 'md' | 'lg' | 'xl';
  };
}

/**
 * Two-column layout block
 */
export interface ColumnsBlock extends BaseBlock {
  type: 'columns';
  content: {
    ratio: '50-50' | '33-67' | '67-33' | '25-75' | '75-25';
    gap: 'sm' | 'md' | 'lg';
    leftContent: QuoteBlock[];
    rightContent: QuoteBlock[];
  };
}

/**
 * Table block for custom data
 */
export interface TableBlock extends BaseBlock {
  type: 'table';
  content: {
    headers: string[];
    rows: string[][];
    striped: boolean;
    bordered: boolean;
  };
}

/**
 * Signature block for client acceptance
 */
export interface SignatureBlock extends BaseBlock {
  type: 'signature';
  content: {
    label: string;
    required: boolean;
    signatureData: string | null;
    signedAt: string | null;
    signerName: string | null;
  };
}

/**
 * Union type of all block types
 */
export type QuoteBlock =
  | HeaderBlock
  | TextBlock
  | ServiceItemBlock
  | ServiceGroupBlock
  | ImageBlock
  | DividerBlock
  | SpacerBlock
  | ColumnsBlock
  | TableBlock
  | SignatureBlock;

/**
 * Quote document structure
 */
export interface LinkedInvoice {
  id: string;
  invoiceNumber: string;
  status: string;
}

export interface QuoteClient {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
}

export interface QuoteDocument {
  id: string;
  workspaceId: string;
  clientId: string;
  projectId: string | null;
  quoteNumber: string;
  status: QuoteStatus;
  title: string;
  issueDate: string;
  expirationDate: string | null;
  blocks: QuoteBlock[];
  settings: QuoteSettings;
  totals: QuoteTotals;
  notes: string;
  terms: string;
  internalNotes: string;
  linkedInvoice?: LinkedInvoice | null;
  client?: QuoteClient | null;
}

export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'converted';

export interface QuoteSettings {
  requireSignature: boolean;
  autoConvertToInvoice: boolean;
  depositRequired: boolean;
  depositType: 'percentage' | 'fixed';
  depositValue: number;
  showLineItemPrices: boolean;
  allowPartialAcceptance: boolean;
  currency: string;
  taxInclusive: boolean;
}

export interface QuoteTotals {
  subtotal: number;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number | null;
  discountAmount: number;
  taxTotal: number;
  total: number;
}

/**
 * Block template for the blocks panel
 */
export interface BlockTemplate {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  defaultContent: QuoteBlock['content'];
}

/**
 * Block templates available in the blocks panel
 */
export const BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    type: 'header',
    label: 'Header',
    description: 'Section title or heading',
    icon: 'heading',
    defaultContent: {
      text: 'Section Title',
      level: 2,
      alignment: 'left',
    },
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Rich text paragraph',
    icon: 'text',
    defaultContent: {
      html: '<p>Enter your text here...</p>',
      alignment: 'left',
    },
  },
  {
    type: 'service-item',
    label: 'Service Item',
    description: 'Billable item or service',
    icon: 'package',
    defaultContent: {
      name: 'Service Name',
      description: '',
      quantity: 1,
      rate: 0,
      unit: 'unit',
      taxRate: null,
      rateCardId: null,
    },
  },
  {
    type: 'service-group',
    label: 'Service Group',
    description: 'Group of related services',
    icon: 'folder',
    defaultContent: {
      title: 'Service Group',
      description: '',
      collapsed: false,
      items: [],
    },
  },
  {
    type: 'image',
    label: 'Image',
    description: 'Upload or embed an image',
    icon: 'image',
    defaultContent: {
      src: '',
      alt: '',
      width: 'full',
      alignment: 'center',
      caption: '',
    },
  },
  {
    type: 'divider',
    label: 'Divider',
    description: 'Horizontal line separator',
    icon: 'minus',
    defaultContent: {
      style: 'solid',
      thickness: 1,
      color: '#e5e7eb',
    },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    description: 'Vertical spacing',
    icon: 'move-vertical',
    defaultContent: {
      height: 'md',
    },
  },
  {
    type: 'columns',
    label: 'Columns',
    description: 'Two-column layout',
    icon: 'columns',
    defaultContent: {
      ratio: '50-50',
      gap: 'md',
      leftContent: [],
      rightContent: [],
    },
  },
  {
    type: 'table',
    label: 'Table',
    description: 'Data table',
    icon: 'table',
    defaultContent: {
      headers: ['Column 1', 'Column 2', 'Column 3'],
      rows: [['Cell 1', 'Cell 2', 'Cell 3']],
      striped: true,
      bordered: true,
    },
  },
  {
    type: 'signature',
    label: 'Signature',
    description: 'Client signature field',
    icon: 'pen-tool',
    defaultContent: {
      label: 'Client Signature',
      required: true,
      signatureData: null,
      signedAt: null,
      signerName: null,
    },
  },
];

/**
 * Quote list item for displaying in tables/lists
 */
export interface QuoteListItem {
  id: string;
  quoteNumber: string;
  title: string;
  status: QuoteStatus;
  total: number;
  issueDate: string;
  expirationDate: string | null;
  client: {
    id: string;
    name: string;
    email: string | null;
  };
  createdAt: string;
}

/**
 * Helper to create a new block with defaults
 */
export function createBlock<T extends QuoteBlock>(
  type: T['type'],
  overrides?: Partial<T['content']>
): T {
  const template = BLOCK_TEMPLATES.find((t) => t.type === type);
  if (!template) {
    throw new Error(`Unknown block type: ${type}`);
  }

  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    type,
    content: { ...template.defaultContent, ...overrides },
    createdAt: now,
    updatedAt: now,
  } as T;
}
