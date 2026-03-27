import Link from 'next/link';
import { Check } from 'lucide-react';

export const metadata = {
  title: 'Pricing | Oreko',
  description: 'Simple, transparent pricing. Free forever with self-hosting.',
};

const plans = [
  {
    name: 'Self-hosted',
    price: 'Free',
    period: 'forever',
    description: 'Deploy on your own infrastructure. Full control.',
    cta: 'Deploy now',
    ctaHref: 'https://github.com/orekoapp/oreko',
    highlighted: false,
    features: [
      'Unlimited quotes & invoices',
      'Unlimited clients',
      'Visual quote builder',
      'Quote to invoice conversion',
      'E-signatures',
      'PDF generation',
      'Email notifications',
      'Client portal',
      'Stripe payment integration',
      'Community support',
    ],
  },
  {
    name: 'Cloud',
    price: '$12',
    period: '/mo',
    description: 'We handle hosting, backups, and updates.',
    cta: 'Start free trial',
    ctaHref: '/register',
    highlighted: true,
    features: [
      'Everything in Self-hosted',
      'Managed hosting & daily backups',
      'Automatic updates',
      'Custom domain',
      'Priority email support',
      'Stripe Connect payments',
      'Advanced PDF templates',
      '99.9% uptime SLA',
    ],
  },
  {
    name: 'Cloud Pro',
    price: '$29',
    period: '/mo',
    description: 'For growing teams and agencies.',
    cta: 'Start free trial',
    ctaHref: '/register',
    highlighted: false,
    features: [
      'Everything in Cloud',
      'Up to 5 team members',
      'Advanced analytics & reporting',
      'Contract templates',
      'Recurring invoices',
      'Milestone payments',
      'API access',
      'White-label options',
    ],
  },
];

const faqs = [
  {
    q: 'Can I try before I buy?',
    a: 'Yes. Cloud plans come with a 14-day free trial, no credit card required. The self-hosted version is free forever.',
  },
  {
    q: 'What happens when my trial ends?',
    a: 'Your account stays active but in read-only mode. You can export your data at any time or upgrade to continue.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. You can upgrade, downgrade, or switch to self-hosted at any time. We will prorate any changes.',
  },
  {
    q: 'Do you offer discounts for annual billing?',
    a: 'Yes. Annual billing saves you 20% compared to monthly. Contact us for custom enterprise pricing.',
  },
];

export default function PricingPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl font-medium text-foreground tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Free forever with self-hosting. Or let us handle everything so you can focus on your business.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-8 ${
                plan.highlighted
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-border'
              }`}
            >
              <h2 className="font-display text-lg font-medium text-foreground">{plan.name}</h2>
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

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-medium text-foreground text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-medium text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
