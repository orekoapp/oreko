'use client';

import { useState, useEffect } from 'react';
import { Banknote, Loader2, CreditCard, Building2, Wallet, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { recordPayment } from '@/lib/invoices/actions';

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
  methodLabel: string;
  referenceNumber?: string;
  notes?: string;
}

interface RecordPaymentDialogProps {
  invoiceId: string;
  amountDue: number;
  currency?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentRecorded?: (payment?: PaymentRecord) => void;
}

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
  { value: 'card', label: 'Credit Card', icon: CreditCard },
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'check', label: 'Check', icon: Wallet },
  { value: 'paypal', label: 'PayPal', icon: Wallet },
  { value: 'other', label: 'Other', icon: Wallet },
];

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function RecordPaymentDialog({
  invoiceId,
  amountDue,
  currency = 'USD',
  open,
  onOpenChange,
  onPaymentRecorded,
}: RecordPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState(amountDue.toString());
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setAmount(amountDue.toString());
      setPaymentDate(new Date());
      setPaymentMethod('bank_transfer');
      setReferenceNumber('');
      setNotes('');
      setError(null);
    }
  }, [open, amountDue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > amountDue) {
      setError(`Amount cannot exceed the amount due (${formatCurrency(amountDue, currency)})`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await recordPayment(invoiceId, {
        amount: numAmount,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });

      if (result.success) {
        // CR #23: Use callback instead of full reload to preserve state
        toast.success('Payment recorded successfully');
        onOpenChange(false);
        onPaymentRecorded?.();
      } else {
        setError(result.error || 'Failed to record payment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment received for this invoice.
              Amount due: {formatCurrency(amountDue, currency)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Amount */}
            <div className="grid gap-2">
              <Label htmlFor="payment-amount">Amount</Label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={amountDue}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(amountDue.toString())}
                >
                  Full Amount
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount((amountDue / 2).toFixed(2))}
                >
                  50%
                </Button>
              </div>
            </div>

            {/* Payment Date */}
            <div className="grid gap-2">
              <Label>Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !paymentDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={(d) => d && setPaymentDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Payment Method */}
            <div className="grid gap-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <method.icon className="h-4 w-4" />
                        {method.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference Number */}
            <div className="grid gap-2">
              <Label htmlFor="payment-reference">Reference Number (Optional)</Label>
              <Input
                id="payment-reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Transaction ID, check number, etc."
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="payment-notes">Notes (Optional)</Label>
              <Textarea
                id="payment-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any payment notes..."
                rows={2}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
