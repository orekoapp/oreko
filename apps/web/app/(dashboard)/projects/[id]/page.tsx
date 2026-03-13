import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/projects';
import {
  getProject,
  getProjectStats,
  getProjectActivity,
  getProjectNotes,
  getProjectContracts,
} from '@/lib/projects/actions';

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

  try {
    const [project, stats, activity, notes, contracts] = await Promise.all([
      getProject(id),
      getProjectStats(id),
      getProjectActivity(id),
      getProjectNotes(id),
      getProjectContracts(id),
    ]);

    return (
      <ProjectDetail
        project={project}
        stats={stats}
        activity={activity}
        notes={notes}
        contracts={contracts}
      />
    );
  } catch {
    notFound();
  }
}
