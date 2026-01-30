import Link from 'next/link';
import { ArrowRight, Github, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 -z-10" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 -z-10" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Create Beautiful Invoices?
          </h2>

          <p className="text-lg md:text-xl text-blue-100 mb-10">
            Join thousands of freelancers who've upgraded their invoicing game. Get started in
            minutes, not hours.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/register">
              <Button
                size="lg"
                className="text-lg px-8 py-6 h-auto bg-white text-blue-700 hover:bg-blue-50"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a
              href="https://github.com/quotecraft/quotecraft"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 h-auto border-white/30 text-white hover:bg-white/10"
              >
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </a>
          </div>

          {/* Secondary links */}
          <div className="flex items-center justify-center gap-6 text-blue-100">
            <a
              href="/docs"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Read the Docs
            </a>
            <span className="text-blue-300/50">|</span>
            <span>No credit card required</span>
          </div>
        </div>
      </div>
    </section>
  );
}
