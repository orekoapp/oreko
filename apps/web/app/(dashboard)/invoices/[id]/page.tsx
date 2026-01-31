import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Receipt,
  Edit,
  Send,
  Download,
  Copy,
  ExternalLink,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
} from 'lucide-react';
import { getInvoice } from '@/lib/invoices/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isInvoiceOverdue, getDaysUntilDue } from '@/lib/invoices/types';
import { InvoiceActions } from '@/components/invoices/invoice-actions';
import { RecordPaymentDialog } from '@/components/invoices/record-payment-dialog';

const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: <Edit className="h-4 w-4" /> },
  sent: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Send className="h-4 w-4" /> },
  viewed: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock className="h-4 w-4" /> },
  partial: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <DollarSign className="h-4 w-4" /> },
  paid: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="h-4 w-4" /> },
  overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: <AlertCircle className="h-4 w-4" /> },
  voided: { bg: 'bg-gray-200', text: 'text-gray-500', icon: <Ban className="h-4 w-4" /> },
};

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    notFound();
  }

  const isOverdue = isInvoiceOverdue(invoice.dueDate, invoice.status);
  const daysUntilDue = getDaysUntilDue(invoice.dueDate);
  const displayStatus = isOverdue && invoice.status !== 'paid' && invoice.status !== 'voided'
    ? 'overdue'
    : invoice.status;
  const defaultStyle = { bg: 'bg-gray-100', text: 'text-gray-700', icon: <Edit className="h-4 w-4" /> };
  const statusStyle = statusColors[displayStatus] ?? defaultStyle;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{invoice.title}</h1>
            <span
              data-testid="invoice-status"
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
            >
              {statusStyle.icon}
              {displayStatus}
            </span>
          </div>
          <p className="text-muted-foreground">
            {invoice.invoiceNumber} &bull; Issued on{' '}
            {new Date(invoice.issueDate).toLocaleDateString()}
          </p>
        </div>

        <InvoiceActions invoice={invoice} isOverdue={isOverdue} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Invoice Preview */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-white p-8">
                {/* Header */}
                <div className="mb-8 flex justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{invoice.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Invoice #{invoice.invoiceNumber}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">Issue Date</p>
                    <p className="text-muted-foreground">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </p>
                    <p className="mt-2 font-medium">Due Date</p>
                    <p className={`${isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                      {isOverdue && ` (${Math.abs(daysUntilDue)} days overdue)`}
                    </p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mb-8">
                  <h3 className="mb-4 font-semibold">Line Items</h3>
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-sm">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Description</th>
                          <th className="px-4 py-3 text-right font-medium">Qty</th>
                          <th className="px-4 py-3 text-right font-medium">Rate</th>
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
                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">
                              {formatCurrency(item.rate, invoice.settings.currency)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {formatCurrency(item.amount, invoice.settings.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                  <div className="mt-8 border-t pt-4">
                    <h3 className="mb-2 font-semibold">Notes</h3>
                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                  </div>
                )}

                {/* Terms */}
                {invoice.terms && (
                  <div className="mt-4">
                    <h3 className="mb-2 font-semibold">Terms & Conditions</h3>
                    <p className="text-sm text-muted-foreground">{invoice.terms}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p data-testid="invoice-total" className="text-2xl font-bold">
                  {formatCurrency(invoice.totals.total, invoice.settings.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {statusStyle.icon}
                  {displayStatus}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p data-testid="amount-due" className={`text-xl font-bold ${invoice.totals.amountDue > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(invoice.totals.amountDue, invoice.settings.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                  {!isOverdue && daysUntilDue >= 0 && (
                    <span className="text-sm text-muted-foreground ml-1">
                      ({daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Line Items</p>
                <p className="font-medium">{invoice.lineItems.length}</p>
              </div>
            </CardContent>
          </Card>

          {/* Client Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Client ID: {invoice.clientId}
              </p>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Client
              </Button>
            </CardContent>
          </Card>

          {/* Payment Actions */}
          {invoice.status !== 'draft' && invoice.status !== 'voided' && invoice.totals.amountDue > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Record Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <RecordPaymentDialog
                  invoiceId={invoice.id}
                  amountDue={invoice.totals.amountDue}
                  currency={invoice.settings.currency}
                />
              </CardContent>
            </Card>
          )}

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No activity yet.
              </p>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          {invoice.internalNotes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {invoice.internalNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
