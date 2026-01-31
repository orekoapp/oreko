import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUserRole, getBillingInfo } from '@/lib/settings/actions';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Billing - Settings',
};

const plans = [
  {
    name: 'Free',
    price: 0,
    features: ['1 team member', '10 quotes/month', '5 invoices/month', 'Basic branding'],
  },
  {
    name: 'Pro',
    price: 9,
    features: ['3 team members', 'Unlimited quotes', 'Unlimited invoices', 'Custom branding', 'Priority support'],
    popular: true,
  },
  {
    name: 'Team',
    price: 29,
    features: ['Unlimited team members', 'Unlimited everything', 'White-label PDFs', 'API access', 'Dedicated support'],
  },
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
    <div className="container max-w-4xl py-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and payment methods
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the <strong className="capitalize">{currentPlan}</strong> plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
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
            {billing?.nextBillingDate && (
              <span className="text-sm text-muted-foreground">
                Next billing: {new Date(billing.nextBillingDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? 'border-primary shadow-md' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">${plan.price}</span>
                  {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-4 w-full"
                  variant={plan.name.toLowerCase() === currentPlan ? 'outline' : 'default'}
                  disabled={plan.name.toLowerCase() === currentPlan}
                >
                  {plan.name.toLowerCase() === currentPlan ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment method for subscription billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billing?.paymentMethod ? (
            <div className="flex items-center justify-between">
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
              <Button variant="outline">Update</Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No payment method on file</p>
              <Button>Add Payment Method</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
