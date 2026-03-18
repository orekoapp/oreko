'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ClientForm } from '@/components/clients';
import { updateClient } from '@/lib/clients/actions';
import type { CreateClientInput } from '@/lib/validations/client';
import type { ClientDetail } from '@/lib/clients/types';
import { toast } from 'sonner';

interface EditClientFormWrapperProps {
  client: ClientDetail;
}

export function EditClientFormWrapper({ client }: EditClientFormWrapperProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const handleSubmit = async (data: CreateClientInput) => {
    setIsSaving(true);
    setServerError(null);
    // Low #77: Use finally to always reset isSaving
    try {
      await updateClient({ ...data, id: client.id });
      toast.success('Client updated successfully');
      router.push(`/clients/${client.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update client';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {serverError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {serverError}
        </div>
      )}

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
    </>
  );
}
