'use client';

import type { PortalBusinessInfo, PortalBranding } from '@/lib/portal/types';

interface PortalDocumentShellProps {
  business: PortalBusinessInfo;
  branding: PortalBranding | null;
  documentType: 'quote' | 'invoice' | 'contract';
  documentNumber: string;
  statusBadge?: React.ReactNode;
  onDownloadPdf?: () => void;
  children: React.ReactNode;
}

export function PortalDocumentShell({
  children,
}: PortalDocumentShellProps) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-100/80 px-4 py-8 dark:bg-neutral-950 sm:py-12">
      <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border bg-card shadow-lg">
        {children}
      </div>
    </div>
  );
}
