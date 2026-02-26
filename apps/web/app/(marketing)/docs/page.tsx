import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Book, FileText, Code, Terminal, Rocket, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Documentation | QuoteCraft',
  description: 'Learn how to use QuoteCraft to create beautiful quotes and invoices.',
};

const docSections = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of QuoteCraft and create your first quote.',
    icon: Rocket,
    href: '#getting-started',
  },
  {
    title: 'Quotes',
    description: 'Create, customize, and send professional quotes to your clients.',
    icon: FileText,
    href: '#quotes',
  },
  {
    title: 'Invoices',
    description: 'Convert quotes to invoices and manage payments.',
    icon: Book,
    href: '#invoices',
  },
  {
    title: 'API Reference',
    description: 'Integrate QuoteCraft with your existing tools and workflows.',
    icon: Code,
    href: '/docs/api',
  },
  {
    title: 'Self-Hosting',
    description: 'Deploy QuoteCraft on your own infrastructure with Docker.',
    icon: Terminal,
    href: '#self-hosting',
  },
  {
    title: 'FAQ',
    description: 'Find answers to commonly asked questions.',
    icon: HelpCircle,
    href: '#faq',
  },
];

export default function DocsPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to know to get started with QuoteCraft.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {docSections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="group relative rounded-lg border p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold">{section.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </Link>
          ))}
        </div>

        <section id="getting-started" className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Getting Started</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <h3>1. Create Your Account</h3>
            <p>
              Sign up for a free account at{' '}
              <Link href="/register" className="text-primary hover:underline">
                quote.persuado.tech/register
              </Link>
              . You can also self-host QuoteCraft using Docker.
            </p>

            <h3>2. Set Up Your Business Profile</h3>
            <p>
              Add your business information, logo, and branding in the Settings page. This
              information will appear on all your quotes and invoices.
            </p>

            <h3>3. Create Your First Quote</h3>
            <p>
              Click &quot;New Quote&quot; to open the visual quote builder. Drag and drop blocks
              to create a professional quote, then send it to your client for approval.
            </p>

            <h3>4. Convert to Invoice</h3>
            <p>
              When your client accepts the quote, convert it to an invoice with one click. No
              data re-entry required!
            </p>
          </div>
        </section>

        <section id="self-hosting" className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Self-Hosting with Docker</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p>QuoteCraft can be self-hosted on your own infrastructure using Docker.</p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{`# Clone the repository
git clone https://github.com/quotecraft/quotecraft.git
cd quotecraft

# Start with Docker Compose
docker compose up -d

# QuoteCraft is now running at http://localhost:3000`}</code>
            </pre>
            <p>
              For detailed installation instructions, see our{' '}
              <a
                href="https://github.com/quotecraft/quotecraft"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub repository
              </a>
              .
            </p>
          </div>
        </section>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Need more help?</p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/contact">Contact Support</Link>
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
