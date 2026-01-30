import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NumberSequenceForm } from '@/components/settings';
import { getNumberSequences } from '@/lib/settings/actions';

export const metadata = {
  title: 'Quote Settings',
};

export default async function QuoteSettingsPage() {
  const sequences = await getNumberSequences();
  const quoteSequence = sequences.find((s) => s.type === 'quote') || null;

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Quote Settings</h1>
          <p className="text-muted-foreground">
            Configure quote numbering and defaults
          </p>
        </div>
      </div>

      <NumberSequenceForm
        type="quote"
        title="Quote Numbering"
        description="Configure how quote numbers are generated."
        initialData={quoteSequence}
      />
    </div>
  );
}
