'use client';

import * as React from 'react';
import { Paintbrush } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  presetColors?: string[];
  disabled?: boolean;
  className?: string;
}

const defaultPresetColors = [
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#A855F7', // Purple
  '#000000', // Black
  '#6B7280', // Gray
  '#FFFFFF', // White
];

export function ColorPicker({
  value = '#3B82F6',
  onChange,
  presetColors = defaultPresetColors,
  disabled = false,
  className,
}: ColorPickerProps) {
  const [color, setColor] = React.useState(value);
  const [open, setOpen] = React.useState(false);

  // Bug #113: Sync internal state when parent updates value prop
  React.useEffect(() => {
    setColor(value);
  }, [value]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onChange?.(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(newColor)) {
      setColor(newColor);
      if (newColor.length === 7) {
        onChange?.(newColor);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            className
          )}
          disabled={disabled}
        >
          <div
            className="mr-2 h-4 w-4 rounded border"
            style={{ backgroundColor: color }}
          />
          <span>{color}</span>
          <Paintbrush className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          {/* Native color input */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border-0 p-0"
            />
            <Input
              value={color}
              onChange={handleInputChange}
              placeholder="#000000"
              className="flex-1 font-mono uppercase"
              maxLength={7}
            />
          </div>

          {/* Preset colors */}
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                aria-label={`Select color ${presetColor}`}
                className={cn(
                  'h-8 w-8 rounded-md border-2 transition-all hover:scale-110',
                  color === presetColor
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-transparent'
                )}
                style={{ backgroundColor: presetColor }}
                onClick={() => handleColorChange(presetColor)}
                type="button"
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
