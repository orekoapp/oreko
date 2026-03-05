'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  Mail,
  CreditCard,
  Blocks,
  Upload,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { createQuote, updateQuote, sendQuote } from '@/lib/quotes/actions';
import { getClientById } from '@/lib/clients/actions';
import { formatCurrency, cn } from '@/lib/utils';
import type { ServiceItemBlock } from '@/lib/quotes/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { DetailsSection } from './sections/DetailsSection';
import { ItemsSection } from './sections/ItemsSection';
import { TermsSection } from './sections/TermsSection';
import { NotesSection } from './sections/NotesSection';

type PreviewMode = 'payment' | 'email' | 'pdf';
type EditorSection = 'details' | 'items' | 'terms' | 'notes';

interface ClientInfo {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

export function QuoteEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId');

  const {
    document,
    isDirty,
    isSaving,
    initDocument,
    updateTitle,
    updateProjectId,
    updateNotes,
    updateTerms,
    updateInternalNotes,
    addBlock,
    updateBlock,
    removeBlock,
  } = useQuoteBuilderStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('payment');
  const [activeSection, setActiveSection] = useState<EditorSection>('details');
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Form state for quote details
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [expirationDays, setExpirationDays] = useState('30');
  const [taxRate, setTaxRate] = useState('0');

