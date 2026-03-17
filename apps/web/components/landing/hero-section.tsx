import Link from 'next/link';
import Image from 'next/image';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';

export function HeroSection() {
  return (
    <section className="relative bg-background pt-20 pb-16 overflow-hidden">
      <BackgroundRippleEffect />
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-foreground tracking-tight leading-[1.1]">
          Manage clients. Send quotes.
          <br />
          Get paid faster.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The all-in-one quoting and invoicing tool for freelancers and agencies.
          Create, send, track, and get paid — open source and self-hosted.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
          >
            Start free trial
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-foreground border border-border hover:bg-accent rounded-md transition-colors"
          >
            See how it works
          </Link>
        </div>

        {/* Product Screenshot - Invoice Preview */}
        <div className="mt-20 rounded-xl border border-border shadow-xl overflow-hidden">
          <Image
            src="/screenshots/invoice-preview.png"
            alt="QuoteCraft invoice preview showing line items, totals, and payment status"
            width={1280}
            height={800}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
