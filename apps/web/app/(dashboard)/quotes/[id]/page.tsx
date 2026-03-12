import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Edit, Download, Trash2, ExternalLink, Receipt, ArrowRight, Clock, CheckCircle, XCircle, Eye, Mail, PenLine } from 'lucide-react';
import { getQuote } from '@/lib/quotes/actions';
import { prisma } from '@quotecraft/database';
import { getCurrentUserWorkspace } from '@/lib/workspace/get-current-workspace';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConvertToInvoiceButton } from '@/components/quotes/convert-to-invoice-button';
import { SendQuoteButton, DuplicateQuoteButton } from '@/components/quotes/quote-detail-actions';

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: QuoteDetailPageProps) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return { title: 'Quote Not Found' };
  }
  try {
    const quote = await getQuote(id);
    return { title: quote ? `${quote.title} - ${quote.quoteNumber}` : 'Quote Details' };
  } catch {
    return { title: 'Quote Not Found' };
  }
}

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' },
  sent: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' },
  viewed: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-700 dark:text-yellow-300' },
  accepted: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' },
  declined: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300' },
  expired: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300' },
  converted: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300' },
};

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    notFound();
  }
  const quote = await getQuote(id);

  if (!quote) {
    notFound();
  }

  const defaultStatus = { bg: 'bg-gray-100', text: 'text-gray-700' };
  const statusStyle = statusColors[quote.status] ?? defaultStatus;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{quote.title}</h1>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
            >
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </span>
          </div>
          <p className="text-muted-foreground">
            {quote.quoteNumber} &bull; Created on{' '}
            {new Date(quote.issueDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DuplicateQuoteButton quoteId={id} />
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/download/quote/${id}`} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </a>
          </Button>
          {quote.status === 'draft' && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/quotes/${id}/builder`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {quote.status === 'draft' && (
            <SendQuoteButton quoteId={id} />
          )}
          {quote.status === 'accepted' && !quote.linkedInvoice && (
            <ConvertToInvoiceButton
              quoteId={quote.id}
              quoteTitle={quote.title}
              total={quote.totals.total}
              currency={quote.settings.currency}
            />
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quote Preview */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quote Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-card p-8">
                {/* Header */}
                <div className="mb-8 flex justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{quote.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Quote #{quote.quoteNumber}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">Issue Date</p>
                    <p className="text-muted-foreground">
                      {new Date(quote.issueDate).toLocaleDateString()}
                    </p>
                    {quote.expirationDate && (
                      <>
                        <p className="mt-2 font-medium">Valid Until</p>
                        <p className="text-muted-foreground">
                          {new Date(quote.expirationDate).toLocaleDateString()}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Line Items */}
                <div className="mb-8">
                  <h3 className="mb-4 font-semibold">Services</h3>
                  <div className="space-y-4">
                    {quote.blocks
                      .filter((b) => b.type === 'service-item')
                      .map((block) => {
                        if (block.type !== 'service-item') return null;
                        const lineTotal =
                          block.content.quantity * block.content.rate;
                        return (
                          <div
                            key={block.id}
                            className="flex items-start justify-between rounded-lg border p-4"
                          >
                            <div>
                              <h4 className="font-medium">{block.content.name}</h4>
                              {block.content.description && (
                                <p className="text-sm text-muted-foreground">
                                  {block.content.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {block.content.quantity} x {formatCurrency(block.content.rate)}
                              </p>
                              <p className="font-semibold">
                                {formatCurrency(lineTotal)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="ml-auto w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
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
                        <span>Tax</span>
                        <span>{formatCurrency(quote.totals.taxTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(quote.totals.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {quote.notes && (
                  <div className="mt-8 border-t pt-4">
                    <h3 className="mb-2 font-semibold">Notes</h3>
                    <p className="text-sm text-muted-foreground">{quote.notes}</p>
                  </div>
                )}

                {/* Terms */}
                {quote.terms && (
                  <div className="mt-4">
                    <h3 className="mb-2 font-semibold">Terms & Conditions</h3>
                    <p className="text-sm text-muted-foreground">{quote.terms}</p>
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
              <CardTitle className="text-base">Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(quote.totals.total)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {quote.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Line Items</p>
                <p className="font-medium">
                  {quote.blocks.filter((b) => b.type === 'service-item').length}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Client Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent>
              {quote.client ? (
                <>
                  <p className="font-medium">{quote.client.name}</p>
                  {quote.client.company && quote.client.company !== quote.client.name && (
                    <p className="text-sm text-muted-foreground">{quote.client.company}</p>
                  )}
                  {quote.client.email && (
                    <p className="text-sm text-muted-foreground">{quote.client.email}</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">No client assigned</p>
              )}
              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <Link href={`/clients/${quote.clientId}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Client
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Linked Invoice */}
          {quote.linkedInvoice && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Linked Invoice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{quote.linkedInvoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {quote.linkedInvoice.status}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/invoices/${quote.linkedInvoice.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Invoice
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Signature */}
          {quote.signatureData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PenLine className="h-4 w-4" />
                  Signature
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border bg-green-50 dark:bg-green-950 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={quote.signatureData.data}
                    alt="Client signature"
                    className="max-h-20 mx-auto"
                  />
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Signed by:</span> {quote.signatureData.signerName}</p>
                  <p><span className="text-muted-foreground">Date:</span> {new Date(quote.signatureData.signedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <p><span className="text-muted-foreground">IP:</span> {quote.signatureData.ipAddress}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity */}
          <QuoteActivity quoteId={quote.id} />
        </div>
      </div>
    </div>
  );
}

async function QuoteActivity({ quoteId }: { quoteId: string }) {
  const { workspaceId } = await getCurrentUserWorkspace();

  const events = await prisma.quoteEvent.findMany({
    where: {
      quoteId,
      quote: { workspaceId },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('sent') || eventType.includes('quote_sent')) return <Mail className="h-4 w-4 text-blue-500" />;
    if (eventType.includes('accepted')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (eventType.includes('declined')) return <XCircle className="h-4 w-4 text-red-500" />;
    if (eventType.includes('viewed')) return <Eye className="h-4 w-4 text-yellow-500" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getEventLabel = (eventType: string) => {
    if (eventType.includes('sent') || eventType === 'quote_sent') return 'Quote sent';
    if (eventType.includes('accepted')) return 'Quote accepted';
    if (eventType.includes('declined')) return 'Quote declined';
    if (eventType.includes('viewed')) return 'Quote viewed';
    if (eventType.includes('created')) return 'Quote created';
    if (eventType.includes('expired')) return 'Quote expired';
    if (eventType.includes('converted')) return 'Quote converted to invoice';
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
