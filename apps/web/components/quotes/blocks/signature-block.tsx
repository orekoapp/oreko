'use client';

import { PenTool, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SignatureBlock } from '@/lib/quotes/types';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';

interface SignatureBlockContentProps {
  block: SignatureBlock;
}

export function SignatureBlockContent({ block }: SignatureBlockContentProps) {
  const { previewMode } = useQuoteBuilderStore();

  const isSigned = !!block.content.signatureData;

  if (isSigned) {
    return (
      <div className="rounded-lg border bg-green-50 p-6">
        <div className="flex items-center gap-2 text-green-700 mb-4">
          <Check className="h-5 w-5" />
          <span className="font-medium">Signed</span>
        </div>
        <div className="space-y-2">
          {block.content.signatureData && (
            <div className="border-b border-green-200 pb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.content.signatureData}
                alt="Signature"
                className="max-h-16"
              />
            </div>
          )}
          {block.content.signerName && (
            <p className="text-sm font-medium text-green-800">
              {block.content.signerName}
            </p>
          )}
          {block.content.signedAt && (
            <p className="text-xs text-green-600">
              Signed on {new Date(block.content.signedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border-2 border-dashed p-6',
        previewMode ? 'border-primary bg-primary/5' : 'border-muted'
      )}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <PenTool className="h-8 w-8 text-muted-foreground mb-3" />
        <p className="font-medium">{block.content.label}</p>
        {block.content.required && (
          <p className="text-xs text-muted-foreground mt-1">Required</p>
        )}
        {previewMode && (
          <p className="text-sm text-muted-foreground mt-3 italic">
            Signature will appear here when the client signs
          </p>
        )}
      </div>
    </div>
  );
}
