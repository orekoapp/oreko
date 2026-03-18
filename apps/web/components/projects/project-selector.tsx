'use client';

import * as React from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getClientProjects } from '@/lib/projects/actions';
import type { ProjectListItem } from '@/lib/projects/types';
import Link from 'next/link';
import { toast } from 'sonner';

interface ProjectSelectorProps {
  clientId: string | null;
  value: string | null;
  onChange: (projectId: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ProjectSelector({
  clientId,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select project (optional)',
}: ProjectSelectorProps) {
  const [projects, setProjects] = React.useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Low #25: Cancel stale requests on rapid clientId changes
  React.useEffect(() => {
    if (!clientId) {
      setProjects([]);
      return;
    }

    let cancelled = false;

    async function loadProjects() {
      if (!clientId) return;
      setIsLoading(true);
      try {
        const data = await getClientProjects(clientId);
        if (!cancelled) setProjects(data);
      } catch {
        if (!cancelled) {
          setProjects([]);
          toast.error('Failed to load projects');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProjects();
    return () => { cancelled = true; };
  }, [clientId]);

  if (!clientId) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground"
        disabled
      >
        <FolderKanban className="mr-2 h-4 w-4" />
        Select a client first
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Select
        value={value || '__none__'}
        onValueChange={(val) => onChange(val === '__none__' ? null : val)}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            <SelectValue placeholder={isLoading ? 'Loading projects...' : placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">
            <span className="text-muted-foreground">No project</span>
          </SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex flex-col">
                <span>{project.name}</span>
                {project.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {project.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {projects.length === 0 && !isLoading && (
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/projects/new?clientId=${clientId}`}>
            <Plus className="mr-2 h-4 w-4" />
            Create new project
          </Link>
        </Button>
      )}
    </div>
  );
}
