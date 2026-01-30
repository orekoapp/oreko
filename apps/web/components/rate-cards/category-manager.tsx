'use client';

import * as React from 'react';
import { Plus, GripVertical, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '@/lib/rate-cards/actions';
import type { CategoryListItem } from '@/lib/rate-cards/types';
import { toast } from 'sonner';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
];

interface CategoryManagerProps {
  categories: CategoryListItem[];
}

interface EditingCategory {
  id?: string;
  name: string;
  color: string;
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<EditingCategory | null>(
    null
  );
  const [isSaving, setIsSaving] = React.useState(false);

  const handleAddNew = () => {
    setEditingCategory({ name: '', color: PRESET_COLORS[0]! });
  };

  const handleEdit = (category: CategoryListItem) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      color: category.color || PRESET_COLORS[0]!,
    });
  };

  const handleSave = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory.id) {
        await updateCategory({
          id: editingCategory.id,
          name: editingCategory.name,
          color: editingCategory.color,
        });
        toast.success('Category updated');
      } else {
        await createCategory({
          name: editingCategory.name,
          color: editingCategory.color,
        });
        toast.success('Category created');
      }
      setEditingCategory(null);
    } catch {
      toast.error('Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteId);
      toast.success('Category deleted');
      setDeleteId(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete category'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Manage Categories
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Add/Edit Form */}
            {editingCategory && (
              <div className="rounded-lg border p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Category name"
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          name: e.target.value,
                        })
                      }
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`h-6 w-6 rounded-full ring-2 ring-offset-2 ${
                            editingCategory.color === color
                              ? 'ring-primary'
                              : 'ring-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            setEditingCategory({ ...editingCategory, color })
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCategory(null)}
                      disabled={isSaving}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      <Check className="mr-1 h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Category List */}
            <div className="space-y-2">
              {categories.length === 0 && !editingCategory && (
                <p className="py-4 text-center text-muted-foreground">
                  No categories yet
                </p>
              )}

              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                    {category.color && (
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.rateCardCount} items
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(category.id)}
                      disabled={category.rateCardCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Button */}
            {!editingCategory && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddNew}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Rate cards in this
              category will become uncategorized.
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
