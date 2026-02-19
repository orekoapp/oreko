import { getClientsForSelect } from '@/lib/clients/actions';
import { getTaxRates, getInvoiceDefaults, getBusinessProfile } from '@/lib/settings/actions';
import { NewInvoiceForm } from './new-invoice-form';

export const metadata = {
  title: 'New Invoice',
};

export default async function NewInvoicePage() {
  const [clients, taxRates, invoiceDefaults, businessProfile] = await Promise.all([
    getClientsForSelect(),
    getTaxRates(),
    getInvoiceDefaults(),
    getBusinessProfile(),
  ]);

  return (
    <NewInvoiceForm
      clients={clients}
      taxRates={taxRates}
      defaultNotes={invoiceDefaults.defaultNotes}
      defaultTerms={invoiceDefaults.defaultTerms}
      currency={businessProfile?.currency || 'USD'}
    />
  );
}
