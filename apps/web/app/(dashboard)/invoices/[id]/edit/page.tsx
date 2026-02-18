import { redirect } from 'next/navigation';

interface InvoiceEditPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Invoice edit page - redirects to detail page
 * Full inline editing to be implemented as a feature enhancement
 */
export default async function InvoiceEditPage({ params }: InvoiceEditPageProps) {
  const { id } = await params;
  redirect(`/invoices/${id}`);
}
