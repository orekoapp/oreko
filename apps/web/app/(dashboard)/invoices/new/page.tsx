import { getClientsForSelect } from '@/lib/clients/actions';
import { NewInvoiceForm } from './new-invoice-form';

export default async function NewInvoicePage() {
  const clients = await getClientsForSelect();

  return <NewInvoiceForm clients={clients} />;
}
