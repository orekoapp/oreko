'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { updateBrandingSettings } from '@/lib/settings/actions';
import type { BrandingSettingsData } from '@/lib/settings/types';
import { toast } from 'sonner';

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
          <CardTitle>Colors</CardTitle>
          <CardDescription>
            Customize the colors used in your client-facing documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex items-center gap-3">
                <ColorPicker
                  value={form.watch('primaryColor') || '#3B82F6'}
                  onChange={(value) => form.setValue('primaryColor', value)}
                />
                <Input
                  value={form.watch('primaryColor') || ''}
                  onChange={(e) => form.setValue('primaryColor', e.target.value)}
                  placeholder="#3B82F6"
                  className="w-28 font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Used for headers and buttons
              </p>
            </div>

            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex items-center gap-3">
                <ColorPicker
                  value={form.watch('secondaryColor') || '#8B5CF6'}
                  onChange={(value) => form.setValue('secondaryColor', value)}
                />
                <Input
                  value={form.watch('secondaryColor') || ''}
                  onChange={(e) => form.setValue('secondaryColor', e.target.value)}
                  placeholder="#8B5CF6"
                  className="w-28 font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Used for accents and highlights
              </p>
            </div>

            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex items-center gap-3">
                <ColorPicker
                  value={form.watch('accentColor') || '#F59E0B'}
                  onChange={(value) => form.setValue('accentColor', value)}
                />
                <Input
                  value={form.watch('accentColor') || ''}
                  onChange={(e) => form.setValue('accentColor', e.target.value)}
                  placeholder="#F59E0B"
                  className="w-28 font-mono"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Used for calls-to-action
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">Preview</p>
            <div className="flex flex-wrap gap-2">
              <div
                className="flex h-10 items-center justify-center rounded-md px-4 text-white"
                style={{ backgroundColor: form.watch('primaryColor') || '#3B82F6' }}
              >
                Primary Button
              </div>
              <div
                className="flex h-10 items-center justify-center rounded-md px-4 text-white"
                style={{ backgroundColor: form.watch('secondaryColor') || '#8B5CF6' }}
              >
                Secondary
              </div>
              <div
                className="flex h-10 items-center justify-center rounded-md px-4 text-white"
                style={{ backgroundColor: form.watch('accentColor') || '#F59E0B' }}
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
