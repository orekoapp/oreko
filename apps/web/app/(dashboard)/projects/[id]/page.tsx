import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/projects';
import { getProject, getProjectStats } from '@/lib/projects/actions';

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
    const [project, stats] = await Promise.all([
      getProject(id),
      getProjectStats(id),
    ]);

    return <ProjectDetail project={project} stats={stats} />;
  } catch {
    notFound();
  }
}
