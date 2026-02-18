'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LogoUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

export function LogoUpload({ value, onChange, className }: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'logo');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Upload failed:', data.error);
        // Fall back to object URL for preview
        const url = URL.createObjectURL(file);
        onChange(url);
        return;
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      // Fall back to object URL for preview
      const url = URL.createObjectURL(file);
      onChange(url);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = useCallback(() => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  if (value) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-card">
              <img
                src={value}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Logo uploaded</p>
              <p className="text-xs text-muted-foreground">
                Click the button to replace or remove
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          isLoading && 'pointer-events-none opacity-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
          <div className="rounded-full bg-muted p-3">
            {isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Upload your logo</p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG up to 2MB
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-2">
            <Upload className="mr-2 h-4 w-4" />
            Choose File
          </Button>
        </div>
      </div>
    </div>
  );
}
