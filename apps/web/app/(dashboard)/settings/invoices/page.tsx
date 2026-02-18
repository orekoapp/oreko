import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NumberSequenceForm, InvoiceDefaultsForm } from '@/components/settings';
import { getNumberSequences, getInvoiceDefaults } from '@/lib/settings/actions';

export const metadata = {
  title: 'Invoice Settings',
};

export default async function InvoiceSettingsPage() {
  const [sequences, invoiceDefaults] = await Promise.all([
    getNumberSequences(),
    getInvoiceDefaults(),
  ]);
  const invoiceSequence = sequences.find((s) => s.type === 'invoice') || null;

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Invoice Settings</h1>
          <p className="text-muted-foreground">
            Configure invoice numbering, payment terms, and defaults
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <NumberSequenceForm
          type="invoice"
          title="Invoice Numbering"
          description="Configure how invoice numbers are generated."
          initialData={invoiceSequence}
        />

        <InvoiceDefaultsForm initialData={invoiceDefaults} />
      </div>
    </div>
  );
}
