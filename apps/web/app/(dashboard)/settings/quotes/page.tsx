export const dynamic = 'force-dynamic';

import { NumberSequenceForm } from '@/components/settings';
import { getNumberSequences } from '@/lib/settings/actions';

export const metadata = {
  title: 'Quote Settings',
};

export default async function QuoteSettingsPage() {
  const sequences = await getNumberSequences();
  const quoteSequence = sequences.find((s) => s.type === 'quote') || null;

  return (
    <NumberSequenceForm
      type="quote"
      title="Quote Numbering"
      description="Configure how quote numbers are generated."
      initialData={quoteSequence}
    />
  );
}
