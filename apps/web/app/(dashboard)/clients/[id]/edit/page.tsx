'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientForm } from '@/components/clients';
import { getClientById, updateClient } from '@/lib/clients/actions';
import type { CreateClientInput } from '@/lib/validations/client';
import type { ClientDetail } from '@/lib/clients/types';
import { toast } from 'sonner';

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = React.useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    async function loadClient() {
      try {
        const data = await getClientById(clientId);
        setClient(data);
      } catch {
        toast.error('Failed to load client');
        router.push('/clients');
      } finally {
        setIsLoading(false);
      }
    }
    loadClient();
  }, [clientId, router]);

  const handleSubmit = async (data: CreateClientInput) => {
    setIsSaving(true);
    try {
      await updateClient({ ...data, id: clientId });
      toast.success('Client updated successfully');
      router.push(`/clients/${clientId}`);
    } catch {
      toast.error('Failed to update client');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-6">
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/clients/${clientId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Client</h1>
          <p className="text-muted-foreground">{client.company || client.name}</p>
        </div>
      </div>

      <ClientForm
        defaultValues={{
          type: client.type as 'individual' | 'company',
          name: client.name,
          email: client.email,
          phone: client.phone || '',
          website: client.website || '',
          company: client.company || '',
          taxId: client.taxId || '',
          address: client.address || undefined,
          notes: client.notes || '',
          tags: client.tags,
          contacts: client.contacts,
        }}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitLabel="Save Changes"
      />
    </div>
  );
}
