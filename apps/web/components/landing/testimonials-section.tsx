import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      "Finally, invoices I'm proud to send to clients. The visual builder is incredible and the one-click conversion saved me hours.",
    name: 'Sarah Chen',
    role: 'Freelance Designer',
    handle: '@sarahchendesigns',
    avatar: null, // Would be a real image URL in production
  },
  {
    quote:
      "Switched from Bloom and saving $200/year. Same features, better experience. The self-hosted option sealed the deal.",
    name: 'Marcus Rivera',
    role: 'Marketing Consultant',
    handle: '@marcusrivera',
    avatar: null,
  },
  {
    quote:
      'Self-hosting was a breeze. Docker compose up and done. Total data ownership without the monthly subscription.',
    name: 'David Kim',
    role: 'Software Developer',
    handle: '@devdavidkim',
    avatar: null,
  },
  {
    quote:
      'My clients actually comment on how professional my quotes look now. The signature feature is seamless.',
    name: 'Jennifer Walsh',
    role: 'Interior Designer',
    handle: 'Walsh Interiors',
    avatar: null,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Loved by Freelancers and Agencies
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Join thousands of professionals who've upgraded their invoicing game.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-slate-200 dark:text-slate-700" />

              <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-6 relative z-10">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>

                {/* Info */}
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {testimonial.role}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {testimonial.handle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
