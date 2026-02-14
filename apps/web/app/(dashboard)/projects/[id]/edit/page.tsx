'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/projects';
import { getProject, updateProject } from '@/lib/projects/actions';
import { getClientsForSelect } from '@/lib/clients/actions';
import type { UpdateProjectInput } from '@/lib/projects/actions';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { notFound } from 'next/navigation';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = React.useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [clients, setClients] = React.useState<Array<{ id: string; name: string; company: string | null }>>([]);
  const [project, setProject] = React.useState<{ name: string; description: string | null; clientId: string } | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const resolvedParams = await params;
        setResolvedParams(resolvedParams);

        const [clientsData, projectData] = await Promise.all([
          getClientsForSelect(),
          getProject(resolvedParams.id),
        ]);

        setClients(clientsData);
        setProject({
          name: projectData.name,
          description: projectData.description,
          clientId: projectData.client.id,
        });
      } catch (error) {
        toast.error('Failed to load project');
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [params]);

  const handleSubmit = async (data: { name: string; description?: string; clientId: string }) => {
    if (!resolvedParams) return;

    setIsLoading(true);
    setServerError(null);
    try {
      await updateProject(resolvedParams.id, {
        name: data.name,
        description: data.description || null,
      });
      toast.success('Project updated successfully');
      router.push(`/projects/${resolvedParams.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
      setServerError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
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

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={resolvedParams ? `/projects/${resolvedParams.id}` : '/projects'}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">Update project details</p>
        </div>
      </div>

      {serverError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <ProjectForm
        clients={clients}
        defaultValues={{
          name: project.name,
          description: project.description || '',
          clientId: project.clientId,
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Save Changes"
      />
    </div>
  );
}
