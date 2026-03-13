'use client';

import { RecordPaymentDialog } from './record-payment-dialog';

interface RecordPaymentButtonProps {
  invoiceId: string;
  amountDue: number;
  currency?: string;
}

export function RecordPaymentButton({ invoiceId, amountDue, currency = 'USD' }: RecordPaymentButtonProps) {
  return (
    <RecordPaymentDialog
      invoiceId={invoiceId}
      amountDue={amountDue}
      currency={currency}
    />
  );
}
