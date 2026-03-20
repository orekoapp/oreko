import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Edit,
  Send,
  ExternalLink,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  RefreshCw,
} from 'lucide-react';
import { getInvoice } from '@/lib/invoices/actions';
import { getCreditNotesForInvoice } from '@/lib/credit-notes/actions';
import { getRecurringSettings } from '@/lib/invoices/recurring';
import { prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isInvoiceOverdue, getDaysUntilDue } from '@/lib/invoices/types';
import { InvoiceActions } from '@/components/invoices/invoice-actions';
import { RecordPaymentButton } from '@/components/invoices/record-payment-button';
import { CreditNoteDialog } from '@/components/invoices/credit-note-dialog';
import { CreditNotesList } from '@/components/invoices/credit-notes-list';
import { RecurringSettingsButton } from '@/components/invoices/recurring-settings-button';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return { title: 'Invoice Not Found' };
  }
  try {
    const invoice = await getInvoice(id);
    return { title: invoice ? `${invoice.title} - ${invoice.invoiceNumber}` : 'Invoice Details' };
  } catch {
    return { title: 'Invoice Not Found' };
  }
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: <Edit className="h-4 w-4" /> },
  sent: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300', icon: <Send className="h-4 w-4" /> },
  viewed: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300', icon: <Clock className="h-4 w-4" /> },
  partial: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300', icon: <DollarSign className="h-4 w-4" /> },
  paid: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300', icon: <CheckCircle className="h-4 w-4" /> },
  overdue: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300', icon: <AlertCircle className="h-4 w-4" /> },
  voided: { bg: 'bg-gray-200 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', icon: <Ban className="h-4 w-4" /> },
};

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    notFound();
  }

  let invoice;
  try {
    invoice = await getInvoice(id);
  } catch (error) {
    console.error('Failed to load invoice:', error);
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load invoice</h2>
        <p className="text-muted-foreground mb-4">
          There was an error loading this invoice. Please try again.
        </p>
        <Button asChild>
          <Link href="/invoices">Back to Invoices</Link>
        </Button>
      </div>
    );
  }

  if (!invoice) {
    notFound();
  }

  const creditNotes = await getCreditNotesForInvoice(invoice.id);
  const recurringSettings = await getRecurringSettings(invoice.id);

  const isOverdue = isInvoiceOverdue(invoice.dueDate, invoice.status);
  const daysUntilDue = getDaysUntilDue(invoice.dueDate);
  const displayStatus = isOverdue && invoice.status !== 'paid' && invoice.status !== 'voided'
    ? 'overdue'
    : invoice.status;
  const defaultStyle = { bg: 'bg-gray-100', text: 'text-gray-700', icon: <Edit className="h-4 w-4" /> };
  const statusStyle = statusColors[displayStatus] ?? defaultStyle;
  // Voided invoices owe nothing regardless of DB value
  const displayAmountDue = invoice.status === 'voided' ? 0 : invoice.totals.amountDue;

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
            {recurringSettings?.enabled && (
              <Badge variant="outline" className="gap-1 border-violet-300 text-violet-600 bg-violet-50 dark:border-violet-600 dark:text-violet-400 dark:bg-violet-950">
                <RefreshCw className="h-3 w-3" />
                Recurring
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {invoice.invoiceNumber} &bull; Issued on{' '}
            {new Date(invoice.issueDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {invoice.status === 'draft' && (
            <Button asChild>
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Invoice
              </Link>
            </Button>
          )}
          <InvoiceActions invoice={invoice} isOverdue={isOverdue} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Invoice Preview */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-card p-8">
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
                      <thead className="bg-muted text-sm">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Description</th>
                          <th className="px-4 py-3 text-right font-medium">Qty</th>
                          <th className="px-4 py-3 text-right font-medium">Rate</th>
                          <th className="px-4 py-3 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {invoice.lineItems.map((item: any) => (
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
                <p data-testid="amount-due" className={`text-xl font-bold ${displayAmountDue > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(displayAmountDue, invoice.settings.currency)}
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
              {invoice.client ? (
                <>
                  <p className="font-medium">{invoice.client.name}</p>
                  {invoice.client.company && invoice.client.company !== invoice.client.name && (
                    <p className="text-sm text-muted-foreground">{invoice.client.company}</p>
                  )}
                  {invoice.client.email && (
                    <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No client assigned</p>
              )}
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href={`/clients/${invoice.clientId}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Client
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recurring Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recurring</CardTitle>
                <RecurringSettingsButton
                  invoiceId={invoice.id}
                  initialSettings={recurringSettings}
                />
              </div>
            </CardHeader>
            <CardContent>
              {recurringSettings?.enabled ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-medium capitalize">{recurringSettings.frequency}</span>
                  </div>
                  {recurringSettings.nextRecurringDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Invoice</span>
                      <span className="font-medium">
                        {new Date(recurringSettings.nextRecurringDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {recurringSettings.endDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ends</span>
                      <span className="font-medium">
                        {new Date(recurringSettings.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auto-send</span>
                    <span className="font-medium">{recurringSettings.autoSend ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not configured. Click the settings button to enable recurring.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Actions */}
          {invoice.status !== 'draft' && invoice.status !== 'voided' && invoice.totals.amountDue > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Record Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <RecordPaymentButton
                  invoiceId={invoice.id}
                  amountDue={invoice.totals.amountDue}
                  currency={invoice.settings.currency}
                />
              </CardContent>
            </Card>
          )}

          {/* Credit Notes */}
          {invoice.status !== 'draft' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Credit Notes</CardTitle>
                  <CreditNoteDialog
                    invoiceId={invoice.id}
                    invoiceLineItems={invoice.lineItems}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {creditNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No credit notes issued for this invoice.
                  </p>
                ) : (
                  <CreditNotesList creditNotes={creditNotes} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity */}
          <InvoiceActivity invoiceId={invoice.id} />

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

async function InvoiceActivity({ invoiceId }: { invoiceId: string }) {
  const { workspaceId } = await getCurrentUserWorkspace();

  const events = await prisma.invoiceEvent.findMany({
    where: {
      invoiceId,
      invoice: { workspaceId },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('sent') || eventType.includes('status_changed_to_sent')) return <Send className="h-4 w-4 text-blue-500" />;
    if (eventType.includes('paid')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (eventType.includes('viewed')) return <Clock className="h-4 w-4 text-yellow-500" />;
    if (eventType.includes('voided')) return <Ban className="h-4 w-4 text-gray-500" />;
    if (eventType.includes('payment')) return <DollarSign className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getEventLabel = (eventType: string) => {
    if (eventType === 'sent' || eventType === 'status_changed_to_sent') return 'Invoice sent';
    if (eventType === 'viewed' || eventType === 'status_changed_to_viewed') return 'Invoice viewed';
    if (eventType === 'paid' || eventType === 'status_changed_to_paid') return 'Invoice paid';
    if (eventType === 'partial' || eventType === 'status_changed_to_partial') return 'Partial payment recorded';
    if (eventType === 'voided' || eventType === 'status_changed_to_voided') return 'Invoice voided';
    if (eventType === 'overdue' || eventType === 'status_changed_to_overdue') return 'Invoice overdue';
    if (eventType.includes('payment')) return 'Payment recorded';
    if (eventType.includes('created')) return 'Invoice created';
    return eventType.replace(/_/g, ' ').replace(/status changed to /i, 'Status changed to ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No activity yet.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="mt-0.5">{getEventIcon(event.eventType)}</div>
                <div className="flex-1">
                  <p className="text-sm">{getEventLabel(event.eventType)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
