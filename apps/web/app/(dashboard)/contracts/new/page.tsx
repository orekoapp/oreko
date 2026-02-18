import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateContractForm } from '@/components/contracts/create-contract-form';
import { getContractTemplates } from '@/lib/contracts/actions';
import { getClientsForSelect } from '@/lib/clients/actions';
import { getQuotes } from '@/lib/quotes/actions';

export const metadata = {
  title: 'New Contract',
  description: 'Create a new contract for a client',
};

interface PageProps {
  searchParams: Promise<{
    templateId?: string;
    clientId?: string;
    quoteId?: string;
  }>;
}

export default async function NewContractPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [templatesResult, clientsResult, quotesResult] = await Promise.all([
    getContractTemplates({ isTemplate: true, limit: 100 }),
    getClientsForSelect(),
    getQuotes({ limit: 100 }),
  ]);

  return (
    <div className="container max-w-2xl py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/contracts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contracts
          </Link>
        </Button>

        <h1 className="text-2xl font-bold">New Contract</h1>
        <p className="text-muted-foreground">
          Create a new contract from a template for your client.
        </p>
      </div>

      <CreateContractForm
        templates={templatesResult.data}
        clients={clientsResult.map((c) => ({
          id: c.id,
          name: c.name,
          company: c.company,
        }))}
        quotes={quotesResult.quotes.map((q: { id: string; title: string }) => ({
          id: q.id,
          title: q.title,
        }))}
        preselectedTemplateId={params.templateId}
        preselectedClientId={params.clientId}
        preselectedQuoteId={params.quoteId}
      />
    </div>
  );
}
