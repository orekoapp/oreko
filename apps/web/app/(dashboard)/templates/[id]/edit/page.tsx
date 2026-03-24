import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ContractTemplateForm } from '@/components/contracts/contract-template-form';
import { BackButton } from '@/components/shared/back-button';
import { getContractTemplateById } from '@/lib/contracts/actions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const template = await getContractTemplateById(id);
  return {
    title: `Edit ${template?.name || 'Contract Template'}`,
    description: 'Edit contract template',
  };
}

export default async function EditTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const template = await getContractTemplateById(id);

  if (!template) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <div className="mb-4">
          <BackButton />
        </div>

        <h1 className="text-2xl font-bold">Edit Template</h1>
        <p className="text-muted-foreground">
          Update your contract template details and content.
        </p>
      </div>

      <ContractTemplateForm template={template} />
    </div>
  );
}
