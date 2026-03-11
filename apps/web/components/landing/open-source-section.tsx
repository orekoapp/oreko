import { Github, MessageCircle, Code, Container } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  'No vendor lock-in',
  'Inspect the code',
  'Self-host anywhere',
  'Community-driven',
  'Modify and extend',
  'GDPR compliant',
];

const links = [
  {
    label: 'Star on GitHub',
    href: 'https://github.com/WisdmLabs/quote-software',
    icon: Github,
  },
  {
    label: 'Discussions',
    href: 'https://github.com/WisdmLabs/quote-software/discussions',
    icon: MessageCircle,
  },
  {
    label: 'Contribute',
    href: 'https://github.com/WisdmLabs/quote-software/blob/main/CONTRIBUTING.md',
    icon: Code,
  },
  {
    label: 'Docker Hub',
    href: 'https://hub.docker.com/r/wisdmlabs/quotecraft',
    icon: Container,
  },
];

export function OpenSourceSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Code block */}
            <div className="order-2 md:order-1">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 overflow-hidden">
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-slate-500 text-sm font-mono">terminal</span>
                </div>

                {/* Code content */}
                <div className="p-6 font-mono text-sm">
                  <p className="text-slate-400">
                    <span className="text-emerald-400">$</span>{' '}
                    <span className="text-white">docker compose up -d</span>
                  </p>
                  <p className="text-slate-500 mt-4">
                    Creating quotecraft_db_1 ... <span className="text-emerald-400">done</span>
                  </p>
                  <p className="text-slate-500">
                    Creating quotecraft_redis_1 ... <span className="text-emerald-400">done</span>
                  </p>
                  <p className="text-slate-500">
                    Creating quotecraft_app_1 ... <span className="text-emerald-400">done</span>
                  </p>
                  <p className="text-emerald-400 mt-4">
                    QuoteCraft running at http://localhost:3000
                  </p>
                </div>
              </div>

              <p className="text-center text-slate-500 dark:text-slate-400 mt-4 text-sm">
                That's it. QuoteCraft running on your server.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {links.map((link, index) => (
                  <a key={index} href={link.href} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-2">
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </a>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Open Source.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                  Open Future.
                </span>
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Your data. Your server. Your rules. QuoteCraft is MIT licensed, meaning you can
                use, modify, and distribute it freely.
              </p>

              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Why Open Source?
              </h3>

              <ul className="grid grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-green-600 dark:text-green-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 text-sm">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
