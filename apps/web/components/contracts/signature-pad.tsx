'use client';

import { useRef, useState, useEffect } from 'react';
import { Eraser, Type, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { SignatureData } from '@/lib/contracts/types';

interface SignaturePadProps {
  onSignatureChange: (signature: SignatureData | null) => void;
  signerName?: string;
}

export function SignaturePad({ onSignatureChange, signerName = '' }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState<'typed' | 'drawn'>('typed');
  const [typedSignature, setTypedSignature] = useState('');
  const [name, setName] = useState(signerName);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
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

    // Check if this is a touch event
    const isTouchEvent = 'touches' in e;
    if (isTouchEvent) {
      const touch = e.touches[0];
      if (touch) {
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      }
      return { x: 0, y: 0 };
    }

    // Mouse event
    const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
    return {
      x: (mouseEvent.clientX - rect.left) * scaleX,
      y: (mouseEvent.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
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

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    updateSignature();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange(null);
  };

  const updateSignature = () => {
    if (signatureType === 'typed') {
      if (typedSignature && name) {
        onSignatureChange({
          type: 'typed',
          value: typedSignature,
          name,
          date: new Date().toISOString(),
        });
      } else {
        onSignatureChange(null);
      }
    } else {
      const canvas = canvasRef.current;
      if (canvas && hasDrawn && name) {
        onSignatureChange({
          type: 'drawn',
          value: canvas.toDataURL('image/png'),
          name,
          date: new Date().toISOString(),
        });
      } else {
        onSignatureChange(null);
      }
    }
  };

  useEffect(() => {
    updateSignature();
  }, [typedSignature, name, signatureType, hasDrawn]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Contract</CardTitle>
        <CardDescription>
          Please sign below to indicate your agreement to the terms of this
          contract.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signerName">Full Legal Name</Label>
          <Input
            id="signerName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        <Tabs
          value={signatureType}
          onValueChange={(v) => setSignatureType(v as 'typed' | 'drawn')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="typed" className="gap-2">
              <Type className="h-4 w-4" />
              Type Signature
            </TabsTrigger>
            <TabsTrigger value="drawn" className="gap-2">
              <PenTool className="h-4 w-4" />
              Draw Signature
            </TabsTrigger>
          </TabsList>

          <TabsContent value="typed" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typedSig">Type Your Signature</Label>
              <Input
                id="typedSig"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder="Type your signature"
                className="font-signature text-2xl h-14"
                style={{ fontFamily: "'Brush Script MT', cursive" }}
              />
            </div>
            {typedSignature && (
              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <p
                  className="text-3xl"
                  style={{ fontFamily: "'Brush Script MT', cursive" }}
                >
                  {typedSignature}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="drawn" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Draw Your Signature</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                >
                  <Eraser className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden bg-white">
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
              </div>
              <p className="text-xs text-muted-foreground">
                Use your mouse or finger to draw your signature above.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground">
          By signing, you agree to the terms and conditions of this contract. Your
          signature will be recorded along with a timestamp and your IP address for
          verification purposes.
        </div>
      </CardContent>
    </Card>
  );
}
