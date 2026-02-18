'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, FileText, Mail, CreditCard, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';
import { createInvoice } from '@/lib/invoices/actions';
import { ProjectSelector } from '@/components/projects';
import { LogoUpload } from '@/components/shared/logo-upload';

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
  company: string | null;
}

interface NewInvoiceFormProps {
  clients: ClientOption[];
}

export function NewInvoiceForm({ clients }: NewInvoiceFormProps) {
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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0] ?? date.toISOString().slice(0, 10);
  });
  const [taxRate, setTaxRate] = useState('0');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', name: '', description: '', quantity: 1, rate: 0 }
  ]);

  const addLineItem = () => {
    setHasUnsavedChanges(true);
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), name: '', description: '', quantity: 1, rate: 0 }
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setHasUnsavedChanges(true);
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = subtotal * (parseFloat(taxRate) / 100);
  const total = subtotal + taxAmount;

  const selectedClient = clients.find(c => c.id === clientId);

  const handleSubmit = async () => {
    if (!clientId) {
      toast.error('Please select a client');
      return;
    }

    if (lineItems.some(item => !item.name)) {
      toast.error('Please fill in all line item names');
      return;
    }

    setIsLoading(true);
    try {
      const result = await createInvoice({
        clientId,
        projectId,
        title: title || 'Invoice',
        dueDate,
        lineItems: lineItems.map(item => ({
          name: item.name,
          description: item.description || undefined,
          quantity: item.quantity,
          rate: item.rate,
          taxRate: parseFloat(taxRate) || undefined,
        })),
        notes: notes || undefined,
        terms: terms || undefined,
      });

      if (result.success) {
        toast.success('Invoice created successfully');
        router.push('/invoices');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create invoice';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Invoice</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/invoices')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left - Form */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Business Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <LogoUpload value={logoUrl} onChange={setLogoUrl} />
            </CardContent>
          </Card>

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
                    <DropdownMenuItem disabled className="text-muted-foreground">Add custom field (coming soon)</DropdownMenuItem>
                    <DropdownMenuItem disabled className="text-muted-foreground">Set default values (coming soon)</DropdownMenuItem>
                    <DropdownMenuItem disabled className="text-muted-foreground">Import from template (coming soon)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client">Customer <span className="text-destructive">*</span></Label>
                <Select value={clientId} onValueChange={(value) => {
                  setClientId(value);
                  setProjectId(null);
                }}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 ? (
                      <SelectItem value="_none" disabled>No clients found</SelectItem>
                    ) : (
                      clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}{client.company ? ` (${client.company})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  <Link href="/clients/new" className="text-primary hover:underline">
                    + Add new client
                  </Link>
                </p>
              </div>

              <div>
                <Label>Project (Optional)</Label>
                <ProjectSelector
                  clientId={clientId || null}
                  value={projectId}
                  onChange={setProjectId}
                />
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
                  <Input id="invoiceNumber" placeholder="Auto-generated" disabled />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate</Label>
                  <Select value={taxRate} onValueChange={setTaxRate}>
                    <SelectTrigger id="taxRate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% - No Tax</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Invoice Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Website Development - Phase 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Items</CardTitle>
                <Button variant="outline" size="sm" disabled title="Rate card import coming soon">
                  Import from Rate Cards
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                  <div className="col-span-5">ITEM</div>
                  <div className="col-span-2 text-right">RATE</div>
                  <div className="col-span-2 text-right">QTY</div>
                  <div className="col-span-2 text-right">AMOUNT</div>
                  <div className="col-span-1"></div>
                </div>

                <Separator />

                {/* Items */}
                {lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-5">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Description (optional)"
                        className="mt-1 text-sm"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
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
                        onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        className="text-right"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2 text-right py-2 font-medium">
                      ${(item.quantity * item.rate).toFixed(2)}
                    </div>
                    <div className="col-span-1 flex justify-end">
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
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Memo/Notes */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Memo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes for Client</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes for the client..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  placeholder="Payment terms, conditions, etc..."
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right - Preview */}
        <div className="space-y-4">
          {/* Preview Mode Tabs */}
          <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as PreviewMode)}>
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
                {/* Logo */}
                {logoUrl && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={logoUrl}
                      alt="Business Logo"
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                )}

                {/* Invoice Header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">{title || 'Invoice'}</h2>
                  <p className="text-sm text-muted-foreground">Invoice # (auto-generated)</p>
                  <p className="text-2xl font-bold mt-2">${total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    Due on {new Date(dueDate).toLocaleDateString()}
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Client Info */}
                <div className="mb-6">
                  <p className="font-medium">{selectedClient?.name || 'Client Name'}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient?.company || 'Select a client above'}
                  </p>
                </div>

                {/* Line Items Summary */}
                <div className="space-y-2 mb-6">
                  {lineItems.filter(item => item.name).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>${(item.quantity * item.rate).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax ({taxRate}%)</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary">
                    <span>Balance Due</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes & Terms in Preview */}
                {notes && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="mb-1 text-sm font-semibold">Notes</h3>
                    <p className="text-sm text-muted-foreground">{notes}</p>
                  </div>
                )}
                {terms && (
                  <div className="mt-4">
                    <h3 className="mb-1 text-sm font-semibold">Terms & Conditions</h3>
                    <p className="text-sm text-muted-foreground">{terms}</p>
                  </div>
                )}

                {previewMode === 'payment' && (
                  <Button className="w-full mt-6" disabled variant="secondary">
                    Pay Now (available after sending)
                  </Button>
                )}
                {previewMode === 'email' && (
                  <div className="mt-6 rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    Email preview will be available after the invoice is created and sent.
                  </div>
                )}
                {previewMode === 'pdf' && (
                  <div className="mt-6 rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
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
