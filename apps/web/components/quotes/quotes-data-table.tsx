'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Download,
  Pencil,
  Check,
  ChevronUp,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { BulkAction } from '@/components/ui/data-table/data-table-toolbar';
import { getQuoteColumns, quoteStatusOptions } from './quotes-columns';
import { QuoteListItem } from '@/lib/quotes/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { duplicateQuote, deleteQuote, getQuote } from '@/lib/quotes/actions';
import { getBusinessProfile } from '@/lib/settings/actions';
import { createInvoiceFromQuote } from '@/lib/invoices/actions';
import { cn } from '@/lib/utils';
import { SendEmailDialog } from '@/components/shared/send-email-dialog';

const ACCENT = '#3786b3';
const ACCENT_LIGHT = '#e3f2fa';
const ACCENT_BG = 'bg-sky-50/60';

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface QuotesDataTableProps {
  data: QuoteListItem[];
}

export function QuotesDataTable({ data: initialData }: QuotesDataTableProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(true);

  // Local data for status updates
  const [data, setData] = useState(initialData);

  const handleView = async (quote: QuoteListItem) => {
    try {
      const fullQuote = await getQuote(quote.id);
      if (fullQuote) {
        setViewingQuote(fullQuote);
        setShowDetails(true);
      } else {
        // Fallback: navigate to quote detail page
        router.push(`/quotes/${quote.id}`);
      }
    } catch {
      router.push(`/quotes/${quote.id}`);
    }
  };

  const handleCloseView = () => {
    setViewingQuote(null);
  };

  const handleDuplicate = async (quote: QuoteListItem) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await duplicateQuote(quote.id);
      if (result.success && result.quoteId) {
        toast.success('Quote duplicated successfully');
        router.push(`/quotes/${result.quoteId}`);
      } else {
        toast.error('Failed to duplicate quote');
      }
    } catch {
      toast.error('Failed to duplicate quote');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (quote: QuoteListItem) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await deleteQuote(quote.id);
      if (result.success) {
        toast.success('Quote deleted successfully');
        setData((prev) => prev.filter((q) => q.id !== quote.id));
      } else {
        toast.error('Failed to delete quote');
      }
    } catch {
      toast.error('Failed to delete quote');
    } finally {
      setIsProcessing(false);
    }
  };

  // Business name for email dialog
  const [businessName, setBusinessName] = useState('');
  useEffect(() => {
    getBusinessProfile().then((p) => setBusinessName(p?.businessName || '')).catch(() => {});
  }, []);

  // Dialog states
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendTarget, setSendTarget] = useState<QuoteListItem | null>(null);

  // Send Quote
  const handleSend = useCallback((quote: QuoteListItem) => {
    setSendTarget(quote);
    setSendDialogOpen(true);
  }, []);

  const handleSendComplete = useCallback(() => {
    if (sendTarget) {
      setData((prev) =>
        prev.map((q) =>
          q.id === sendTarget.id ? { ...q, status: 'sent' } : q
        )
      );
    }
    setSendTarget(null);
  }, [sendTarget]);

  // Bug #75: Copy Link — use access token URL (not quoteNumber).
  // QuoteListItem doesn't include accessToken, so we fall back to the quote detail page.
  const handleCopyLink = useCallback(async (quote: QuoteListItem) => {
    // The public portal URL requires an access token which isn't available on the list item.
    // Copy the internal quote link instead so the user can share from the detail page.
    const url = `${window.location.origin}/quotes/${quote.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied — share the portal link from the quote detail page');
    } catch {
      toast.error('Failed to copy link');
    }
  }, []);

  // Convert to Invoice
  const handleConvertToInvoice = useCallback(async (quote: QuoteListItem) => {
    if (quote.status !== 'accepted') {
      toast.error('Only accepted quotes can be converted to invoices');
      return;
    }

    toast.loading('Converting quote to invoice...', { id: 'convert' });
    try {
      const result = await createInvoiceFromQuote(quote.id);
      if (result.success && result.invoice) {
        toast.success('Quote converted to invoice!', { id: 'convert' });
        setData((prev) =>
          prev.map((q) =>
            q.id === quote.id ? { ...q, status: 'converted' } : q
          )
        );
        router.push(`/invoices/${result.invoice.id}`);
      } else {
        toast.error(result.error || 'Failed to convert quote', { id: 'convert' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to convert quote';
      console.error('Convert to invoice error:', err);
      toast.error(msg, { id: 'convert' });
    }
  }, [router]);

  const columns = getQuoteColumns({
    onView: handleView,
    onEdit: (quote) => {
      router.push(`/quotes/${quote.id}/edit`);
    },
    onDuplicate: handleDuplicate,
    onDelete: handleDelete,
    onDownload: (quote) => {
      window.open(`/api/pdf/quote/${quote.id}`, '_blank');
    },
    onSend: handleSend,
    onCopyLink: handleCopyLink,
    onConvertToInvoice: handleConvertToInvoice,
  });

  const bulkActions: BulkAction<QuoteListItem>[] = [
    {
      label: 'Delete',
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      variant: 'destructive',
      onClick: async (rows) => {
        const drafts = rows.filter((r) => r.status === 'draft');
        if (drafts.length === 0) {
          toast.error('Only draft quotes can be deleted');
          return;
        }
        setIsProcessing(true);
        try {
          let deleted = 0;
          for (const quote of drafts) {
            const result = await deleteQuote(quote.id);
            if (result.success) deleted++;
          }
          toast.success(`${deleted} quote(s) deleted`);
          setData((prev) => prev.filter((q) => !drafts.some((d) => d.id === q.id)));
        } catch {
          toast.error('Failed to delete quotes');
        } finally {
          setIsProcessing(false);
        }
      },
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No quotes yet</h3>
      <p className="text-muted-foreground mb-4">
        Create your first quote to get started
      </p>
      <Button asChild>
        <Link href="/quotes/new">
          <Plus className="mr-2 h-4 w-4" />
          Create Quote
        </Link>
      </Button>
    </div>
  );

  const quote = viewingQuote;

  // Extract line items from blocks for the view dialog
  const lineItems = quote?.blocks
    ?.filter((b: any) => b.type === 'service-item')
    ?.map((b: any) => ({
      id: b.id,
      name: b.content.name || 'Untitled Item',
      description: b.content.description || '',
      quantity: b.content.quantity || 0,
      rate: b.content.rate || 0,
      amount: (b.content.quantity || 0) * (b.content.rate || 0),
    })) || [];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        filterKey="client"
        filterPlaceholder="Search quotes..."
        statusOptions={quoteStatusOptions}
        statusFilterKey="status"
        pageSizes={[10, 25, 50, 100]}
        emptyState={emptyState}
        onRowClick={(quote) => handleView(quote)}
        bulkActions={bulkActions}
      />

      {/* Quote View Dialog — Payment Page Style */}
      <Dialog open={!!viewingQuote} onOpenChange={(open) => !open && handleCloseView()}>
        <DialogContent className="!flex !flex-col !max-w-[520px] !max-h-[90vh] !p-0 !gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Quote Preview</DialogTitle>
          {quote && (
            <>
              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">
                {/* Payment Page Card */}
                <div className="bg-card overflow-hidden relative">
                  {/* Subtle wave decoration */}
                  <svg className="absolute top-0 left-0 pointer-events-none" viewBox="0 0 200 120" fill="none" style={{ width: '45%', height: '100px' }}>
                    <path d="M0 0 L0 80 Q60 72 120 40 Q160 18 200 0 Z" fill={ACCENT} opacity="0.05" />
                    <path d="M0 0 L0 50 Q40 44 80 24 Q110 10 140 0 Z" fill={ACCENT} opacity="0.03" />
                  </svg>

                  {/* Header — centered */}
                  <div className="px-6 pt-8 pb-5 text-center relative">
                    <div
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3"
                      style={{ backgroundColor: ACCENT_LIGHT }}
                    >
                      <Check className="h-5 w-5" style={{ color: ACCENT }} />
                    </div>
                    <h3 className="text-base font-semibold tracking-tight">
                      {quote.client?.name || 'Quote'}
                    </h3>
                    <p className="text-3xl font-bold tracking-tight mt-1" style={{ color: ACCENT }}>
                      {formatCurrency(quote.totals.total)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quote #{quote.quoteNumber} &middot; {quote.expirationDate ? `Valid until ${formatDate(String(quote.expirationDate))}` : `Issued ${formatDate(String(quote.issueDate))}`}
                    </p>
                  </div>

                  <Separator className="border-gray-100" />

                  {/* Client + Line Items (Collapsible) */}
                  <div className="px-6 py-4">
                    <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm">
                            {quote.client?.name || 'Select a customer'}
                          </p>
                          {quote.client?.company && quote.client.company !== quote.client.name && (
                            <p className="text-xs text-muted-foreground">
                              {quote.client.company}
                            </p>
                          )}
                        </div>
                        <CollapsibleTrigger asChild>
                          <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
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
                          {lineItems.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between py-2 text-sm"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {item.name || 'Untitled Item'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {item.quantity} &times; {formatCurrency(item.rate)}
                                  {item.description && (
                                    <span className="ml-1.5 text-muted-foreground/70">
                                      &middot; {item.description}
                                    </span>
                                  )}
                                </p>
                              </div>
                              <span className="ml-4 font-medium tabular-nums text-sm">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                          ))}

                          <Separator className="my-4 border-gray-100" />

                          {/* Subtotal/Discount rows if applicable */}
                          {quote.totals.discountAmount > 0 && (
                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="tabular-nums">{formatCurrency(quote.totals.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="tabular-nums text-green-600">-{formatCurrency(quote.totals.discountAmount)}</span>
                              </div>
                            </div>
                          )}

                          {/* Tax row if applicable */}
                          {quote.totals.taxTotal > 0 && (
                            <div className="space-y-2 mb-3">
                              {quote.totals.discountAmount === 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Subtotal</span>
                                  <span className="tabular-nums">{formatCurrency(quote.totals.subtotal)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="tabular-nums">{formatCurrency(quote.totals.taxTotal)}</span>
                              </div>
                            </div>
                          )}

                          {/* Total row */}
                          <div
                            className={cn(
                              'flex justify-between items-baseline rounded-lg px-3 py-3 -mx-3 border-l-2',
                              ACCENT_BG,
                            )}
                            style={{ borderLeftColor: ACCENT }}
                          >
                            <span className="font-semibold text-sm">Total</span>
                            <span className="text-lg font-bold tabular-nums" style={{ color: ACCENT }}>
                              {formatCurrency(quote.totals.total)}
                            </span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

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
                        <p className="text-xs font-medium text-muted-foreground mb-1">Terms & Conditions</p>
                        <p className="text-sm text-muted-foreground">{quote.terms}</p>
                      </div>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="px-6 pb-4 pt-2 space-y-2">
                    <button
                      className="w-full h-12 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Accept Quote
                    </button>
                    <button
                      onClick={() => window.open(`/api/pdf/quote/${quote.id}`, '_blank')}
                      className="w-full h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors border border-border text-muted-foreground hover:bg-muted/50"
                    >
                      <Download className="h-4 w-4" />
                      Download Quote
                    </button>
                  </div>

                  {/* Powered By Footer */}
                  <div className="px-6 pb-5 pt-2">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="h-px flex-1 bg-border/40" />
                      <p className="text-[10px] text-muted-foreground/50 whitespace-nowrap">
                        Powered by QuoteCraft
                      </p>
                      <div className="h-px flex-1 bg-border/40" />
                    </div>
                  </div>
                </div>
              </div>

            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      {sendTarget && (
        <SendEmailDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          type="quote"
          documentId={sendTarget.id}
          documentNumber={sendTarget.quoteNumber}
          recipientEmail={sendTarget.client?.email || ''}
          recipientName={sendTarget.client?.name || ''}
          businessName={businessName}
          total={sendTarget.total}
          dueDate={sendTarget.expirationDate || undefined}
          onSent={handleSendComplete}
        />
      )}
    </>
  );
}
