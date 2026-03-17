import Image from 'next/image';
import Link from 'next/link';
import {
  FileText,
  ArrowRightLeft,
  CreditCard,
  BarChart3,
  PenTool,
  Shield,
  Zap,
  Globe,
} from 'lucide-react';

export const metadata = {
  title: 'Features | QuoteCraft',
  description: 'Everything you need to create quotes, send invoices, and get paid.',
};

const highlights = [
  {
    icon: Zap,
    title: 'Fast setup',
    description: 'Get started in minutes. No complex onboarding or configuration required.',
  },
  {
    icon: Shield,
    title: 'Secure by default',
    description: 'All data encrypted at rest and in transit. PCI compliant via Stripe.',
  },
  {
    icon: Globe,
    title: 'Works everywhere',
    description: 'Responsive design. Works on desktop, tablet, and mobile browsers.',
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
    screenshot: '/screenshots/quote-preview.png',
    screenshotAlt: 'QuoteCraft quote preview with line items and totals',
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
    screenshot: '/screenshots/invoice-preview.png',
    screenshotAlt: 'QuoteCraft invoice preview with payment tracking',
  },
  {
    id: 'clients',
    icon: CreditCard,
    tag: 'Client management',
    title: 'All your clients, organized',
    description:
      'Keep client contacts, communication history, and financial data in one place. See lifetime value, outstanding balances, and recent activity at a glance.',
    bullets: [
      'Contact details and notes',
      'Quote and invoice history',
      'Lifetime value tracking',
      'Client portal for approvals',
      'E-signature capture',
    ],
    screenshot: '/screenshots/clients.png',
    screenshotAlt: 'QuoteCraft client management',
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
      'Client lifetime value',
      'Customizable date ranges',
    ],
    screenshot: '/screenshots/analytics.png',
    screenshotAlt: 'QuoteCraft analytics dashboard',
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="font-display text-4xl font-medium text-foreground tracking-tight">
            Everything you need to get paid
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From quote creation to payment collection, QuoteCraft handles your entire billing workflow.
          </p>
        </div>

        {/* Quick highlights */}
        <div className="grid sm:grid-cols-3 gap-8 mb-24">
          {highlights.map((h) => (
            <div key={h.title} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent mb-4">
                <h.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-medium text-foreground">{h.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{h.description}</p>
            </div>
          ))}
        </div>

        {/* Feature sections */}
        <div className="space-y-32">
          {features.map((feature, i) => {
            const isReversed = i % 2 === 1;
            return (
              <div
                key={feature.id}
                id={feature.id}
                className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-start gap-12 lg:gap-20 scroll-mt-24`}
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
                  <ul className="mt-6 space-y-2.5">
                    {feature.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <PenTool className="h-3.5 w-3.5 text-primary shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex-1 w-full">
                  <div className="rounded-xl border border-border shadow-lg overflow-hidden">
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

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="font-display text-2xl font-medium text-foreground">
            Ready to get started?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Try QuoteCraft free for 14 days. No credit card required.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
            >
              Start free trial
            </Link>
            <Link
              href="https://github.com/quotecraft/quotecraft"
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-foreground border border-border hover:bg-accent rounded-md transition-colors"
            >
              Self-host for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
