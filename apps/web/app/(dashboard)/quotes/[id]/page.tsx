import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Edit, Send, Download, Copy, Trash2, ExternalLink, Receipt, ArrowRight } from 'lucide-react';
import { getQuote } from '@/lib/quotes/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConvertToInvoiceButton } from '@/components/quotes/convert-to-invoice-button';

const statusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
  sent: { bg: 'bg-blue-100', text: 'text-blue-700' },
  viewed: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  accepted: { bg: 'bg-green-100', text: 'text-green-700' },
  declined: { bg: 'bg-red-100', text: 'text-red-700' },
  expired: { bg: 'bg-orange-100', text: 'text-orange-700' },
  converted: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { id } = await params;
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
              {quote.status}
            </span>
          </div>
          <p className="text-muted-foreground">
            {quote.quoteNumber} &bull; Created on{' '}
            {new Date(quote.issueDate).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/quotes/${id}/builder`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          {quote.status === 'draft' && (
            <Button size="sm">
              <Send className="mr-2 h-4 w-4" />
              Send to Client
            </Button>
          )}
          {quote.status === 'accepted' && (
            <ConvertToInvoiceButton
              quoteId={quote.id}
              quoteTitle={quote.title}
              total={quote.totals.total}
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
              <div className="rounded-lg border bg-white p-8">
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
                                {block.content.quantity} x $
                                {block.content.rate.toFixed(2)}
                              </p>
                              <p className="font-semibold">
                                ${lineTotal.toFixed(2)}
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
                      <span>${quote.totals.subtotal.toFixed(2)}</span>
                    </div>
                    {quote.totals.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-${quote.totals.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {quote.totals.taxTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>${quote.totals.taxTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                      <span>Total</span>
                      <span>${quote.totals.total.toFixed(2)}</span>
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
                  ${quote.totals.total.toFixed(2)}
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
        </div>
      </div>
    </div>
  );
}
