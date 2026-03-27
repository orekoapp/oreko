'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FileText, ArrowRightLeft, ScrollText, BarChart3, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

const features = [
  {
    tag: 'Quotes',
    icon: FileText,
    title: 'Create professional quotes in minutes',
    description:
      'Build branded quotes with our visual editor. Add line items, apply discounts, set payment terms, and send to clients for review and approval.',
    screenshot: '/screenshots/quote-detail.png',
    screenshotAlt: 'Oreko quote builder with live preview panel',
    link: '/features#quotes',
  },
  {
    tag: 'Invoicing',
    icon: ArrowRightLeft,
    title: 'Send invoices and get paid faster',
    description:
      'Create invoices from scratch or convert accepted quotes with one click. Track payment status, send reminders, and let clients pay online.',
    screenshot: '/screenshots/invoice-detail.png',
    screenshotAlt: 'Oreko invoice popup with line items, totals, and download option',
    link: '/features#invoicing',
  },
  {
    tag: 'Contracts',
    icon: ScrollText,
    title: 'Manage contracts and e-signatures',
    description:
      'Send contracts for review, track signature status, and keep everything organized. From draft to signed — all in one place.',
    screenshot: '/screenshots/contracts.png',
    screenshotAlt: 'Oreko contracts management with status tracking',
    link: '/features#contracts',
  },
  {
    tag: 'Analytics',
    icon: BarChart3,
    title: 'Understand how your business is performing',
    description:
      'Track revenue trends, quote conversion rates, and client insights. See what is working and where you can improve.',
    screenshot: '/screenshots/analytics.png',
    screenshotAlt: 'Oreko analytics dashboard with revenue and client data',
    link: '/features#analytics',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-transparent py-24">
      <div className="max-w-6xl mx-auto px-6 space-y-28">
        {features.map((feature, i) => (
          <div key={feature.tag} className="space-y-8">
            {/* Text — always left-aligned */}
            <motion.div
              className="max-w-xl"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-3">
                <feature.icon className="h-4 w-4" />
                <span>{feature.tag}</span>
              </div>
              <h2 className="font-display text-3xl font-medium text-foreground tracking-tight leading-snug">
                {feature.title}
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              <Link
                href={feature.link}
                className="group mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Learn more
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            {/* Screenshot — full width below with spotlight hover */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
            >
              <SpotlightCard className="rounded-xl border border-border shadow-lg overflow-hidden bg-card transition-shadow duration-500 hover:shadow-xl">
                <Image
                  src={feature.screenshot}
                  alt={feature.screenshotAlt}
                  width={1280}
                  height={800}
                  className="w-full h-auto"
                />
              </SpotlightCard>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
