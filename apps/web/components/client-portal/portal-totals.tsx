interface PortalTotalsProps {
  subtotal: number;
  discountAmount?: number;
  taxTotal?: number;
  total: number;
  currency: string;
  amountPaid?: number;
  amountDue?: number;
  deposit?: {
    required: boolean;
    type: 'percentage' | 'fixed';
    value: number;
    amount: number;
  };
}

function formatCurrency(amount: number, currency: string): string {
  const parts = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).formatToParts(amount);
  return parts.map((p, i) => {
    if (p.type === 'currency' && parts[i + 1]?.type !== 'literal') return p.value + ' ';
    return p.value;
  }).join('');
}

export function PortalTotals({
  subtotal,
  discountAmount = 0,
  taxTotal = 0,
  total,
  currency,
  amountPaid,
  amountDue,
  deposit,
}: PortalTotalsProps) {
  return (
    <div className="ml-auto w-72 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatCurrency(subtotal, currency)}</span>
      </div>

      {discountAmount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount</span>
          <span>-{formatCurrency(discountAmount, currency)}</span>
        </div>
      )}

      {taxTotal > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatCurrency(taxTotal, currency)}</span>
        </div>
      )}

      <div className="flex justify-between border-t pt-2 text-base font-semibold">
        <span>Total</span>
        <span>{formatCurrency(total, currency)}</span>
      </div>

      {amountPaid !== undefined && amountPaid > 0 && (
        <>
          <div className="flex justify-between text-sm text-green-600">
            <span>Paid</span>
            <span>-{formatCurrency(amountPaid, currency)}</span>
          </div>
          {amountDue !== undefined && (
            <div
              className={`flex justify-between border-t pt-2 font-semibold ${
                amountDue > 0 ? 'text-orange-600' : 'text-green-600'
              }`}
            >
              <span>Amount Due</span>
              <span>{formatCurrency(amountDue, currency)}</span>
            </div>
          )}
        </>
      )}

      {deposit?.required && deposit.amount > 0 && (
        <div className="mt-3 rounded-lg border border-dashed p-3">
          <p className="text-sm font-medium">Deposit Required</p>
          <p className="text-xs text-muted-foreground">
            {deposit.type === 'percentage' ? `${deposit.value}%` : formatCurrency(deposit.value, currency)}{' '}
            ({formatCurrency(deposit.amount, currency)}) due upon acceptance
          </p>
        </div>
      )}
    </div>
  );
}
