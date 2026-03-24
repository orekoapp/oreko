'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  ArrowRightLeft,
  ScrollText,
  BarChart3,
  Check,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'motion/react';

const highlights = [
  {
    icon: Zap,
    title: 'Fast setup',
    description:
      'Get started in minutes. No complex onboarding or configuration required.',
  },
  {
    icon: Shield,
    title: 'Secure by default',
    description:
      'All data encrypted at rest and in transit. PCI compliant via Stripe.',
  },
  {
    icon: Globe,
    title: 'Works everywhere',
    description:
      'Responsive design. Works on desktop, tablet, and mobile browsers.',
  },
];

const features = [
  {
    id: 'quotes',
    icon: FileText,
    tag: 'Quotes',
    title: 'Create professional quotes that win clients',
    description:
      'Use our visual quote builder to create branded, professional quotes. Add line items with descriptions, quantities, and rates. Apply discounts, set payment terms, and include your company branding.',
    bullets: [
      'Drag-and-drop visual builder',
      'Custom branding and colors',
      'Flexible line items and pricing',
      'Payment term templates',
      'Client approval workflow',
    ],
    screenshot: '/screenshots/quote-detail.png',
    screenshotAlt: 'QuoteCraft quote builder with live preview panel',
  },
  {
    id: 'invoicing',
    icon: ArrowRightLeft,
    tag: 'Invoicing',
    title: 'One-click quote to invoice conversion',
    description:
      'When a client accepts a quote, convert it to an invoice instantly. All line items, client details, and payment terms carry over. No re-entering data, no copy-paste errors.',
    bullets: [
      'Instant conversion from accepted quotes',
      'Automatic line item transfer',
      'Payment tracking and reminders',
      'PDF generation and email delivery',
      'Stripe payment integration',
    ],
    screenshot: '/screenshots/invoice-detail.png',
    screenshotAlt: 'QuoteCraft invoice with line items and payment tracking',
  },
  {
    id: 'contracts',
    icon: ScrollText,
    tag: 'Contracts',
    title: 'Manage contracts and e-signatures',
    description:
      'Send contracts for client review, collect e-signatures, and track status from draft to signed. Keep everything organized in one place with full audit trails.',
    bullets: [
      'Contract templates with variables',
      'E-signature capture',
      'Status tracking and reminders',
      'Full audit trail',
      'PDF export and download',
    ],
    screenshot: '/screenshots/contracts.png',
    screenshotAlt: 'QuoteCraft contracts management with status tracking',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    tag: 'Analytics',
    title: 'Business insights at a glance',
    description:
      'Track revenue trends, quote conversion rates, top clients, and forecast future revenue. Understand what is working and where you can improve.',
    bullets: [
      'Revenue tracking and forecasting',
      'Quote conversion analytics',
      'Top clients by revenue',
      'Invoice and payment status',
      'Customizable date ranges',
    ],
    screenshot: '/screenshots/analytics.png',
    screenshotAlt: 'QuoteCraft analytics dashboard with revenue and client data',
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Hero */}
        <motion.div
          className="max-w-xl mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="font-display text-4xl font-medium text-foreground tracking-tight">
            Everything you need to get paid
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            From quote creation to payment collection, QuoteCraft handles your
            entire billing workflow.
          </p>
        </motion.div>

        {/* Quick highlights */}
        <div className="grid sm:grid-cols-3 gap-8 mb-24">
          {highlights.map((h, i) => (
            <motion.div
              key={h.title}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.15 + i * 0.1,
                ease: 'easeOut',
              }}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent mb-4 transition-colors group-hover:bg-primary/10">
                <h.icon className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
              </div>
              <h3 className="font-display font-medium text-foreground">
                {h.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {h.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Feature sections — left-aligned, stacked */}
        <div className="space-y-28">
          {features.map((feature) => (
            <div
              key={feature.id}
              id={feature.id}
              className="scroll-mt-24 space-y-8"
            >
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
                <ul className="mt-6 space-y-2.5">
                  {feature.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                className="rounded-xl border border-border shadow-lg overflow-hidden bg-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              >
                <Image
                  src={feature.screenshot}
                  alt={feature.screenshotAlt}
                  width={1280}
                  height={800}
                  className="w-full h-auto"
                />
              </motion.div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-24 rounded-2xl bg-primary/5 border border-primary/10 px-8 py-16 sm:px-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-medium text-foreground">
              Ready to get started?
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Try QuoteCraft free for 14 days. No credit card required.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                Start free trial
              </Link>
              <Link
                href="https://github.com/quotecraft/quotecraft"
                className="group inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Self-host for free
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
