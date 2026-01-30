'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, FileText, Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ContractEditor } from '@/components/contracts/contract-editor';
import { SignaturePad } from '@/components/contracts/signature-pad';
import { signContract } from '@/lib/contracts/actions';
import { formatDate } from '@/lib/utils';
import type { ContractInstanceDetail, SignatureData } from '@/lib/contracts/types';

interface ContractSigningViewProps {
  contract: ContractInstanceDetail;
  token: string;
  ipAddress: string;
}

export function ContractSigningView({
  contract,
  token,
  ipAddress,
}: ContractSigningViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [signature, setSignature] = useState<SignatureData | null>(null);
  const [isSigned, setIsSigned] = useState(contract.status === 'signed');

  const handleSign = () => {
    if (!signature) return;

    startTransition(async () => {
      try {
        await signContract({ token, signatureData: signature }, ipAddress);
        setIsSigned(true);
        router.refresh();
      } catch (error) {
        console.error('Failed to sign contract:', error);
      }
    });
  };

  if (isSigned || contract.status === 'signed') {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container max-w-3xl py-12">
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Contract Signed</h1>
              <p className="text-muted-foreground mb-6">
                Thank you for signing the contract. A confirmation email has been
                sent to you with a copy of the signed document.
              </p>
              {contract.signatureData && (
                <div className="border rounded-lg p-4 bg-white inline-block">
                  <p className="text-sm text-muted-foreground mb-2">Signed by</p>
                  {contract.signatureData.type === 'drawn' ? (
                    <img
                      src={contract.signatureData.value}
                      alt="Signature"
                      className="max-h-16 mx-auto"
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
                    {contract.signatureData.name} ·{' '}
                    {formatDate(new Date(contract.signatureData.date))}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container max-w-4xl py-8">
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{contract.contractName}</CardTitle>
                  <CardDescription>
                    Please review and sign this contract
                  </CardDescription>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="text-sm font-medium">{contract.clientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sent</p>
                    <p className="text-sm font-medium">
                      {contract.sentAt
                        ? formatDate(contract.sentAt)
                        : 'Not sent'}
                    </p>
                  </div>
                </div>
                {contract.quoteName && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Quote</p>
                      <p className="text-sm font-medium">{contract.quoteName}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contract Content */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Terms</CardTitle>
              <CardDescription>
                Please read through the contract carefully before signing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContractEditor
                content={contract.content}
                onChange={() => {}}
                editable={false}
              />
            </CardContent>
          </Card>

          {/* Signature */}
          <SignaturePad
            onSignatureChange={setSignature}
            signerName={contract.clientName}
          />

          {/* Sign Button */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleSign}
              disabled={!signature || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Sign Contract
                </>
              )}
            </Button>
          </div>

          {/* Legal Notice */}
          <p className="text-xs text-center text-muted-foreground">
            By signing this contract, you agree to all terms and conditions
            stated above. Your signature, timestamp, and IP address will be
            recorded for verification purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
