'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, ArrowLeft, Palette, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateBrandingSettings } from '@/lib/settings/actions';

interface OnboardingBrandingStepProps {
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function OnboardingBrandingStep({ onNext, onSkip, onBack }: OnboardingBrandingStepProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        await updateBrandingSettings({
          primaryColor,
          accentColor,
        });

        router.refresh();
        onNext();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save branding settings');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Customize your branding</h3>
        <p className="text-sm text-muted-foreground">
          Make your quotes and invoices match your brand
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="primaryColor">Primary Color</Label>
          <div className="flex gap-3">
            <div
              className="h-10 w-10 rounded-md border shadow-sm cursor-pointer"
              style={{ backgroundColor: primaryColor }}
              onClick={() => document.getElementById('primaryColorInput')?.click()}
            />
            <Input
              id="primaryColorInput"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="sr-only"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#3B82F6"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Used for headings and buttons
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="accentColor">Accent Color</Label>
          <div className="flex gap-3">
            <div
              className="h-10 w-10 rounded-md border shadow-sm cursor-pointer"
              style={{ backgroundColor: accentColor }}
              onClick={() => document.getElementById('accentColorInput')?.click()}
            />
            <Input
              id="accentColorInput"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="sr-only"
            />
            <Input
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              placeholder="#10B981"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Used for highlights and success states
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <p className="text-sm font-medium mb-3">Preview</p>
        <div className="flex gap-3">
          <Button style={{ backgroundColor: primaryColor }} className="text-white">
            Primary Button
          </Button>
          <Button variant="outline" style={{ borderColor: accentColor, color: accentColor }}>
            Accent Button
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        You can upload your logo later in Settings → Branding
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSkip}>
            Skip for now
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
