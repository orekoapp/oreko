import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClientById } from '@/lib/clients/actions';
import { EditClientFormWrapper } from './edit-client-form-wrapper';
import { BackButton } from '@/components/shared/back-button';

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;

  const client = await getClientById(id).catch(() => null);

  if (!client) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold">Edit Client</h1>
          <p className="text-muted-foreground">{client.company || client.name}</p>
        </div>
      </div>

      <EditClientFormWrapper client={client} />
    </div>
  );
}
