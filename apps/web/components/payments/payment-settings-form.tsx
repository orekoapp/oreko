'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ExternalLink, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  updatePaymentSettings,
  createStripeOnboardingLink,
  checkStripeAccountStatus,
} from '@/lib/payments/actions';
import type { PaymentSettingsData } from '@/lib/payments/types';

interface PaymentSettingsFormProps {
  initialData: PaymentSettingsData | null;
  stripeEnabled: boolean;
}

export function PaymentSettingsForm({ initialData, stripeEnabled }: PaymentSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const [settings, setSettings] = useState({
    passProcessingFees: initialData?.passProcessingFees ?? false,
    defaultPaymentTerms: initialData?.defaultPaymentTerms ?? 30,
  });

  const [stripeStatus, setStripeStatus] = useState({
    connected: !!initialData?.stripeAccountId,
    onboardingComplete: initialData?.stripeOnboardingComplete ?? false,
    status: initialData?.stripeAccountStatus,
  });

  const handleSave = () => {
    startTransition(async () => {
      await updatePaymentSettings(settings);
      router.refresh();
    });
  };

  const handleStripeConnect = () => {
    startTransition(async () => {
      const result = await createStripeOnboardingLink();
      if (result.success && result.url) {
        window.location.href = result.url;
      }
    });
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const status = await checkStripeAccountStatus();
      setStripeStatus({
        connected: status.connected,
        onboardingComplete: status.chargesEnabled && status.payoutsEnabled,
        status: status.status,
      });
      router.refresh();
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stripe Connect */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Stripe Connect</CardTitle>
              <CardDescription>
                Accept credit card payments from your clients
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!stripeEnabled ? (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Stripe Not Configured</p>
                <p className="text-sm text-amber-700 mt-1">
                  Stripe API keys are not configured. Please set STRIPE_SECRET_KEY in your environment variables to enable payment processing.
                </p>
              </div>
            </div>
          ) : stripeStatus.connected && stripeStatus.onboardingComplete ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Connected to Stripe</p>
                  <p className="text-sm text-muted-foreground">
                    You can accept card payments from clients
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          ) : stripeStatus.connected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium">Onboarding Incomplete</p>
                    <p className="text-sm text-muted-foreground">
                      Complete your Stripe account setup to accept payments
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Pending
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleStripeConnect} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue Setup
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                >
                  {isCheckingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Check Status
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Connect your Stripe account to accept credit card and other digital payments directly through invoices.
              </p>
              <Button onClick={handleStripeConnect} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect with Stripe
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Options</CardTitle>
          <CardDescription>
            Configure how payments are processed for your invoices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="passProcessingFees">Pass Processing Fees to Client</Label>
              <p className="text-sm text-muted-foreground">
                Add Stripe processing fees (2.9% + $0.30) to the invoice total
              </p>
            </div>
            <Switch
              id="passProcessingFees"
              checked={settings.passProcessingFees}
              onCheckedChange={(checked) =>
                setSettings((s) => ({ ...s, passProcessingFees: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultPaymentTerms">Default Payment Terms</Label>
            <Select
              value={settings.defaultPaymentTerms.toString()}
              onValueChange={(value) =>
                setSettings((s) => ({ ...s, defaultPaymentTerms: parseInt(value) }))
              }
            >
              <SelectTrigger id="defaultPaymentTerms" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Due on Receipt</SelectItem>
                <SelectItem value="7">Net 7</SelectItem>
                <SelectItem value="15">Net 15</SelectItem>
                <SelectItem value="30">Net 30</SelectItem>
                <SelectItem value="45">Net 45</SelectItem>
                <SelectItem value="60">Net 60</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Default number of days until payment is due
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
