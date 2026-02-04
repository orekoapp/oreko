'use client';

import { useState } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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

export default function NewInvoicePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('payment');

  // Form state
  const [clientId, setClientId] = useState('');
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
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = subtotal * (parseFloat(taxRate) / 100);
  const total = subtotal + taxAmount;

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
      toast.error('Failed to create invoice');
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
          {/* Invoice Details */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Invoice Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client">Customer</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="demo-client">Demo Client</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  <Link href="/clients/new" className="text-primary hover:underline">
                    + Add new client
                  </Link>
                </p>
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
                <Button variant="outline" size="sm" asChild>
                  <Link href="/rate-cards">
                    Import from Rate Cards
                  </Link>
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
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                {/* Invoice Header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">{title || 'Invoice'}</h2>
                  <p className="text-sm text-muted-foreground">Invoice #0001</p>
                  <p className="text-2xl font-bold mt-2">${total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    Due on {new Date(dueDate).toLocaleDateString()}
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Client Info */}
                <div className="mb-6">
                  <p className="font-medium">Client Name</p>
                  <p className="text-sm text-muted-foreground">client@example.com</p>
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

                {previewMode === 'payment' && (
                  <Button className="w-full mt-6" disabled>
                    Pay Now
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
