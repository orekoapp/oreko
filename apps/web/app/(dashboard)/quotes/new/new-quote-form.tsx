'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSavedLineItems, type SavedLineItemData } from '@/lib/saved-items/actions';
import {
  CalendarIcon,
  Plus,
  Trash2,
  Loader2,
  CreditCard,
  Mail,
  FileText,
  ChevronDown,
  ChevronUp,
  Pencil,
  Download,
  Palette,
  Building2,
  Paperclip,
  Link2,
  CalendarPlus,
  Banknote,
  HelpCircle,
  Check,
  Camera,
  Briefcase,
  Megaphone,
  PartyPopper,
  CheckCircle2,
  PenTool,
} from 'lucide-react';
import { format, addDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn, formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { searchClients } from '@/lib/clients/actions';
import { createQuote, sendQuote, getNextQuoteNumber } from '@/lib/quotes/actions';
import { getInvoiceTemplates } from '@/lib/invoices/actions';
import type { InvoiceTemplateLineItem } from '@/lib/invoices/actions';
import { getBusinessProfile, getWorkspace } from '@/lib/settings/actions';

// ─── Types ───────────────────────────────────────────────
interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
}

type PreviewTab = 'quote' | 'email' | 'pdf';

// ─── Quote Templates ───────────────────────────────────
interface QuoteTemplate {
  label: string;
  style: 'clean' | 'stripe' | 'minimal' | 'accent-bar' | 'glassmorphism' | 'receipt';
  accent: string;
  accentBg: string;
  accentLight: string;
  separatorClass: string;
  cardClass: string;
  amountSize: string;
  buttonColor: string;
  topBorder?: string;
  bgTint?: string;
}

