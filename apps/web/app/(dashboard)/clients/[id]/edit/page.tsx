import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClientById } from '@/lib/clients/actions';
import { EditClientFormWrapper } from './edit-client-form-wrapper';

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
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/clients/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Client</h1>
          <p className="text-muted-foreground">{client.company || client.name}</p>
        </div>
      </div>

      <EditClientFormWrapper client={client} />
    </div>
  );
}
