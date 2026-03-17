import Link from 'next/link';
import { Github, Shield, Server, Code } from 'lucide-react';

export function OpenSourceSection() {
  return (
    <section className="bg-accent/50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-4">
            <Shield className="h-4 w-4" />
            <span>Open source</span>
          </div>
          <h2 className="font-display text-3xl font-medium text-foreground tracking-tight">
            Own your data. Host it yourself.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            QuoteCraft is open source under the MIT license. Deploy on your own server,
            keep client data private, and customize it however you need.
          </p>

          <Link
            href="https://github.com/quotecraft/quotecraft"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium border border-border bg-background hover:bg-accent text-foreground px-4 py-2.5 rounded-md transition-colors"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </Link>
        </div>

        <div className="mt-16 grid sm:grid-cols-3 gap-10">
          <div>
            <Server className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-display font-medium text-foreground">Self-hosted</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Deploy with Docker in minutes. Your server, your rules, your data.
            </p>
          </div>
          <div>
            <Code className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-display font-medium text-foreground">Fully extensible</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Built with Next.js, Prisma, and PostgreSQL. Fork it and make it yours.
            </p>
          </div>
          <div>
            <Shield className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-display font-medium text-foreground">Privacy first</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              No tracking, no analytics on your data. Client information stays on your server.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
