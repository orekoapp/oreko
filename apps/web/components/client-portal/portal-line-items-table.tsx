interface LineItem {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
}

interface PortalLineItemsTableProps {
  items: LineItem[];
  currency: string;
  showPrices?: boolean;
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

export function PortalLineItemsTable({
  items,
  currency,
  showPrices = true,
}: PortalLineItemsTableProps) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full">
        <thead className="bg-muted text-sm">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Description</th>
            {showPrices && (
              <>
                <th className="px-4 py-3 text-right font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Rate</th>
              </>
            )}
            <th className="px-4 py-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3">
                <p className="font-medium">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </td>
              {showPrices && (
                <>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    {formatCurrency(item.rate, currency)}
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-right font-medium">
                {formatCurrency(item.amount, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
