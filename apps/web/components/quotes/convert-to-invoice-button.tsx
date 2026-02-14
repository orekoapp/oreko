'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  const [copyLineItems, setCopyLineItems] = useState(true);
  const [sendImmediately, setSendImmediately] = useState(false);

  const handleConvert = async () => {
    setIsConverting(true);
    setError(null);

    try {
      const result = await createInvoiceFromQuote(quoteId);

      if (result.success && result.invoice) {
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
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Due Date</span>
              <span className="font-medium">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} (Net 30)
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="copy-items"
                checked={copyLineItems}
                onCheckedChange={(checked) => setCopyLineItems(checked === true)}
              />
              <Label htmlFor="copy-items" className="text-sm font-normal">
                Copy line items
              </Label>
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
