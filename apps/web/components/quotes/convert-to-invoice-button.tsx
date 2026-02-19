'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createInvoiceFromQuote } from '@/lib/invoices/actions';
import { sendInvoice } from '@/lib/invoices/actions';

const PAYMENT_TERMS = [
  { value: '7', label: 'Net 7 (7 days)' },
  { value: '15', label: 'Net 15 (15 days)' },
  { value: '30', label: 'Net 30 (30 days)' },
  { value: '45', label: 'Net 45 (45 days)' },
  { value: '60', label: 'Net 60 (60 days)' },
  { value: '90', label: 'Net 90 (90 days)' },
];

interface ConvertToInvoiceButtonProps {
  quoteId: string;
  quoteTitle: string;
  total: number;
}

export function ConvertToInvoiceButton({
  quoteId,
  quoteTitle,
  total,
}: ConvertToInvoiceButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendImmediately, setSendImmediately] = useState(false);
  const [paymentTermDays, setPaymentTermDays] = useState('30');

  const dueDate = new Date(Date.now() + parseInt(paymentTermDays) * 24 * 60 * 60 * 1000);

  const handleConvert = async () => {
    setIsConverting(true);
    setError(null);

    try {
      const result = await createInvoiceFromQuote(quoteId, {
        dueDays: parseInt(paymentTermDays),
      });

      if (result.success && result.invoice) {
        if (sendImmediately) {
          await sendInvoice(result.invoice.id).catch(() => {});
        }
        router.push(`/invoices/${result.invoice.id}`);
      } else {
        setError(result.error || 'Failed to create invoice');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <Receipt className="mr-2 h-4 w-4" />
          Convert to Invoice
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert Quote to Invoice</DialogTitle>
          <DialogDescription>
            This will create a new invoice from this quote. All line items, notes, and terms will
            be copied to the invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quote</span>
              <span className="font-medium">{quoteTitle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-medium">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <Label htmlFor="payment-terms" className="text-sm font-normal">Payment Terms</Label>
              <Select value={paymentTermDays} onValueChange={setPaymentTermDays}>
                <SelectTrigger id="payment-terms" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TERMS.map((term) => (
                    <SelectItem key={term.value} value={term.value}>
                      {term.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Due: {dueDate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-immediate"
                checked={sendImmediately}
                onCheckedChange={(checked) => setSendImmediately(checked === true)}
              />
              <Label htmlFor="send-immediate" className="text-sm font-normal">
                Send immediately after creation
              </Label>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isConverting}
          >
            Cancel
          </Button>
          <Button onClick={handleConvert} disabled={isConverting}>
            {isConverting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
