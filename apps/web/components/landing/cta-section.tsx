'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function CtaSection() {
  return (
    <section className="bg-transparent py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="rounded-2xl bg-primary/5 border border-primary/10 px-8 py-16 sm:px-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-medium text-foreground tracking-tight">
              Ready to get started?
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Create your first quote in minutes. No credit card required.
              Self-host for free or try our managed cloud.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                Start free trial
              </Link>
              <Link
                href="https://github.com/quotecraft/quotecraft"
                className="group inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Deploy self-hosted
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
