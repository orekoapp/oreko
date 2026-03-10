import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Users, Code, Globe } from 'lucide-react';

export const metadata = {
  title: 'About | QuoteCraft',
  description: 'Learn about QuoteCraft and our mission to make invoicing beautiful and accessible.',
};

const values = [
  {
    icon: Heart,
    title: 'Open Source First',
    description:
      'We believe in transparency and community. QuoteCraft is MIT licensed and will always be free to self-host.',
  },
  {
    icon: Users,
    title: 'Built for Freelancers',
    description:
      'We understand the challenges of running a small business. QuoteCraft is designed by freelancers, for freelancers.',
  },
  {
    icon: Code,
    title: 'Developer Friendly',
    description:
      'Modern tech stack, clean codebase, and comprehensive documentation. Contribute or customize to your needs.',
  },
  {
    icon: Globe,
    title: 'Privacy Focused',
    description:
      'Your data belongs to you. Self-host for complete control or trust our privacy-first cloud hosting.',
  },
];

export default function AboutPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">About QuoteCraft</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We&apos;re building the open-source alternative to expensive invoicing tools. Beautiful
            quotes and invoices should be accessible to everyone.
          </p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none mb-16">
          <h2>Our Story</h2>
          <p>
            QuoteCraft was born out of frustration. As freelancers and agency owners ourselves, we
            were tired of choosing between ugly spreadsheet-based invoices and expensive SaaS tools
            that charged $20-50/month just to send a quote.
          </p>
          <p>
            We wanted something different: a beautiful, visual quote builder that was actually
            affordable. When we couldn&apos;t find it, we decided to build it ourselves—and make it
            open source so everyone could benefit.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is simple: make professional invoicing accessible to every freelancer and
            small business, regardless of budget. We believe that looking professional shouldn&apos;t
            cost a fortune.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-16">
          {values.map((value) => (
            <div key={value.title} className="rounded-lg border p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <value.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{value.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join the Community</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            QuoteCraft is built by a community of developers and freelancers. Join us and help shape
            the future of open-source invoicing.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <a
                href="https://github.com/WisdmLabs/quote-software"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
