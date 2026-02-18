'use client';

import * as React from 'react';
import { CreditCard, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { PublicInvoiceData } from '@/lib/invoices/portal-actions';

interface InvoicePortalViewProps {
  invoice: PublicInvoiceData;
  accessToken: string;
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string; description: string }> = {
  sent: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    icon: <Clock className="h-5 w-5" />,
    label: 'Payment Requested',
    description: 'Please review and pay this invoice.',
  },
  viewed: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: <Clock className="h-5 w-5" />,
    label: 'Awaiting Payment',
    description: 'Please complete payment for this invoice.',
  },
  partial: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    text: 'text-purple-700 dark:text-purple-300',
    icon: <DollarSign className="h-5 w-5" />,
    label: 'Partial Payment Received',
    description: 'A partial payment has been received. Please pay the remaining balance.',
  },
  paid: {
    bg: 'bg-green-50 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-300',
    icon: <CheckCircle className="h-5 w-5" />,
    label: 'Paid in Full',
    description: 'Thank you! This invoice has been paid.',
  },
  overdue: {
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-300',
    icon: <AlertCircle className="h-5 w-5" />,
    label: 'Payment Overdue',
    description: 'This invoice is past due. Please pay as soon as possible.',
  },
  voided: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    icon: <AlertCircle className="h-5 w-5" />,
    label: 'Voided',
    description: 'This invoice has been voided and is no longer valid.',
  },
};

export function InvoicePortalView({ invoice, accessToken }: InvoicePortalViewProps) {
  const primaryColor = invoice.branding?.primaryColor || '#3B82F6';
  const defaultConfig = {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: <Clock className="h-5 w-5" />,
    label: 'Payment Requested',
    description: 'Please review and pay this invoice.',
  };
  const config = statusConfig[invoice.status] ?? defaultConfig;

  const [paymentMessage, setPaymentMessage] = React.useState<string | null>(null);

  const handlePayment = () => {
    setPaymentMessage('Online payment is not yet available for this invoice. Please contact the business directly for payment options.');
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`rounded-lg p-4 ${config.bg}`}>
        <div className="flex items-center gap-3">
          <div className={config.text}>{config.icon}</div>
          <div>
            <h2 className={`font-semibold ${config.text}`}>{config.label}</h2>
            <p className={`text-sm ${config.text} opacity-90`}>{config.description}</p>
          </div>
        </div>
        {invoice.isOverdue && invoice.daysOverdue > 0 && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            This invoice is {invoice.daysOverdue} day{invoice.daysOverdue !== 1 ? 's' : ''} overdue.
          </p>
        )}
      </div>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{invoice.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Invoice #{invoice.invoiceNumber}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Issue Date</p>
              <p className="font-medium">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </p>
              <p className="mt-2 text-muted-foreground">Due Date</p>
              <p className={`font-medium ${invoice.isOverdue ? 'text-red-600' : ''}`}>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Line Items */}
          <div className="overflow-hidden rounded-lg border mb-6">
            <table className="w-full">
              <thead className="bg-muted text-sm">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  {invoice.settings.showLineItemPrices && (
                    <>
                      <th className="px-4 py-3 text-right font-medium">Qty</th>
                      <th className="px-4 py-3 text-right font-medium">Rate</th>
                    </>
                  )}
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </td>
                    {invoice.settings.showLineItemPrices && (
                      <>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(item.rate, invoice.settings.currency)}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(item.amount, invoice.settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="ml-auto w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.totals.subtotal, invoice.settings.currency)}</span>
              </div>
              {invoice.totals.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(invoice.totals.discountAmount, invoice.settings.currency)}</span>
                </div>
              )}
              {invoice.totals.taxTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(invoice.totals.taxTotal, invoice.settings.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(invoice.totals.total, invoice.settings.currency)}</span>
              </div>
              {invoice.totals.amountPaid > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Amount Paid</span>
                    <span>-{formatCurrency(invoice.totals.amountPaid, invoice.settings.currency)}</span>
                  </div>
                  <div className={`flex justify-between border-t pt-2 font-bold ${invoice.totals.amountDue > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    <span>Amount Due</span>
                    <span>{formatCurrency(invoice.totals.amountDue, invoice.settings.currency)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-6 border-t pt-4">
              <h3 className="mb-2 font-semibold">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Terms */}
          {invoice.terms && (
            <div className="mt-4">
              <h3 className="mb-2 font-semibold">Terms & Conditions</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {formatCurrency(payment.amount, invoice.settings.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {payment.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  {payment.processedAt && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.processedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pay Button */}
      {invoice.canPay && (
        <div className="flex flex-col items-center gap-3 pt-4">
          <Button
            size="lg"
            onClick={handlePayment}
            style={{ backgroundColor: primaryColor }}
            className="min-w-[200px] text-white hover:opacity-90"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Pay {formatCurrency(invoice.totals.amountDue, invoice.settings.currency)}
          </Button>
          {paymentMessage && (
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {paymentMessage}
            </p>
          )}
        </div>
      )}

      {/* Billed To */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billed To</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{invoice.client.name}</p>
          {invoice.client.company && (
            <p className="text-sm text-muted-foreground">{invoice.client.company}</p>
          )}
          <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
        </CardContent>
      </Card>

      {/* From */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">From</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{invoice.business.name}</p>
          {invoice.business.email && (
            <p className="text-sm text-muted-foreground">{invoice.business.email}</p>
          )}
          {invoice.business.phone && (
            <p className="text-sm text-muted-foreground">{invoice.business.phone}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
