const testimonials = [
  {
    quote:
      'QuoteCraft replaced three different tools for us. We create quotes, convert to invoices, and track payments all in one place. Our cash flow improved within the first month.',
    name: 'Sarah Chen',
    role: 'Founder, Brightpath Design',
  },
  {
    quote:
      'The self-hosted option was the deciding factor. We needed client data on our own servers for compliance, and QuoteCraft made that straightforward.',
    name: 'Marcus Rivera',
    role: 'Director of Operations, Nexus Consulting',
  },
  {
    quote:
      'I switched from Bonsai and saved $300 a year. The quote builder is actually better and the interface is cleaner. Highly recommend for freelancers.',
    name: 'Priya Patel',
    role: 'Independent UX Consultant',
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-accent/50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-display text-3xl font-medium text-foreground tracking-tight text-center">
          Trusted by businesses everywhere
        </h2>
        <p className="mt-4 text-muted-foreground text-center max-w-xl mx-auto">
          Freelancers, agencies, and small teams use QuoteCraft to manage their quoting and invoicing.
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-background rounded-xl border border-border p-8">
              <p className="text-foreground/80 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="font-medium text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
