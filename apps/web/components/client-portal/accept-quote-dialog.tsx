'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SignaturePad } from './signature-pad';
import { SigningOtpGate } from './signing-otp-gate';
import { acceptQuote, type PublicQuoteData } from '@/lib/quotes/portal-actions';
import { calculateDepositAmount } from '@/lib/quotes/utils';
import { toast } from 'sonner';

interface AcceptQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: PublicQuoteData;
  accessToken: string;
  onAccepted: () => void;
}

export function AcceptQuoteDialog({
  open,
  onOpenChange,
  quote,
  accessToken,
  onAccepted,
}: AcceptQuoteDialogProps) {
  const [signerName, setSignerName] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIdentityVerified, setIsIdentityVerified] = useState(false);

  const requiresSignature = quote.settings.requireSignature;
  const hasTerms = !!quote.terms;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quote.currency,
    }).format(amount);
  };

  const depositAmount = quote.settings.depositRequired
    ? calculateDepositAmount(
        quote.totals.total,
        quote.settings.depositType,
        quote.settings.depositValue
      )
    : 0;

  const canSubmit =
    signerName.trim().length > 0 &&
    (!requiresSignature || signatureData) &&
    (!hasTerms || agreedToTerms);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const result = await acceptQuote({
        accessToken,
        signatureData: signatureData || '',
        signerName: signerName.trim(),
        agreedToTerms,
      });

      if (result.success) {
        toast.success('Quote accepted successfully!');
        onAccepted();
      } else {
        toast.error(result.error || 'Failed to accept quote');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form state
      setSignerName('');
      setSignatureData(null);
      setAgreedToTerms(false);
      setIsIdentityVerified(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Accept Quote
          </DialogTitle>
          <DialogDescription>
            Review the details below and sign to accept this quote.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quote Summary */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quote Total</span>
              <span className="font-semibold">
                {formatCurrency(quote.totals.total)}
              </span>
            </div>
            {quote.settings.depositRequired && depositAmount > 0 && (
              <div className="mt-2 flex justify-between border-t pt-2 text-sm">
                <span className="text-muted-foreground">
                  Deposit due now
                  {quote.settings.depositType === 'percentage' &&
                    ` (${quote.settings.depositValue}%)`}
                </span>
                <span className="font-semibold text-primary">
                  {formatCurrency(depositAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Email OTP Verification Gate */}
          {requiresSignature && !isIdentityVerified && (
            <SigningOtpGate
              type="quote"
              accessToken={accessToken}
              clientEmail={quote.client.email}
              onVerified={() => setIsIdentityVerified(true)}
            />
          )}

          {/* Show signing form only after identity verification (or if no signature required) */}
          {(!requiresSignature || isIdentityVerified) && (
            <>
              {/* Signer Name */}
              <div className="space-y-2">
                <Label htmlFor="signer-name">Your Name</Label>
                <Input
                  id="signer-name"
                  placeholder="Enter your full name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              {/* Signature Pad */}
              {requiresSignature && (
                <div className="space-y-2">
                  <Label>Your Signature</Label>
                  <SignaturePad onChange={setSignatureData} />
                </div>
              )}

              {/* Terms Agreement */}
              {hasTerms && (
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agree-terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    disabled={isSubmitting}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="agree-terms"
                      className="text-sm font-normal leading-snug"
                    >
                      I have read and agree to the terms and conditions outlined in
                      this quote.
                    </Label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Accept Quote
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
