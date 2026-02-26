'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Is QuoteCraft really free?',
    answer:
      "Yes! The self-hosted version is 100% free and includes all features. You only pay if you want us to host it for you with our cloud plans starting at $9/month.",
  },
  {
    question: "What's the difference between self-hosted and cloud?",
    answer:
      "Self-hosted means you run QuoteCraft on your own server using Docker. You're responsible for hosting, backups, and updates. Cloud means we handle all of that for you - just sign up and start creating quotes.",
  },
  {
    question: 'How does QuoteCraft compare to Bloom or Bonsai?',
    answer:
      "QuoteCraft offers the same visual builder experience but with two key differences: it's open source (so you can self-host for free) and our cloud plans are 50% cheaper. We focus specifically on quotes and invoices rather than being an all-in-one platform.",
  },
  {
    question: 'Is my data safe?',
    answer:
      "For self-hosted: Your data never leaves your server. For cloud: We use industry-standard encryption, regular backups, and you can export your data anytime. We never sell or share your data.",
  },
  {
    question: 'Can I migrate from another tool?',
    answer:
      'Yes! We offer import tools for common formats including CSV, and specific importers for Bloom, Bonsai, and Wave. Your existing clients and invoice history can be brought over.',
  },
  {
    question: 'Do you take a percentage of payments?',
    answer:
      "No. We never touch your money. You connect your own Stripe or PayPal account and receive payments directly. We just help you create beautiful invoices.",
  },
  {
    question: 'What payment processors are supported?',
    answer:
      'We integrate with Stripe, PayPal, and manual bank transfers. More payment processors are on our roadmap based on community requests.',
  },
  {
    question: 'Can I use my own domain?',
    answer:
      "Self-hosted: Absolutely, it's your server. Cloud Pro and Team: Yes, you can connect your custom domain. Cloud Starter: Uses a quote.persuado.tech subdomain.",
  },
  {
    question: 'Is there a mobile app?',
    answer:
      'The web app is fully responsive and works great on mobile browsers. Native iOS and Android apps are on our roadmap for future releases.',
  },
  {
    question: 'How do I get support?',
    answer:
      'Self-hosted: Community support via GitHub discussions and Discord. Cloud: Email support for Starter, priority support for Pro, dedicated support for Team plans.',
  },
];

export function FAQSection() {
  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Questions? We've Got Answers.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to know about QuoteCraft.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-slate-200 dark:border-slate-800 rounded-lg px-6 bg-white dark:bg-slate-800"
              >
                <AccordionTrigger className="text-left text-lg font-medium text-slate-900 dark:text-white hover:no-underline py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400 pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
            Still have questions?{' '}
            <a
              href="mailto:support@quote.persuado.tech"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
