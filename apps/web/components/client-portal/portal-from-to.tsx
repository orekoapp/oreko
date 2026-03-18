import type { PortalBusinessInfo, PortalClientInfo } from '@/lib/portal/types';

interface PortalFromToProps {
  business: PortalBusinessInfo;
  client: PortalClientInfo;
  fromLabel?: string;
  toLabel?: string;
}

export function PortalFromTo({
  business,
  client,
  fromLabel = 'From',
  toLabel = 'Prepared for',
}: PortalFromToProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* From */}
      <div>
        <p className="mb-1 text-sm text-muted-foreground">{fromLabel}</p>
        <div className="space-y-0.5">
          <p className="font-medium">{business.name}</p>
          {business.email && (
            <p className="text-sm text-muted-foreground">{business.email}</p>
          )}
          {business.phone && (
            <p className="text-sm text-muted-foreground">{business.phone}</p>
          )}
          {business.address && (
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {business.address}
            </p>
          )}
        </div>
      </div>

      {/* To */}
      <div>
        <p className="mb-1 text-sm text-muted-foreground">{toLabel}</p>
        <div className="space-y-0.5">
          <p className="font-medium">{client.name}</p>
          {client.company && (
            <p className="text-sm text-muted-foreground">{client.company}</p>
          )}
          {client.email && (
            <p className="text-sm text-muted-foreground">{client.email}</p>
          )}
          {client.address && (
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {client.address}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
