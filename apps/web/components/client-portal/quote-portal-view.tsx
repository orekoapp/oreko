'use client';

import { useState } from 'react';
import { Check, Download, CheckCircle2, XCircle, ChevronUp } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { PublicQuoteData } from '@/lib/quotes/portal-actions';
import { calculateDepositAmount } from '@/lib/quotes/utils';
import { QuoteBlockRenderer } from './quote-block-renderer';
import { AcceptQuoteDialog } from './accept-quote-dialog';
import { DeclineQuoteDialog } from './decline-quote-dialog';

interface QuotePortalViewProps {
  quote: PublicQuoteData;
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

export function QuotePortalView({ quote, accessToken }: QuotePortalViewProps) {
  const [showDetails, setShowDetails] = useState(true);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState(quote.status);

  const canRespond = ['sent', 'viewed'].includes(quoteStatus) && !quote.isExpired;
  const currency = quote.currency;
  const accentColor = quote.branding?.primaryColor || ACCENT;
  const accentLight = quote.branding?.primaryColor
    ? `${quote.branding.primaryColor}18`
    : ACCENT_LIGHT;

  const depositAmount = quote.settings.depositRequired
    ? calculateDepositAmount(
        quote.totals.total,
        quote.settings.depositType,
        quote.settings.depositValue
      )
    : 0;

  const handleAccepted = () => {
    setQuoteStatus('accepted');
    setShowAcceptDialog(false);
  };

  const handleDeclined = () => {
    setQuoteStatus('declined');
    setShowDeclineDialog(false);
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
          {quote.business.name}
        </h3>
        <p className="mt-1 text-3xl font-bold tracking-tight" style={{ color: accentColor }}>
          {formatCurrency(quote.totals.total, currency)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Quote #{quote.quoteNumber} &middot;{' '}
          {quote.expirationDate
            ? `Valid until ${formatDate(quote.expirationDate)}`
            : `Issued ${formatDate(quote.issueDate)}`}
        </p>
      </div>

      <Separator className="border-gray-100" />

      {/* Client + Line Items (Collapsible) */}
      <div className="px-6 py-4">
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{quote.client.name}</p>
              {quote.client.company && quote.client.company !== quote.client.name && (
                <p className="text-xs text-muted-foreground">{quote.client.company}</p>
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
              {/* Bug #73: Only show lineItems if blocks don't contain service-items (avoid duplicates) */}
              {quote.lineItems.length > 0 && !quote.blocks.some((b) => b.type === 'service-item') && (
                <>
                  {quote.lineItems.map((item) => (
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
                </>
              )}

              {/* Subtotal/Discount rows */}
              {quote.totals.discountAmount > 0 && (
                <div className="mb-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{formatCurrency(quote.totals.subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="tabular-nums text-green-600">-{formatCurrency(quote.totals.discountAmount, currency)}</span>
                  </div>
                </div>
              )}

              {/* Tax row */}
              {quote.totals.taxTotal > 0 && (
                <div className="mb-3 space-y-2">
                  {quote.totals.discountAmount === 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="tabular-nums">{formatCurrency(quote.totals.subtotal, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="tabular-nums">{formatCurrency(quote.totals.taxTotal, currency)}</span>
                  </div>
                </div>
              )}

              {/* Total row */}
              <div
                className={cn(
                  '-mx-3 flex items-baseline justify-between rounded-lg border-l-2 px-3 py-3',
                  ACCENT_BG,
                )}
                style={{ borderLeftColor: accentColor }}
              >
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-bold tabular-nums" style={{ color: accentColor }}>
                  {formatCurrency(quote.totals.total, currency)}
                </span>
              </div>

              {/* Deposit info */}
              {quote.settings.depositRequired && depositAmount > 0 && (
                <div className="mt-2 rounded-lg border border-dashed px-3 py-2">
                  <p className="text-xs font-medium">
                    Deposit: {quote.settings.depositType === 'percentage' ? `${quote.settings.depositValue}%` : formatCurrency(quote.settings.depositValue, currency)}{' '}
                    ({formatCurrency(depositAmount, currency)}) due upon acceptance
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Content Blocks */}
      {quote.blocks.length > 0 && (
        <>
          <Separator className="border-gray-100" />
          <div className="px-6 py-5">
            <div className="space-y-4">
              {quote.blocks.map((block) => (
                <QuoteBlockRenderer key={block.id} block={block} quote={quote} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      {quote.notes && (
        <>
          <Separator className="border-gray-100" />
          <div className="px-6 py-5">
            <p className="text-sm text-muted-foreground">{quote.notes}</p>
          </div>
        </>
      )}

      {/* Terms */}
      {quote.terms && (
        <>
          <Separator className="border-gray-100" />
          <div className="px-6 py-5">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Terms & Conditions</p>
            <p className="text-sm text-muted-foreground">{quote.terms}</p>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 px-6 pb-4 pt-2">
        {canRespond ? (
          <>
            <button
              onClick={() => setShowAcceptDialog(true)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: accentColor }}
            >
              <CheckCircle2 className="h-4 w-4" />
              Accept Quote
            </button>
            <button
              onClick={() => setShowDeclineDialog(true)}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </button>
          </>
        ) : quoteStatus === 'accepted' ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
            <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">Quote Accepted</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Thank you! Next steps will follow shortly.</p>
          </div>
        ) : quoteStatus === 'declined' ? (
          <div className="py-4 text-center">
            <XCircle className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">Quote Declined</p>
            <p className="mt-0.5 text-xs text-muted-foreground">If you change your mind, please get in touch.</p>
          </div>
        ) : quote.isExpired ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              This quote has expired. Please contact the business to request a new one.
            </p>
          </div>
        ) : (
          <button
            onClick={() => window.open(`/api/download/quote/${quote.id}?token=${accessToken}`, '_blank')}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            <Download className="h-4 w-4" />
            Download Quote
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

      {/* Dialogs */}
      <AcceptQuoteDialog
        open={showAcceptDialog}
        onOpenChange={setShowAcceptDialog}
        quote={quote}
        accessToken={accessToken}
        onAccepted={handleAccepted}
      />
      <DeclineQuoteDialog
        open={showDeclineDialog}
        onOpenChange={setShowDeclineDialog}
        quote={quote}
        accessToken={accessToken}
        onDeclined={handleDeclined}
      />
    </div>
  );
}
