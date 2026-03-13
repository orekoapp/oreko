import { type ReactNode } from 'react';
import { SettingsNav } from '@/components/settings/settings-nav';
import { SettingsBreadcrumb } from '@/components/settings/settings-breadcrumb';

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
          {children}
        </main>
      </div>
    </div>
  );
}
