'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ContractEditor } from './contract-editor';
import { VariableManager } from './variable-manager';
import {
  createContractTemplate,
  updateContractTemplate,
} from '@/lib/contracts/actions';
import type {
  ContractTemplateDetail,
  ContractVariable,
} from '@/lib/contracts/types';

const contractTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  content: z.string().min(1, 'Content is required'),
});

type ContractTemplateFormData = z.infer<typeof contractTemplateSchema>;

interface ContractTemplateFormProps {
  template?: ContractTemplateDetail | null;
}

export function ContractTemplateForm({ template }: ContractTemplateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [variables, setVariables] = useState<ContractVariable[]>(
    template?.variables || []
  );
  const [content, setContent] = useState(template?.content || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContractTemplateFormData>({
    resolver: zodResolver(contractTemplateSchema),
    defaultValues: {
      name: template?.name || '',
      content: template?.content || '',
    },
  });

  const onSubmit = (data: ContractTemplateFormData) => {
    startTransition(async () => {
      try {
        if (template) {
          await updateContractTemplate({
            id: template.id,
            name: data.name,
            content,
            variables,
          });
        } else {
          await createContractTemplate({
            name: data.name,
            content,
            isTemplate: true,
            variables,
          });
        }
        router.push('/templates');
        router.refresh();
      } catch (error) {
        console.error('Failed to save template:', error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{template ? 'Edit Template' : 'Create Template'}</CardTitle>
          <CardDescription>
            {template
              ? 'Update your contract template details and content.'
              : 'Create a new contract template that can be used for multiple clients.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Standard Service Agreement"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <VariableManager variables={variables} onChange={setVariables} />

      <Card>
        <CardHeader>
          <CardTitle>Contract Content</CardTitle>
          <CardDescription>
            Write your contract content. Use {'{{variableKey}}'} syntax to insert
            variables that will be replaced when creating contracts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContractEditor
            content={content}
            onChange={setContent}
            variables={variables}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/templates')}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}
