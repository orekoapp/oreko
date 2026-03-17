'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const templateTabs = [
  { label: 'Contracts', href: '/templates/contracts' },
  { label: 'Invoice Items', href: '/templates/invoice-items' },
  { label: 'Invoice Templates', href: '/templates/invoices' },
  { label: 'Emails', href: '/templates/emails' },
];

export default function TemplatesLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">
          Manage your contract, invoice, and email templates
        </p>
      </div>
      <nav className="border-b">
        <div className="flex gap-6">
          {templateTabs.map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'pb-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div>{children}</div>
    </div>
  );
}
