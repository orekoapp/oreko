import { notFound, redirect } from 'next/navigation';
import { getQuote } from '@/lib/quotes/actions';
import EditQuoteForm from './edit-quote-form';

export const metadata = {
  title: 'Edit Quote',
};

interface EditQuotePageProps {
  params: Promise<{ id: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditQuotePage({ params }: EditQuotePageProps) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  const quote = await getQuote(id);

  if (!quote) {
    notFound();
  }

  // Only draft quotes can be edited
  if (quote.status !== 'draft') {
    redirect(`/quotes/${id}`);
  }

  return <EditQuoteForm quote={quote} />;
}
