'use client';

import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TableBlock } from '@/lib/quotes/types';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TableBlockContentProps {
  block: TableBlock;
}

export function TableBlockContent({ block }: TableBlockContentProps) {
  const { updateBlock, selectedBlockId, previewMode } = useQuoteBuilderStore();
  const isEditing = selectedBlockId === block.id && !previewMode;

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...block.content.headers];
    newHeaders[index] = value;
    updateBlock(block.id, { headers: newHeaders });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = block.content.rows.map((row, rIdx) =>
      rIdx === rowIndex
        ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
        : row
    );
    updateBlock(block.id, { rows: newRows });
  };

  const handleAddColumn = () => {
    const newHeaders = [...block.content.headers, `Column ${block.content.headers.length + 1}`];
    const newRows = block.content.rows.map((row) => [...row, '']);
    updateBlock(block.id, { headers: newHeaders, rows: newRows });
  };

  const handleRemoveColumn = (colIndex: number) => {
    if (block.content.headers.length <= 1) return;
    const newHeaders = block.content.headers.filter((_, idx) => idx !== colIndex);
    const newRows = block.content.rows.map((row) => row.filter((_, idx) => idx !== colIndex));
    updateBlock(block.id, { headers: newHeaders, rows: newRows });
  };

  const handleAddRow = () => {
    const newRow = block.content.headers.map(() => '');
    updateBlock(block.id, { rows: [...block.content.rows, newRow] });
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (block.content.rows.length <= 1) return;
    const newRows = block.content.rows.filter((_, idx) => idx !== rowIndex);
    updateBlock(block.id, { rows: newRows });
  };

  const handleToggleOption = (option: 'striped' | 'bordered') => {
    updateBlock(block.id, { [option]: !block.content[option] });
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="striped"
              checked={block.content.striped}
              onCheckedChange={() => handleToggleOption('striped')}
            />
            <Label htmlFor="striped" className="text-sm">Striped rows</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="bordered"
              checked={block.content.bordered}
              onCheckedChange={() => handleToggleOption('bordered')}
            />
            <Label htmlFor="bordered" className="text-sm">Show borders</Label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {block.content.headers.map((header, colIndex) => (
                  <th key={colIndex} className="p-2 text-left">
                    <div className="flex items-center gap-1">
                      <Input
                        value={header}
                        onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                        className="h-8 text-sm font-medium"
                        placeholder={`Header ${colIndex + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleRemoveColumn(colIndex)}
                        disabled={block.content.headers.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </th>
                ))}
                <th className="p-2 w-10">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddColumn}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {block.content.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="p-2">
                      <Input
                        value={cell}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="h-8 text-sm"
                        placeholder="..."
                      />
                    </td>
                  ))}
                  <td className="p-2 w-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveRow(rowIndex)}
                      disabled={block.content.rows.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button variant="outline" size="sm" onClick={handleAddRow} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Row
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className={cn(
          'w-full text-sm',
          block.content.bordered && 'border border-border'
        )}
      >
        <thead>
          <tr className={cn(block.content.bordered && 'border-b border-border')}>
            {block.content.headers.map((header, index) => (
              <th
                key={index}
                className={cn(
                  'p-3 text-left font-medium bg-muted/50',
                  block.content.bordered && 'border border-border'
                )}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.content.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                block.content.striped && rowIndex % 2 === 1 && 'bg-muted/30',
                block.content.bordered && 'border-b border-border'
              )}
            >
              {row.map((cell, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(
                    'p-3',
                    block.content.bordered && 'border border-border'
                  )}
                >
                  {cell || <span className="text-muted-foreground">-</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
