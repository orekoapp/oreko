'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  createEmailTemplate,
  updateEmailTemplate,
} from '@/lib/email/actions';
import {
  EMAIL_TEMPLATE_TYPES,
  getTemplateTypeName,
  DEFAULT_TEMPLATES,
} from '@/lib/email/types';
import type { EmailTemplateDetail, EmailTemplateType } from '@/lib/email/types';

const emailTemplateSchema = z.object({
  type: z.enum(EMAIL_TEMPLATE_TYPES as unknown as [string, ...string[]]),
  name: z.string().min(1, 'Name is required').max(100),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  isActive: z.boolean(),
  isDefault: z.boolean(),
});

type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;

interface EmailTemplateFormProps {
  template?: EmailTemplateDetail | null;
}

export function EmailTemplateForm({ template }: EmailTemplateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [previewOpen, setPreviewOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmailTemplateFormData>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      type: (template?.type as EmailTemplateType) || 'quote_sent',
      name: template?.name || '',
      subject: template?.subject || '',
      body: template?.body || '',
      isActive: template?.isActive ?? true,
      isDefault: template?.isDefault ?? false,
    },
  });

  const selectedType = watch('type') as EmailTemplateType;
  const body = watch('body');
  const subject = watch('subject');

  const loadDefaultTemplate = () => {
    const defaultTemplate = DEFAULT_TEMPLATES[selectedType];
    if (defaultTemplate) {
      setValue('name', defaultTemplate.name);
      setValue('subject', defaultTemplate.subject);
      setValue('body', defaultTemplate.body);
    }
  };

  const onSubmit = (data: EmailTemplateFormData) => {
    startTransition(async () => {
      try {
        if (template) {
          await updateEmailTemplate({
            id: template.id,
            ...data,
            type: data.type as EmailTemplateType,
          });
        } else {
          await createEmailTemplate({
            ...data,
            type: data.type as EmailTemplateType,
          });
        }
        router.push('/settings/emails');
        router.refresh();
      } catch (error) {
        console.error('Failed to save template:', error);
      }
    });
  };

  // Sample preview data
  const previewHtml = body
    .replace(/{{businessName}}/g, 'Acme Corp')
    .replace(/{{clientName}}/g, 'John Smith')
    .replace(/{{clientEmail}}/g, 'john@example.com')
    .replace(/{{quoteName}}/g, 'Website Redesign')
    .replace(/{{quoteNumber}}/g, 'QT-0001')
    .replace(/{{quoteUrl}}/g, '#')
    .replace(/{{quoteTotal}}/g, '$5,000.00')
    .replace(/{{quoteValidUntil}}/g, '2024-12-31')
    .replace(/{{invoiceNumber}}/g, 'INV-0001')
    .replace(/{{invoiceUrl}}/g, '#')
    .replace(/{{invoiceTotal}}/g, '$5,000.00')
    .replace(/{{invoiceDueDate}}/g, '2024-12-31')
    .replace(/{{amountPaid}}/g, '$5,000.00')
    .replace(/{{amountDue}}/g, '$5,000.00')
    .replace(/{{daysOverdue}}/g, '7')
    .replace(/{{contractName}}/g, 'Service Agreement')
    .replace(/{{contractUrl}}/g, '#')
    .replace(/{{message}}/g, 'Looking forward to working with you!')
    .replace(/{{#if\s+\w+}}([\s\S]*?){{\/if}}/g, '$1');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{template ? 'Edit Template' : 'Create Template'}</CardTitle>
          <CardDescription>
            Customize email templates sent to your clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Template Type</Label>
              <Select
                value={selectedType}
                onValueChange={(value) =>
                  setValue('type', value as EmailTemplateType)
                }
                disabled={!!template}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_TEMPLATE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getTemplateTypeName(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Quote Sent - Custom"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
          </div>

          {!template && (
            <Button type="button" variant="outline" onClick={loadDefaultTemplate}>
              Load Default Template
            </Button>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="e.g., Quote: {{quoteName}} from {{businessName}}"
            />
            {errors.subject && (
              <p className="text-sm text-destructive">{errors.subject.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use variables like {'{{clientName}}'}, {'{{quoteName}}'}, etc.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="body">Email Body (HTML)</Label>
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Email Preview</DialogTitle>
                    <DialogDescription>
                      Preview with sample data
                    </DialogDescription>
                  </DialogHeader>
                  <div className="border rounded-lg p-4 bg-card">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Subject:</strong> {subject
                        .replace(/{{businessName}}/g, 'Acme Corp')
                        .replace(/{{quoteName}}/g, 'Website Redesign')
                        .replace(/{{quoteTotal}}/g, '$5,000.00')
                        .replace(/{{invoiceNumber}}/g, 'INV-0001')
                        .replace(/{{contractName}}/g, 'Service Agreement')
                        .replace(/{{daysOverdue}}/g, '7')}
                    </p>
                    <hr className="my-2" />
                    <div
                      dangerouslySetInnerHTML={{ __html: previewHtml }}
                      className="prose prose-sm max-w-none"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Textarea
              id="body"
              {...register('body')}
              rows={12}
              className="font-mono text-sm"
              placeholder="<p>Hi {{clientName}},</p>..."
            />
            {errors.body && (
              <p className="text-sm text-destructive">{errors.body.message}</p>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Available Variables:</p>
            <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
              <code>{'{{businessName}}'}</code>
              <code>{'{{clientName}}'}</code>
              <code>{'{{clientEmail}}'}</code>
              <code>{'{{quoteName}}'}</code>
              <code>{'{{quoteNumber}}'}</code>
              <code>{'{{quoteUrl}}'}</code>
              <code>{'{{quoteTotal}}'}</code>
              <code>{'{{quoteValidUntil}}'}</code>
              <code>{'{{invoiceNumber}}'}</code>
              <code>{'{{invoiceUrl}}'}</code>
              <code>{'{{invoiceTotal}}'}</code>
              <code>{'{{invoiceDueDate}}'}</code>
              <code>{'{{amountPaid}}'}</code>
              <code>{'{{amountDue}}'}</code>
              <code>{'{{daysOverdue}}'}</code>
              <code>{'{{contractName}}'}</code>
              <code>{'{{contractUrl}}'}</code>
              <code>{'{{message}}'}</code>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Conditional: {'{{#if message}}...{{/if}}'}
            </p>
          </div>

          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isDefault"
                checked={watch('isDefault')}
                onCheckedChange={(checked) => setValue('isDefault', checked)}
              />
              <Label htmlFor="isDefault">Default for this type</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/settings/emails')}
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
