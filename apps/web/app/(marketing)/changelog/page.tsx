import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Changelog | QuoteCraft',
  description: 'See what\'s new in QuoteCraft. Latest updates and improvements.',
};

const releases = [
  {
    version: '1.0.0',
    date: 'February 2026',
    title: 'Initial Release',
    type: 'major',
    changes: [
      'Visual quote builder with drag-and-drop blocks',
      'Client management system',
      'Rate card system for consistent pricing',
      'One-click quote to invoice conversion',
      'E-signature capture with audit trail',
      'Stripe payment integration',
      'PDF generation for quotes and invoices',
      'Email notifications',
      'Dashboard with key metrics',
      'Self-hosting with Docker',
    ],
  },
  {
    version: '0.9.0',
    date: 'January 2026',
    title: 'Beta Release',
    type: 'minor',
    changes: [
      'Public beta launch',
      'Bug fixes and performance improvements',
      'Mobile-responsive design',
      'Dark mode support',
    ],
  },
  {
    version: '0.8.0',
    date: 'December 2025',
    title: 'Alpha Release',
    type: 'minor',
    changes: [
      'Initial alpha release for testing',
      'Core quote and invoice functionality',
      'Basic client management',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Changelog</h1>
          <p className="text-xl text-muted-foreground">
            See what&apos;s new in QuoteCraft. We ship updates regularly.
          </p>
        </div>

        <div className="space-y-12">
          {releases.map((release) => (
            <div key={release.version} className="relative pl-8 border-l-2 border-muted">
              <div className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-primary" />
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge
                  variant={release.type === 'major' ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  v{release.version}
                </Badge>
                <span className="text-sm text-muted-foreground">{release.date}</span>
              </div>
              <h2 className="text-xl font-semibold mb-4">{release.title}</h2>
              <ul className="space-y-2">
                {release.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary mt-1.5">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Want to stay updated?{' '}
            <a
              href="https://github.com/quotecraft/quotecraft"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Star us on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
