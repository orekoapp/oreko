import { notFound, redirect } from 'next/navigation';
import { getInvoice } from '@/lib/invoices/actions';
import { getClientsForSelect } from '@/lib/clients/actions';
import { getTaxRates, getBusinessProfile } from '@/lib/settings/actions';
import { EditInvoiceForm } from './edit-invoice-form';

interface InvoiceEditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: InvoiceEditPageProps) {
  const { id } = await params;
  try {
    const invoice = await getInvoice(id);
    return { title: invoice ? `Edit ${invoice.title}` : 'Edit Invoice' };
  } catch {
    return { title: 'Invoice Not Found' };
  }
}

export default async function InvoiceEditPage({ params }: InvoiceEditPageProps) {
  const { id } = await params;

  const [invoice, clients, taxRates, businessProfile] = await Promise.all([
    getInvoice(id),
    getClientsForSelect(),
    getTaxRates(),
    getBusinessProfile(),
  ]);

  if (!invoice) {
    notFound();
  }

  // Only draft invoices can be edited
  if (invoice.status !== 'draft') {
    redirect(`/invoices/${id}`);
  }

  return (
    <EditInvoiceForm
      invoice={invoice}
      clients={clients}
      taxRates={taxRates}
      currency={invoice.currency}
      businessName={businessProfile?.businessName || 'Your Business'}
    />
  );
}
