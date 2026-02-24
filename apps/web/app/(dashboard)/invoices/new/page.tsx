import { getClientsForSelect } from '@/lib/clients/actions';
import { getTaxRates, getNumberSequences, getBusinessProfile } from '@/lib/settings/actions';
import { getRateCardsForSelection } from '@/lib/rate-cards/actions';
import { NewInvoiceForm } from './new-invoice-form';

export const metadata = {
  title: 'New Invoice',
};

export default async function NewInvoicePage() {
  const [clients, taxRates, sequences, businessProfile, rateCards] = await Promise.all([
    getClientsForSelect(),
    getTaxRates(),
    getNumberSequences(),
    getBusinessProfile(),
    getRateCardsForSelection(),
  ]);

  // Compute next invoice number
  const invoiceSeq = sequences.find((s) => s.type === 'invoice');
  const nextValue = (invoiceSeq?.currentValue ?? 0) + 1;
  const padding = invoiceSeq?.padding ?? 4;
  const prefix = (invoiceSeq?.prefix ?? 'INV').replace(/-$/, '');
  const paddedValue = String(nextValue).padStart(padding, '0');
  const suffix = invoiceSeq?.suffix;
  const parts = [prefix, paddedValue].filter(Boolean);
  if (suffix) parts.push(suffix);
  const nextInvoiceNumber = parts.join('-');

  return (
    <NewInvoiceForm
      clients={clients}
      taxRates={taxRates}
      currency={businessProfile?.currency || 'USD'}
      nextInvoiceNumber={nextInvoiceNumber}
      rateCards={rateCards}
      businessName={businessProfile?.businessName || 'Your Business'}
    />
  );
}
