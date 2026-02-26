import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Github, Twitter } from 'lucide-react';

export const metadata = {
  title: 'Contact | QuoteCraft',
  description: 'Get in touch with the QuoteCraft team.',
};

const contactMethods = [
  {
    icon: MessageSquare,
    title: 'Discord Community',
    description: 'Join our Discord server for real-time help and discussions.',
    href: 'https://discord.gg/quotecraft',
    label: 'Join Discord',
  },
  {
    icon: Github,
    title: 'GitHub Issues',
    description: 'Report bugs or request features on our GitHub repository.',
    href: 'https://github.com/quotecraft/quotecraft/issues',
    label: 'Open Issue',
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'For general inquiries and support questions.',
    href: 'mailto:support@quote.persuado.tech',
    label: 'Send Email',
  },
  {
    icon: Twitter,
    title: 'Twitter',
    description: 'Follow us for updates and announcements.',
    href: 'https://twitter.com/quotecraft',
    label: 'Follow Us',
  },
];

export default function ContactPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Have a question? We&apos;re here to help.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {contactMethods.map((method) => (
            <div key={method.title} className="rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <method.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{method.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
              <Button asChild variant="outline" size="sm">
                <a href={method.href} target="_blank" rel="noopener noreferrer">
                  {method.label}
                </a>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg border bg-muted/50 p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mb-6">
            Before reaching out, check if your question has already been answered.
          </p>
          <Button asChild variant="outline">
            <Link href="/#faq">View FAQ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
