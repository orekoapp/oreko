import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Self-hosted',
    price: 'Free',
    period: 'forever',
    description: 'Host on your own server. Full control over your data.',
    cta: 'Deploy now',
    ctaHref: 'https://github.com/quotecraft/quotecraft',
    highlighted: false,
    features: [
      'Unlimited quotes & invoices',
      'Unlimited clients',
      'E-signatures',
      'PDF generation',
      'Email notifications',
      'Community support',
    ],
  },
  {
    name: 'Cloud',
    price: '$12',
    period: '/mo',
    description: 'We handle hosting, backups, and updates for you.',
    cta: 'Start free trial',
    ctaHref: '/register',
    highlighted: true,
    features: [
      'Everything in Self-hosted',
      'Managed hosting & backups',
      'Priority email support',
      'Custom domain',
      'Stripe payments',
      'Automatic updates',
    ],
  },
  {
    name: 'Cloud Pro',
    price: '$29',
    period: '/mo',
    description: 'For growing teams that need collaboration.',
    cta: 'Start free trial',
    ctaHref: '/register',
    highlighted: false,
    features: [
      'Everything in Cloud',
      'Up to 5 team members',
      'Advanced analytics',
      'Contract templates',
      'Recurring invoices',
      'API access',
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-background py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-display text-3xl font-medium text-foreground tracking-tight text-center">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-muted-foreground text-center max-w-xl mx-auto">
          Free forever with self-hosting. Or let us handle everything.
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-8 ${
                plan.highlighted
                  ? 'border-primary ring-1 ring-primary bg-background'
                  : 'border-border bg-background'
              }`}
            >
              <h3 className="font-display text-lg font-medium text-foreground">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-display font-medium text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>

              <Link
                href={plan.ctaHref}
                className={`mt-6 block text-center text-sm font-medium px-4 py-2.5 rounded-md transition-colors ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border text-foreground hover:bg-accent'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
