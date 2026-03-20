import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/projects';
import {
  getProject,
  getProjectStats,
  getProjectActivity,
  getProjectNotes,
  getProjectContracts,
} from '@/lib/projects/actions';
import { getWorkspaceCurrency } from '@/lib/settings/actions';

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { id } = await params;

  try {
    const project = await getProject(id);
    return {
      title: project.name,
    };
  } catch {
    return {
      title: 'Project Not Found',
    };
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  // Bug #189: Validate UUID format before querying database
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }

  try {
    const [project, stats, activity, notes, contracts, currency] = await Promise.all([
      getProject(id),
      getProjectStats(id),
      getProjectActivity(id),
      getProjectNotes(id),
      getProjectContracts(id),
      getWorkspaceCurrency(),
    ]);

    return (
      <ProjectDetail
        project={project}
        stats={stats}
        activity={activity}
        notes={notes}
        contracts={contracts}
        currency={currency}
      />
    );
  } catch {
    notFound();
  }
}
