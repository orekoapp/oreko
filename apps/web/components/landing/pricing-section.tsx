import Link from 'next/link';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Open Source',
    price: 'FREE',
    period: 'forever',
    description: 'Self-hosted on your server',
    popular: true,
    features: [
      { text: 'All features included', included: true },
      { text: 'Unlimited quotes & invoices', included: true },
      { text: 'Docker deployment', included: true },
      { text: 'Full data ownership', included: true },
      { text: 'Community support', included: true },
      { text: 'API access', included: true },
    ],
    cta: 'Get Started',
    ctaVariant: 'outline' as const,
    href: 'https://github.com/quotecraft/quotecraft',
    external: true,
  },
  {
    name: 'Cloud Starter',
    price: '$9',
    period: '/month',
    description: 'We host it for you',
    popular: false,
    badge: 'Best Value',
    features: [
      { text: 'All features included', included: true },
      { text: '100 quotes/month', included: true },
      { text: 'Managed hosting', included: true },
      { text: 'Automatic backups', included: true },
      { text: 'Email support', included: true },
      { text: 'SSL included', included: true },
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'default' as const,
    href: '/register?plan=starter',
    external: false,
  },
  {
    name: 'Cloud Pro',
    price: '$19',
    period: '/month',
    description: 'For growing businesses',
    popular: false,
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Unlimited quotes', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom domain', included: true },
      { text: 'API access', included: true },
      { text: 'Up to 3 team members', included: true },
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'default' as const,
    href: '/register?plan=pro',
    external: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Pricing That Makes Sense
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Open source and free, or let us host it for less than a coffee a week.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                'relative rounded-2xl border p-8',
                tier.popular
                  ? 'border-blue-500 dark:border-blue-400 shadow-xl shadow-blue-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              )}
            >
              {/* Popular badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Best Value badge */}
              {tier.badge && !tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                    {tier.badge}
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                  {tier.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {tier.price}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{tier.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span
                      className={cn(
                        'text-sm',
                        feature.included
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-500'
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {tier.external ? (
                <a
                  href={tier.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant={tier.ctaVariant} className="w-full">
                    {tier.cta}
                  </Button>
                </a>
              ) : (
                <Link href={tier.href}>
                  <Button variant={tier.ctaVariant} className="w-full">
                    {tier.cta}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Comparison note */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Compare: Bloom starts at $19/mo, Bonsai at $21/mo, HoneyBook at $19/mo.
          </p>
        </div>
      </div>
    </section>
  );
}
