import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Code, Key, FileJson, Webhook } from 'lucide-react';

export const metadata = {
  title: 'API Reference | Oreko',
  description: 'Integrate Oreko with your existing tools using our REST API.',
};

export default function ApiDocsPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Code className="h-4 w-4" />
            API Reference
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Oreko API</h1>
          <p className="text-xl text-muted-foreground">
            Integrate Oreko with your existing tools and workflows.
          </p>
        </div>

        <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 p-6 mb-12">
          <h2 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            API Coming Soon
          </h2>
          <p className="text-amber-700 dark:text-amber-300">
            We&apos;re currently building out our REST API. Join our waitlist to be notified when
            it&apos;s ready.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Authentication</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Secure API key authentication with role-based access control.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileJson className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">REST API</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Full CRUD operations for quotes, invoices, clients, and more.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Webhook className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Webhooks</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time notifications for quote views, signatures, and payments.
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Code className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">SDKs</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Official SDKs for Node.js, Python, and more coming soon.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Want to be notified when the API is ready?</p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/contact">Join Waitlist</Link>
            </Button>
            <Button asChild>
              <a
                href="https://github.com/orekoapp/oreko"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
