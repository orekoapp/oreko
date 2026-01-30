'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateRateCardInput, CategoryListItem } from '@/lib/rate-cards/types';

const rateCardFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  pricingType: z.enum(['fixed', 'hourly', 'daily', 'weekly', 'monthly', 'per_unit']).default('fixed'),
  rate: z.coerce.number().min(0, 'Rate must be positive'),
  unit: z.string().max(50).optional(),
  categoryId: z.string().optional(),
  taxRateId: z.string().optional(),
  isActive: z.boolean().default(true),
});

type RateCardFormValues = z.infer<typeof rateCardFormSchema>;

interface TaxRate {
  id: string;
  name: string;
  rate: number;
}

interface RateCardFormProps {
  defaultValues?: Partial<RateCardFormValues>;
  categories: CategoryListItem[];
  taxRates: TaxRate[];
  onSubmit: (data: CreateRateCardInput) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const PRICING_TYPES = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'daily', label: 'Daily Rate' },
  { value: 'weekly', label: 'Weekly Rate' },
  { value: 'monthly', label: 'Monthly Rate' },
  { value: 'per_unit', label: 'Per Unit' },
];

const UNIT_SUGGESTIONS = [
  'hour',
  'day',
  'week',
  'month',
  'each',
  'page',
  'word',
  'project',
  'session',
];

export function RateCardForm({
  defaultValues,
  categories,
  taxRates,
  onSubmit,
  isLoading = false,
  submitLabel = 'Create Rate Card',
}: RateCardFormProps) {
  const form = useForm<RateCardFormValues>({
    resolver: zodResolver(rateCardFormSchema),
    defaultValues: {
      name: '',
      description: '',
      pricingType: 'fixed',
      rate: 0,
      unit: '',
      categoryId: '',
      taxRateId: '',
      isActive: true,
      ...defaultValues,
    },
  });

  const pricingType = form.watch('pricingType');

  const handleSubmit = async (data: RateCardFormValues) => {
    await onSubmit({
      name: data.name,
      description: data.description || undefined,
      pricingType: data.pricingType as CreateRateCardInput['pricingType'],
      rate: data.rate,
      unit: data.unit || undefined,
      categoryId: data.categoryId || undefined,
      taxRateId: data.taxRateId || undefined,
      isActive: data.isActive,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="e.g., Web Design Consultation"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Describe what this rate card covers..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              value={form.watch('categoryId') || ''}
              onValueChange={(value) => form.setValue('categoryId', value || '')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.color && (
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pricingType">Pricing Type *</Label>
              <Select
                value={form.watch('pricingType')}
                onValueChange={(value) =>
                  form.setValue('pricingType', value as RateCardFormValues['pricingType'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('rate')}
                  className="pl-7"
                  placeholder="0.00"
                />
              </div>
              {form.formState.errors.rate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.rate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <div className="space-y-2">
                <Input
                  id="unit"
                  {...form.register('unit')}
                  placeholder={
                    pricingType === 'hourly'
                      ? 'hour'
                      : pricingType === 'daily'
                        ? 'day'
                        : 'each'
                  }
                />
                <div className="flex flex-wrap gap-1">
                  {UNIT_SUGGESTIONS.map((unit) => (
                    <Button
                      key={unit}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => form.setValue('unit', unit)}
                    >
                      {unit}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRateId">Tax Rate</Label>
              <Select
                value={form.watch('taxRateId') || ''}
                onValueChange={(value) => form.setValue('taxRateId', value || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tax rate (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Tax</SelectItem>
                  {taxRates.map((taxRate) => (
                    <SelectItem key={taxRate.id} value={taxRate.id}>
                      {taxRate.name} ({taxRate.rate}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active</Label>
              <p className="text-sm text-muted-foreground">
                Active rate cards can be added to quotes
              </p>
            </div>
            <Switch
              id="isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
