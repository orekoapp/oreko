import Image from 'next/image';
import {
  Blocks,
  ArrowRightLeft,
  PenTool,
  CalendarClock,
  Layers,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Blocks,
    title: 'Visual Quote Builder',
    headline: 'Build Beautiful Quotes',
    description:
      'Drag-and-drop blocks, not spreadsheet rows. Create quotes your clients will remember with our intuitive visual editor.',
    points: ['Block-based editor', 'Real-time preview', 'Professional templates'],
    color: 'from-blue-500 to-blue-600',
    image: '/images/landing/hero-screenshot.png',
    imageAlt: 'Visual quote builder with drag and drop blocks',
  },
  {
    icon: ArrowRightLeft,
    title: 'One-Click Conversion',
    headline: 'Quote to Invoice in One Click',
    description:
      'Stop copying data between documents. When a quote is accepted, convert it to an invoice instantly with zero re-entry.',
    points: ['Zero data re-entry', 'Automatic data transfer', 'Maintain history'],
    color: 'from-violet-500 to-violet-600',
    image: '/images/landing/feature-quotes-list.png',
    imageAlt: 'Quotes list showing draft, sent, and accepted statuses',
  },
  {
    icon: PenTool,
    title: 'E-Signatures',
    headline: 'Get Signed Instantly',
    description:
      'Built-in electronic signatures that are legally binding. Clients can sign from any device, anywhere.',
    points: ['Legally binding', 'Mobile-friendly', 'Signature tracking'],
    color: 'from-emerald-500 to-emerald-600',
    image: '/images/landing/feature-quote-builder.png',
    imageAlt: 'Quote builder with signature block for electronic signatures',
  },
  {
    icon: CalendarClock,
    title: 'Payment Scheduling',
    headline: 'Flexible Payment Terms',
    description:
      'Set up deposits, milestone payments, and auto-reminders. Get paid on your terms without chasing clients.',
    points: ['Deposit requests', 'Milestone payments', 'Auto-reminders'],
    color: 'from-amber-500 to-amber-600',
    image: '/images/landing/feature-dashboard.png',
    imageAlt: 'Dashboard showing revenue tracking and invoice status',
  },
  {
    icon: Layers,
    title: 'Rate Card System',
    headline: 'Consistent Pricing',
    description:
      'Create reusable services with saved rates. Build quotes faster and maintain consistent pricing across projects.',
    points: ['Reusable services', 'Automatic calculations', 'Version history'],
    color: 'from-pink-500 to-pink-600',
    image: '/images/landing/feature-rate-cards.png',
    imageAlt: 'Rate cards with service pricing for hourly and fixed rates',
  },
  {
    icon: Server,
    title: 'Self-Hosted Option',
    headline: 'Your Data, Your Server',
    description:
      'Deploy on your own infrastructure with Docker. Full control over your data with no vendor lock-in.',
    points: ['Docker deployment', 'Full data control', 'No vendor lock-in'],
    color: 'from-slate-500 to-slate-600',
    image: '/images/landing/feature-settings.png',
    imageAlt: 'Comprehensive settings for full customization',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            QuoteCraft is Different
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A visual builder that's open source and actually free. Everything you need to
            create, send, and get paid for your work.
          </p>
        </div>

        <div className="space-y-20 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                'grid md:grid-cols-2 gap-12 items-center',
                index % 2 === 1 && 'md:grid-flow-dense'
              )}
            >
              {/* Content */}
              <div className={cn(index % 2 === 1 && 'md:col-start-2')}>
                <div
                  className={cn(
                    'inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br mb-6',
                    feature.color
                  )}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                  {feature.title}
                </p>

                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {feature.headline}
                </h3>

                <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                  {feature.description}
                </p>

                <ul className="space-y-3">
                  {feature.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3 h-3 text-green-600 dark:text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Feature screenshot */}
              <div className={cn(index % 2 === 1 && 'md:col-start-1')}>
                <div className="relative">
                  <div
                    className={cn(
                      'absolute -inset-4 bg-gradient-to-r blur-2xl rounded-3xl opacity-20',
                      feature.color
                    )}
                  />
                  <div className="relative aspect-[4/3] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.imageAlt}
                      fill
                      className="object-cover object-top"
                      quality={85}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
