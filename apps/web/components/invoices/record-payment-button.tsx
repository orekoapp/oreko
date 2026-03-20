'use client';

import { useState } from 'react';
import { Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecordPaymentDialog } from './record-payment-dialog';

interface RecordPaymentButtonProps {
  invoiceId: string;
  amountDue: number;
  currency?: string;
}

export function RecordPaymentButton({ invoiceId, amountDue, currency = 'USD' }: RecordPaymentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        <Banknote className="mr-2 h-4 w-4" />
        Record Payment
      </Button>
      <RecordPaymentDialog
        invoiceId={invoiceId}
        amountDue={amountDue}
        currency={currency}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
