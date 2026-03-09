'use client';

import { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
  className?: string;
}

export function SignaturePad({ onChange, className }: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // Resize canvas on mount and window resize
  useEffect(() => {
    const resizeCanvas = () => {
      if (signatureRef.current && containerRef.current) {
        const canvas = signatureRef.current.getCanvas();
        const container = containerRef.current;

        // Store current signature data
        const data = signatureRef.current.toData();

        // Resize canvas to container width
        canvas.width = container.clientWidth;
        canvas.height = 200;

        // Restore signature data
        if (data.length > 0) {
          signatureRef.current.fromData(data);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const handleEnd = () => {
    if (signatureRef.current) {
      const empty = signatureRef.current.isEmpty();
      setIsEmpty(empty);

      if (!empty) {
        const dataUrl = signatureRef.current.toDataURL('image/png');
        onChange(dataUrl);
      } else {
        onChange(null);
      }
    }
  };

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
      onChange(null);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        ref={containerRef}
        role="application"
        aria-label="Signature pad — draw your signature here"
        className="relative overflow-hidden rounded-lg border-2 border-dashed border-primary/30 bg-white"
      >
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          canvasProps={{
            className: 'w-full touch-none',
            'aria-label': 'Signature drawing area',
            style: { height: '200px', width: '100%' },
          }}
          onEnd={handleEnd}
          backgroundColor="rgb(255, 255, 255)"
        />

        {/* Signature line hint */}
        <div className="pointer-events-none absolute bottom-8 left-4 right-4" aria-hidden="true">
          <div className="border-b border-gray-300" />
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Sign above
          </p>
        </div>

        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Draw your signature here
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={isEmpty}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}
