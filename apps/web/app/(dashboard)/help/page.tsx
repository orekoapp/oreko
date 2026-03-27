'use client';

import {
  BookOpen,
  MessageCircle,
  Mail,
  FileText,
  Video,
  ExternalLink,
  Lightbulb,
  Bug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const helpTopics = [
  {
    icon: FileText,
    title: 'Getting Started',
    description: 'Learn the basics of creating quotes and invoices',
    href: '/help#getting-started',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Comprehensive guides and API references',
    href: '/help#docs',
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Watch step-by-step tutorials',
    href: '/help#tutorials',
  },
  {
    icon: Lightbulb,
    title: 'Tips & Tricks',
    description: 'Get the most out of Oreko',
    href: '/help#tips',
  },
];

const supportOptions = [
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our support team',
    action: 'Start Chat',
    available: false,
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'We\'ll respond within 24 hours',
    action: 'Send Email',
    href: 'mailto:support@oreko.app',
    available: true,
  },
  {
    icon: Bug,
    title: 'Report a Bug',
    description: 'Found an issue? Let us know',
    action: 'Report Bug',
    href: 'mailto:support@oreko.app?subject=Bug%20Report',
    available: true,
  },
];

const faqs = [
  {
    question: 'How do I create my first quote?',
    answer: 'Navigate to Quotes in the sidebar, click "New Quote", fill in the client details and line items, then save or send to your client.',
  },
  {
    question: 'Can I convert a quote to an invoice?',
    answer: 'Yes! Once a quote is accepted, you can convert it to an invoice with one click. All the details will be automatically transferred.',
  },
  {
    question: 'How do I set up payment processing?',
    answer: 'Go to Settings > Payments and connect your Stripe account. Once connected, your clients can pay invoices directly.',
  },
  {
    question: 'Can I customize the look of my quotes?',
    answer: 'Yes! Go to Settings > Branding to customize colors, fonts, and add your logo to all your documents.',
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers, learn best practices, and get support
        </p>
      </div>

      {/* Low #78: Added IDs for anchor navigation from help topic links */}
      <section id="getting-started">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Resources</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {helpTopics.map((topic) => (
            <a
              key={topic.title}
              href={topic.href}
              className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <topic.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{topic.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{topic.description}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section id="tips">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Frequently Asked Questions</h2>
        <div className="rounded-lg border">
          <Accordion type="single" collapsible className="px-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className={index === faqs.length - 1 ? 'border-b-0' : ''}>
                <AccordionTrigger className="text-sm hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Support Options */}
      <section id="docs">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Get Support</h2>
        <div className="rounded-lg border divide-y">
          {supportOptions.map((option) => (
            <div key={option.title} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <option.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{option.title}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
              {option.available ? (
                option.href ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={option.href} target="_blank" rel="noopener noreferrer">
                      {option.action}
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">{option.action}</Button>
                )
              ) : (
                <span className="text-xs text-muted-foreground">Coming soon</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
