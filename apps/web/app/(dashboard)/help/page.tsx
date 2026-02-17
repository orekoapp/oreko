import Link from 'next/link';
import {
  BookOpen,
  MessageCircle,
  Mail,
  FileText,
  Video,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  Bug,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const helpTopics = [
  {
    icon: FileText,
    title: 'Getting Started',
    description: 'Learn the basics of creating quotes and invoices',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Comprehensive guides and API references',
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Watch step-by-step tutorials',
  },
  {
    icon: Lightbulb,
    title: 'Tips & Tricks',
    description: 'Get the most out of QuoteCraft',
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
    description: 'Send us an email and we\'ll respond within 24 hours',
    action: 'Send Email',
    href: 'mailto:support@quotecraft.app',
    available: true,
  },
  {
    icon: Bug,
    title: 'Report a Bug',
    description: 'Found an issue? Let us know',
    action: 'Report Bug',
    href: 'mailto:support@quotecraft.app?subject=Bug%20Report',
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
  {
    question: 'How do rate cards work?',
    answer: 'Rate cards let you save your common services with preset prices. When creating a quote, you can quickly add items from your rate cards.',
  },
];

export const metadata = {
  title: 'Help & Support',
};

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers, learn best practices, and get support
        </p>
      </div>

      {/* Help Topics */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Help Topics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {helpTopics.map((topic) => (
            <Card key={topic.title} className="hover:shadow-md transition-shadow h-full">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <topic.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="grid gap-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Support Options */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Get Support</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {supportOptions.map((option) => (
            <Card key={option.title}>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <option.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {option.available ? (
                  option.href ? (
                    <Button asChild className="w-full">
                      <a href={option.href} target="_blank" rel="noopener noreferrer">
                        {option.action}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button className="w-full">{option.action}</Button>
                  )
                ) : (
                  <Button className="w-full" disabled>
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Additional Resources */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Need more help?</CardTitle>
            <CardDescription>
              Check out our community resources or schedule a demo call
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" asChild>
              <a href="mailto:support@quotecraft.app" target="_blank" rel="noopener noreferrer">
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/settings">
                Back to Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
