import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Code, Coffee } from 'lucide-react';

export const metadata = {
  title: 'Careers | QuoteCraft',
  description: 'Join the QuoteCraft team and help build the future of open-source invoicing.',
};

export default function CareersPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Join Our Team</h1>
          <p className="text-xl text-muted-foreground">
            Help us build the future of open-source invoicing.
          </p>
        </div>

        <div className="rounded-lg border bg-muted/50 p-8 text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">We&apos;re Open Source!</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            QuoteCraft is an open-source project maintained by a community of contributors. While
            we don&apos;t have traditional job openings, there are many ways to get involved.
          </p>
        </div>

        <div className="space-y-8">
          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Code className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Contribute Code</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              We welcome contributions of all sizes, from bug fixes to major features. Check out
              our GitHub repository to get started.
            </p>
            <Button asChild variant="outline" size="sm">
              <a
                href="https://github.com/quotecraft/quotecraft/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contributing Guide
              </a>
            </Button>
          </div>

          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <Coffee className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Join the Community</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Connect with other contributors and users on Discord. Share ideas, ask questions,
              and help shape the future of QuoteCraft.
            </p>
            <Button asChild variant="outline" size="sm">
              <a
                href="https://discord.gg/quotecraft"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Discord
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Questions?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Get in touch
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
