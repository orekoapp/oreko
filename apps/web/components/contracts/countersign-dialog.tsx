'use client';

import { useState, useEffect } from 'react';
import { Loader2, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CountersignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  contractName: string;
  onCountersigned?: () => void;
}

export function CountersignDialog({
  open,
  onOpenChange,
  contractId,
  contractName,
  onCountersigned,
}: CountersignDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    if (open) {
      setBusinessName('Your Business Name');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    toast.info('Contract countersigning is not yet implemented. This feature is coming soon.');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Countersign Contract</DialogTitle>
            <DialogDescription>
              Apply your business signature to &quot;{contractName}&quot;.
              The client has already signed this contract.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name"
                required
              />
            </div>

            {businessName && (
              <div className="border rounded-lg p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Signature Preview</p>
                <p
                  className="text-2xl"
                  style={{ fontFamily: "'Brush Script MT', cursive" }}
                >
                  {businessName}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !businessName.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <PenLine className="mr-2 h-4 w-4" />
              Countersign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
