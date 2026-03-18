'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ContractVariable } from '@/lib/contracts/types';

interface VariableManagerProps {
  variables: ContractVariable[];
  onChange: (variables: ContractVariable[]) => void;
}

const variableTypes = [
  { value: 'text', label: 'Text' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes/No' },
] as const;

export function VariableManager({ variables, onChange }: VariableManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addVariable = () => {
    const newVariable: ContractVariable = {
      key: `variable_${variables.length + 1}`,
      label: 'New Variable',
      type: 'text',
      required: false,
    };
    onChange([...variables, newVariable]);
    setEditingIndex(variables.length);
  };

  const updateVariable = (index: number, updates: Partial<ContractVariable>) => {
    const newVariables = [...variables];
    const current = newVariables[index];
    if (current) {
      newVariables[index] = { ...current, ...updates } as ContractVariable;
    }
    onChange(newVariables);
  };

  const removeVariable = (index: number) => {
    onChange(variables.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const generateKey = (label: string): string => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variables</CardTitle>
        <CardDescription>
          Define variables that can be customized when creating contracts from this
          template. Use {'{{variableKey}}'} syntax in your content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {variables.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No variables defined yet. Add a variable to make your template dynamic.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Low #62: Use variable.key as React key instead of array index */}
            {variables.map((variable, index) => (
              <div
                key={variable.key || index}
                className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30"
              >
                <div className="cursor-move text-muted-foreground pt-2">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={variable.label}
                      onChange={(e) => {
                        const label = e.target.value;
                        updateVariable(index, {
                          label,
                          key: generateKey(label) || variable.key,
                        });
                      }}
                      placeholder="Variable label"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Key</Label>
                    <Input
                      value={variable.key}
                      onChange={(e) =>
                        updateVariable(index, { key: e.target.value })
                      }
                      placeholder="variable_key"
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select
                      value={variable.type}
                      onValueChange={(value: ContractVariable['type']) =>
                        updateVariable(index, { type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {variableTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Default Value</Label>
                    <Input
                      value={variable.defaultValue || ''}
                      onChange={(e) =>
                        updateVariable(index, { defaultValue: e.target.value })
                      }
                      placeholder="Default value"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={variable.required || false}
                      onCheckedChange={(checked) =>
                        updateVariable(index, { required: checked })
                      }
                    />
                    <Label className="text-xs">Required</Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeVariable(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button type="button" variant="outline" onClick={addVariable}>
          <Plus className="mr-2 h-4 w-4" />
          Add Variable
        </Button>
      </CardContent>
    </Card>
  );
}
