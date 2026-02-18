'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PublicQuoteData } from '@/lib/quotes/portal-actions';
import { AcceptQuoteDialog } from './accept-quote-dialog';
import { DeclineQuoteDialog } from './decline-quote-dialog';
import { QuoteBlockRenderer } from './quote-block-renderer';

interface QuotePortalViewProps {
  quote: PublicQuoteData;
  accessToken: string;
}

export function QuotePortalView({ quote, accessToken }: QuotePortalViewProps) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState(quote.status);

  const canRespond = ['sent', 'viewed'].includes(quoteStatus) && !quote.isExpired;
  const isAccepted = quoteStatus === 'accepted';
  const isDeclined = quoteStatus === 'declined';
  const isExpired = quote.isExpired;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.settings.currency,
    }).format(amount);
  };

  const handleAccepted = () => {
    setQuoteStatus('accepted');
    setShowAcceptDialog(false);
  };

  const handleDeclined = () => {
    setQuoteStatus('declined');
    setShowDeclineDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {isExpired && (
        <div className="flex items-center gap-3 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 p-4 text-orange-800 dark:text-orange-200">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">This quote has expired</p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              This quote expired on{' '}
              {new Date(quote.expirationDate!).toLocaleDateString()}. Please
              contact {quote.business.name} to request a new quote.
            </p>
          </div>
        </div>
      )}

      {isAccepted && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 p-4 text-green-800 dark:text-green-200">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Quote Accepted</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Thank you for accepting this quote. {quote.business.name} will be
              in touch with next steps.
            </p>
          </div>
        </div>
      )}

      {isDeclined && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-red-800 dark:text-red-200">
          <XCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Quote Declined</p>
            <p className="text-sm text-red-700 dark:text-red-300">
              You have declined this quote. If you change your mind, please
              contact {quote.business.name}.
            </p>
          </div>
        </div>
      )}

      {/* Quote Info Bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>{quote.quoteNumber}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Issued: {new Date(quote.issueDate).toLocaleDateString()}</span>
        </div>
        {quote.expirationDate && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              Valid until: {new Date(quote.expirationDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Client Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Prepared for</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-semibold">{quote.client.name}</p>
          {quote.client.company && (
            <p className="text-muted-foreground">{quote.client.company}</p>
          )}
          <p className="text-sm text-muted-foreground">{quote.client.email}</p>
        </CardContent>
      </Card>

      {/* Quote Content Blocks */}
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4">
            {quote.blocks.map((block) => (
              <QuoteBlockRenderer key={block.id} block={block} quote={quote} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Line Items (if showLineItemPrices) */}
      {quote.lineItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quote.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {quote.settings.showLineItemPrices && (
                    <div className="ml-4 text-right">
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.rate)}
                      </p>
                      <p className="font-semibold">{formatCurrency(item.amount)}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Totals */}
      <Card>
        <CardContent className="py-4">
          <div className="ml-auto w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(quote.totals.subtotal)}</span>
            </div>
            {quote.totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(quote.totals.discountAmount)}</span>
              </div>
            )}
            {quote.totals.taxTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(quote.totals.taxTotal)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(quote.totals.total)}</span>
            </div>

            {/* Deposit info */}
            {quote.settings.depositRequired && (
              <div className="mt-2 rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium">Deposit Required</p>
                <p className="text-sm text-muted-foreground">
                  {quote.settings.depositType === 'percentage'
                    ? `${quote.settings.depositValue}%`
                    : formatCurrency(quote.settings.depositValue)}{' '}
                  due upon acceptance
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes & Terms */}
      {(quote.notes || quote.terms) && (
        <Card>
          <CardContent className="py-6 space-y-4">
            {quote.notes && (
              <div>
                <h3 className="mb-2 font-semibold">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {quote.notes}
                </p>
              </div>
            )}
            {quote.terms && (
              <div>
                <h3 className="mb-2 font-semibold">Terms & Conditions</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {quote.terms}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {canRespond && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="lg"
            className="sm:min-w-[160px]"
            onClick={() => setShowAcceptDialog(true)}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Accept Quote
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="sm:min-w-[160px]"
            onClick={() => setShowDeclineDialog(true)}
          >
            <XCircle className="mr-2 h-5 w-5" />
            Decline
          </Button>
        </div>
      )}

      {/* Accept Dialog */}
      <AcceptQuoteDialog
        open={showAcceptDialog}
        onOpenChange={setShowAcceptDialog}
        quote={quote}
        accessToken={accessToken}
        onAccepted={handleAccepted}
      />

      {/* Decline Dialog */}
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
