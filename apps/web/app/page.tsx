import Link from 'next/link';
import { ArrowRight, FileText, Receipt, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="text-xl font-bold">QuoteCraft</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Log in
            </Link>
            <Button asChild>
              <Link href="/register">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center space-y-8 py-24 text-center md:py-32">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Beautiful Quotes & Invoices
              <br />
              <span className="text-muted-foreground">Made Simple</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Create stunning, professional quotes and invoices in minutes. The open-source
              alternative to Bloom and Bonsai.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-24">
          <div className="mx-auto max-w-[800px] text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Everything you need to get paid
            </h2>
            <p className="mt-4 text-muted-foreground">
              Powerful features designed for freelancers and small businesses
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<FileText className="h-10 w-10" />}
              title="Visual Quote Builder"
              description="Drag-and-drop blocks to create beautiful, professional quotes"
            />
            <FeatureCard
              icon={<Receipt className="h-10 w-10" />}
              title="One-Click Invoicing"
              description="Convert accepted quotes to invoices instantly"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10" />}
              title="Client Portal"
              description="Clients can view, accept, and pay without creating an account"
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10" />}
              title="Online Payments"
              description="Accept credit cards and deposits with Stripe integration"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} QuoteCraft. Open source under MIT license.
          </p>
          <nav className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link
              href="https://github.com/quotecraft/quotecraft"
              className="text-sm text-muted-foreground hover:underline"
            >
              GitHub
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center">
      <div className="text-primary">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
