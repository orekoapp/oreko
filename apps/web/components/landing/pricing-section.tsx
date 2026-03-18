'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

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
    <section id="pricing" className="bg-transparent py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="max-w-xl mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="font-display text-3xl font-medium text-foreground tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Free forever with self-hosting. Or let us handle everything.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.45,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            >
              <SpotlightCard
                className={`rounded-xl border p-8 h-full transition-shadow duration-300 hover:shadow-md ${
                  plan.highlighted
                    ? 'border-primary ring-1 ring-primary bg-background'
                    : 'border-border bg-background'
                }`}
                spotlightColor={
                  plan.highlighted
                    ? 'rgba(59, 130, 246, 0.12)'
                    : 'rgba(59, 130, 246, 0.06)'
                }
              >
                {plan.highlighted && (
                  <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-4">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-lg font-medium text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-display font-medium text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {plan.period}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <Link
                  href={plan.ctaHref}
                  className={`mt-6 block text-center text-sm font-medium px-4 py-2.5 rounded-md transition-all active:scale-[0.98] ${
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20'
                      : 'border border-border text-foreground hover:bg-accent'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
