import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectsDataTable } from '@/components/projects';
import { getProjects } from '@/lib/projects/actions';

interface ProjectsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export const metadata = {
  title: 'Projects',
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Organize your work by client projects</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ListLoading />}>
        <ProjectListWrapper />
      </Suspense>
    </div>
  );
}

async function ProjectListWrapper() {
  // Fetch all projects (active + inactive) — the DataTable handles status filtering client-side
  const [activeResult, inactiveResult] = await Promise.all([
    getProjects({ isActive: true, pageSize: 200 }),
    getProjects({ isActive: false, pageSize: 200 }),
  ]);
  const allProjects = [...activeResult.projects, ...inactiveResult.projects];
  return <ProjectsDataTable data={allProjects as any} />;
}

function ListLoading() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
