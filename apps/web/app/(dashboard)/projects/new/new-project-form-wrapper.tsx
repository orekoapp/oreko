'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/projects';
import { createProject } from '@/lib/projects/actions';
import type { CreateProjectInput } from '@/lib/projects/actions';
import { toast } from 'sonner';

interface NewProjectFormWrapperProps {
  clients: Array<{ id: string; name: string; company: string | null }>;
}

export function NewProjectFormWrapper({ clients }: NewProjectFormWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || '';

  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const handleSubmit = async (data: CreateProjectInput) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const result = await createProject(data);
      toast.success('Project created successfully');
      router.push(`/projects/${result.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
      setServerError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <>
      {serverError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {clients.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">No clients found. Please create a client first.</p>
          <Button asChild className="mt-4">
            <Link href="/clients/new">Create Client</Link>
          </Button>
        </div>
      ) : (
        <ProjectForm
          clients={clients}
          defaultValues={{ clientId }}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Create Project"
        />
      )}
    </>
  );
}
