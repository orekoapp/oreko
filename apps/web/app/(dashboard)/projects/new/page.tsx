import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClientsForSelect } from '@/lib/clients/actions';
import { NewProjectFormWrapper } from './new-project-form-wrapper';

export default async function NewProjectPage() {
  const clients = await getClientsForSelect();

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

      <NewProjectFormWrapper clients={clients} />
    </div>
  );
}
