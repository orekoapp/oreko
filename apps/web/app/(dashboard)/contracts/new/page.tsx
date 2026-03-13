import NewContractForm from '@/components/contracts/new-contract-form';
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
    <NewContractForm
      templates={templatesResult.data}
      clients={clientsResult.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company,
      }))}
      quotes={quotesResult.quotes.map((q: { id: string; title: string }) => ({
        id: q.id,
        title: q.title,
      }))}
      preselectedTemplateId={params.templateId}
      preselectedClientId={params.clientId}
    />
  );
}
