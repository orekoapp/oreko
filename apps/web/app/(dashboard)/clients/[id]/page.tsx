import { notFound } from 'next/navigation';
import { ClientDetail } from '@/components/clients';
import { getClientById, getClientActivity } from '@/lib/clients/actions';

interface ClientDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ClientDetailPageProps) {
  const { id } = await params;

  try {
    const client = await getClientById(id);
    return {
      title: client.company || client.name,
    };
  } catch {
    return {
      title: 'Client Not Found',
    };
  }
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;

  try {
    const [client, activities] = await Promise.all([
      getClientById(id),
      getClientActivity(id),
    ]);

    return (
      <div className="container py-6">
        <ClientDetail client={client} activities={activities} />
      </div>
    );
  } catch {
    notFound();
  }
}
