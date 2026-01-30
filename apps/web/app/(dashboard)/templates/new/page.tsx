import { ContractTemplateForm } from '@/components/contracts/contract-template-form';

export const metadata = {
  title: 'New Contract Template',
  description: 'Create a new contract template',
};

export default function NewTemplatePage() {
  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Contract Template</h1>
        <p className="text-muted-foreground">
          Create a reusable contract template for your clients.
        </p>
      </div>

      <ContractTemplateForm />
    </div>
  );
}
