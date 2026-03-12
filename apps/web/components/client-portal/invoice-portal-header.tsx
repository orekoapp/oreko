'use client';

import { Download, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PublicInvoiceData } from '@/lib/invoices/portal-actions';

interface InvoicePortalHeaderProps {
  invoice: PublicInvoiceData;
}

export function InvoicePortalHeader({ invoice }: InvoicePortalHeaderProps) {
  const primaryColor = invoice.branding?.primaryColor || '#3B82F6';

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-4xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Business Logo or Icon */}
            {(invoice.branding?.logoUrl || invoice.business.logoUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(invoice.branding?.logoUrl || invoice.business.logoUrl)!}
                alt={invoice.business.name || 'Business'}
                className="h-10 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <Building2 className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{invoice.business.name}</p>
              <h1 className="font-semibold">{invoice.title}</h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </header>
  );
}
