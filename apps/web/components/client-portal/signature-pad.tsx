'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Type, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
  className?: string;
}

export function SignaturePad({ onChange, className }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signatureType, setSignatureType] = useState<'typed' | 'drawn'>('typed');
  const [typedSignature, setTypedSignature] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      if (touch) {
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return { x: 0, y: 0 };
    }
    const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
    return {
      x: (mouseEvent.clientX - rect.left) * scaleX,
      y: (mouseEvent.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    emitSignature();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange(null);
  };

  const emitSignature = useCallback(() => {
    if (signatureType === 'typed') {
      if (typedSignature.trim()) {
        // Encode typed signature as a data string the backend can store
        onChange(`typed:${typedSignature.trim()}`);
      } else {
        onChange(null);
      }
    } else {
      const canvas = canvasRef.current;
      if (canvas && hasDrawn) {
        onChange(canvas.toDataURL('image/png'));
      } else {
        onChange(null);
      }
    }
  }, [signatureType, typedSignature, hasDrawn, onChange]);

  useEffect(() => {
    emitSignature();
  }, [emitSignature]);

  return (
    <div className={cn('space-y-3', className)}>
      <Tabs
        value={signatureType}
        onValueChange={(v) => {
          setSignatureType(v as 'typed' | 'drawn');
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="typed" className="gap-2">
            <Type className="h-4 w-4" />
            Type
          </TabsTrigger>
          <TabsTrigger value="drawn" className="gap-2">
            <PenTool className="h-4 w-4" />
            Draw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="typed" className="space-y-3 mt-3">
          <div className="space-y-2">
            <Label htmlFor="typed-sig">Type Your Signature</Label>
            <Input
              id="typed-sig"
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              placeholder="Type your signature"
              className="text-2xl h-14"
              style={{ fontFamily: "'Brush Script MT', cursive" }}
            />
          </div>
          {typedSignature && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Preview:</p>
              <p
                className="text-3xl"
                style={{ fontFamily: "'Brush Script MT', cursive" }}
              >
                {typedSignature}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="drawn" className="space-y-3 mt-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Draw Your Signature</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearCanvas}
                disabled={!hasDrawn}
              >
                <Eraser className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-primary/30 bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={200}
                className="w-full h-[200px] cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasDrawn && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Draw your signature here
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
