'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updateBrandingSettings } from '@/lib/settings/actions';
import type { BrandingSettingsData } from '@/lib/settings/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const brandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily: z.string().max(100).optional(),
  customCss: z.string().max(10000).optional(),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

interface BrandingSettingsFormProps {
  initialData: BrandingSettingsData | null;
}

interface BrandingPreset {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const BRANDING_PRESETS: BrandingPreset[] = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    description: 'Classic and trustworthy',
    primaryColor: '#3B82F6',
    secondaryColor: '#1D4ED8',
    accentColor: '#0EA5E9',
  },
  {
    id: 'modern-indigo',
    name: 'Modern Indigo',
    description: 'Contemporary and elegant',
    primaryColor: '#6366F1',
    secondaryColor: '#4F46E5',
    accentColor: '#818CF8',
  },
  {
    id: 'creative-purple',
    name: 'Creative Purple',
    description: 'Bold and creative',
    primaryColor: '#8B5CF6',
    secondaryColor: '#7C3AED',
    accentColor: '#A78BFA',
  },
  {
    id: 'warm-orange',
    name: 'Warm Orange',
    description: 'Energetic and inviting',
    primaryColor: '#F97316',
    secondaryColor: '#EA580C',
    accentColor: '#FB923C',
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Fresh and sustainable',
    primaryColor: '#22C55E',
    secondaryColor: '#16A34A',
    accentColor: '#4ADE80',
  },
  {
    id: 'elegant-slate',
    name: 'Elegant Slate',
    description: 'Minimal and sophisticated',
    primaryColor: '#475569',
    secondaryColor: '#334155',
    accentColor: '#64748B',
  },
  {
    id: 'bold-red',
    name: 'Bold Red',
    description: 'Strong and confident',
    primaryColor: '#EF4444',
    secondaryColor: '#DC2626',
    accentColor: '#F87171',
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    description: 'Calm and professional',
    primaryColor: '#14B8A6',
    secondaryColor: '#0D9488',
    accentColor: '#2DD4BF',
  },
];

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Source Sans Pro',
  'Nunito',
  'Poppins',
  'Raleway',
];

export function BrandingSettingsForm({ initialData }: BrandingSettingsFormProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      primaryColor: initialData?.primaryColor || '#3B82F6',
      secondaryColor: initialData?.secondaryColor || '#8B5CF6',
      accentColor: initialData?.accentColor || '#F59E0B',
      fontFamily: initialData?.fontFamily || 'Inter',
      customCss: initialData?.customCss || '',
    },
  });

  const currentColors = {
    primary: form.watch('primaryColor'),
    secondary: form.watch('secondaryColor'),
    accent: form.watch('accentColor'),
  };

  const selectedPreset = BRANDING_PRESETS.find(
    (preset) =>
      preset.primaryColor === currentColors.primary &&
      preset.secondaryColor === currentColors.secondary &&
      preset.accentColor === currentColors.accent
  );

  const applyPreset = (preset: BrandingPreset) => {
    form.setValue('primaryColor', preset.primaryColor);
    form.setValue('secondaryColor', preset.secondaryColor);
    form.setValue('accentColor', preset.accentColor);
  };

  const handleSubmit = async (data: BrandingFormValues) => {
    setIsSaving(true);
    try {
      await updateBrandingSettings({
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
        fontFamily: data.fontFamily,
        customCss: data.customCss,
      });
      toast.success('Branding settings updated');
    } catch {
      toast.error('Failed to update branding settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Color Themes</CardTitle>
          <CardDescription>
            Choose a preset color theme for your client-facing documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BRANDING_PRESETS.map((preset) => {
              const isSelected = selectedPreset?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    'relative rounded-lg border-2 p-4 text-left transition-all hover:shadow-md',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/50'
                  )}
                >
                  {isSelected && (
                    <div className="absolute -right-2 -top-2 rounded-full bg-primary p-1">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="mb-3 flex gap-1">
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: preset.primaryColor }}
                    />
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: preset.secondaryColor }}
                    />
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                  </div>
                  <p className="font-medium">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">Preview</p>
            <div className="flex flex-wrap gap-2">
              <div
                className="flex h-10 items-center justify-center rounded-md px-4 text-white"
                style={{ backgroundColor: currentColors.primary || '#3B82F6' }}
              >
                Primary Button
              </div>
              <div
                className="flex h-10 items-center justify-center rounded-md px-4 text-white"
                style={{ backgroundColor: currentColors.secondary || '#8B5CF6' }}
              >
                Secondary
              </div>
              <div
                className="flex h-10 items-center justify-center rounded-md px-4 text-white"
                style={{ backgroundColor: currentColors.accent || '#F59E0B' }}
              >
                Accent
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>
            Choose the font family for your documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <select
              id="fontFamily"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={form.watch('fontFamily') || 'Inter'}
              onChange={(e) => form.setValue('fontFamily', e.target.value)}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div
            className="rounded-lg border p-4"
            style={{ fontFamily: form.watch('fontFamily') || 'Inter' }}
          >
            <p className="mb-2 text-lg font-semibold">Sample Text Preview</p>
            <p className="text-muted-foreground">
              The quick brown fox jumps over the lazy dog. 0123456789
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom CSS</CardTitle>
          <CardDescription>
            Add custom CSS to further customize your documents. Use with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            {...form.register('customCss')}
            placeholder=".quote-header { ... }"
            className="font-mono text-sm"
            rows={8}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
