'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Hourglass,
  Loader2,
  Mail,
  PenLine,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContractEditor } from '@/components/contracts/contract-editor';
import { SignaturePad } from '@/components/contracts/signature-pad';
import { SigningOtpGate } from '@/components/client-portal/signing-otp-gate';
import { signContract } from '@/lib/contracts/actions';
import { formatDate } from '@/lib/utils';
import type { ContractInstanceDetail, SignatureData } from '@/lib/contracts/types';

interface ContractSigningViewProps {
  contract: ContractInstanceDetail;
  token: string;
  ipAddress: string;
  userAgent: string;
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  draft: {
    label: 'Draft',
    className: 'border-gray-300 text-gray-600 bg-gray-50',
    icon: <FileText className="h-3 w-3" />,
  },
  sent: {
    label: 'Sent',
    className: 'border-blue-300 text-blue-600 bg-blue-50',
    icon: <Mail className="h-3 w-3" />,
  },
  viewed: {
    label: 'Viewed',
    className: 'border-yellow-300 text-yellow-700 bg-yellow-50',
    icon: <Eye className="h-3 w-3" />,
  },
  pending: {
    label: 'Pending',
    className: 'border-amber-300 text-amber-600 bg-amber-50',
    icon: <Hourglass className="h-3 w-3" />,
  },
  signed: {
    label: 'Signed',
    className: 'border-green-300 text-green-600 bg-green-50',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  expired: {
    label: 'Expired',
    className: 'border-red-300 text-red-600 bg-red-50',
    icon: <Clock className="h-3 w-3" />,
  },
};

export function ContractSigningView({
  contract,
  token,
  ipAddress,
  userAgent,
}: ContractSigningViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [signature, setSignature] = useState<SignatureData | null>(null);
  const [isSigned, setIsSigned] = useState(
    contract.status === 'signed' || contract.status === 'pending'
  );
  const [signError, setSignError] = useState<string | null>(null);
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);

  const config = statusConfig[contract.status] || statusConfig.draft!;

  const handleSign = () => {
    if (!signature) return;
    setSignError(null);

    startTransition(async () => {
      try {
        await signContract({ token, signatureData: signature }, ipAddress, userAgent);
        setIsSigned(true);
        router.refresh();
      } catch (error) {
        console.error('Failed to sign contract:', error);
        setSignError('Failed to sign the contract. Please try again or contact the business directly.');
      }
    });
  };

  const showSignedView = isSigned || contract.status === 'signed' || contract.status === 'pending';

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-100/80 px-4 py-8 dark:bg-neutral-950 sm:py-12">
      <div className="w-full max-w-[860px] overflow-hidden rounded-2xl border bg-card shadow-lg">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{contract.contractName}</h2>
              <p className="text-sm text-muted-foreground">
                For {contract.clientName} &middot; Created {formatDate(contract.createdAt)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`gap-1 ${config.className}`}
            >
              {config.icon}
              {config.label}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Body */}
        <div className="bg-muted/20">
          <div className="p-6 space-y-6">
            {/* Contract Details */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Details</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Client</p>
                  <p className="font-medium text-sm">{contract.clientName}</p>
                </div>
                {contract.quoteName && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Related Quote</p>
                    <p className="font-medium text-sm">{contract.quoteName}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Sent</p>
                  <p className="font-medium text-sm">
                    {contract.sentAt ? formatDate(contract.sentAt) : 'Not sent'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Viewed</p>
                  <p className="font-medium text-sm">
                    {contract.viewedAt ? formatDate(contract.viewedAt) : 'Not viewed'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Signed</p>
                  <p className="font-medium text-sm">
                    {contract.signedAt ? formatDate(contract.signedAt) : 'Not signed'}
                  </p>
                </div>
                {contract.signerIpAddress && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Client IP</p>
                    <p className="font-medium text-sm font-mono">{contract.signerIpAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Signatures */}
            {(contract.signatureData || contract.countersignatureData || showSignedView) && (
              <>
                <Separator className="bg-border/60" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Signatures</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Client Signature */}
                    <div className="rounded-lg border bg-background p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Client Signature</p>
                      {contract.signatureData ? (
                        <>
                          {contract.signatureData.type === 'drawn' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={contract.signatureData.value}
                              alt="Client Signature"
                              className="max-h-16"
                            />
                          ) : (
                            <p
                              className="text-2xl"
                              style={{ fontFamily: "'Brush Script MT', cursive" }}
                            >
                              {contract.signatureData.value}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Signed by {contract.signatureData.name} on{' '}
                            {formatDate(new Date(contract.signatureData.date))}
                          </p>
                        </>
                      ) : (
                        <div className="h-16 border-2 border-dashed rounded flex items-center justify-center text-sm text-muted-foreground">
                          Awaiting signature
                        </div>
                      )}
                    </div>

                    {/* Business Signature */}
                    <div className="rounded-lg border bg-background p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Business Signature</p>
                      {contract.countersignatureData ? (
                        <>
                          {contract.countersignatureData.type === 'drawn' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={contract.countersignatureData.value}
                              alt="Business Signature"
                              className="max-h-16"
                            />
                          ) : (
                            <p
                              className="text-2xl"
                              style={{ fontFamily: "'Brush Script MT', cursive" }}
                            >
                              {contract.countersignatureData.value}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Countersigned by {contract.countersignatureData.name} on{' '}
                            {formatDate(new Date(contract.countersignatureData.date))}
                          </p>
                        </>
                      ) : (
                        <div className="h-16 border-2 border-dashed rounded flex items-center justify-center text-sm text-muted-foreground">
                          Awaiting countersignature
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator className="bg-border/60" />

            {/* Contract Content */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Contract Content</p>
              <div className="rounded-lg border bg-background p-4 [&_.ProseMirror]:!min-h-[100px] [&_.ProseMirror]:!max-h-[400px] [&_.ProseMirror]:overflow-y-auto [&_.prose]:!prose-sm">
                <ContractEditor
                  key={contract.id}
                  content={contract.content}
                  editable={false}
                />
              </div>
            </div>

            {/* Email OTP Verification Gate — show before signature pad */}
            {!showSignedView && !isIdentityVerified && contract.clientEmail && (
              <>
                <Separator className="bg-border/60" />
                <SigningOtpGate
                  type="contract"
                  accessToken={token}
                  clientEmail={contract.clientEmail}
                  onVerified={() => setIsIdentityVerified(true)}
                />
              </>
            )}

            {/* Signature Pad - only for unsigned contracts after identity verification */}
            {!showSignedView && (isIdentityVerified || !contract.clientEmail) && (
              <>
                <Separator className="bg-border/60" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Your Signature</p>
                  <SignaturePad
                    onSignatureChange={setSignature}
                    signerName={contract.clientName}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        {!showSignedView && (isIdentityVerified || !contract.clientEmail) && (
          <>
            <Separator />
            <div className="p-4">
              {signError && (
                <div className="mb-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{signError}</p>
                </div>
              )}
              <button
                onClick={handleSign}
                disabled={!signature || isPending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <PenLine className="h-4 w-4" />
                    Sign Contract
                  </>
                )}
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                By signing, you agree to all terms above. Your signature, timestamp,
                and IP address will be recorded.
              </p>
            </div>
          </>
        )}

        {/* Powered By Footer */}
        <div className="px-6 pb-5 pt-2">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-border/40" />
            <p className="whitespace-nowrap text-[10px] text-muted-foreground/50">
              Powered by Oreko
            </p>
            <div className="h-px flex-1 bg-border/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
