'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/projects';
import { createProject } from '@/lib/projects/actions';
import { getClientsForSelect } from '@/lib/clients/actions';
import type { CreateProjectInput } from '@/lib/projects/actions';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || '';

  const [isLoading, setIsLoading] = React.useState(false);
  const [clients, setClients] = React.useState<Array<{ id: string; name: string; company: string | null }>>([]);
  const [isLoadingClients, setIsLoadingClients] = React.useState(true);
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadClients() {
      try {
        const data = await getClientsForSelect();
        setClients(data);
      } catch (error) {
        toast.error('Failed to load clients');
      } finally {
        setIsLoadingClients(false);
      }
    }
    loadClients();
  }, []);

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

  if (isLoadingClients) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Project</h1>
          <p className="text-muted-foreground">Create a new project to organize your work</p>
        </div>
      </div>

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
    </div>
  );
}
