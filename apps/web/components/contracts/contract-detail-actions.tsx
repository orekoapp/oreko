'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ExternalLink, Download, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { sendContractInstance } from '@/lib/contracts/actions';
import { CountersignDialog } from './countersign-dialog';

interface ContractDetailActionsProps {
  contractId: string;
  contractName: string;
  status: string;
  clientViewUrl: string;
  pdfUrl?: string | null;
}

export function ContractDetailActions({
  contractId,
  contractName,
  status,
  clientViewUrl,
}: ContractDetailActionsProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [countersignOpen, setCountersignOpen] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await sendContractInstance(contractId);
      if (result.emailSent) {
        toast.success('Contract sent successfully!');
      } else {
        toast.warning('Contract marked as sent, but email delivery failed. Check email settings.');
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send contract');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {status === 'draft' && (
          <Button onClick={handleSend} disabled={isSending}>
            <Send className="mr-2 h-4 w-4" />
            {isSending ? 'Sending...' : 'Send to Client'}
          </Button>
        )}
        {status === 'pending' && (
          <Button onClick={() => setCountersignOpen(true)}>
            <PenLine className="mr-2 h-4 w-4" />
            Countersign
          </Button>
        )}
        {status !== 'draft' && (
          <Button variant="outline" asChild>
            <a href={clientViewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View as Client
            </a>
          </Button>
        )}
        <Button variant="outline" asChild>
          <a href={`/api/download/contract/${contractId}`} target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </a>
        </Button>
      </div>

      <CountersignDialog
        open={countersignOpen}
        onOpenChange={setCountersignOpen}
        contractId={contractId}
        contractName={contractName}
        onCountersigned={() => router.refresh()}
      />
    </>
  );
}
