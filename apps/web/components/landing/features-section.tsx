import Image from 'next/image';
import Link from 'next/link';
import { FileText, ArrowRightLeft, CreditCard, BarChart3, ChevronRight } from 'lucide-react';

const features = [
  {
    tag: 'Quotes',
    icon: FileText,
    title: 'Create professional quotes in minutes',
    description:
      'Build branded quotes with our visual editor. Add line items, apply discounts, set payment terms, and send to clients for review and approval.',
    screenshot: '/screenshots/quote-preview.png',
    screenshotAlt: 'QuoteCraft quote preview with line items and totals',
    link: '/features#quotes',
  },
  {
    tag: 'Invoicing',
    icon: ArrowRightLeft,
    title: 'Convert quotes to invoices instantly',
    description:
      'When a client accepts a quote, convert it to an invoice with one click. No re-entering data. Everything carries over — line items, client details, payment terms.',
    screenshot: '/screenshots/invoice-preview.png',
    screenshotAlt: 'QuoteCraft invoice preview with payment tracking',
    link: '/features#invoicing',
  },
  {
    tag: 'Clients',
    icon: CreditCard,
    title: 'Keep all your clients in one place',
    description:
      'Manage contacts, track quote and invoice history, and see lifetime value at a glance. Know exactly where each client relationship stands.',
    screenshot: '/screenshots/clients.png',
    screenshotAlt: 'QuoteCraft client management interface',
    link: '/features#clients',
  },
  {
    tag: 'Analytics',
    icon: BarChart3,
    title: 'Understand how your business is performing',
    description:
      'Track revenue trends, quote conversion rates, and client insights. See what is working and where you can improve.',
    screenshot: '/screenshots/analytics.png',
    screenshotAlt: 'QuoteCraft analytics dashboard',
    link: '/features#analytics',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-24">
      <div className="max-w-6xl mx-auto px-6 space-y-32">
        {features.map((feature, i) => {
          const isReversed = i % 2 === 1;
          return (
            <div
              key={feature.tag}
              className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
            >
              <div className="flex-1 max-w-md">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-4">
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
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Learn more
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="flex-1 w-full">
                <div className="rounded-xl border border-border shadow-lg overflow-hidden bg-card">
                  <Image
                    src={feature.screenshot}
                    alt={feature.screenshotAlt}
                    width={1280}
                    height={800}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
