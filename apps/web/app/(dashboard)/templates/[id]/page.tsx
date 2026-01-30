import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, Pencil, Copy, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContractEditor } from '@/components/contracts/contract-editor';
import { getContractTemplateById } from '@/lib/contracts/actions';
import { formatDate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const template = await getContractTemplateById(id);
  return {
    title: template?.name || 'Contract Template',
    description: 'View contract template details',
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const template = await getContractTemplateById(id);

  if (!template) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/templates">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">
              Created {formatDate(template.createdAt)} · Updated{' '}
              {formatDate(template.updatedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/templates/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/contracts/new?templateId=${id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Contract
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {template.variables.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Variables</CardTitle>
              <CardDescription>
                These variables can be customized when creating a contract from
                this template.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variable) => (
                  <Badge key={variable.key} variant="secondary" className="gap-1">
                    <code className="text-xs">{`{{${variable.key}}}`}</code>
                    <span className="text-muted-foreground">-</span>
                    <span>{variable.label}</span>
                    {variable.required && (
                      <span className="text-destructive">*</span>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Contract Content</CardTitle>
            <CardDescription>Preview of the contract template</CardDescription>
          </CardHeader>
          <CardContent>
            <ContractEditor
              content={template.content}
              onChange={() => {}}
              editable={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>
                {template._count.instances} contract
                {template._count.instances !== 1 ? 's' : ''} created from this
                template
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
