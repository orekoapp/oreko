import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmailTemplateForm } from '@/components/email';

export const metadata = {
  title: 'New Email Template',
};

export default function NewEmailTemplatePage() {
  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/emails">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Email Template</h1>
          <p className="text-muted-foreground">
            Create a new custom email template
          </p>
        </div>
      </div>

      <EmailTemplateForm />
    </div>
  );
}
