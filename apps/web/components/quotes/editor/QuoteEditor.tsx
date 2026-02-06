'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  Mail,
  CreditCard,
  Blocks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { createQuote, updateQuote } from '@/lib/quotes/actions';
import { getClientById } from '@/lib/clients/actions';
import { formatCurrency } from '@/lib/utils';
import type { ServiceItemBlock } from '@/lib/quotes/types';

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
    updateNotes,
    updateTerms,
    addBlock,
    updateBlock,
    removeBlock,
  } = useQuoteBuilderStore();

  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('payment');
  const [activeSection, setActiveSection] = useState<EditorSection>('details');
  const [client, setClient] = useState<ClientInfo | null>(null);

  // Form state for quote details
  const [title, setTitle] = useState('');
  const [expirationDays, setExpirationDays] = useState('30');
  const [taxRate, setTaxRate] = useState('0');

  // Initialize document if not exists
  useEffect(() => {
    if (!document) {
      const now = new Date().toISOString();
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);

      initDocument({
        id: `temp-${Date.now()}`,
        workspaceId: 'default',
        clientId: clientId || '',
        quoteNumber: `Q-${Date.now().toString().slice(-6)}`,
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
    }
  }, [document]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateTitle(newTitle);
  };

  const handleSave = async () => {
    if (!document) return;

    setIsLoading(true);
    try {
      if (document.id.startsWith('temp-')) {
        // Create new quote
        const result = await createQuote({
          clientId: document.clientId,
          title: document.title,
          blocks: document.blocks,
        });

        if (result.success && result.quote) {
          toast.success('Quote created successfully');
          router.push(`/quotes/${result.quote.id}`);
        }
      } else {
        // Update existing quote
        const result = await updateQuote(document.id, {
          title: document.title,
          blocks: document.blocks,
          notes: document.notes,
          terms: document.terms,
        });

        if (result.success) {
          toast.success('Quote saved successfully');
        }
      }
    } catch (error) {
      toast.error('Failed to save quote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToBuilder = () => {
    if (clientId) {
      router.push(`/quotes/new/builder?clientId=${clientId}`);
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
          <Button disabled={isLoading}>
            <Send className="mr-2 h-4 w-4" />
            Send Quote
          </Button>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left - Form */}
        <div className="space-y-6">
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
            />
          )}
        </div>

        {/* Right - Preview */}
        <div className="space-y-4">
          {/* Preview Mode Tabs */}
          <Tabs
            value={previewMode}
            onValueChange={(v) => setPreviewMode(v as PreviewMode)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Page
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Preview
              </TabsTrigger>
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Quote PDF
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Preview Card */}
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="rounded-lg border bg-white p-6 shadow-sm min-h-[500px]">
                {/* Quote Header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">{title || 'Quote'}</h2>
                  <p className="text-sm text-muted-foreground">
                    {document?.quoteNumber || 'Q-000000'}
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
                  <Button className="w-full mt-6" disabled>
                    Accept & Pay Deposit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
