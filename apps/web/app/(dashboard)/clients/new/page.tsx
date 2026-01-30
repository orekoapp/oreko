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

  const handleSubmit = async (data: CreateClientInput) => {
    setIsLoading(true);
    try {
      const result = await createClient(data);
      toast.success('Client created successfully');
      router.push(`/clients/${result.id}`);
    } catch (error) {
      toast.error('Failed to create client');
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
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

      <ClientForm onSubmit={handleSubmit} isLoading={isLoading} submitLabel="Create Client" />
    </div>
  );
}
