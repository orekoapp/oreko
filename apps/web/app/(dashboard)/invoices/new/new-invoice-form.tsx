'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, FileText, Mail, CreditCard, ChevronDown, CheckCircle2, Pencil, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createInvoice } from '@/lib/invoices/actions';

interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate?: number;
}

type PreviewMode = 'payment' | 'email' | 'pdf';

interface ClientOption {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
}

interface TaxRateOption {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
}

interface RateCardOption {
  id: string;
  name: string;
  description: string | null;
  rate: number;
  unit: string | null;
  categoryName: string | null;
}

interface NewInvoiceFormProps {
  clients: ClientOption[];
  taxRates?: TaxRateOption[];
  currency?: string;
  nextInvoiceNumber: string;
  rateCards?: RateCardOption[];
  businessName?: string;
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function NewInvoiceForm({
  clients,
  taxRates = [],
  currency = 'USD',
  nextInvoiceNumber,
  rateCards = [],
  businessName = 'Your Business',
}: NewInvoiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('payment');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Form state
  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNumber);
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0] ?? date.toISOString().slice(0, 10);
  });
  const defaultTaxRate = taxRates.find((t) => t.isDefault && t.isActive);
  const [taxRate, setTaxRate] = useState(defaultTaxRate ? String(defaultTaxRate.rate) : '0');

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', name: '', description: '', quantity: 1, rate: 0 },
  ]);

  const addLineItem = () => {
    setHasUnsavedChanges(true);
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), name: '', description: '', quantity: 1, rate: 0 },
    ]);
  };

  const addFromRateCard = (rc: RateCardOption) => {
    setHasUnsavedChanges(true);
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        name: rc.name,
        description: rc.description || '',
        quantity: 1,
        rate: rc.rate,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setHasUnsavedChanges(true);
    setLineItems(
      lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = subtotal * (parseFloat(taxRate) / 100);
  const total = subtotal + taxAmount;

  const selectedClient = clients.find((c) => c.id === clientId);

  // Validation issues
  const validationIssues = useMemo(() => {
    const issues: string[] = [];
    if (!clientId) issues.push('Client is required');
    if (lineItems.some((item) => !item.name)) issues.push('All items need a name');
    if (lineItems.every((item) => item.rate === 0)) issues.push('At least one item needs a rate');
    if (!invoiceNumber.trim()) issues.push('Invoice number is required');
    return issues;
  }, [clientId, lineItems, invoiceNumber]);

  const handleSubmit = async () => {
    if (validationIssues.length > 0) {
      toast.error(validationIssues[0]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await createInvoice({
        clientId,
        title: 'Invoice',
        invoiceNumber: invoiceNumber.trim(),
        dueDate,
        lineItems: lineItems.map((item) => ({
          name: item.name,
          description: item.description || undefined,
          quantity: item.quantity,
          rate: item.rate,
          taxRate: parseFloat(taxRate) || undefined,
        })),
      });

      if (result.success) {
        toast.success('Invoice created successfully');
        router.push('/invoices');
      } else if ('error' in result) {
        toast.error(result.error);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create invoice';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header — Cancel + Create buttons, no back arrow or title */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/invoices')}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>

      {/* Main Content - Split View (60/40) */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left - Form (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Invoice Details</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8">
                      Options
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled className="text-muted-foreground">
                      Add custom field (coming soon)
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="text-muted-foreground">
                      Set default values (coming soon)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client selection / display */}
              <div>
                <Label htmlFor="client">
                  Customer <span className="text-destructive">*</span>
                </Label>
                {selectedClient ? (
                  <div className="flex items-center gap-3 rounded-lg border p-3 mt-1.5">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(selectedClient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {selectedClient.name}
                        {selectedClient.company &&
                          selectedClient.company !== selectedClient.name &&
                          ` (${selectedClient.company})`}
                      </p>
                      {selectedClient.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {selectedClient.email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          /* keep client, just allow re-selection */
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setClientId('')}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Select
                      value={clientId}
                      onValueChange={(value) => setClientId(value)}
                    >
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.length === 0 ? (
                          <SelectItem value="_none" disabled>
                            No clients found
                          </SelectItem>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                              {client.company && client.company !== client.name
                                ? ` (${client.company})`
                                : ''}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Link
                        href="/clients/new"
                        className="text-primary hover:underline"
                      >
                        + Add new client
                      </Link>
                    </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => {
                      setInvoiceNumber(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate</Label>
                  <Select value={taxRate} onValueChange={setTaxRate}>
                    <SelectTrigger id="taxRate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% - Default</SelectItem>
                      {taxRates
                        .filter((t) => t.isActive)
                        .map((tr) => (
                          <SelectItem key={tr.id} value={String(tr.rate)}>
                            {tr.rate}% - {tr.name}
                          </SelectItem>
                        ))}
                      {taxRates.filter((t) => t.isActive).length === 0 && (
                        <>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="15">15%</SelectItem>
                          <SelectItem value="20">20%</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Items</CardTitle>
                {rateCards.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Templates
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      {rateCards.map((rc) => (
                        <DropdownMenuItem
                          key={rc.id}
                          onClick={() => addFromRateCard(rc)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{rc.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatMoney(rc.rate, currency)}
                              {rc.unit ? ` / ${rc.unit}` : ''}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="text-muted-foreground"
                  >
                    Templates
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                  <div className="col-span-6">ITEMS</div>
                  <div className="col-span-2 text-right">RATE</div>
                  <div className="col-span-2 text-right">QTY</div>
                  <div className="col-span-2"></div>
                </div>

                <Separator />

                {/* Items */}
                {lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-start"
                  >
                    <div className="col-span-6">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) =>
                          updateLineItem(item.id, 'name', e.target.value)
                        }
                      />
                      <Input
                        placeholder="Description (optional)"
                        className="mt-1 text-sm"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, 'description', e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="text-right"
                        value={item.rate || ''}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            'rate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        className="text-right"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            'quantity',
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full" onClick={addLineItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Items
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Validation badge */}
          {validationIssues.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                {validationIssues.length} Issue{validationIssues.length > 1 ? 's' : ''}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {validationIssues[0]}
              </span>
            </div>
          )}
        </div>

        {/* Right - Preview (40%) */}
        <div className="lg:col-span-2 space-y-4">
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
                Invoice PDF
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Preview Card */}
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                {previewMode === 'payment' && (
                  <>
                    {/* Checkmark + Business Name + Total */}
                    <div className="text-center mb-6">
                      <div className="flex justify-center mb-3">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {businessName}
                      </p>
                      <p className="text-3xl font-bold mt-1">
                        {formatMoney(total, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Invoice #{invoiceNumber} &middot; Due{' '}
                        {new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <Separator className="my-4" />

                    {/* Client */}
                    {selectedClient && (
                      <div className="mb-4">
                        <p className="text-sm font-medium">
                          {selectedClient.company || selectedClient.name}
                        </p>
                      </div>
                    )}

                    {/* Line Items */}
                    <div className="space-y-3 mb-6">
                      {lineItems.map((item) => (
                        <div key={item.id} className="text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {item.name || 'Untitled Item'}{' '}
                              {item.quantity} &times; {formatMoney(item.rate, currency)}
                            </span>
                            <span className="font-medium">
                              {formatMoney(item.quantity * item.rate, currency)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    {/* Total Due */}
                    <div className="flex justify-between items-center font-bold text-lg mb-4">
                      <span>Total Due</span>
                      <span>{formatMoney(total, currency)}</span>
                    </div>

                    {/* Thank you message */}
                    <p className="text-center text-sm text-muted-foreground mb-4">
                      Thank you for your business!
                    </p>

                    {/* Download Invoice button */}
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Invoice
                    </Button>
                  </>
                )}

                {previewMode === 'email' && (
                  <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    Email preview will be available after the invoice is created
                    and sent.
                  </div>
                )}

                {previewMode === 'pdf' && (
                  <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    PDF download will be available after the invoice is created.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
