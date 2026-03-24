import { type ReactNode } from 'react';
import { SettingsNav } from '@/components/settings/settings-nav';
import { SettingsBreadcrumb } from '@/components/settings/settings-breadcrumb';
import { ErrorBoundary } from '@/components/shared/error-boundary';

// Bug #171: Wrap settings children in ErrorBoundary so a single page crash
// doesn't take down the entire settings section (sidebar stays visible)
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="py-6">
      <div className="mb-6">
        <SettingsBreadcrumb />
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="shrink-0 md:w-48">
          <SettingsNav />
        </aside>
        <div className="hidden md:block w-px bg-border" />
        <main className="min-w-0 flex-1">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
