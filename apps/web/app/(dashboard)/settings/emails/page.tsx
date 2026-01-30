import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmailTemplateList } from '@/components/email';
import { getEmailTemplates } from '@/lib/email/actions';

export const metadata = {
  title: 'Email Templates',
};

export default async function EmailSettingsPage() {
  const templates = await getEmailTemplates();

  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Email Templates</h1>
            <p className="text-muted-foreground">
              Customize email notifications sent to your clients
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/settings/emails/new">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      <EmailTemplateList templates={templates} />
    </div>
  );
}
