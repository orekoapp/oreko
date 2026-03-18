'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const templateTabs = [
  { label: 'Contracts', href: '/templates/contracts' },
  { label: 'Invoice Items', href: '/templates/invoice-items' },
  { label: 'Invoice Templates', href: '/templates/invoices' },
  { label: 'Emails', href: '/templates/emails' },
];

// Low #75: Extracted to client component so layout can be server component
export function TemplateTabs() {
  const pathname = usePathname();

  return (
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
  );
}
