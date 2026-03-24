import { type ReactNode } from 'react';
import { TemplateTabs } from './template-tabs';

// Low #75: Server component layout — child pages can export static metadata
export default function TemplatesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">
          Manage your contract, invoice, and email templates
        </p>
      </div>
      <TemplateTabs />
      <div>{children}</div>
    </div>
  );
}
