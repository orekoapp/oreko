'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Receipt,
  Plus,
  Download,
  Pencil,
  Check,
  ChevronUp,
} from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { getInvoiceColumns, invoiceStatusOptions } from './invoices-columns';
import { InvoiceListItem } from '@/lib/invoices/types';
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
} from '@/components/ui/dialog';
import Link from 'next/link';
import { deleteInvoice, duplicateInvoice, getInvoice } from '@/lib/invoices/actions';
import { cn } from '@/lib/utils';
import { SendEmailDialog } from '@/components/shared/send-email-dialog';
import { RecordPaymentDialog } from './record-payment-dialog';
import { RecurringSettingsDialog, RecurringSettings } from './recurring-settings-dialog';

const ACCENT = '#3786b3';
const ACCENT_LIGHT = '#e3f2fa';
const ACCENT_BG = 'bg-sky-50/60';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface InvoicesDataTableProps {
  data: InvoiceListItem[];
}

export function InvoicesDataTable({ data: initialData }: InvoicesDataTableProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(true);

  // Local data state for status/payment updates
  const [data, setData] = useState(initialData);

  // Dialog states
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendTarget, setSendTarget] = useState<InvoiceListItem | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<InvoiceListItem | null>(null);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [recurringTarget, setRecurringTarget] = useState<InvoiceListItem | null>(null);

  // Payment history for viewing invoice
  const [viewPayments, setViewPayments] = useState<any[]>([]);

  // Recurring invoice IDs (placeholder for future backend support)
  const [recurringIds, setRecurringIds] = useState<Set<string>>(new Set());

  const handleView = async (invoice: InvoiceListItem) => {
    try {
      const fullInvoice = await getInvoice(invoice.id);
      if (fullInvoice) {
        setViewingInvoice(fullInvoice);
        setViewPayments((fullInvoice as any).payments || []);
        setShowDetails(true);
      } else {
        // Fallback: navigate to detail page
        router.push(`/invoices/${invoice.id}`);
      }
    } catch {
      router.push(`/invoices/${invoice.id}`);
    }
  };

  const handleCloseView = () => {
    setViewingInvoice(null);
    setViewPayments([]);
  };

  const handleDelete = async (invoice: InvoiceListItem) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await deleteInvoice(invoice.id);
      if (result.success) {
        toast.success('Invoice deleted successfully');
        setData((prev) => prev.filter((i) => i.id !== invoice.id));
      } else {
        toast.error(result.error || 'Failed to delete invoice');
      }
    } catch {
      toast.error('Failed to delete invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async (invoice: InvoiceListItem) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await duplicateInvoice(invoice.id);
      if (result.success && result.invoiceId) {
        toast.success('Invoice duplicated successfully');
        router.push(`/invoices/${result.invoiceId}`);
      } else {
        toast.error(result.error || 'Failed to duplicate invoice');
      }
    } catch {
      toast.error('Failed to duplicate invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  // Send Invoice
  const handleSend = useCallback((invoice: InvoiceListItem) => {
    setSendTarget(invoice);
    setSendDialogOpen(true);
  }, []);

  const handleSendComplete = useCallback(() => {
    if (sendTarget) {
      setData((prev) =>
        prev.map((inv) =>
          inv.id === sendTarget.id ? { ...inv, status: 'sent' as const } : inv
        )
      );
    }
    setSendTarget(null);
  }, [sendTarget]);

  // Copy Link
  const handleCopyLink = useCallback(async (invoice: InvoiceListItem) => {
    if (!invoice.accessToken) {
      toast.error('No portal link available — send the invoice first');
      return;
    }
    const url = `${window.location.origin}/i/${invoice.accessToken}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  }, []);

  // Record Payment
  const handleRecordPayment = useCallback((invoice: InvoiceListItem) => {
    setPaymentTarget(invoice);
    setPaymentDialogOpen(true);
  }, []);

  const handlePaymentRecorded = useCallback(() => {
    // Refresh data from server after payment recorded
    setPaymentTarget(null);
    router.refresh();
  }, [router]);

  // Recurring Settings
  const handleRecurringSettings = useCallback((invoice: InvoiceListItem) => {
    setRecurringTarget(invoice);
    setRecurringDialogOpen(true);
  }, []);

  const handleRecurringSaved = useCallback((settings: RecurringSettings) => {
    setRecurringTarget(null);
  }, []);

  const columns = getInvoiceColumns({
    onView: handleView,
    onEdit: (invoice) => {
      router.push(`/invoices/${invoice.id}/edit`);
    },
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    onDownload: (invoice) => {
      window.open(`/api/download/invoice/${invoice.id}`, '_blank');
    },
    onSend: handleSend,
    onCopyLink: handleCopyLink,
    onRecordPayment: handleRecordPayment,
    onRecurringSettings: handleRecurringSettings,
    recurringInvoiceIds: recurringIds,
  });

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No invoices yet</h3>
      <p className="text-muted-foreground mb-4">
        Create your first invoice or convert a quote to an invoice
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/quotes">View Quotes</Link>
        </Button>
      </div>
    </div>
  );

  const invoice = viewingInvoice;

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        filterKey="client"
        filterPlaceholder="Search invoices..."
        statusOptions={invoiceStatusOptions}
        statusFilterKey="status"
        pageSizes={[10, 25, 50, 100]}
        emptyState={emptyState}
        onRowClick={(invoice) => router.push(`/invoices/${invoice.id}`)}
      />

      {/* Invoice View Dialog -- Payment Page Style */}
      <Dialog open={!!viewingInvoice} onOpenChange={(open) => !open && handleCloseView()}>
        <DialogContent className="!flex !flex-col !max-w-[520px] !max-h-[90vh] !p-0 !gap-0 overflow-hidden">
          {invoice && (
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

                  {/* Header -- centered */}
                  <div className="px-6 pt-8 pb-5 text-center relative">
                    <div
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3"
                      style={{ backgroundColor: ACCENT_LIGHT }}
                    >
                      <Check className="h-5 w-5" style={{ color: ACCENT }} />
                    </div>
                    <h3 className="text-base font-semibold tracking-tight">
                      {invoice.client?.name || 'Invoice'}
                    </h3>
                    <p className="text-3xl font-bold tracking-tight mt-1" style={{ color: ACCENT }}>
                      {formatCurrency(invoice.totals.total)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Invoice #{invoice.invoiceNumber} &middot; Due {formatDate(invoice.dueDate)}
                    </p>
                  </div>

                  <Separator className="border-gray-100" />

                  {/* Transaction History */}
                  {viewPayments.length > 0 && (
                    <>
                      <div className="px-6 py-4">
                        <p className="text-xs font-medium text-muted-foreground mb-3">Payment History</p>
                        <div className="space-y-2">
                          {viewPayments.map((pmt: any) => (
                            <div
                              key={pmt.id}
                              className="flex items-center justify-between py-2 text-sm border-b border-gray-50 last:border-0"
                            >
                              <div>
                                <p className="font-medium text-sm">{pmt.paymentMethod || 'Payment'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(pmt.paymentDate || pmt.createdAt)}
                                  {pmt.referenceNumber && ` · ${pmt.referenceNumber}`}
                                </p>
                              </div>
                              <span className="font-medium tabular-nums text-green-600 text-sm">
                                +{formatCurrency(pmt.amount)}
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
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm">
                            {invoice.client?.name || 'Select a customer'}
                          </p>
                          {invoice.client?.company && invoice.client.company !== invoice.client.name && (
                            <p className="text-xs text-muted-foreground">
                              {invoice.client.company}
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
                          {invoice.lineItems.map((item: any) => (
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
                          {invoice.totals.discountAmount > 0 && (
                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="tabular-nums">{formatCurrency(invoice.totals.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="tabular-nums text-green-600">-{formatCurrency(invoice.totals.discountAmount)}</span>
                              </div>
                            </div>
                          )}

                          {/* Amount Paid row if applicable */}
                          {invoice.totals.amountPaid > 0 && (
                            <div className="space-y-2 mb-3">
                              {invoice.totals.discountAmount === 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Subtotal</span>
                                  <span className="tabular-nums">{formatCurrency(invoice.totals.subtotal)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Paid</span>
                                <span className="tabular-nums text-green-600">-{formatCurrency(invoice.totals.amountPaid)}</span>
                              </div>
                            </div>
                          )}

                          {/* Total Due row */}
                          <div
                            className={cn(
                              'flex justify-between items-baseline rounded-lg px-3 py-3 -mx-3 border-l-2',
                              ACCENT_BG,
                            )}
                            style={{ borderLeftColor: ACCENT }}
                          >
                            <span className="font-semibold text-sm">Total Due</span>
                            <span className="text-lg font-bold tabular-nums" style={{ color: ACCENT }}>
                              {formatCurrency(invoice.totals.amountDue)}
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

                  {/* Download Button */}
                  <div className="px-6 pb-6 pt-2">
                    <button
                      onClick={() => window.open(`/api/download/invoice/${invoice.id}`, '_blank')}
                      className="w-full h-12 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      <Download className="h-4 w-4" />
                      Download Invoice
                    </button>
                  </div>

                  {/* Powered By Footer */}
                  <div className="px-6 pb-5">
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

              {/* Footer Actions */}
              {(invoice.status as string) === 'draft' && (
                <div className="border-t p-3 flex items-center justify-end bg-background">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      handleCloseView();
                      router.push(`/invoices/${invoice.id}/edit`);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      {sendTarget && (() => {
        return (
          <SendEmailDialog
            open={sendDialogOpen}
            onOpenChange={setSendDialogOpen}
            type="invoice"
            documentId={sendTarget.id}
            documentNumber={sendTarget.invoiceNumber}
            recipientEmail={sendTarget.client.email || ''}
            recipientName={sendTarget.client.name}
            total={sendTarget.total}
            dueDate={sendTarget.dueDate}
            onSent={handleSendComplete}
          />
        );
      })()}

      {/* Record Payment Dialog */}
      {paymentTarget && (
        <RecordPaymentDialog
          invoiceId={paymentTarget.id}
          amountDue={(data.find((i) => i.id === paymentTarget.id)?.amountDue) ?? paymentTarget.amountDue}
          currency="USD"
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}

      {/* Recurring Settings Dialog */}
      {recurringTarget && (
        <RecurringSettingsDialog
          invoiceId={recurringTarget.id}
          open={recurringDialogOpen}
          onOpenChange={setRecurringDialogOpen}
          onSave={handleRecurringSaved}
        />
      )}
    </>
  );
}
