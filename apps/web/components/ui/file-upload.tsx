'use client';

import * as React from 'react';
import { Upload, X, File, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  value?: File | string | null;
  onChange?: (file: File | null) => void;
  onUpload?: (file: File) => Promise<string>;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
  preview?: boolean;
  placeholder?: string;
}

export function FileUpload({
  value,
  onChange,
  onUpload,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  disabled = false,
  className,
  preview = true,
  placeholder = 'Click to upload or drag and drop',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === 'string') {
      setPreviewUrl(value);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
      setError('Invalid file type');
      return;
    }

    if (onUpload) {
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        onChange?.(file);
        setPreviewUrl(url);
      } catch (err) {
        setError('Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    } else {
      onChange?.(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange?.(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isImage = accept.includes('image');

  return (
    <div className={cn('relative', className)}>
      {previewUrl && preview ? (
        <div className="relative">
          {isImage ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <File className="h-8 w-8 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">
                {value instanceof File ? value.name : 'Uploaded file'}
              </span>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-destructive'
          )}
          onDrop={disabled ? undefined : handleDrop}
          onDragOver={disabled ? undefined : handleDragOver}
          onDragLeave={disabled ? undefined : handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            ) : isImage ? (
              <ImageIcon className="h-10 w-10 text-muted-foreground" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground" />
            )}
            <div className="text-sm">
              <span className="font-medium text-primary">
                {isUploading ? 'Uploading...' : placeholder}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {accept === 'image/*'
                ? 'PNG, JPG, GIF up to'
                : 'Files up to'}{' '}
              {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
