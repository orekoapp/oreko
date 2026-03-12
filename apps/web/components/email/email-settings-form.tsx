'use client';

import * as React from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function EmailSettingsForm() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [signature, setSignature] = React.useState('');
  const [footer, setFooter] = React.useState(
    'This email and any attachments are intended solely for the use of the individual or entity to whom they are addressed. If you have received this message in error, please notify the sender immediately. Unauthorized use, disclosure, or distribution is prohibited.'
  );
  const [clientEmail, setClientEmail] = React.useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      toast.info('Email settings are not yet persisted. This feature is coming soon.');
    } catch {
      toast.error('Failed to update email settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Signature */}
      <Card>
        <CardHeader>
          <CardTitle>Email Signature</CardTitle>
          <CardDescription>
            This signature will be appended to all outgoing emails to your clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Your Name&#10;your@email.com"
            className="min-h-[100px]"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Email Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Email Footer</CardTitle>
          <CardDescription>
            This disclaimer text appears at the bottom of every email sent from your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            placeholder="Enter your email footer / disclaimer text..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Email Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Email Setup</CardTitle>
          <CardDescription>
            Configure the email address used for sending client-facing emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Current sending email</p>
                <p className="text-sm text-muted-foreground">
                  {clientEmail || 'No email configured — emails will be sent from the default system address.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Client-facing email address</label>
            <div className="flex gap-3">
              <Input
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="you@yourdomain.com"
                type="email"
                className="flex-1"
              />
              <Button type="button" variant="outline" disabled title="Email verification coming soon">
                Verify
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Clients will see this address as the sender on all emails from your workspace.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