  // Initialize document if not exists or has empty ID (from resetDocument())
  useEffect(() => {
    if (!document || !document.id) {
      const now = new Date().toISOString();
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);

      initDocument({
        id: `temp-${Date.now()}`,
        workspaceId: 'default',
        clientId: clientId || '',
        projectId: null,
        quoteNumber: 'DRAFT',
        status: 'draft',
        title: 'New Quote',
        issueDate: now,
        expirationDate: expDate.toISOString(),
        blocks: [],
        settings: {
          requireSignature: true,
          autoConvertToInvoice: false,
          depositRequired: false,
          depositType: 'percentage',
          depositValue: 50,
          showLineItemPrices: true,
          allowPartialAcceptance: false,
          currency: 'USD',
          taxInclusive: false,
        },
        totals: {
          subtotal: 0,
          discountType: null,
          discountValue: null,
          discountAmount: 0,
          taxTotal: 0,
          total: 0,
        },
        notes: '',
        terms: '',
        internalNotes: '',
      });
    }
  }, [document, initDocument, clientId]);

  // Load client info
  useEffect(() => {
    if (clientId) {
      getClientById(clientId)
        .then((result) => {
          if (result) {
            setClient({
              id: result.id,
              name: result.name,
              email: result.email,
              company: result.company,
            });
          }
        })
        .catch(console.error);
    }
  }, [clientId]);

  // Sync form state with document
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setProjectId(document.projectId);
    }
  }, [document]);

  // Cleanup blob URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (logoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateTitle(newTitle);
  };

  const handleProjectChange = (newProjectId: string | null) => {
    setProjectId(newProjectId);
    updateProjectId(newProjectId);
  };

  const handleClientChange = useCallback((newClient: ClientInfo | null) => {
    setClient(newClient);
    // Update URL to reflect client change
    if (newClient) {
      const url = new URL(window.location.href);
      url.searchParams.set('clientId', newClient.id);
      router.replace(url.pathname + url.search);
    }
  }, [router]);

  // Logo upload handler (mock - in production this would upload to storage)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Only PNG and JPG images are allowed');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      // Revoke previous object URL to prevent memory leak
      if (logoUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(logoUrl);
      }
      // Create a local preview URL
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
      toast.success('Logo uploaded successfully');
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!document) return;

    setIsLoading(true);
    try {
      if (document.id.startsWith('temp-')) {
        // Create new quote
        const result = await createQuote({
          clientId: client?.id || document.clientId,
          projectId: document.projectId,
          title: document.title,
          blocks: document.blocks,
        });

        if (result.success && result.quote) {
          toast.success('Quote saved as draft');
          router.push(`/quotes/${result.quote.id}`);
        }
      } else {
        // Update existing quote
        const result = await updateQuote(document.id, {
          title: document.title,
          blocks: document.blocks,
          notes: document.notes,
          terms: document.terms,
          internalNotes: document.internalNotes,
        });

        if (result.success) {
          toast.success('Quote saved successfully');
        }
      }
    } catch {
      toast.error('Failed to save quote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendQuote = async () => {
    if (!document || !client) return;

    setIsSending(true);
    try {
      // First save if it's a new quote
      let quoteId = document.id;

      if (document.id.startsWith('temp-')) {
        const createResult = await createQuote({
          clientId: client.id,
          projectId: document.projectId,
          title: document.title,
          blocks: document.blocks,
        });

        if (!createResult.success || !createResult.quote) {
          throw new Error('Failed to create quote');
        }
        quoteId = createResult.quote.id;
      }

      // Then send the quote
      const result = await sendQuote(quoteId);

      if (result.success) {
        if (result.emailSent) {
          toast.success('Quote sent and email delivered');
        } else {
          toast.warning('Quote marked as sent, but email delivery failed. Please check your email configuration.');
        }
        router.push(`/quotes/${quoteId}`);
      } else {
        throw new Error(result.error || 'Failed to send quote');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send quote');
    } finally {
      setIsSending(false);
      setShowSendConfirm(false);
    }
  };

  const handleSwitchToBuilder = () => {
    if (client?.id) {
      router.push(`/quotes/new/builder?clientId=${client.id}`);
    } else {
      router.push('/quotes/new/builder');
    }
  };

  // Calculate totals from service item blocks
  const serviceItems = useMemo(() => {
    return (document?.blocks || []).filter(
      (b): b is ServiceItemBlock => b.type === 'service-item'
    );
  }, [document?.blocks]);

  const subtotal = useMemo(() => {
    return serviceItems.reduce(
      (sum, item) => sum + item.content.quantity * item.content.rate,
      0
    );
  }, [serviceItems]);

  const taxAmount = subtotal * (parseFloat(taxRate) / 100);
  const total = subtotal + taxAmount;

  const sectionNav = [
    { id: 'details' as const, label: 'Details' },
    { id: 'items' as const, label: 'Items' },
    { id: 'terms' as const, label: 'Terms' },
    { id: 'notes' as const, label: 'Notes' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/quotes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {title || 'New Quote'}
              {isDirty && (
                <span className="text-muted-foreground ml-2">(unsaved)</span>
              )}
            </h1>
            {client && (
              <p className="text-muted-foreground text-sm">
                For {client.company || client.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSwitchToBuilder} size="sm">
            <Blocks className="mr-2 h-4 w-4" />
            Visual Builder
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isLoading || isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            onClick={() => setShowSendConfirm(true)}
            disabled={isLoading || !client}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Quote
          </Button>
        </div>
      </div>

      {/* Main Content - Split View (~60/40) */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left - Form (~60% = 3 columns) */}
        <div className="space-y-6 lg:col-span-3">
          {/* Section Navigation */}
          <div className="flex gap-2 border-b pb-2">
            {sectionNav.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </div>

          {/* Active Section */}
          {activeSection === 'details' && (
            <DetailsSection
              title={title}
              onTitleChange={handleTitleChange}
              expirationDays={expirationDays}
              onExpirationChange={setExpirationDays}
              taxRate={taxRate}
              onTaxRateChange={setTaxRate}
              client={client}
              onClientChange={handleClientChange}
              projectId={projectId}
              onProjectChange={handleProjectChange}
            />
          )}

          {activeSection === 'items' && (
            <ItemsSection
              blocks={document?.blocks || []}
              onAddBlock={addBlock}
              onUpdateBlock={updateBlock}
              onRemoveBlock={removeBlock}
            />
          )}

          {activeSection === 'terms' && (
            <TermsSection
              terms={document?.terms || ''}
              onTermsChange={(terms) => updateTerms(terms)}
            />
          )}

          {activeSection === 'notes' && (
            <NotesSection
              notes={document?.notes || ''}
              onNotesChange={(notes) => updateNotes(notes)}
              internalNotes={document?.internalNotes || ''}
              onInternalNotesChange={(notes) => updateInternalNotes(notes)}
            />
          )}
        </div>

        {/* Right - Preview (~40% = 2 columns) */}
        <div className="space-y-4 lg:col-span-2">
          {/* Preview Mode Tabs */}
          <Tabs
            value={previewMode}
            onValueChange={(v) => setPreviewMode(v as PreviewMode)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Payment</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Preview Card */}
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="rounded-lg border bg-card p-6 shadow-sm min-h-[500px]">
                {/* Logo Upload Area */}
                <div className="mb-4">
                  <label
                    htmlFor="logo-upload"
                    className={cn(
                      'flex items-center justify-center w-full h-16 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                      logoUrl
                        ? 'border-transparent'
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    {isUploadingLogo ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : logoUrl ? (
                      <div className="relative h-12 w-32">
                        <Image
                          src={logoUrl}
                          alt="Business logo"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4" />
                        <span>Upload logo (PNG/JPG, max 2MB)</span>
                      </div>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Quote Header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">{title || 'Quote'}</h2>
                  <p className="text-sm text-muted-foreground">
                    {document?.quoteNumber || 'DRAFT'}
                  </p>
                  <p className="text-2xl font-bold mt-2">
                    {formatCurrency(total)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Valid for {expirationDays} days
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Client Info */}
                {client && (
                  <div className="mb-6">
                    <p className="font-medium">
                      {client.company || client.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {client.email}
                    </p>
                  </div>
                )}

                {/* Line Items Summary */}
                <div className="space-y-2 mb-6">
                  {serviceItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.content.name || 'Untitled'} ×{' '}
                        {item.content.quantity}
                      </span>
                      <span>
                        {formatCurrency(
                          item.content.quantity * item.content.rate
                        )}
                      </span>
                    </div>
                  ))}

                  {serviceItems.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No items added yet
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax ({taxRate}%)</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {previewMode === 'payment' && (
                  <div className="mt-6 space-y-2">
                    <Button className="w-full" disabled>
                      Accept & Pay Deposit
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Preview only — clients will see this button in the portal
                    </p>
                  </div>
                )}

                {previewMode === 'email' && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm">
                    <p className="font-medium mb-2">Email Preview</p>
                    <p className="text-muted-foreground">
                      Hi {client?.name || 'Client'},
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Please find attached your quote for &quot;{title || 'New Quote'}&quot;
                      totaling {formatCurrency(total)}.
                    </p>
                    <p className="text-muted-foreground mt-2">
                      This quote is valid for {expirationDays} days.
                    </p>
                  </div>
                )}

                {previewMode === 'pdf' && (
                  <div className="mt-6 text-center space-y-2">
                    <Button variant="outline" disabled>
                      <FileText className="mr-2 h-4 w-4" />
                      Download PDF Preview
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PDF generation available after saving the quote
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Send Confirmation Dialog */}
      <AlertDialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Quote?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the quote to {client?.email || 'the client'}. The
              quote status will be updated to &quot;Sent&quot; and the client will receive
              an email with a link to view and accept the quote.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendQuote} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Quote
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
