import Link from 'next/link';
import { Plus, Mail } from 'lucide-react';
import { EmailSettingsForm } from '@/components/email/email-settings-form';
import { getEmailTemplates } from '@/lib/email/actions';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Email - Settings',
};

export default async function EmailSettingsPage() {
  const templates = await getEmailTemplates({});

  return (
    <div className="space-y-8">
      <EmailSettingsForm />

      {/* Low #53: Show email templates section with link to manage */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Email Templates</h3>
            <p className="text-sm text-muted-foreground">
              {templates.length} template{templates.length !== 1 ? 's' : ''} configured
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/settings/emails/new">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Link>
          </Button>
        </div>
        {templates.length > 0 && (
          <ul className="space-y-2">
            {templates.slice(0, 5).map((t) => (
              <li key={t.id}>
                <Link
                  href={`/settings/emails/${t.id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