const QUOTE_TEMPLATES: Record<string, QuoteTemplate> = {
  clean: {
    label: 'Clean',
    style: 'clean',
    accent: '#6d28d9',
    accentBg: 'bg-violet-50/60',
    accentLight: '#ede9fe',
    separatorClass: 'border-gray-100',
    cardClass: 'rounded-2xl',
    amountSize: 'text-2xl',
    buttonColor: 'bg-violet-600 hover:bg-violet-700 text-white',
  },
  stripe: {
    label: 'Stripe',
    style: 'stripe',
    accent: '#635bff',
    accentBg: 'bg-indigo-50/60',
    accentLight: '#e0e7ff',
    separatorClass: 'border-gray-100',
    cardClass: 'rounded-xl',
    amountSize: 'text-3xl',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
  minimal: {
    label: 'Minimal',
    style: 'minimal',
    accent: '#18181b',
    accentBg: 'bg-zinc-50/80',
    accentLight: '#f4f4f5',
    separatorClass: 'border-zinc-100',
    cardClass: 'rounded-lg',
    amountSize: 'text-3xl',
    buttonColor: 'bg-zinc-900 hover:bg-zinc-800 text-white',
  },
  ocean: {
    label: 'Ocean',
    style: 'accent-bar',
    accent: '#0d9488',
    accentBg: 'bg-teal-50/60',
    accentLight: '#ccfbf1',
    separatorClass: 'border-teal-50',
    cardClass: 'rounded-xl',
    amountSize: 'text-2xl',
    buttonColor: 'bg-teal-600 hover:bg-teal-700 text-white',
    topBorder: 'linear-gradient(90deg, #14b8a6, #0d9488, #0f766e)',
  },
  glass: {
    label: 'Glass',
    style: 'glassmorphism',
    accent: '#7c3aed',
    accentBg: 'bg-purple-50/40',
    accentLight: '#f3e8ff',
    separatorClass: 'border-purple-100/50',
    cardClass: 'rounded-2xl',
    amountSize: 'text-2xl',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    bgTint: 'linear-gradient(135deg, #faf5ff 0%, #f0f9ff 50%, #fdf4ff 100%)',
  },
  receipt: {
    label: 'Receipt',
    style: 'receipt',
    accent: '#059669',
    accentBg: 'bg-emerald-50/60',
    accentLight: '#d1fae5',
    separatorClass: 'border-dashed border-gray-200',
    cardClass: 'rounded-lg',
    amountSize: 'text-3xl',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  sunset: {
    label: 'Sunset',
    style: 'accent-bar',
    accent: '#ea580c',
    accentBg: 'bg-orange-50/60',
    accentLight: '#ffedd5',
    separatorClass: 'border-orange-100',
    cardClass: 'rounded-xl',
    amountSize: 'text-2xl',
    buttonColor: 'bg-orange-600 hover:bg-orange-700 text-white',
    topBorder: 'linear-gradient(90deg, #f97316, #ea580c, #dc2626)',
  },
  corporate: {
    label: 'Corporate',
    style: 'stripe',
    accent: '#1e40af',
    accentBg: 'bg-blue-50/60',
    accentLight: '#dbeafe',
    separatorClass: 'border-blue-50',
    cardClass: 'rounded-lg',
    amountSize: 'text-2xl',
    buttonColor: 'bg-blue-700 hover:bg-blue-800 text-white',
  },
  quotecraft: {
    label: 'QuoteCraft',
    style: 'clean',
    accent: '#3786b3',
    accentBg: 'bg-primary-50/60',
    accentLight: '#e3f2fa',
    separatorClass: 'border-primary-100',
    cardClass: 'rounded-2xl',
    amountSize: 'text-3xl',
    buttonColor: 'bg-primary-600 hover:bg-primary-700 text-white',
  },
};

type TemplateName = keyof typeof QUOTE_TEMPLATES;

// ─── Main Component ──────────────────────────────────────
interface NewQuoteFormProps {
  defaultCurrency?: string;
}

export default function NewQuoteForm({ defaultCurrency = 'USD' }: NewQuoteFormProps) {
  const router = useRouter();
  // toast from sonner (imported at top)
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState(defaultCurrency);

  // Real clients from DB
  const [clients, setClients] = useState<Array<{ id: string; name: string; email: string; company: string | null }>>([]);

  const [businessName, setBusinessName] = useState('Your Business');

  useEffect(() => {
    searchClients('', 50).then(setClients).catch(() => {});
    getNextQuoteNumber().then(setQuoteNumber).catch((err) => console.error('Failed to fetch quote number:', err));
    // Try business profile first, fall back to workspace name
    Promise.all([getBusinessProfile(), getWorkspace()])
      .then(([bp, ws]) => {
        setBusinessName(bp?.businessName || ws.name || 'Your Business');
      })
      .catch(() => {});
  }, []);

  // Form State
  const [quoteNumber, setQuoteNumber] = useState('QT-0001');
  const [issueDate, setIssueDate] = useState<Date | undefined>(new Date());
  const [expirationDays, setExpirationDays] = useState('30');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxRate, setTaxRate] = useState('0% - Default');
  const [customTaxRate, setCustomTaxRate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');

  // Quote Details Options
  const [showBillAsCompany, setShowBillAsCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [showCustomField, setShowCustomField] = useState(false);
  const [customFieldLabel, setCustomFieldLabel] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  // Add Enhancements
  const [showDescription, setShowDescription] = useState(false);
  const [description, setDescription] = useState('');
  const [showContract, setShowContract] = useState(false);
  const [contractRef, setContractRef] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);

  // Quote Settings
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [signatureRequired, setSignatureRequired] = useState(false);

  // UI State
  const [previewTab, setPreviewTab] = useState<PreviewTab>('quote');
  const [showPreviewDetails, setShowPreviewDetails] = useState(true);
  const [templateName, setTemplateName] = useState<TemplateName>('quotecraft');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<SavedLineItemData[]>([]);

  // Load saved items and invoice templates for dropdowns
  const [invoiceTemplates, setInvoiceTemplates] = useState<{ id: string; name: string; lineItems: InvoiceTemplateLineItem[] }[]>([]);
  useEffect(() => {
    getSavedLineItems().then(setSavedItems).catch(() => {});
    getInvoiceTemplates().then(({ data }) => {
      setInvoiceTemplates(data.map((t) => ({ id: t.id, name: t.name, lineItems: t.lineItems })));
    }).catch(() => {});
  }, []);

  // Refs
  const pdfRef = useRef<HTMLDivElement>(null);

  // Derived State
  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId),
    [selectedClientId]
  );

  const tpl = (QUOTE_TEMPLATES[templateName] ?? QUOTE_TEMPLATES.clean) as QuoteTemplate;

  const subtotal = lineItems.reduce(
    (acc, item) => acc + item.quantity * item.rate,
    0
  );
  const discountAmount = discountType === 'percent'
    ? Math.round(subtotal * (discount / 100) * 100) / 100
    : discount;
  const total = Math.max(0, subtotal - discountAmount);

  const expirationDate = issueDate
    ? addDays(issueDate, parseInt(expirationDays) || 30)
    : undefined;

  // ─── Handlers ────────────────────────────────────────
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        description: '',
        quantity: 1,
        rate: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (
    id: string,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!selectedClientId) {
      toast.error('Please select a client');
      return;
    }
    if (lineItems.length === 0 || !lineItems.some(i => i.name.trim())) {
      toast.error('Please add at least one line item');
      return;
    }
    if (!terms.trim()) {
      toast.error('Please add terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const blocks = lineItems.filter(i => i.name.trim()).map(item => ({
        id: item.id,
        type: 'service-item' as const,
        content: {
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          unit: 'unit',
          taxRate: customTaxRate ? parseFloat(customTaxRate) : null,
          rateCardId: null,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      console.log('Creating quote with:', { clientId: selectedClientId, title: lineItems[0]?.name, blocks: blocks.length });

      const result = await createQuote({
        clientId: selectedClientId,
        title: lineItems[0]?.name || 'Untitled Quote',
        currency,
        expirationDate: expirationDate?.toISOString(),
        blocks,
        notes: notes || undefined,
        terms: terms || undefined,
        isDraft,
      });

      console.log('Create quote result:', result);

      if (result.success && result.quote?.id) {
        if (!isDraft) {
          const sendResult = await sendQuote(result.quote.id);
          if (!sendResult.success) {
            toast.error(sendResult.error || 'Quote created but email could not be sent. You can resend from the quotes list.');
            router.push('/quotes');
            return;
          }
        }
        toast.success(isDraft ? 'Draft Saved' : 'Quote Sent');
        router.push('/quotes');
      } else {
        toast.error(result.error || 'Failed to create quote');
      }
    } catch (err) {
      console.error('Create quote error:', err);
      toast.error('Failed to create quote. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultTerms = () => {
    setTerms(
      '1. This quote is valid for the period specified above.\n' +
      '2. Payment terms: 50% deposit upon acceptance, balance due on completion.\n' +
      '3. Additional work outside the scope of this quote will be billed separately.\n' +
      `4. All prices are in ${currency} unless otherwise stated.\n` +
      '5. By accepting this quote, you agree to these terms and conditions.'
    );
  };

  // Business name loaded from workspace settings above

  // ─── PDF Download Handler ─────────────────────────────
  const handleDownloadPdf = useCallback(async () => {
    if (!pdfRef.current) return;
    setPdfGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 595,
        height: 842,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 595, 842);
      pdf.save(`Quote-${quoteNumber}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  }, [quoteNumber, toast]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">

      {/* ─── Main Content ────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        <div className="grid lg:grid-cols-[1fr,420px] xl:grid-cols-[1fr,480px] h-full">
          {/* ═══════════════════════════════════════════ */}
          {/* LEFT PANEL — Editor                        */}
          {/* ═══════════════════════════════════════════ */}
          <div className="overflow-y-auto no-scrollbar border-r bg-background">
            <div className="max-w-[640px] mx-auto py-10 px-8 space-y-0">
              {/* ─── Quote Details Section ──────────── */}
              <div className="pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold tracking-tight font-display">
                    Quote Details
                  </h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                        Options
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-1">
                      <div
                        role="menuitem"
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => setShowBillAsCompany(!showBillAsCompany)}
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>Bill as Company</span>
                        </div>
                        <Switch
                          checked={showBillAsCompany}
                          onCheckedChange={setShowBillAsCompany}
                          className="scale-75"
                        />
                      </div>
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors"
                        onClick={() => setShowCustomField(!showCustomField)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                        <span>Add Custom Field</span>
                        {showCustomField && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                      </button>
                      <div className="h-px bg-border/50 my-1" />
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors"
                        onClick={() => setShowDescription(!showDescription)}
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>Add Description</span>
                        {showDescription && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                      </button>
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors"
                        onClick={() => setShowContract(!showContract)}
                      >
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <span>Add Contract</span>
                        {showContract && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                      </button>
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors"
                        onClick={() => setShowAttachments(!showAttachments)}
                      >
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span>Add Attachments</span>
                        {showAttachments && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                      </button>
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors"
                        onClick={() => setShowEvent(!showEvent)}
                      >
                        <CalendarPlus className="h-4 w-4 text-muted-foreground" />
                        <span>Add Event</span>
                        {showEvent && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Client Selector / Display */}
                <div className="mb-5">
                  {selectedClient ? (
                    <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3 bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {selectedClient.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {selectedClient.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedClient.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => setSelectedClientId('')}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => setSelectedClientId('')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Customer
                      </Label>
                      <Select
                        value={selectedClientId}
                        onValueChange={setSelectedClientId}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              <div className="flex items-center gap-2">
                                <span>{client.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  {client.email}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Bill as Company — shown when toggled */}
                {showBillAsCompany && (
                  <div className="mb-4 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Company Name</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-10"
                      placeholder="Enter company name"
                    />
                  </div>
                )}

                {/* Issue Date / Quote Number / Tax Rate — Compact Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Issue Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal h-11 text-sm bg-card shadow-none',
                            !issueDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          {issueDate
                            ? format(issueDate, 'MMM do, yyyy')
                            : 'Pick date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={issueDate}
                          onSelect={setIssueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Quote Number
                    </Label>
                    <Input
                      value={quoteNumber}
                      readOnly
                      disabled
                      className="h-11 opacity-60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Tax rate
                    </Label>
                    <Select value={taxRate} onValueChange={(v) => {
                      setTaxRate(v);
                      if (v !== 'custom') setCustomTaxRate('');
                    }}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0% - Default">
                          0% - Default
                        </SelectItem>
                        <SelectItem value="5% - GST">5% - GST</SelectItem>
                        <SelectItem value="10% - VAT">10% - VAT</SelectItem>
                        <SelectItem value="18% - GST">18% - GST</SelectItem>
                        <SelectItem value="custom">Set Custom Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Tax Rate Input */}
                {taxRate === 'custom' && (
                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Custom Tax Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={customTaxRate}
                      onChange={(e) => setCustomTaxRate(e.target.value)}
                      className="h-10 w-32"
                      placeholder="e.g. 12.5"
                    />
                  </div>
                )}

                {/* Expiration Period */}
                <div className="mt-3 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Valid For</Label>
                  <Select value={expirationDays} onValueChange={setExpirationDays}>
                    <SelectTrigger className="h-10 max-w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="45">45 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Currency Selector */}
                <div className="mt-3 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="h-10 max-w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                      <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
                      <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Field — shown when toggled */}
                {showCustomField && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Field Label</Label>
                      <Input
                        value={customFieldLabel}
                        onChange={(e) => setCustomFieldLabel(e.target.value)}
                        placeholder="e.g. Project Name"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Field Value</Label>
                      <Input
                        value={customFieldValue}
                        onChange={(e) => setCustomFieldValue(e.target.value)}
                        placeholder="e.g. Website Redesign"
                        className="h-10"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Add Enhancements — Dropdown ─────── */}
              {(showDescription || showContract || showAttachments || showEvent) && (
                <div className="mt-8 space-y-6">
                  {showDescription && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <button
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => { setShowDescription(false); setDescription(''); }}
                        >
                          Remove
                        </button>
                      </div>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="resize-none min-h-[80px]"
                        placeholder="Describe this project or service..."
                      />
                    </div>
                  )}
                  {showContract && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Contract Reference</Label>
                        <button
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => { setShowContract(false); setContractRef(''); }}
                        >
                          Remove
                        </button>
                      </div>
                      <Input
                        value={contractRef}
                        onChange={(e) => setContractRef(e.target.value)}
                        className="h-10"
                        placeholder="Link or reference to contract..."
                      />
                    </div>
                  )}
                  {showAttachments && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Attachments</Label>
                        <button
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => setShowAttachments(false)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="border-2 border-dashed rounded-lg px-4 py-6 text-center text-muted-foreground text-sm hover:border-primary/30 transition-colors cursor-pointer bg-muted/10">
                        <Paperclip className="h-5 w-5 mx-auto mb-2 opacity-50" />
                        <p>Click to upload or drag files here</p>
                        <p className="text-xs mt-1">PDF, Images up to 10MB</p>
                      </div>
                    </div>
                  )}
                  {showEvent && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Event Details</Label>
                        <button
                          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => { setShowEvent(false); setEventName(''); setEventDate(undefined); }}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                          className="h-10"
                          placeholder="Event name"
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal h-10 text-sm',
                                !eventDate && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                              {eventDate ? format(eventDate, 'MMM do, yyyy') : 'Event date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={eventDate}
                              onSelect={setEventDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Separator className="bg-border/60" />

              {/* ─── Items Section ────────────────────── */}
              <div className="py-8">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-semibold tracking-tight font-display">
                    Items
                  </h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                        Templates
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-64 p-1">
                      <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">Load a template</p>
                      {invoiceTemplates.length === 0 ? (
                        <div className="py-4 text-center">
                          <p className="text-xs text-muted-foreground">No templates yet</p>
                          <button
                            onClick={() => router.push('/templates/invoices')}
                            className="text-xs text-primary hover:text-primary/80 mt-1"
                          >
                            Create templates →
                          </button>
                        </div>
                      ) : (
                        invoiceTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => {
                              setLineItems(
                                template.lineItems.map((item) => ({
                                  id: Math.random().toString(36).substr(2, 9),
                                  name: item.name,
                                  description: item.description || '',
                                  quantity: item.qty,
                                  rate: item.rate,
                                }))
                              );
                            }}
                            className="w-full flex items-center gap-2.5 px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors text-left"
                          >
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{template.name}</span>
                          </button>
                        ))
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Items Table Header */}
                {lineItems.length > 0 && (
                  <div className="grid grid-cols-[1fr,80px,60px,32px] gap-3 mb-3 px-3">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Items
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Rate
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Qty
                    </span>
                    <span />
                  </div>
                )}

                {/* Line Items */}
                <div className="space-y-0 mb-5">
                  {lineItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        'group px-3 py-3 transition-colors hover:bg-muted/30',
                        index !== lineItems.length - 1 && 'border-b border-border/40'
                      )}
                    >
                      <div className="grid grid-cols-[1fr,80px,60px,32px] gap-3 items-center">
                        <Input
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) =>
                            updateLineItem(item.id, 'name', e.target.value)
                          }
                          className="h-9 border-0 shadow-none px-0 text-sm font-medium focus-visible:ring-0 !bg-transparent"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate || ''}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              'rate',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-9 text-sm"
                          placeholder="0"
                        />
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity || ''}
                          onChange={(e) =>
                            updateLineItem(
                              item.id,
                              'quantity',
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="h-9 text-sm"
                          placeholder="1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Add a description..."
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, 'description', e.target.value)
                        }
                        className="h-7 text-xs text-muted-foreground border-0 shadow-none px-0 mt-0.5 focus-visible:ring-0 !bg-transparent"
                      />
                    </div>
                  ))}
                </div>

                {/* Add Items Dropdown */}
                <Popover open={addItemOpen} onOpenChange={setAddItemOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-11 border-dashed border-2 text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary-50/50 transition-all"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Items
                      <ChevronDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0"
                    align="start"
                    style={{ width: 'var(--radix-popover-trigger-width)' }}
                  >
                    <Command>
                      <CommandInput placeholder="Search saved items..." />
                      <CommandList className="max-h-[280px]">
                        <CommandEmpty>No items found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              addLineItem();
                              setAddItemOpen(false);
                            }}
                            className="py-2.5"
                          >
                            <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Blank Item</span>
                          </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Saved Items">
                          {savedItems.length === 0 ? (
                            <div className="py-4 text-center">
                              <p className="text-xs text-muted-foreground">No saved items yet</p>
                              <button
                                onClick={() => { setAddItemOpen(false); router.push('/templates/invoice-items'); }}
                                className="text-xs text-primary hover:text-primary/80 mt-1"
                              >
                                Create saved items →
                              </button>
                            </div>
                          ) : (
                            savedItems.map((saved) => (
                              <CommandItem
                                key={saved.id}
                                value={saved.name}
                                onSelect={() => {
                                  setLineItems([...lineItems, {
                                    id: Math.random().toString(36).substr(2, 9),
                                    name: saved.name,
                                    description: saved.description || '',
                                    quantity: 1,
                                    rate: saved.price,
                                  }]);
                                  setAddItemOpen(false);
                                }}
                                className="py-2.5"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{saved.name}</p>
                                  {saved.description && <p className="text-xs text-muted-foreground truncate">{saved.description}</p>}
                                </div>
                                {saved.price > 0 && (
                                  <span className="ml-3 shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
                                    {formatCurrency(saved.price, currency)}
                                  </span>
                                )}
                              </CommandItem>
                            ))
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <Separator className="bg-border/60" />

              {/* ─── Quote Settings ─────────────────── */}
              <div className="py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight font-display">
                      Quote Settings
                    </h3>
                    <p className="text-[13px] text-muted-foreground mt-1">
                      Configure deposit, discount, and signature requirements.
                    </p>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                        Options
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-1">
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors"
                        onClick={() => setShowDeposit(!showDeposit)}
                      >
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                        <span>Deposit Required</span>
                        {showDeposit && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                      </button>
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors"
                        onClick={() => setShowDiscount(!showDiscount)}
                      >
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        <span>Discount</span>
                        {showDiscount && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                      </button>
                      <div
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => setSignatureRequired(!signatureRequired)}
                      >
                        <div className="flex items-center gap-2.5">
                          <PenTool className="h-4 w-4 text-muted-foreground" />
                          <span>Require Signature</span>
                        </div>
                        <Switch
                          checked={signatureRequired}
                          onCheckedChange={setSignatureRequired}
                          className="scale-75"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Conditional Settings Fields */}
                {(showDeposit || showDiscount) && (
                  <div className="mt-4 pt-3 border-t border-dashed space-y-3">
                    {showDiscount && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Discount</Label>
                          <button
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => { setShowDiscount(false); setDiscount(0); }}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={discount || ''}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                            className="h-10"
                            placeholder="0.00"
                          />
                          <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'flat' | 'percent')}>
                            <SelectTrigger className="w-[100px] h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flat">Flat</SelectItem>
                              <SelectItem value="percent">%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    {showDeposit && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Deposit Required</Label>
                          <button
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => { setShowDeposit(false); setDepositAmount(0); }}
                          >
                            Remove
                          </button>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          value={depositAmount || ''}
                          onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                          className="h-10"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Separator className="bg-border/60" />

              {/* ─── Notes & Terms Section ──────────── */}
              <div className="py-8">
                <h3 className="text-xl font-semibold tracking-tight font-display mb-5">
                  Notes & Terms
                </h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="resize-none min-h-[80px] text-sm"
                      placeholder="Additional notes for the client..."
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Terms & Conditions</Label>
                      <button
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        onClick={loadDefaultTerms}
                      >
                        Use Default
                      </button>
                    </div>
                    <Textarea
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className="resize-none min-h-[100px] text-sm"
                      placeholder="Terms and conditions..."
                    />
                  </div>
                </div>
              </div>

              {/* ─── Bottom Action Bar ────────────────── */}
              <div className="flex items-center gap-3 pt-4 pb-8 border-t">
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  size="lg"
                  className="px-8"
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send Quote
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                >
                  Save Draft
                </Button>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/* RIGHT PANEL — Live Preview                 */}
          {/* ═══════════════════════════════════════════ */}
          <div className="overflow-y-auto no-scrollbar bg-muted/30 flex flex-col">
            {/* Preview Tabs */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 pt-4 pb-3">
              <Tabs
                value={previewTab}
                onValueChange={(v) => setPreviewTab(v as PreviewTab)}
              >
                <TabsList className="w-full grid grid-cols-3 h-10">
                  <TabsTrigger
                    value="quote"
                    className="text-xs data-[state=active]:text-foreground"
                  >
                    Quote Page
                  </TabsTrigger>
                  <TabsTrigger
                    value="email"
                    className="text-xs data-[state=active]:text-foreground"
                  >
                    Email Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="pdf"
                    className="text-xs data-[state=active]:text-foreground"
                  >
                    Quote PDF
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* ═══ QUOTE PAGE TAB ════════════════════ */}
            {previewTab === 'quote' && (
            <div className="p-4 flex-1">
              <div className={cn(
                'bg-card border shadow-sm overflow-hidden transition-all duration-300 relative',
                tpl.cardClass,
                tpl.style === 'glassmorphism' && 'backdrop-blur-xl bg-white/70 border-white/40',
              )}
              style={tpl.bgTint ? { background: tpl.bgTint } : undefined}
              >
                {/* ─── Subtle top-left wave decoration ─── */}
                <svg className="absolute top-0 left-0 pointer-events-none" viewBox="0 0 200 120" fill="none" style={{ width: '45%', height: '100px' }}>
                  <path d="M0 0 L0 80 Q60 72 120 40 Q160 18 200 0 Z" fill={tpl.accent} opacity="0.05" />
                  <path d="M0 0 L0 50 Q40 44 80 24 Q110 10 140 0 Z" fill={tpl.accent} opacity="0.03" />
                </svg>

                {/* ─── Theme Picker ─── */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="absolute top-3 right-3 h-7 w-7 rounded-full bg-muted/60 hover:bg-muted transition-colors flex items-center justify-center z-20"
                      title="Change template"
                    >
                      <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-3" align="end" side="bottom">
                    <p className="text-xs font-medium text-muted-foreground mb-2.5">Quote Style</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {Object.entries(QUOTE_TEMPLATES).map(([key, t]) => (
                        <button
                          key={key}
                          onClick={() => setTemplateName(key as TemplateName)}
                          className={cn(
                            'flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all hover:bg-muted',
                            templateName === key && 'ring-2 ring-primary ring-offset-1 bg-muted'
                          )}
                        >
                          <div className="w-full h-10 rounded-md overflow-hidden relative border border-border/50 bg-white flex flex-col items-center justify-center gap-0.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `${t.accent}20`, border: `1.5px solid ${t.accent}` }} />
                            <div className="h-0.5 w-5 rounded-full bg-muted-foreground/15" />
                            <div className="h-0.5 w-3 rounded-full" style={{ background: t.accent, opacity: 0.5 }} />
                          </div>
                          <span className="text-[10px] leading-tight text-muted-foreground">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* ─── Top accent bar (accent-bar style) ─── */}
                {tpl.style === 'accent-bar' && tpl.topBorder && (
                  <div className="w-full h-1" style={{ background: tpl.topBorder }} />
                )}

                {/* ─── Header Area (centered) ─── */}
                <div className="px-6 pt-8 pb-5 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3"
                    style={{ backgroundColor: tpl.accentLight }}>
                    <Check className="h-5 w-5" style={{ color: tpl.accent }} />
                  </div>
                  <h3 className="text-base font-semibold tracking-tight">{businessName}</h3>
                  <p className={cn('font-bold tracking-tight mt-1', tpl.amountSize)} style={{ color: tpl.accent }}>
                    {formatCurrency(total, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Quote #{quoteNumber} · {expirationDate ? `Valid until ${format(expirationDate, 'MMM dd, yyyy')}` : `Issued ${issueDate ? format(issueDate, 'MMM dd, yyyy') : '...'}`}
                  </p>
                </div>

                <Separator className={tpl.separatorClass} />

                {/* ─── Client + Details (Collapsible) ── */}
                <div className="px-6 py-4">
                  <Collapsible
                    open={showPreviewDetails}
                    onOpenChange={setShowPreviewDetails}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm">
                          {selectedClient?.name || 'Select a customer'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedClient?.company || ''}
                        </p>
                      </div>
                      <CollapsibleTrigger asChild>
                        <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                          {showPreviewDetails ? 'Hide' : 'Details'}
                          <ChevronUp
                            className={cn(
                              'h-3 w-3 transition-transform',
                              !showPreviewDetails && 'rotate-180'
                            )}
                          />
                        </button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent>
                      <Separator className={cn('mb-4', tpl.separatorClass)} />
                      <div className="space-y-2">
                        {lineItems.length > 0 &&
                          lineItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between py-2 text-sm"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {item.name || 'Untitled Item'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {item.quantity} × {formatCurrency(item.rate, currency)}
                                  {item.description && <span className="ml-1.5 text-muted-foreground/70">· {item.description}</span>}
                                </p>
                              </div>
                              <span className="ml-4 font-medium tabular-nums text-sm">
                                {formatCurrency(item.quantity * item.rate, currency)}
                              </span>
                            </div>
                          ))}

                        {lineItems.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">
                            No items added yet
                          </p>
                        )}

                        <Separator className={cn('my-4', tpl.separatorClass)} />

                        {discountAmount > 0 && (
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span className="tabular-nums">{formatCurrency(subtotal, currency)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Discount</span>
                              <span className="tabular-nums text-green-600">-{formatCurrency(discountAmount, currency)}</span>
                            </div>
                          </div>
                        )}
                        <div className={cn('flex justify-between items-baseline rounded-lg px-3 py-3 -mx-3 border-l-2', tpl.accentBg)}
                          style={{ borderLeftColor: tpl.accent }}>
                          <span className="font-semibold text-sm">Total</span>
                          <span className="text-lg font-bold tabular-nums" style={{ color: tpl.accent }}>
                            {formatCurrency(total, currency)}
                          </span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* ─── Notes ─── */}
                {notes && (
                  <>
                    <Separator className={tpl.separatorClass} />
                    <div className="px-6 py-5">
                      <p className="text-sm text-muted-foreground">{notes}</p>
                    </div>
                  </>
                )}

                {/* ─── Action Buttons ─── */}
                <div className="px-6 pb-4 pt-2 space-y-2">
                  <button
                    className={cn(
                      'w-full h-12 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors',
                      tpl.buttonColor,
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Accept Quote
                  </button>
                  <button
                    className="w-full h-10 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors border border-border text-muted-foreground hover:bg-muted/50 cursor-default"
                  >
                    <Download className="h-4 w-4" />
                    Download Quote
                  </button>
                </div>

                {/* ─── Footer ─── */}
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
            )}

            {/* ═══ QUOTE PDF TAB ═════════════════════ */}
            {previewTab === 'pdf' && (
            <div className="p-4 flex-1 flex flex-col items-center">
              <p className="text-xs text-muted-foreground mb-3 w-full">
                A4 Preview · {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
              </p>

              <div className="w-full overflow-hidden flex-1 flex items-start justify-center">
                <div
                  style={{
                    width: '595px',
                    height: '842px',
                    transform: 'scale(var(--pdf-scale, 0.68))',
                    transformOrigin: 'top center',
                  }}
                  className="bg-white shadow-2xl rounded-sm border border-border/40 flex-shrink-0 relative"
                >
                  <button
                    onClick={handleDownloadPdf}
                    disabled={pdfGenerating}
                    className={cn(
                      'absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-muted/80 hover:bg-muted transition-colors flex items-center justify-center z-20',
                      pdfGenerating && 'opacity-70 cursor-not-allowed'
                    )}
                    title="Download PDF"
                  >
                    {pdfGenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : (
                      <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>

                  <div className="w-full h-full flex flex-col text-black" style={{ fontFamily: 'system-ui, sans-serif' }}>
                    {tpl.topBorder && (
                      <div className="w-full" style={{ height: '4px', background: tpl.topBorder }} />
                    )}

                    <div className="flex items-start justify-between px-10 pt-8 pb-6">
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: '#111' }}>{businessName}</h2>
                        <p className="text-xs mt-1" style={{ color: '#666' }}>hello@company.com</p>
                      </div>
                      <div className="text-right">
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: tpl.accent }}>QUOTE</h1>
                        <p className="text-xs mt-1" style={{ color: '#666' }}>#{quoteNumber}</p>
                        <p className="text-xs" style={{ color: '#666' }}>
                          Date: {issueDate ? format(issueDate, 'MMM dd, yyyy') : 'Not set'}
                        </p>
                        {expirationDate && (
                          <p className="text-xs" style={{ color: '#666' }}>
                            Valid until: {format(expirationDate, 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-10 pb-6">
                      <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: '#999' }}>Prepared For</p>
                      <p className="text-sm font-medium" style={{ color: '#111' }}>
                        {selectedClient?.name || 'Customer Name'}
                      </p>
                      {selectedClient?.company && (
                        <p className="text-xs" style={{ color: '#666' }}>{selectedClient.company}</p>
                      )}
                    </div>

                    <div className="px-10 flex-1">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                            <th className="text-left py-2 font-semibold" style={{ color: '#333', width: '50%' }}>Description</th>
                            <th className="text-center py-2 font-semibold" style={{ color: '#333' }}>Qty</th>
                            <th className="text-right py-2 font-semibold" style={{ color: '#333' }}>Rate</th>
                            <th className="text-right py-2 font-semibold" style={{ color: '#333' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.length > 0 ? lineItems.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td className="py-2">
                                <p className="font-medium" style={{ color: '#111' }}>{item.name || 'Untitled'}</p>
                                {item.description && <p style={{ color: '#888' }}>{item.description}</p>}
                              </td>
                              <td className="py-2 text-center" style={{ color: '#333' }}>{item.quantity}</td>
                              <td className="py-2 text-right tabular-nums" style={{ color: '#333' }}>{formatCurrency(item.rate, currency)}</td>
                              <td className="py-2 text-right tabular-nums font-medium" style={{ color: '#111' }}>{formatCurrency(item.quantity * item.rate, currency)}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={4} className="py-6 text-center" style={{ color: '#999' }}>
                                No items added
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="px-10 pb-8">
                      <div className="ml-auto" style={{ width: '200px' }}>
                        <div className="flex justify-between py-1 text-xs" style={{ color: '#666' }}>
                          <span>Subtotal</span>
                          <span className="tabular-nums">{formatCurrency(subtotal, currency)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between py-1 text-xs" style={{ color: '#22c55e' }}>
                            <span>Discount</span>
                            <span className="tabular-nums">-{formatCurrency(discountAmount, currency)}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-1 text-xs" style={{ borderTop: '1px solid #e5e7eb', color: '#333' }}>
                          <span className="font-medium">Total</span>
                          <span className="tabular-nums font-medium">{formatCurrency(total, currency)}</span>
                        </div>
                        <div className="flex justify-between py-2 mt-1 rounded px-2 -mx-2"
                          style={{ background: `${tpl.accent}10` }}
                        >
                          <span className="text-xs font-bold" style={{ color: '#111' }}>Quote Total</span>
                          <span className="text-sm font-bold tabular-nums" style={{ color: tpl.accent }}>{formatCurrency(total, currency)}</span>
                        </div>
                      </div>
                    </div>

                    {notes && (
                      <div className="px-10 pb-4">
                        <p className="text-[10px]" style={{ color: '#999' }}>{notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* ═══ EMAIL PREVIEW TAB ═══════════════════ */}
            {previewTab === 'email' && (
            <div className="p-4 flex-1">
              <div className={cn('bg-card border shadow-sm overflow-hidden transition-all duration-300 relative', tpl.cardClass)}>

                {tpl.topBorder && (
                  <div className="w-full h-1" style={{ background: tpl.topBorder }} />
                )}

                <div className="px-6 pb-4 pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight">{businessName}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{businessName}</p>
                      <p className="font-bold text-lg mt-0.5" style={{ color: tpl.accent }}>Quote</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Valid until {expirationDate ? format(expirationDate, 'MMM dd, yyyy') : '...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-4 flex gap-3">
                  <button
                    className={cn('flex-1 h-11 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors', tpl.buttonColor)}
                  >
                    View Quote
                  </button>
                  <button
                    className="flex-1 h-11 rounded-lg font-medium text-sm flex items-center justify-center gap-2 border border-border hover:bg-muted transition-colors"
                  >
                    Download PDF
                  </button>
                </div>

                <Separator className={tpl.separatorClass} />

                <div className="px-6 py-4 space-y-3">
                  <p className="text-sm font-medium">Quote #{quoteNumber}</p>

                  {lineItems.length > 0 && (
                    <div className="space-y-1">
                      {lineItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-1.5 text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name || 'Untitled Item'}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.quantity} × {formatCurrency(item.rate, currency)}
                              {item.description && <span className="ml-1.5 text-muted-foreground/70">· {item.description}</span>}
                            </p>
                          </div>
                          <span className="ml-4 font-medium tabular-nums text-sm">{formatCurrency(item.quantity * item.rate, currency)}</span>
                        </div>
                      ))}
                      <Separator className={tpl.separatorClass} />
                    </div>
                  )}

                  <div className="space-y-2">
                    {discountAmount > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="tabular-nums">{formatCurrency(subtotal, currency)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Discount</span>
                          <span className="tabular-nums text-green-600">-{formatCurrency(discountAmount, currency)}</span>
                        </div>
                        <Separator className={tpl.separatorClass} />
                      </>
                    )}
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Total</span>
                      <span className="tabular-nums" style={{ color: tpl.accent }}>{formatCurrency(total, currency)}</span>
                    </div>
                  </div>
                </div>

                {notes && (
                  <>
                    <Separator className={tpl.separatorClass} />
                    <div className="px-6 py-4">
                      <p className="text-sm italic text-muted-foreground">{notes}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Contact us at <span className="underline">hello@company.com</span>
                      </p>
                    </div>
                  </>
                )}

                <div className="px-6 py-4 bg-muted/30 border-t">
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    This email and any attachments are intended solely for the use of the individual
                    or entity to whom they are addressed. If you have received this message in error,
                    please notify {businessName} immediately.
                  </p>
                </div>
              </div>
            </div>
            )}

            {/* ═══ HIDDEN A4 RENDER DIV (for PDF capture) ═══ */}
            <div
              ref={pdfRef}
              className="fixed"
              style={{
                left: '-9999px',
                top: 0,
                width: '595px',
                height: '842px',
                background: '#ffffff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: '#111111',
                zIndex: -1,
              }}
            >
              {tpl.topBorder && (
                <div style={{ width: '100%', height: '4px', background: tpl.topBorder }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 40px 24px' }}>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 700 }}>{businessName}</p>
                  <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>hello@company.com</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '22px', fontWeight: 700, color: tpl.accent, letterSpacing: '0.05em' }}>QUOTE</p>
                  <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>#{quoteNumber}</p>
                  <p style={{ fontSize: '11px', color: '#666' }}>
                    Date: {issueDate ? format(issueDate, 'MMM dd, yyyy') : 'Not set'}
                  </p>
                  {expirationDate && (
                    <p style={{ fontSize: '11px', color: '#666' }}>
                      Valid until: {format(expirationDate, 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ padding: '0 40px 24px' }}>
                <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: '#999', marginBottom: '4px' }}>Prepared For</p>
                <p style={{ fontSize: '13px', fontWeight: 500 }}>
                  {selectedClient?.name || 'Customer Name'}
                </p>
                {selectedClient?.company && (
                  <p style={{ fontSize: '11px', color: '#666' }}>{selectedClient.company}</p>
                )}
              </div>

              <div style={{ padding: '0 40px' }}>
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600, color: '#333' }}>Description</th>
                      <th style={{ textAlign: 'center', padding: '8px 0', fontWeight: 600, color: '#333' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600, color: '#333' }}>Rate</th>
                      <th style={{ textAlign: 'right', padding: '8px 0', fontWeight: 600, color: '#333' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.length > 0 ? lineItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '8px 0' }}>
                          <p style={{ fontWeight: 500 }}>{item.name || 'Untitled'}</p>
                          {item.description && <p style={{ color: '#888', marginTop: '2px' }}>{item.description}</p>}
                        </td>
                        <td style={{ textAlign: 'center', padding: '8px 0', color: '#333' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '8px 0', color: '#333' }}>{formatCurrency(item.rate, currency)}</td>
                        <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 500 }}>{formatCurrency(item.quantity * item.rate, currency)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} style={{ padding: '24px 0', textAlign: 'center', color: '#999' }}>
                          No items added
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '16px 40px', marginTop: 'auto' }}>
                <div style={{ marginLeft: 'auto', width: '200px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px', color: '#666' }}>
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, currency)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px', color: '#22c55e' }}>
                      <span>Discount</span>
                      <span>-{formatCurrency(discountAmount, currency)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px', borderTop: '1px solid #e5e7eb', color: '#333', fontWeight: 500 }}>
                    <span>Total</span>
                    <span>{formatCurrency(total, currency)}</span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    padding: '8px', marginTop: '4px', borderRadius: '4px',
                    background: `${tpl.accent}15`,
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>Quote Total</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: tpl.accent }}>{formatCurrency(total, currency)}</span>
                  </div>
                </div>
              </div>

              {notes && (
                <div style={{ padding: '0 40px 16px' }}>
                  <p style={{ fontSize: '10px', color: '#999' }}>{notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
