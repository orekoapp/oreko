import { Table, FileQuestion, DollarSign } from 'lucide-react';

const problems = [
  {
    icon: Table,
    title: 'Your invoices look like tax forms',
    description:
      "You're using Zoho, Wave, or Excel. Your quotes are functional but forgettable. Clients see spreadsheets, not professionalism.",
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    icon: FileQuestion,
    title: 'Pretty but no paper trail',
    description:
      "You're using Canva for quotes. They look great but you're copying data manually into invoices. No tracking, no automation, no records.",
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  {
    icon: DollarSign,
    title: 'Bloom costs $20/month for WHAT?',
    description:
      "You've seen Bloom, Bonsai, HoneyBook. They're beautiful but $20-50/month for invoicing feels excessive when you're just starting out.",
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Sound Familiar?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            If you're nodding along, you're not alone. These are the frustrations that led us
            to build QuoteCraft.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${problem.bgColor} mb-6`}
              >
                <problem.icon className={`h-7 w-7 ${problem.color}`} />
              </div>

              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                "{problem.title}"
              </h3>

              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
