'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { settingsNavItems } from './settings-nav';

export function SettingsBreadcrumb() {
  const pathname = usePathname();

  const currentItem = settingsNavItems.find((item) => {
    if (item.href === '/settings/account') {
      return pathname === '/settings/account' || pathname === '/settings';
    }
    return pathname.startsWith(item.href);
  });

  const pageLabel = currentItem?.label ?? 'Settings';

  return (
    <div className="flex items-center gap-1.5 text-lg">
      <Link
        href="/settings/account"
        className="font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        Settings
      </Link>
      {currentItem && (
        <>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{pageLabel}</span>
        </>
      )}
    </div>
  );
}
