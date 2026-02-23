'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientForm } from '@/components/clients';
import { createClient } from '@/lib/clients/actions';
import type { CreateClientInput } from '@/lib/validations/client';
import { toast } from 'sonner';

export default function NewClientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const handleSubmit = async (data: CreateClientInput) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const result = await createClient(data);
      toast.success('Client created successfully');
      router.push(`/clients/${result.id}`);
    } catch (error) {
      let errorMessage = 'Failed to create client';
      if (error instanceof Error) {
        // Server action errors may be sanitized; check for demo mode keywords
        if (error.message.includes('demo') || error.message.includes('Demo')) {
          errorMessage = 'This action is not available in demo mode. Create an account to save your changes.';
        } else {
          errorMessage = error.message;
        }
      }
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Client</h1>
          <p className="text-muted-foreground">Create a new client profile</p>
        </div>
      </div>

      {serverError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <ClientForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create Client" />
    </div>
  );
}
