'use client';

import { useState, useEffect } from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, X, FileText } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import type { QuoteBlock, BlockType } from '@/lib/quotes/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getContractTemplates } from '@/lib/contracts/actions';

export function PropertiesPanel() {
  const { document, selectedBlockId, updateBlock, togglePropertiesPanel } = useQuoteBuilderStore();
  const [contractTemplates, setContractTemplates] = useState<{ id: string; name: string }[]>([]);

  // Bug #76: Add error handling for contract template fetch
  useEffect(() => {
    getContractTemplates()
      .then((result) => {
        setContractTemplates(result.data.map((t) => ({ id: t.id, name: t.name })));
      })
      .catch((error) => {
        console.error('Failed to load contract templates:', error);
      });
  }, []);

  const selectedBlock = document?.blocks.find((b) => b.id === selectedBlockId);

  if (!selectedBlock) {
    return (
      <div className="absolute md:relative right-0 top-0 z-20 flex h-full w-72 flex-col border-l bg-card shadow-lg md:shadow-none">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="font-semibold">Properties</h2>
            <p className="text-xs text-muted-foreground">Document Settings</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={togglePropertiesPanel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <DocumentSettingsPanel contractTemplates={contractTemplates} />
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="absolute md:relative right-0 top-0 z-20 flex h-full w-72 flex-col border-l bg-card shadow-lg md:shadow-none">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="font-semibold">Properties</h2>
          <p className="text-xs text-muted-foreground capitalize">
            {selectedBlock.type.replace('-', ' ')} Block
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          onClick={togglePropertiesPanel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <BlockProperties block={selectedBlock} onUpdate={updateBlock} />
        </div>
      </ScrollArea>
    </div>
  );
}

// Document Settings Panel (shown when no block is selected)
// CR #26: All hooks called before conditional return (Rules of Hooks)
function DocumentSettingsPanel({ contractTemplates }: { contractTemplates: { id: string; name: string }[] }) {
  const { document, updateSettings, markDirty } = useQuoteBuilderStore();

  if (!document) return null;

  const contractTemplateId = document.contractTemplateId || '';
  const selectedTemplate = contractTemplates.find((t) => t.id === contractTemplateId);
  const handleContractChange = (value: string) => {
    useQuoteBuilderStore.setState((state) => {
      if (state.document) {
        state.document.contractTemplateId = value === 'none' ? null : value;
      }
    });
    markDirty();
  };

  return (
    <div className="space-y-6">
      {/* Contract Template */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Contract</Label>
        </div>
        <Select value={contractTemplateId || 'none'} onValueChange={handleContractChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a contract template..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No contract</SelectItem>
            {contractTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTemplate && (
          <p className="text-xs text-muted-foreground">
            This contract will be attached to the quote when sent.
          </p>
        )}
      </div>

      {!selectedTemplate && (
        <p className="text-center text-xs text-muted-foreground pt-4">
          Click on a block in the canvas to edit its properties.
        </p>
      )}
    </div>
  );
}

interface BlockPropertiesProps {
  block: QuoteBlock;
  onUpdate: (blockId: string, content: Partial<QuoteBlock['content']>) => void;
}

function BlockProperties({ block, onUpdate }: BlockPropertiesProps) {
  const handleUpdate = (updates: Partial<typeof block.content>) => {
    onUpdate(block.id, updates);
  };

  switch (block.type) {
    case 'header':
      return <HeaderProperties block={block} onUpdate={handleUpdate} />;
    case 'text':
      return <TextProperties block={block} onUpdate={handleUpdate} />;
    case 'service-item':
      return <ServiceItemProperties block={block} onUpdate={handleUpdate} />;
    case 'divider':
      return <DividerProperties block={block} onUpdate={handleUpdate} />;
    case 'spacer':
      return <SpacerProperties block={block} onUpdate={handleUpdate} />;
    case 'image':
      return <ImageProperties block={block} onUpdate={handleUpdate} />;
    case 'signature':
      return <SignatureProperties block={block} onUpdate={handleUpdate} />;
    case 'table':
      return <TableProperties block={block} onUpdate={handleUpdate} />;
    case 'columns':
      return <ColumnsProperties block={block} onUpdate={handleUpdate} />;
    case 'service-group':
      return <ServiceGroupProperties block={block} onUpdate={handleUpdate} />;
    default:
      return (
        <p className="text-sm text-muted-foreground">
          No properties available for this block type.
        </p>
      );
  }
}

// Header Block Properties
function HeaderProperties({
  block,
  onUpdate,
}: {
  block: Extract<QuoteBlock, { type: 'header' }>;
  onUpdate: (updates: Partial<typeof block.content>) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Text</Label>
        <Input
          value={block.content.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Enter heading text"
        />
      </div>

      <div className="space-y-2">
        <Label>Heading Level</Label>
        <Select
          value={String(block.content.level)}
          onValueChange={(value) => onUpdate({ level: parseInt(value) as 1 | 2 | 3 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Heading 1 (Large)</SelectItem>
            <SelectItem value="2">Heading 2 (Medium)</SelectItem>
            <SelectItem value="3">Heading 3 (Small)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AlignmentSelector
        value={block.content.alignment}
        onChange={(alignment) => onUpdate({ alignment: alignment as typeof block.content.alignment })}
        options={['left', 'center', 'right']}
      />
    </>
  );
}

// Text Block Properties
function TextProperties({
  block,
  onUpdate,
}: {
  block: Extract<QuoteBlock, { type: 'text' }>;
  onUpdate: (updates: Partial<typeof block.content>) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Content</Label>
        <p className="text-xs text-muted-foreground">
          Edit text directly in the canvas
        </p>
      </div>

      <AlignmentSelector
        value={block.content.alignment}
        onChange={(alignment) => onUpdate({ alignment: alignment as typeof block.content.alignment })}
        options={['left', 'center', 'right', 'justify']}
      />
    </>
  );
}

// Service Item Block Properties
function ServiceItemProperties({
  block,
  onUpdate,
}: {
  block: Extract<QuoteBlock, { type: 'service-item' }>;
  onUpdate: (updates: Partial<typeof block.content>) => void;
}) {
  const { document } = useQuoteBuilderStore();
  return (
    <>
      <div className="space-y-2">
        <Label>Service Name</Label>
        <Input
          value={block.content.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Service name"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={block.content.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Optional description"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            type="number"
            value={block.content.quantity}
            onChange={(e) => onUpdate({ quantity: Math.max(1, parseFloat(e.target.value) || 1) })}
            min={1}
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label>Rate</Label>
          <Input
            type="number"
            value={block.content.rate}
            onChange={(e) => onUpdate({ rate: parseFloat(e.target.value) || 0 })}
            min={0}
            step="0.01"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select
            value={block.content.unit}
            onValueChange={(value) => onUpdate({ unit: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unit">Unit</SelectItem>
              <SelectItem value="hour">Hour</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tax Rate (%)</Label>
          <Input
            type="number"
            value={block.content.taxRate || ''}
            onChange={(e) =>
              onUpdate({ taxRate: e.target.value ? parseFloat(e.target.value) : null })
            }
            min={0}
            max={100}
            step="0.1"
            placeholder="0"
          />
        </div>
      </div>

      <div className="pt-2 border-t">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Line Total</span>
          <span className="font-semibold">
            {formatCurrency(block.content.quantity * block.content.rate, document?.settings?.currency ?? 'USD')}
          </span>
        </div>
      </div>
    </>
  );
}

// Divider Block Properties
function DividerProperties({
  block,
  onUpdate,
}: {
  block: Extract<QuoteBlock, { type: 'divider' }>;
  onUpdate: (updates: Partial<typeof block.content>) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Style</Label>
        <Select
          value={block.content.style}
          onValueChange={(value) =>
            onUpdate({ style: value as 'solid' | 'dashed' | 'dotted' })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Thickness</Label>
        <Select
          value={String(block.content.thickness)}
          onValueChange={(value) => onUpdate({ thickness: parseInt(value) as 1 | 2 | 3 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Thin</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">Thick</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={block.content.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="w-12 h-9 p-1 cursor-pointer"
          />
          <Input
            value={block.content.color}
            onChange={(e) => onUpdate({ color: e.target.value })}
            placeholder="#e5e7eb"
            className="flex-1"
          />
        </div>
      </div>
    </>
  );
}

// Spacer Block Properties
function SpacerProperties({
  block,
  onUpdate,
}: {
  block: Extract<QuoteBlock, { type: 'spacer' }>;
  onUpdate: (updates: Partial<typeof block.content>) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Height</Label>
      <Select
        value={block.content.height}
        onValueChange={(value) =>
          onUpdate({ height: value as 'sm' | 'md' | 'lg' | 'xl' })
        }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sm">Small (16px)</SelectItem>
          <SelectItem value="md">Medium (32px)</SelectItem>
          <SelectItem value="lg">Large (64px)</SelectItem>
          <SelectItem value="xl">Extra Large (96px)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// Image Block Properties
function ImageProperties({
  block,
  onUpdate,
}: {
  block: Extract<QuoteBlock, { type: 'image' }>;
  onUpdate: (updates: Partial<typeof block.content>) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Image URL</Label>
        <Input
          value={block.content.src}
          onChange={(e) => onUpdate({ src: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label>Alt Text</Label>
        <Input
          value={block.content.alt}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Image description"
        />
      </div>

      <div className="space-y-2">
        <Label>Caption</Label>
        <Input
          value={block.content.caption}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          placeholder="Optional caption"
        />
      </div>

      <div className="space-y-2">
        <Label>Width</Label>
        <Select
          value={block.content.width === 'full' ? 'full' : 'custom'}
          onValueChange={(value) =>
            onUpdate({ width: value === 'full' ? 'full' : 400 })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Width</SelectItem>
            <SelectItem value="custom">Custom Width</SelectItem>
          </SelectContent>
        </Select>
        {typeof block.content.width === 'number' && (
          <Input
            type="number"
            value={block.content.width}
            onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 400 })}
            min={100}
            max={800}
            className="mt-2"
          />
        )}
      </div>

      <AlignmentSelector
        value={block.content.alignment}
        onChange={(alignment) => onUpdate({ alignment: alignment as typeof block.content.alignment })}
        options={['left', 'center', 'right']}
      />
    </>
  );
}

// TODO Bug #67: Signature block preview mode can be misleading — the unsigned placeholder
// looks similar to the signed state. Consider adding a clearer visual distinction (e.g. "Preview Only" badge).

// Bug #69: Drag and drop insertion logic is fully implemented in the builder page components
// (quotes/[id]/builder/page.tsx and quotes/new/builder/page.tsx). The onDragEnd handler
// correctly calculates insertion index when dropping on existing blocks (overIndex + 1)
// and appends to the end when dropping on the canvas background.

// TODO Bug #78: Signature data is stored as base64 in the DB, which bloats storage.
// Consider moving signature images to file storage (S3/R2) and storing only the URL.

// Signature Block Properties
function SignatureProperties({
  block,
  onUpdate,
}: {
  block: Extract<QuoteBlock, { type: 'signature' }>;
  onUpdate: (updates: Partial<typeof block.content>) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Label</Label>
        <Input
          value={block.content.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Client Signature"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Required</Label>
        <Switch
          checked={block.content.required}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>

      {block.content.signatureData && (
        <div className="space-y-2 pt-2 border-t">
          <Label>Status</Label>
          <p className="text-sm text-green-600">Signed</p>
          {block.content.signerName && (
            <p className="text-sm text-muted-foreground">
              By: {block.content.signerName}
            </p>
          )}
          {block.content.signedAt && (
            <p className="text-sm text-muted-foreground">
              On: {new Date(block.content.signedAt).toLocaleDateString()}
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() =>
              onUpdate({ signatureData: null, signedAt: null, signerName: null })
            }
          >
            Clear Signature
          </Button>
        </div>
      )}
    </>
  );
}

// Table Block Properties
function TableProperties({
  block,
  onUpdate,
}: {
  block: Extract<QuoteBlock, { type: 'table' }>;
  onUpdate: (updates: Partial<typeof block.content>) => void;
}) {
  const addColumn = () => {
    const newHeaders = [...block.content.headers, `Column ${block.content.headers.length + 1}`];
    const newRows = block.content.rows.map((row) => [...row, '']);
    onUpdate({ headers: newHeaders, rows: newRows });
  };

  const removeColumn = () => {
    if (block.content.headers.length <= 1) return;
    const newHeaders = block.content.headers.slice(0, -1);
    const newRows = block.content.rows.map((row) => row.slice(0, -1));
    onUpdate({ headers: newHeaders, rows: newRows });
  };

  const addRow = () => {
    const newRow = Array(block.content.headers.length).fill('');
    onUpdate({ rows: [...block.content.rows, newRow] });
  };

  const removeRow = () => {
    if (block.content.rows.length <= 1) return;
    onUpdate({ rows: block.content.rows.slice(0, -1) });
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Columns ({block.content.headers.length})</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={removeColumn} disabled={block.content.headers.length <= 1}>
            Remove
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={addColumn}>
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Rows ({block.content.rows.length})</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={removeRow} disabled={block.content.rows.length <= 1}>
            Remove
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={addRow}>
            Add
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Label>Striped Rows</Label>
        <Switch
          checked={block.content.striped}
          onCheckedChange={(checked) => onUpdate({ striped: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Bordered</Label>
        <Switch
          checked={block.content.bordered}
          onCheckedChange={(checked) => onUpdate({ bordered: checked })}
        />
      </div>
    </>
  );
}

// Columns Block Properties
function ColumnsProperties({
  block,
  onUpdate,
}: {
  block: Extract<QuoteBlock, { type: 'columns' }>;
  onUpdate: (updates: Partial<typeof block.content>) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Column Ratio</Label>
        <Select
          value={block.content.ratio}
          onValueChange={(value) => onUpdate({ ratio: value as typeof block.content.ratio })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50-50">Equal (50/50)</SelectItem>
            <SelectItem value="33-67">Narrow Left (33/67)</SelectItem>
            <SelectItem value="67-33">Wide Left (67/33)</SelectItem>
            <SelectItem value="25-75">Sidebar Left (25/75)</SelectItem>
            <SelectItem value="75-25">Sidebar Right (75/25)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Gap</Label>
        <Select
          value={block.content.gap}
          onValueChange={(value) => onUpdate({ gap: value as 'sm' | 'md' | 'lg' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground pt-2">
        Edit column contents directly in the canvas.
      </p>
    </>
  );
}

// Service Group Block Properties
function ServiceGroupProperties({
  block,
  onUpdate,
}: {
  block: Extract<QuoteBlock, { type: 'service-group' }>;
  onUpdate: (updates: Partial<typeof block.content>) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Group Title</Label>
        <Input
          value={block.content.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Service Group"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={block.content.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Optional description"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Collapsed by Default</Label>
        <Switch
          checked={block.content.collapsed}
          onCheckedChange={(checked) => onUpdate({ collapsed: checked })}
        />
      </div>

      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          {block.content.items.length} item{block.content.items.length !== 1 ? 's' : ''} in this group.
          Add service items inside the group on the canvas.
        </p>
      </div>
    </>
  );
}

// Alignment Selector Component
type AlignmentOption = 'left' | 'center' | 'right' | 'justify';

interface AlignmentSelectorProps {
  value: AlignmentOption;
  onChange: (value: AlignmentOption) => void;
  options: readonly AlignmentOption[];
}

function AlignmentSelector({ value, onChange, options }: AlignmentSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Alignment</Label>
      <div className="flex gap-1">
        {options.map((option) => (
          <Button
            key={option}
            variant={value === option ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onChange(option)}
          >
            {option === 'left' && <AlignLeft className="h-4 w-4" />}
            {option === 'center' && <AlignCenter className="h-4 w-4" />}
            {option === 'right' && <AlignRight className="h-4 w-4" />}
            {option === 'justify' && <AlignJustify className="h-4 w-4" />}
          </Button>
        ))}
      </div>
    </div>
  );
}
