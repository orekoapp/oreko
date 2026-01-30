import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentSettingsForm } from '@/components/payments';
import { getPaymentSettings } from '@/lib/payments/actions';
import { isStripeEnabled } from '@/lib/services/stripe';

export const metadata = {
  title: 'Payment Settings',
};

export default async function PaymentSettingsPage() {
  const settings = await getPaymentSettings();
  const stripeEnabled = isStripeEnabled();

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Payment Settings</h1>
          <p className="text-muted-foreground">
            Configure how you accept payments from clients
          </p>
        </div>
      </div>

      <PaymentSettingsForm initialData={settings} stripeEnabled={stripeEnabled} />
    </div>
  );
}
