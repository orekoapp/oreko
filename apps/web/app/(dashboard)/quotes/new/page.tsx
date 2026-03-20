import NewQuoteForm from './new-quote-form';
import { getWorkspaceCurrency } from '@/lib/settings/actions';

export const metadata = {
  title: 'New Quote',
};

export default async function NewQuotePage() {
  const defaultCurrency = await getWorkspaceCurrency();

  return <NewQuoteForm defaultCurrency={defaultCurrency} />;
}
