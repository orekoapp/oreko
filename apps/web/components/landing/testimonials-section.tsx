'use client';

import { Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { Marquee } from '@/components/ui/marquee';
import { SpotlightCard } from '@/components/ui/spotlight-card';

const testimonials = [
  {
    quote:
      'Oreko replaced three different tools for us. We create quotes, convert to invoices, and track payments all in one place. Our cash flow improved within the first month.',
    name: 'Sarah Chen',
    role: 'Founder, Brightpath Design',
  },
  {
    quote:
      'The self-hosted option was the deciding factor. We needed client data on our own servers for compliance, and Oreko made that straightforward.',
    name: 'Marcus Rivera',
    role: 'Director of Operations, Nexus Consulting',
  },
  {
    quote:
      'I switched from Bonsai and saved $300 a year. The quote builder is actually better and the interface is cleaner. Highly recommend for freelancers.',
    name: 'Priya Patel',
    role: 'Independent UX Consultant',
  },
  {
    quote:
      'Finally a tool that looks as professional as the work we deliver. The client portal alone has saved us hours of back-and-forth emails.',
    name: 'James Okafor',
    role: 'Creative Director, Mosaic Studio',
  },
  {
    quote:
      'We tried everything from FreshBooks to HoneyBook. Oreko is the only one that lets us own our data while still having a beautiful interface.',
    name: 'Lisa Nguyen',
    role: 'Co-founder, Springboard Agency',
  },
  {
    quote:
      'The quote-to-invoice conversion is magic. One click and everything carries over. No more re-typing line items or chasing mismatched totals.',
    name: 'David Park',
    role: 'Freelance Photographer',
  },
];

function TestimonialCard({
  quote,
  name,
  role,
}: {
  quote: string;
  name: string;
  role: string;
}) {
  return (
    <SpotlightCard className="w-[350px] shrink-0 rounded-xl border border-border bg-background p-8 flex flex-col transition-shadow hover:shadow-md">
      <Quote className="h-5 w-5 text-primary/40 mb-4" />
      <p className="text-foreground/80 text-sm leading-relaxed flex-1">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
          {name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </SpotlightCard>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-accent/50 py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <motion.div
          className="max-w-xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h2 className="font-display text-3xl font-medium text-foreground tracking-tight">
            Trusted by businesses everywhere
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Freelancers, agencies, and small teams use Oreko to manage their
            quoting and invoicing.
          </p>
        </motion.div>
      </div>

      {/* Marquee row 1 */}
      <Marquee speed={35} className="mb-4 [--gap:1rem]">
        {testimonials.slice(0, 3).map((t) => (
          <TestimonialCard key={t.name} {...t} />
        ))}
      </Marquee>

      {/* Marquee row 2 — reverse direction */}
      <Marquee speed={35} reverse className="[--gap:1rem]">
        {testimonials.slice(3).map((t) => (
          <TestimonialCard key={t.name} {...t} />
        ))}
      </Marquee>
    </section>
  );
}
