import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmailTemplateForm } from '@/components/email';
import { getEmailTemplateById } from '@/lib/email/actions';

interface EmailTemplatePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Email Template',
};

export default async function EditEmailTemplatePage({ params }: EmailTemplatePageProps) {
  const { id } = await params;
  const template = await getEmailTemplateById(id);

  if (!template) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/emails">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-lg font-semibold">Edit Email Template</h2>
      </div>

      <EmailTemplateForm template={template} />
    </div>
  );
}
