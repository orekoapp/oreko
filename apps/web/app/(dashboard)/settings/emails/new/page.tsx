import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmailTemplateForm } from '@/components/email';

export const metadata = {
  title: 'New Email Template',
};

export default function NewEmailTemplatePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/emails">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-lg font-semibold">Create Email Template</h2>
      </div>

      <EmailTemplateForm />
    </div>
  );
}
