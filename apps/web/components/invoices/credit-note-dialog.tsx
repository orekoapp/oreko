'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createCreditNote } from '@/lib/credit-notes/actions';

interface LineItemInput {
  name: string;
  description: string;
  quantity: number;
  rate: number;
}

interface CreditNoteDialogProps {
  invoiceId: string;
  invoiceLineItems: Array<{
    name: string;
    description: string | null;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  currency?: string;
}

export function CreditNoteDialog(props: CreditNoteDialogProps) {
  const { invoiceId, invoiceLineItems } = props;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItemInput[]>(
    invoiceLineItems.map((item) => ({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      rate: item.rate,
    }))
  );

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { name: '', description: '', quantity: 1, rate: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: keyof LineItemInput, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } as LineItemInput : item
      )
    );
  };

  const totalAmount = lineItems.reduce((sum, item) => {
    return sum + Math.round(item.quantity * item.rate * 100) / 100;
  }, 0);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the credit note');
      return;
    }

    if (lineItems.length === 0) {
      toast.error('At least one line item is required');
      return;
    }

    for (const item of lineItems) {
      if (!item.name.trim()) {
        toast.error('All line items must have a name');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const result = await createCreditNote(invoiceId, {
        reason,
        notes: notes || undefined,
        lineItems: lineItems.map((item) => ({
          name: item.name,
          description: item.description || undefined,
          quantity: item.quantity,
          rate: item.rate,
        })),
      });

      if (result.success) {
        toast.success('Credit note created successfully');
        setOpen(false);
        setReason('');
        setNotes('');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to create credit note');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: props.currency || 'USD',
    }).formatToParts(amount);
    return parts.map((p, i) => {
      if (p.type === 'currency' && parts[i + 1]?.type !== 'literal') return p.value + ' ';
      return p.value;
    }).join('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Issue Credit Note
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Credit Note</DialogTitle>
          <DialogDescription>
            Issue a credit note against this invoice. This creates a formal record of the credit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Reason for the credit note..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLineItem}>
                <Plus className="mr-1 h-3 w-3" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={index} className="flex items-start gap-2 rounded-lg border p-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    />
                    <div className="flex gap-2">
                      <div className="w-24">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-32">
                        <Label className="text-xs">Rate</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-32">
                        <Label className="text-xs">Amount</Label>
                        <div className="flex items-center h-10 px-3 text-sm font-medium text-muted-foreground">
                          {formatCurrency(Math.round(item.quantity * item.rate * 100) / 100)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {lineItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveLineItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 text-right">
              <span className="text-sm text-muted-foreground">Total: </span>
              <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Credit Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
