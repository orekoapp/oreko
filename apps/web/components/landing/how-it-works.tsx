import { FileEdit, Send, ArrowRightLeft, CreditCard } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: FileEdit,
    title: 'Create Beautiful Quote',
    description:
      'Use the visual builder to craft a quote your clients will remember. Drag and drop blocks, add your branding.',
  },
  {
    number: 2,
    icon: Send,
    title: 'Get It Signed',
    description:
      'Send for e-signature with one click. Track when it\'s viewed and signed. No more "did you get my email?"',
  },
  {
    number: 3,
    icon: ArrowRightLeft,
    title: 'Convert to Invoice',
    description:
      'One click. No data re-entry. The accepted quote becomes a professional invoice automatically.',
  },
  {
    number: 4,
    icon: CreditCard,
    title: 'Get Paid',
    description:
      'Accept payments via Stripe, PayPal, or bank transfer. Set up deposits and payment schedules.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            From Quote to Paid in 4 Steps
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            No complicated workflows. No learning curve. Just a simple process that gets you
            paid faster.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection line - visible only on desktop */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500" />

            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step number */}
                <div className="relative z-10 inline-flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-4 border-blue-500 dark:border-blue-400 shadow-lg mb-6">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <step.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
