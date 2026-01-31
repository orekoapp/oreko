'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateWorkspaceSettings, type WorkspaceSettings } from '@/lib/settings/actions';

interface WorkspaceSettingsFormProps {
  initialData: WorkspaceSettings | null;
}

export function WorkspaceSettingsForm({ initialData }: WorkspaceSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const result = await updateWorkspaceSettings({ name, slug });
      if (result.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(result.error || 'Failed to update workspace settings');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Workspace Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            // Auto-generate slug if slug matches auto-generated version
            if (slug === generateSlug(initialData?.name || '')) {
              setSlug(generateSlug(e.target.value));
            }
          }}
          placeholder="My Company"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="slug">Workspace URL</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">quotecraft.app/</span>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(generateSlug(e.target.value))}
            placeholder="my-company"
            required
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          This is your workspace's unique identifier in URLs
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {success && (
        <p className="text-sm text-green-600">Settings saved successfully</p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
