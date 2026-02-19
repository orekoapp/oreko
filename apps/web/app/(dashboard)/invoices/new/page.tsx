import { getClientsForSelect } from '@/lib/clients/actions';
import { getTaxRates } from '@/lib/settings/actions';
import { NewInvoiceForm } from './new-invoice-form';

export const metadata = {
  title: 'New Invoice',
};

export default async function NewInvoicePage() {
  const [clients, taxRates] = await Promise.all([
    getClientsForSelect(),
    getTaxRates(),
  ]);

  return <NewInvoiceForm clients={clients} taxRates={taxRates} />;
}
