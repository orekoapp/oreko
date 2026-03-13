'use client';

import * as React from 'react';
import { Plus, Pencil, Trash2, X, Check, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  createCustomField,
  updateCustomField,
  deleteCustomField,
} from '@/lib/settings/actions';
import type {
  CustomFieldData,
  CustomFieldType,
  CustomFieldEntity,
} from '@/lib/settings/types';
import {
  CUSTOM_FIELD_TYPE_LABELS,
  CUSTOM_FIELD_ENTITY_LABELS,
} from '@/lib/settings/types';
import { toast } from 'sonner';

interface CustomFieldsManagerProps {
  initialData: CustomFieldData[];
}

interface EditingField {
  id?: string;
  name: string;
  fieldType: CustomFieldType;
  appliesTo: CustomFieldEntity[];
  isRequired: boolean;
  isActive: boolean;
  options: string[];
  newOption: string;
}

const ALL_FIELD_TYPES = Object.keys(CUSTOM_FIELD_TYPE_LABELS) as CustomFieldType[];
const ALL_ENTITIES = Object.keys(CUSTOM_FIELD_ENTITY_LABELS) as CustomFieldEntity[];

const hasOptions = (type: CustomFieldType) => type === 'dropdown' || type === 'multiselect';

export function CustomFieldsManager({ initialData }: CustomFieldsManagerProps) {
  const [fields, setFields] = React.useState<CustomFieldData[]>(initialData);
  const [editingField, setEditingField] = React.useState<EditingField | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleAddNew = () => {
    setEditingField({
      name: '',
      fieldType: 'text',
      appliesTo: [],
      isRequired: false,
      isActive: true,
      options: [],
      newOption: '',
    });
  };

  const handleEdit = (field: CustomFieldData) => {
    setEditingField({
      id: field.id,
      name: field.name,
      fieldType: field.fieldType,
      appliesTo: [...field.appliesTo],
      isRequired: field.isRequired,
      isActive: field.isActive,
      options: [...field.options],
      newOption: '',
    });
  };

  const handleToggleEntity = (entity: CustomFieldEntity) => {
    if (!editingField) return;
    const current = editingField.appliesTo;
    setEditingField({
      ...editingField,
      appliesTo: current.includes(entity)
        ? current.filter((e) => e !== entity)
        : [...current, entity],
    });
  };

  const handleAddOption = () => {
    if (!editingField || !editingField.newOption.trim()) return;
    if (editingField.options.includes(editingField.newOption.trim())) {
      toast.error('Option already exists');
      return;
    }
    setEditingField({
      ...editingField,
      options: [...editingField.options, editingField.newOption.trim()],
      newOption: '',
    });
  };

  const handleRemoveOption = (index: number) => {
    if (!editingField) return;
    setEditingField({
      ...editingField,
      options: editingField.options.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (!editingField) return;

    if (!editingField.name.trim()) {
      toast.error('Field name is required');
      return;
    }

    if (editingField.appliesTo.length === 0) {
      toast.error('Select at least one entity');
      return;
    }

    if (hasOptions(editingField.fieldType) && editingField.options.length < 2) {
      toast.error('Add at least 2 options for dropdown/multi-select fields');
      return;
    }

    setIsSaving(true);
    try {
      const input = {
        name: editingField.name.trim(),
        fieldType: editingField.fieldType,
        appliesTo: editingField.appliesTo,
        isRequired: editingField.isRequired,
        isActive: editingField.isActive,
        options: hasOptions(editingField.fieldType) ? editingField.options : [],
      };

      if (editingField.id) {
        await updateCustomField({ ...input, id: editingField.id });
        setFields((prev) =>
          prev.map((f) =>
            f.id === editingField.id
              ? { ...f, ...input, updatedAt: new Date() }
              : f
          )
        );
        toast.success('Custom field updated');
      } else {
        const result = await createCustomField(input);
        setFields((prev) => [
          ...prev,
          {
            id: result.id,
            ...input,
            sortOrder: prev.length,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        toast.success('Custom field created');
      }

      setEditingField(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save custom field');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteCustomField(deleteId);
      setFields((prev) => prev.filter((f) => f.id !== deleteId));
      toast.success('Custom field deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete custom field');
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
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Define custom fields for your quotes, invoices, clients, and projects.
              </CardDescription>
            </div>
            {!editingField && (
              <Button onClick={handleAddNew} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Form */}
          {editingField && (
            <div className="mb-6 rounded-lg border p-4">
              <div className="mb-4 text-sm font-medium">
                {editingField.id ? 'Edit Custom Field' : 'New Custom Field'}
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="field-name">Field Name *</Label>
                    <Input
                      id="field-name"
                      value={editingField.name}
                      onChange={(e) =>
                        setEditingField({ ...editingField, name: e.target.value })
                      }
                      placeholder="e.g., PO Number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-type">Field Type *</Label>
                    <Select
                      value={editingField.fieldType}
                      onValueChange={(value: CustomFieldType) =>
                        setEditingField({ ...editingField, fieldType: value })
                      }
                    >
                      <SelectTrigger id="field-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_FIELD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {CUSTOM_FIELD_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Applies To */}
                <div className="space-y-2">
                  <Label>Applies To *</Label>
                  <div className="flex flex-wrap gap-4">
                    {ALL_ENTITIES.map((entity) => (
                      <div key={entity} className="flex items-center gap-2">
                        <Checkbox
                          id={`entity-${entity}`}
                          checked={editingField.appliesTo.includes(entity)}
                          onCheckedChange={() => handleToggleEntity(entity)}
                        />
                        <Label
                          htmlFor={`entity-${entity}`}
                          className="cursor-pointer text-sm font-normal"
                        >
                          {CUSTOM_FIELD_ENTITY_LABELS[entity]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Options editor for dropdown/multiselect */}
                {hasOptions(editingField.fieldType) && (
                  <div className="space-y-2">
                    <Label>Options *</Label>
                    <div className="space-y-2">
                      {editingField.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 rounded-md border px-3 py-2 text-sm">
                            {option}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveOption(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          value={editingField.newOption}
                          onChange={(e) =>
                            setEditingField({ ...editingField, newOption: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddOption();
                            }
                          }}
                          placeholder="Add an option..."
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddOption}
                          disabled={!editingField.newOption.trim()}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="isRequired"
                      checked={editingField.isRequired}
                      onCheckedChange={(checked) =>
                        setEditingField({ ...editingField, isRequired: checked })
                      }
                    />
                    <Label htmlFor="isRequired" className="cursor-pointer">
                      Required
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={editingField.isActive}
                      onCheckedChange={(checked) =>
                        setEditingField({ ...editingField, isActive: checked })
                      }
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Active
                    </Label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setEditingField(null)}
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

          {/* Fields List */}
          {fields.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No custom fields configured. Add one to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    !field.isActive ? 'opacity-60' : ''
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{field.name}</span>
                      <Badge variant="secondary">
                        {CUSTOM_FIELD_TYPE_LABELS[field.fieldType]}
                      </Badge>
                      {field.isRequired && (
                        <Badge variant="default">Required</Badge>
                      )}
                      {!field.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {field.appliesTo.map((entity) => (
                        <Badge key={entity} variant="outline" className="text-xs">
                          {CUSTOM_FIELD_ENTITY_LABELS[entity]}
                        </Badge>
                      ))}
                      {hasOptions(field.fieldType) && field.options.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          {field.options.length} option{field.options.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(field)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(field.id)}
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
            <AlertDialogTitle>Delete Custom Field</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom field? Any data stored in this
              field on existing records will be lost. This action cannot be undone.
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
