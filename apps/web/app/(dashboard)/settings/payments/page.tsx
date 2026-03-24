export const dynamic = 'force-dynamic';

import { PaymentSettingsForm } from '@/components/payments';
import { getPaymentSettings } from '@/lib/payments/actions';
import { isStripeEnabled } from '@/lib/services/stripe';

export const metadata = {
  title: 'Payment Settings',
};

export default async function PaymentSettingsPage() {
  const settings = await getPaymentSettings();
  const stripeEnabled = isStripeEnabled();

  return <PaymentSettingsForm initialData={settings} stripeEnabled={stripeEnabled} />;
}
