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
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/emails">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Email Template</h1>
          <p className="text-muted-foreground">
            Modify your email template
          </p>
        </div>
      </div>

      <EmailTemplateForm template={template} />
    </div>
  );
}
