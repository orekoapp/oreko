'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  Send,
  Plus,
  Trash2,
  X,
  Import,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getEmailTemplates, getEmailTemplateById } from '@/lib/email/actions';
import { sendQuote } from '@/lib/quotes/actions';
import { sendInvoice } from '@/lib/invoices/actions';
import { sendContractInstance } from '@/lib/contracts/actions';

// ─── Types ────────────────────────────────────────────────
interface LineItemPreview {
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
}

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'invoice' | 'quote' | 'contract';
  documentId: string;
  documentNumber: string;
  recipientEmail: string;
  recipientName: string;
  // Preview data
  businessName?: string;
  total?: number;
  dueDate?: string;
  lineItems?: LineItemPreview[];
  notes?: string;
  // Contract-specific
  contractName?: string;
  onSent?: () => void;
}

const ACCENT = '#3786b3';
const ACCENT_LIGHT = '#e3f2fa';

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


// ─── Main Component ───────────────────────────────────────
export function SendEmailDialog({
  open,
  onOpenChange,
  type,
  documentId,
  documentNumber,
  recipientEmail,
  recipientName,
  businessName = 'Your Business',
  total = 0,
  dueDate,
  lineItems = [],
  notes,
  contractName,
  onSent,
}: SendEmailDialogProps) {
  const label = type === 'invoice' ? 'Invoice' : type === 'quote' ? 'Quote' : 'Contract';
  const actionLabel = type === 'invoice' ? 'Pay this Invoice' : type === 'quote' ? 'Accept Quote' : 'Review & Sign';

  // Recipients
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', name: recipientName, email: recipientEmail },
  ]);
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');

  // Form
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Email templates
  const [emailTemplates, setEmailTemplates] = useState<
    { id: string; name: string; subject: string }[]
  >([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  useEffect(() => {
    if (open && !templatesLoaded) {
      getEmailTemplates({}).then((templates) => {
        setEmailTemplates(templates.map((t) => ({ id: t.id, name: t.name, subject: t.subject })));
        setTemplatesLoaded(true);
      });
    }
  }, [open, templatesLoaded]);

  const stripHtml = (html: string): string => {
    // First decode all HTML entities (handles double-encoded HTML)
    let text = html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    // Decode again in case of double-encoding
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
    // Now strip all HTML tags
    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<\/?(p|div|h[1-6]|ul|ol|li|blockquote|section|article|header|footer|main|nav|aside|figure|figcaption|details|summary)[^>]*>/gi, '\n')
      .replace(/<\/?(strong|b|em|i|u|s|strike|del|ins|sub|sup|small|mark|abbr|code|kbd|samp|var|span)[^>]*>/gi, '')
      .replace(/<a[^>]*href="([^"]*)"[^>]*>[^<]*<\/a>/gi, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return text;
  };

  const replaceVariables = (text: string): string => {
    return text
      .replace(/\{\{client_name\}\}/gi, recipientName || '')
      .replace(/\{\{clientName\}\}/gi, recipientName || '')
      .replace(/\{\{business_name\}\}/gi, businessName || '')
      .replace(/\{\{businessName\}\}/gi, businessName || '')
      .replace(/\{\{document_number\}\}/gi, documentNumber || '')
      .replace(/\{\{documentNumber\}\}/gi, documentNumber || '')
      .replace(/\{\{quote_number\}\}/gi, documentNumber || '')
      .replace(/\{\{quoteNumber\}\}/gi, documentNumber || '')
      .replace(/\{\{invoice_number\}\}/gi, documentNumber || '')
      .replace(/\{\{invoiceNumber\}\}/gi, documentNumber || '')
      .replace(/\{\{quote_total\}\}/gi, total ? formatCurrency(total) : '$0.00')
      .replace(/\{\{quoteTotal\}\}/gi, total ? formatCurrency(total) : '$0.00')
      .replace(/\{\{invoice_total\}\}/gi, total ? formatCurrency(total) : '$0.00')
      .replace(/\{\{invoiceTotal\}\}/gi, total ? formatCurrency(total) : '$0.00')
      .replace(/\{\{total\}\}/gi, total ? formatCurrency(total) : '$0.00')
      .replace(/\{\{amount\}\}/gi, total ? formatCurrency(total) : '$0.00')
      .replace(/\{\{due_date\}\}/gi, dueDate ? formatDate(dueDate) : '')
      .replace(/\{\{dueDate\}\}/gi, dueDate ? formatDate(dueDate) : '')
      .replace(/\{\{quote_valid_until\}\}/gi, dueDate ? formatDate(dueDate) : '')
      .replace(/\{\{quoteValidUntil\}\}/gi, dueDate ? formatDate(dueDate) : '')
      .replace(/\{\{contract_name\}\}/gi, contractName || '')
      .replace(/\{\{contractName\}\}/gi, contractName || '')
      .replace(/\{\{quote_name\}\}/gi, contractName || documentNumber || '')
      .replace(/\{\{quoteName\}\}/gi, contractName || documentNumber || '')
      .replace(/\{\{#if\s+\w+\}\}[\s\S]*?\{\{\/if\}\}/gi, '')
      .replace(/\{\{quote_url\}\}/gi, '[Link will be included automatically]')
      .replace(/\{\{quoteUrl\}\}/gi, '[Link will be included automatically]')
      .replace(/\{\{invoice_url\}\}/gi, '[Link will be included automatically]')
      .replace(/\{\{invoiceUrl\}\}/gi, '[Link will be included automatically]')
      .replace(/\{\{contract_url\}\}/gi, '[Link will be included automatically]')
      .replace(/\{\{contractUrl\}\}/gi, '[Link will be included automatically]')
      .replace(/\{\{message\}\}/gi, '');
  };

  const handleImportTemplate = async (templateId: string) => {
    const detail = await getEmailTemplateById(templateId);
    if (detail) {
      setSubject(replaceVariables(detail.subject));
      setMessage(replaceVariables(stripHtml(detail.body)));
      toast.success('Template imported');
    }
  };

  const effectiveSubject = subject || `${label} #${documentNumber} from ${businessName}`;
  const effectiveMessage = message || `Your message preview will appear here...`;

  const handleAddRecipient = () => {
    if (!newRecipientEmail.trim()) return;
    const name = newRecipientEmail.split('@')[0] || 'Recipient';
    setRecipients((prev) => [
      ...prev,
      { id: Date.now().toString(), name, email: newRecipientEmail.trim() },
    ]);
    setNewRecipientEmail('');
    setShowAddRecipient(false);
  };

  const handleRemoveRecipient = (id: string) => {
    if (recipients.length <= 1) return;
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  // Bug #105: Pass custom recipients, subject, and message to server actions
  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    setIsSending(true);
    try {
      const emailOptions = {
        recipients: recipients.map((r) => r.email),
        subject: subject || undefined,
        message: message || undefined,
      };

      let result: { success: boolean; error?: string; emailSent?: boolean };

      if (type === 'quote') {
        result = await sendQuote(documentId, emailOptions);
      } else if (type === 'invoice') {
        result = await sendInvoice(documentId, emailOptions);
      } else {
        const contractResult = await sendContractInstance(documentId, emailOptions);
        result = { success: true, emailSent: contractResult.emailSent };
      }

      if (result.success) {
        if (result.emailSent) {
          toast.success(`${label} sent successfully!`);
        } else {
          toast.success(`${label} status updated to sent, but email delivery failed. Check email settings.`);
        }
        onOpenChange(false);
        onSent?.();
      } else {
        toast.error(result.error || `Failed to send ${label.toLowerCase()}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to send ${label.toLowerCase()}`;
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setRecipients([{ id: '1', name: recipientName, email: recipientEmail }]);
      setSubject('');
      setMessage('');
      setShowAddRecipient(false);
      setNewRecipientEmail('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!max-w-[1100px] !w-[95vw] !max-h-[90vh] !h-[85vh] !p-0 !gap-0 overflow-hidden flex flex-col">
        {/* ─── Header ───────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background shrink-0">
          <div>
            <DialogTitle className="text-xl font-semibold tracking-tight">Send {label}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              {label} #{documentNumber}
            </DialogDescription>
          </div>
        </div>

        {/* ─── Two Panel Layout ────────────────────── */}
        <div className="flex-1 overflow-hidden grid grid-cols-[1fr,1fr] lg:grid-cols-[1fr,1.1fr]">

          {/* ═══ LEFT PANEL — Form ═══════════════════ */}
          <div className="overflow-y-auto border-r bg-background">
            <div className="p-6 space-y-6">

              {/* Recipients */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold">Recipients</h3>
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium"
                    onClick={() => setShowAddRecipient(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Recipient
                  </button>
                </div>

                <div className="space-y-2">
                  {recipients.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 bg-muted/20"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">
                          {r.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{r.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {recipients.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveRecipient(r.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add recipient inline form */}
                  {showAddRecipient && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={newRecipientEmail}
                        onChange={(e) => setNewRecipientEmail(e.target.value)}
                        className="h-10 flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient()}
                        autoFocus
                      />
                      <Button size="sm" onClick={handleAddRecipient} disabled={!newRecipientEmail.trim()}>
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setShowAddRecipient(false); setNewRecipientEmail(''); }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Subject */}
              <div>
                <h3 className="text-base font-semibold mb-2">Subject</h3>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={`${label} #${documentNumber} from ${businessName}`}
                  className="h-10"
                />
              </div>

              <Separator />

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold">Body</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8 shadow-none">
                        <Import className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                        Select a template to import
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {emailTemplates.length === 0 ? (
                        <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                          No templates available
                        </div>
                      ) : (
                        emailTemplates.map((tmpl) => (
                          <DropdownMenuItem
                            key={tmpl.id}
                            onClick={() => handleImportTemplate(tmpl.id)}
                            className="flex flex-col items-start gap-0.5 cursor-pointer"
                          >
                            <span className="font-medium text-sm">{tmpl.name}</span>
                            <span className="text-xs text-muted-foreground truncate w-full">
                              {tmpl.subject}
                            </span>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter a message..."
                    className="w-full min-h-[200px] p-4 text-sm resize-none focus:outline-none bg-background"
                  />
                </div>
              </div>

              {/* Send Button */}
              <div className="pt-2">
                <Button
                  onClick={handleSend}
                  disabled={isSending}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8"
                >
                  {isSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Email
                </Button>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT PANEL — Email Preview ═════════ */}
          <div className="overflow-y-auto bg-muted/30">
            <div className="p-4 lg:p-6">
              {/* Subject preview */}
              <div className="mb-4 px-4 py-3 bg-muted/50 rounded-lg border border-border/40">
                <p className="text-sm text-muted-foreground">
                  {subject ? subject : (
                    <span className="italic">Your subject preview will appear here...</span>
                  )}
                </p>
              </div>

              {/* Email card */}
              <div className="bg-card border shadow-sm rounded-xl overflow-hidden">
                {/* Branded header with gradient */}
                <div
                  className="h-28 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}22 0%, ${ACCENT}44 40%, ${ACCENT}66 60%, ${ACCENT}33 100%)`,
                  }}
                >
                  {/* Decorative circles */}
                  <div
                    className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20"
                    style={{ background: ACCENT }}
                  />
                  <div
                    className="absolute right-20 -bottom-6 w-24 h-24 rounded-full opacity-15"
                    style={{ background: ACCENT }}
                  />
                  <div
                    className="absolute left-6 bottom-6 w-12 h-12 rounded-full opacity-10"
                    style={{ background: '#fff' }}
                  />
                </div>

                {/* Business name + Label */}
                <div className="px-6 pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">{businessName}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{businessName}</p>
                      <p className="font-bold text-lg mt-0.5" style={{ color: ACCENT }}>
                        {label}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message preview */}
                <div className="px-6 pb-4">
                  {/* CR #24: Split once, not twice per render */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {message ? (() => {
                      const lines = message.split('\n');
                      return lines.map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < lines.length - 1 && <br />}
                        </span>
                      ));
                    })() : (
                      <span className="italic">Your message preview will appear here...</span>
                    )}
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="px-6 pb-4 flex gap-3">
                  <button
                    className="flex-1 h-11 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {actionLabel}
                  </button>
                  <button className="flex-1 h-11 rounded-lg font-medium text-sm flex items-center justify-center gap-2 border border-border hover:bg-muted transition-colors">
                    Download PDF
                  </button>
                </div>

                <Separator />

                {/* Document Summary */}
                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {type === 'contract'
                        ? (contractName || `Contract #${documentNumber}`)
                        : type === 'invoice'
                          ? `Invoice #${documentNumber}`
                          : `Quote #${documentNumber}`}
                    </p>
                    {dueDate && (
                      <p className="text-xs text-muted-foreground">
                        {type === 'invoice' ? 'Due' : type === 'quote' ? 'Valid until' : 'Sent on'} {formatDate(dueDate)}
                      </p>
                    )}
                  </div>

                  {/* Line Items (invoices/quotes only) */}
                  {type !== 'contract' && lineItems.length > 0 && (
                    <div className="space-y-1">
                      {lineItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.name || 'Untitled Item'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
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
                      <Separator className="my-2" />
                    </div>
                  )}

                  {/* Total (invoices/quotes only) */}
                  {type !== 'contract' && (
                    <div className="flex justify-between text-sm font-semibold">
                      <span>{type === 'invoice' ? 'Total Due' : 'Total'}</span>
                      <span className="tabular-nums" style={{ color: ACCENT }}>
                        {formatCurrency(total)}
                      </span>
                    </div>
                  )}

                  {/* Contract description */}
                  {type === 'contract' && (
                    <p className="text-sm text-muted-foreground">
                      Please review and sign this contract at your earliest convenience.
                    </p>
                  )}
                </div>

                {/* Notes */}
                {notes && (
                  <>
                    <Separator />
                    <div className="px-6 py-4">
                      <p className="text-sm italic text-muted-foreground">{notes}</p>
                    </div>
                  </>
                )}

                {/* Legal Footer */}
                <div className="px-6 py-4 bg-muted/30 border-t">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    This email was sent by {businessName} via QuoteCraft. If you have questions
                    about this {type}, please contact {businessName} directly.
                  </p>
                  <div className="flex items-center gap-2 justify-center mt-3">
                    <div className="h-px flex-1 bg-border/40" />
                    <p className="text-[10px] text-muted-foreground/50 whitespace-nowrap">
                      Powered by QuoteCraft
                    </p>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
