'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface TermsSectionProps {
  terms: string;
  onTermsChange: (terms: string) => void;
}

const DEFAULT_TERMS = `1. Payment Terms: Payment is due within 30 days of invoice date.

2. Late Payment: A late fee of 1.5% per month will be applied to overdue invoices.

3. Scope: This quote covers only the services explicitly listed. Additional work will require a separate quote.

4. Validity: This quote is valid for 30 days from the issue date.

5. Cancellation: Either party may cancel this agreement with 14 days written notice.`;

export function TermsSection({ terms, onTermsChange }: TermsSectionProps) {
  const handleUseDefault = () => {
    onTermsChange(DEFAULT_TERMS);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Terms & Conditions</CardTitle>
            <CardDescription>
              These terms will appear on the quote
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleUseDefault}>
            <FileText className="mr-2 h-4 w-4" />
            Use Default
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="terms" className="sr-only">Terms & Conditions</Label>
          <Textarea
            id="terms"
            placeholder="Enter your terms and conditions..."
            value={terms}
            onChange={(e) => onTermsChange(e.target.value)}
            rows={12}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Tip: You can save default terms in Settings → Quote Settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
