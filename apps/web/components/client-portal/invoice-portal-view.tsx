'use client';

import { useState } from 'react';
import { Check, Download, CreditCard, ChevronUp, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { PublicInvoiceData } from '@/lib/invoices/portal-actions';

interface InvoicePortalViewProps {
  invoice: PublicInvoiceData;
  accessToken: string;
}

const ACCENT = '#3786b3';
const ACCENT_LIGHT = '#e3f2fa';
const ACCENT_BG = 'bg-sky-50/60';

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function InvoicePortalView({ invoice, accessToken }: InvoicePortalViewProps) {
  const [showDetails, setShowDetails] = useState(true);
  const currency = invoice.settings.currency;
  const accentColor = invoice.branding?.primaryColor || ACCENT;
  const accentLight = invoice.branding?.primaryColor
    ? `${invoice.branding.primaryColor}18`
    : ACCENT_LIGHT;

  const handlePayment = () => {
    alert('Online payment is not yet available for this invoice. Please contact the business directly for payment options.');
  };

  return (
    <div className="relative overflow-hidden">
      {/* Subtle wave decoration */}
      <svg className="pointer-events-none absolute left-0 top-0" viewBox="0 0 200 120" fill="none" style={{ width: '45%', height: '100px' }}>
        <path d="M0 0 L0 80 Q60 72 120 40 Q160 18 200 0 Z" fill={accentColor} opacity="0.05" />
        <path d="M0 0 L0 50 Q40 44 80 24 Q110 10 140 0 Z" fill={accentColor} opacity="0.03" />
      </svg>

      {/* Hero header — centered */}
      <div className="relative px-6 pb-5 pt-8 text-center">
        <div
          className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: accentLight }}
        >
          <Check className="h-5 w-5" style={{ color: accentColor }} />
        </div>
        <h3 className="text-base font-semibold tracking-tight">
          {invoice.business.name}
        </h3>
        <p className="mt-1 text-3xl font-bold tracking-tight" style={{ color: accentColor }}>
          {formatCurrency(invoice.totals.amountDue || invoice.totals.total, currency)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Invoice #{invoice.invoiceNumber} &middot; Due {formatDate(invoice.dueDate)}
        </p>
      </div>

      <Separator className="border-gray-100" />

      {/* Payment History */}
      {invoice.payments.length > 0 && (
        <>
          <div className="px-6 py-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">Payment History</p>
            <div className="space-y-2">
              {invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b border-gray-50 py-2 text-sm last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {payment.paymentMethod.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.processedAt ? formatDate(payment.processedAt) : ''}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-green-600">
                    +{formatCurrency(payment.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Separator className="border-gray-100" />
        </>
      )}

      {/* Client + Line Items (Collapsible) */}
      <div className="px-6 py-4">
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{invoice.client.name}</p>
              {invoice.client.company && invoice.client.company !== invoice.client.name && (
                <p className="text-xs text-muted-foreground">{invoice.client.company}</p>
              )}
            </div>
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                {showDetails ? 'Hide' : 'Details'}
                <ChevronUp
                  className={cn(
                    'h-3 w-3 transition-transform',
                    !showDetails && 'rotate-180'
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <Separator className="mb-4 border-gray-100" />
            <div className="space-y-2">
              {invoice.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.name || 'Untitled Item'}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.quantity} &times; {formatCurrency(item.rate, currency)}
                      {item.description && (
                        <span className="ml-1.5 text-muted-foreground/70">
                          &middot; {item.description}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="ml-4 text-sm font-medium tabular-nums">
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}

              <Separator className="my-4 border-gray-100" />

              {/* Subtotal/Discount rows */}
              {invoice.totals.discountAmount > 0 && (
                <div className="mb-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{formatCurrency(invoice.totals.subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="tabular-nums text-green-600">-{formatCurrency(invoice.totals.discountAmount, currency)}</span>
                  </div>
                </div>
              )}

              {/* Tax row */}
              {invoice.totals.taxTotal > 0 && (
                <div className="mb-3 space-y-2">
                  {invoice.totals.discountAmount === 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">{formatCurrency(invoice.totals.subtotal, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="tabular-nums">{formatCurrency(invoice.totals.taxTotal, currency)}</span>
                  </div>
                </div>
              )}

              {/* Amount paid row */}
              {invoice.totals.amountPaid > 0 && (
                <div className="mb-3 space-y-2">
                  {invoice.totals.discountAmount === 0 && invoice.totals.taxTotal === 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">{formatCurrency(invoice.totals.subtotal, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid</span>
                    <span className="tabular-nums text-green-600">-{formatCurrency(invoice.totals.amountPaid, currency)}</span>
                  </div>
                </div>
              )}

              {/* Total Due row */}
              <div
                className={cn(
                  '-mx-3 flex items-baseline justify-between rounded-lg border-l-2 px-3 py-3',
                  ACCENT_BG,
                )}
                style={{ borderLeftColor: accentColor }}
              >
                <span className="text-sm font-semibold">Total Due</span>
                <span className="text-lg font-bold tabular-nums" style={{ color: accentColor }}>
                  {formatCurrency(invoice.totals.amountDue ?? invoice.totals.total, currency)}
                </span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <>
          <Separator className="border-gray-100" />
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </div>
        </>
      )}

      {/* Terms */}
      {invoice.terms && (
        <>
          <Separator className="border-gray-100" />
          <div className="px-6 py-5">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Terms & Conditions</p>
            <p className="text-sm text-muted-foreground">{invoice.terms}</p>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 px-6 pb-4 pt-2">
        {invoice.canPay && invoice.totals.amountDue > 0 ? (
          <>
            <button
              onClick={handlePayment}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              <CreditCard className="h-4 w-4" />
              Pay {formatCurrency(invoice.totals.amountDue, currency)}
            </button>
            <button
              onClick={() => window.open(`/api/download/invoice/${invoice.id}`, '_blank')}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </button>
          </>
        ) : (
          <button
            onClick={() => window.open(`/api/download/invoice/${invoice.id}`, '_blank')}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            <Download className="h-4 w-4" />
            Download Invoice
          </button>
        )}
      </div>

      {/* Powered By Footer */}
      <div className="px-6 pb-5 pt-2">
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-border/40" />
          <p className="whitespace-nowrap text-[10px] text-muted-foreground/50">
            Powered by QuoteCraft
          </p>
          <div className="h-px flex-1 bg-border/40" />
        </div>
      </div>
    </div>
  );
}
