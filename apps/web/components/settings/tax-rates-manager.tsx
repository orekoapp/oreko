'use client';

import * as React from 'react';
import { Plus, Pencil, Trash2, Star, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  createTaxRate,
  updateTaxRate,
  deleteTaxRate,
} from '@/lib/settings/actions';
import type { TaxRateData, CreateTaxRateInput } from '@/lib/settings/types';
import { toast } from 'sonner';

interface TaxRatesManagerProps {
  initialData: TaxRateData[];
}

interface EditingTaxRate {
  id?: string;
  name: string;
  rate: string;
  description: string;
  isInclusive: boolean;
  isDefault: boolean;
  isActive: boolean;
}

export function TaxRatesManager({ initialData }: TaxRatesManagerProps) {
  const [taxRates, setTaxRates] = React.useState<TaxRateData[]>(initialData);
  const [editingRate, setEditingRate] = React.useState<EditingTaxRate | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleAddNew = () => {
    setEditingRate({
      name: '',
      rate: '',
      description: '',
      isInclusive: false,
      isDefault: false,
      isActive: true,
    });
  };

  const handleEdit = (taxRate: TaxRateData) => {
    setEditingRate({
      id: taxRate.id,
      name: taxRate.name,
      rate: taxRate.rate.toString(),
      description: taxRate.description || '',
      isInclusive: taxRate.isInclusive,
      isDefault: taxRate.isDefault,
      isActive: taxRate.isActive,
    });
  };

  const handleSave = async () => {
    if (!editingRate) return;

    if (!editingRate.name.trim()) {
      toast.error('Name is required');
      return;
    }

    const rate = parseFloat(editingRate.rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Rate must be between 0 and 100');
      return;
    }

    setIsSaving(true);
    try {
      const input: CreateTaxRateInput = {
        name: editingRate.name,
        rate,
        description: editingRate.description || undefined,
        isInclusive: editingRate.isInclusive,
        isDefault: editingRate.isDefault,
        isActive: editingRate.isActive,
      };

      if (editingRate.id) {
        await updateTaxRate({ ...input, id: editingRate.id });
        setTaxRates((prev) =>
          prev.map((tr) =>
            tr.id === editingRate.id
              ? {
                  ...tr,
                  ...input,
                  rate,
                  updatedAt: new Date(),
                }
              : editingRate.isDefault
                ? { ...tr, isDefault: false }
                : tr
          )
        );
        toast.success('Tax rate updated');
      } else {
        const result = await createTaxRate(input);
        setTaxRates((prev) => [
          ...prev.map((tr) =>
            editingRate.isDefault ? { ...tr, isDefault: false } : tr
          ),
          {
            id: result.id,
            ...input,
            rate,
            description: input.description || null,
            isInclusive: input.isInclusive || false,
            isDefault: input.isDefault || false,
            isActive: input.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        toast.success('Tax rate created');
      }

      setEditingRate(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save tax rate');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteTaxRate(deleteId);
      setTaxRates((prev) => prev.filter((tr) => tr.id !== deleteId));
      toast.success('Tax rate deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete tax rate');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tax Rates</CardTitle>
              <CardDescription>
                Configure tax rates for your quotes and invoices.
              </CardDescription>
            </div>
            {!editingRate && (
              <Button onClick={handleAddNew} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Tax Rate
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Form */}
          {editingRate && (
            <div className="mb-6 rounded-lg border p-4">
              <div className="mb-4 text-sm font-medium">
                {editingRate.id ? 'Edit Tax Rate' : 'New Tax Rate'}
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={editingRate.name}
                      onChange={(e) =>
                        setEditingRate({ ...editingRate, name: e.target.value })
                      }
                      placeholder="e.g., Sales Tax"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">Rate (%) *</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={editingRate.rate}
                      onChange={(e) =>
                        setEditingRate({ ...editingRate, rate: e.target.value })
                      }
                      placeholder="e.g., 8.25"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editingRate.description}
                    onChange={(e) =>
                      setEditingRate({ ...editingRate, description: e.target.value })
                    }
                    placeholder="Optional description"
                  />
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isInclusive"
                      checked={editingRate.isInclusive}
                      onCheckedChange={(checked) =>
                        setEditingRate({ ...editingRate, isInclusive: checked })
                      }
                    />
                    <Label htmlFor="isInclusive" className="cursor-pointer">
                      Tax Inclusive
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="isDefault"
                      checked={editingRate.isDefault}
                      onCheckedChange={(checked) =>
                        setEditingRate({ ...editingRate, isDefault: checked })
                      }
                    />
                    <Label htmlFor="isDefault" className="cursor-pointer">
                      Default Rate
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={editingRate.isActive}
                      onCheckedChange={(checked) =>
                        setEditingRate({ ...editingRate, isActive: checked })
                      }
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Active
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setEditingRate(null)}
                    disabled={isSaving}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Check className="mr-1 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tax Rates List */}
          {taxRates.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No tax rates configured
            </p>
          ) : (
            <div className="space-y-2">
              {taxRates.map((taxRate) => (
                <div
                  key={taxRate.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    !taxRate.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{taxRate.name}</span>
                      <span className="text-lg font-semibold text-primary">
                        {taxRate.rate}%
                      </span>
                      {taxRate.isDefault && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                      {taxRate.isInclusive && (
                        <Badge variant="secondary">Inclusive</Badge>
                      )}
                      {!taxRate.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    {taxRate.description && (
                      <p className="text-sm text-muted-foreground">
                        {taxRate.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(taxRate)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(taxRate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Rate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tax rate? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
