'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, FileText, Mail, CreditCard } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { updateInvoice } from '@/lib/invoices/actions';
import { ProjectSelector } from '@/components/projects';
import type { InvoiceDocument } from '@/lib/invoices/types';

interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate?: number;
}

interface ClientOption {
  id: string;
  name: string;
  company: string | null;
}

interface TaxRateOption {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
  isActive: boolean;
}

interface EditInvoiceFormProps {
  invoice: InvoiceDocument;
  clients: ClientOption[];
  taxRates: TaxRateOption[];
  currency?: string;
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

type PreviewMode = 'payment' | 'email' | 'pdf';

export function EditInvoiceForm({ invoice, clients, taxRates, currency = 'USD' }: EditInvoiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('payment');

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Derive tax rate from first line item's tax rate (all items share same rate in current UI)
  const existingTaxRate = invoice.lineItems[0]?.taxRate;

  // Form state - pre-populated from invoice
  const [projectId, setProjectId] = useState<string | null>(invoice.projectId);
  const [title, setTitle] = useState(invoice.title);
  const [dueDate, setDueDate] = useState(invoice.dueDate);
  const [taxRate, setTaxRate] = useState(existingTaxRate ? String(existingTaxRate) : '0');
  const [notes, setNotes] = useState(invoice.notes);
  const [terms, setTerms] = useState(invoice.terms);
  const [internalNotes, setInternalNotes] = useState(invoice.internalNotes);

  const [lineItems, setLineItems] = useState<LineItem[]>(
    invoice.lineItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      rate: item.rate,
      taxRate: item.taxRate ?? undefined,
    }))
  );

  const addLineItem = () => {
    setHasUnsavedChanges(true);
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), name: '', description: '', quantity: 1, rate: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setHasUnsavedChanges(true);
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setHasUnsavedChanges(true);
    setLineItems(lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = subtotal * (parseFloat(taxRate) / 100);
  const total = subtotal + taxAmount;

  const selectedClient = clients.find((c) => c.id === invoice.clientId);

  const handleSubmit = async () => {
    if (lineItems.some((item) => !item.name)) {
      toast.error('Please fill in all line item names');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateInvoice(invoice.id, {
        projectId,
        title: title || 'Invoice',
        dueDate,
        lineItems: lineItems.map((item) => ({
          name: item.name,
          description: item.description || undefined,
          quantity: item.quantity,
          rate: item.rate,
          taxRate: parseFloat(taxRate) || undefined,
        })),
        notes: notes || undefined,
        terms: terms || undefined,
        internalNotes: internalNotes || undefined,
      });

      if (result.success) {
        setHasUnsavedChanges(false);
        toast.success('Invoice updated successfully');
        router.push(`/invoices/${invoice.id}`);
      } else {
        toast.error(result.error || 'Failed to update invoice');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update invoice';
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
            <Link href={`/invoices/${invoice.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Invoice</h1>
            <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/invoices/${invoice.id}`)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Main Content - Split View (60/40) */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left - Form (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Customer</Label>
                <Input value={selectedClient?.name || 'Unknown Client'} disabled />
                <p className="text-xs text-muted-foreground mt-1">
                  Client cannot be changed after creation
                </p>
              </div>

              <div>
                <Label>Project (Optional)</Label>
                <ProjectSelector
                  clientId={invoice.clientId}
                  value={projectId}
                  onChange={(val) => {
                    setProjectId(val);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input id="invoiceNumber" value={invoice.invoiceNumber} disabled />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate</Label>
                  <Select
                    value={taxRate}
                    onValueChange={(val) => {
                      setTaxRate(val);
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger id="taxRate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0% - No Tax</SelectItem>
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

              <div>
                <Label htmlFor="title">Invoice Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Website Development - Phase 1"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Items</CardTitle>
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
                        onChange={(e) =>
                          updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)
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
                          updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                    <div className="col-span-2 text-right py-2 font-medium">
                      {formatMoney(item.quantity * item.rate, currency)}
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
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  placeholder="Payment terms, conditions, etc..."
                  value={terms}
                  onChange={(e) => {
                    setTerms(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="internalNotes">Internal Notes</Label>
                <p className="text-xs text-muted-foreground mb-1">(Not visible to client)</p>
                <Textarea
                  id="internalNotes"
                  placeholder="Internal notes, reminders, etc..."
                  value={internalNotes}
                  onChange={(e) => {
                    setInternalNotes(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right - Preview (40%) */}
        <div className="lg:col-span-2 space-y-4">
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

          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="rounded-lg border bg-card p-6 shadow-sm">
                {/* Invoice Header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">{title || 'Invoice'}</h2>
                  <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
                  <p className="text-2xl font-bold mt-2">{formatMoney(total, currency)}</p>
                  <p className="text-sm text-muted-foreground">
                    Due on {new Date(dueDate).toLocaleDateString()}
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Client Info */}
                <div className="mb-6">
                  <p className="font-medium">{selectedClient?.name || 'Client'}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedClient?.company || ''}
                  </p>
                </div>

                {/* Line Items Summary */}
                <div className="space-y-2 mb-6">
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name || 'Untitled Item'} x {item.quantity}
                      </span>
                      <span>{formatMoney(item.quantity * item.rate, currency)}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal, currency)}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax ({taxRate}%)</span>
                      <span>{formatMoney(taxAmount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatMoney(total, currency)}</span>
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
                    Email preview will be available after the invoice is sent.
                  </div>
                )}
                {previewMode === 'pdf' && (
                  <div className="mt-6 rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                    PDF download will be available after saving.
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
