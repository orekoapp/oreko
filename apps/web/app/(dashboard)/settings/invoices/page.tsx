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
    <div className="space-y-6">
      <NumberSequenceForm
        type="invoice"
        title="Invoice Numbering"
        description="Configure how invoice numbers are generated."
        initialData={invoiceSequence}
      />

      <InvoiceDefaultsForm initialData={invoiceDefaults} />
    </div>
  );
}
