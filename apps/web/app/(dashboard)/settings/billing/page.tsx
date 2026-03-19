export const dynamic = 'force-dynamic';

import { CheckCircle, AlertCircle, CreditCard, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUserRole, getBillingInfo } from '@/lib/settings/actions';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Subscription - Settings',
};

const MOCK_INVOICES = [
  { date: 'Feb 10, 2026', description: 'Trial period for Starter Plan', amount: '$0.00', status: 'Paid' as const },
  { date: 'Jan 10, 2026', description: 'Pro Plan - Monthly', amount: '$9.00', status: 'Paid' as const },
  { date: 'Dec 10, 2025', description: 'Pro Plan - Monthly', amount: '$9.00', status: 'Paid' as const },
];

export default async function BillingSettingsPage() {
  const currentUserRole = await getCurrentUserRole();

  // Only owners can access billing
  if (currentUserRole !== 'owner') {
    redirect('/settings');
  }

  const billing = await getBillingInfo();
  const currentPlan = billing?.plan || 'free';

  return (
    <div className="space-y-8">
      {/* Your Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Subscription</CardTitle>
              <CardDescription>
                All subscription transactions are processed using Stripe with your billing email address.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold capitalize">{currentPlan === 'free' ? 'Free Plan' : `${currentPlan} Plan`}</h3>
                  <p className="text-sm text-muted-foreground">
                    {/* Low #51: Fixed label — nextBillingDate is not the start date */}
                    {billing?.nextBillingDate
                      ? `Next billing on ${new Date(billing.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                      : 'Free tier — no billing'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  {currentPlan !== 'free' && (
                    <>
                      <p className="text-lg font-bold">
                        ${currentPlan === 'pro' ? '9.00' : currentPlan === 'team' ? '29.00' : '0.00'}
                      </p>
                      {billing?.nextBillingDate && (
                        <p className="text-xs text-muted-foreground">
                          Next billing: {new Date(billing.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status badges */}
            <div className="mt-3 flex items-center gap-2">
              {billing?.status === 'active' ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {billing?.status || 'Free'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Add a payment method that will be billed for your subscription.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add a Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {billing?.paymentMethod ? (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-16 items-center justify-center rounded border bg-muted text-xs font-semibold uppercase">
                  {billing.paymentMethod.brand}
                </div>
                <div>
                  <p className="font-medium">
                    {billing.paymentMethod.brand} ending in {billing.paymentMethod.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {billing.paymentMethod.expMonth}/{billing.paymentMethod.expYear}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground mb-2">No payment method on file</p>
              <p className="text-sm text-muted-foreground">Add a payment method to upgrade your plan or enable auto-renewal.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>
            Track all of your payments here and download receipts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 divide-y">
            {MOCK_INVOICES.map((invoice, index) => (
              <div key={index} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-6">
                  <span className="w-[100px] text-sm text-muted-foreground">{invoice.date}</span>
                  <span className="text-sm">{invoice.description}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{invoice.amount}</span>
                  <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400">
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
