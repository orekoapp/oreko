'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  ExternalLink,
  Send,
  Mail,
  Eye,
  CheckCircle2,
  Clock,
  Hourglass,
  Loader2,
  PenLine,
} from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/data-table';
import { getContractColumns, contractStatusOptions } from './contracts-columns';
import { ContractInstanceListItem, ContractInstanceDetail } from '@/lib/contracts/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { deleteContractInstance, getContractInstanceById } from '@/lib/contracts/actions';
import { getBusinessProfile } from '@/lib/settings/actions';
import { CountersignDialog } from './countersign-dialog';
import { ContractEditor } from './contract-editor';
import { formatDate } from '@/lib/utils';
import { SendEmailDialog } from '@/components/shared/send-email-dialog';

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  draft: {
    label: 'Draft',
    className: 'border-gray-300 text-gray-600 bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:bg-gray-900',
    icon: <FileText className="h-3 w-3" />,
  },
  sent: {
    label: 'Sent',
    className: 'border-blue-300 text-blue-600 bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:bg-blue-950',
    icon: <Mail className="h-3 w-3" />,
  },
  viewed: {
    label: 'Viewed',
    className: 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:bg-yellow-950',
    icon: <Eye className="h-3 w-3" />,
  },
  pending: {
    label: 'Pending',
    className: 'border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:bg-amber-950',
    icon: <Hourglass className="h-3 w-3" />,
  },
  signed: {
    label: 'Signed',
    className: 'border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:text-green-400 dark:bg-green-950',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  expired: {
    label: 'Expired',
    className: 'border-red-300 text-red-600 bg-red-50 dark:border-red-600 dark:text-red-400 dark:bg-red-950',
    icon: <Clock className="h-3 w-3" />,
  },
};

interface ContractsDataTableProps {
  data: ContractInstanceListItem[];
}

export function ContractsDataTable({ data: initialData }: ContractsDataTableProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingContract, setViewingContract] = useState<ContractInstanceDetail | null>(null);
  const [isLoadingContract, setIsLoadingContract] = useState(false);

  // Local data for status updates
  const [data, setData] = useState(initialData);

  // Business name for email dialog
  const [businessName, setBusinessName] = useState('');
  useEffect(() => {
    getBusinessProfile().then((p) => setBusinessName(p?.businessName || '')).catch(() => {});
  }, []);

  // Dialog states
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendTarget, setSendTarget] = useState<ContractInstanceListItem | null>(null);
  const [countersignDialogOpen, setCountersignDialogOpen] = useState(false);
  const [countersignTarget, setCountersignTarget] = useState<ContractInstanceListItem | null>(null);

  const handleView = async (contract: ContractInstanceListItem) => {
    setIsLoadingContract(true);
    try {
      const detail = await getContractInstanceById(contract.id);
      if (detail) {
        setViewingContract(detail);
      } else {
        toast.error('Contract not found');
      }
    } catch {
      toast.error('Failed to load contract');
    } finally {
      setIsLoadingContract(false);
    }
  };

  const handleCloseView = () => {
    setViewingContract(null);
  };

  const handleDelete = async (contract: ContractInstanceListItem) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await deleteContractInstance(contract.id);
      toast.success('Contract deleted successfully');
      setData((prev) => prev.filter((c) => c.id !== contract.id));
    } catch {
      toast.error('Failed to delete contract');
    } finally {
      setIsProcessing(false);
    }
  };

  // Send Contract
  const handleSend = useCallback((contract: ContractInstanceListItem) => {
    setSendTarget(contract);
    setSendDialogOpen(true);
  }, []);

  const handleSendComplete = useCallback(() => {
    if (sendTarget) {
      setData((prev) =>
        prev.map((c) =>
          c.id === sendTarget.id ? { ...c, status: 'sent', sentAt: new Date() } : c
        )
      );
    }
    setSendTarget(null);
  }, [sendTarget]);

  // Countersign
  const handleCountersign = useCallback((contract: ContractInstanceListItem) => {
    setCountersignTarget(contract);
    setCountersignDialogOpen(true);
  }, []);

  const handleCountersignComplete = useCallback(() => {
    if (countersignTarget) {
      setData((prev) =>
        prev.map((c) =>
          c.id === countersignTarget.id ? { ...c, status: 'signed' } : c
        )
      );
    }
    setCountersignTarget(null);
  }, [countersignTarget]);

  // Resend
  const handleResend = useCallback((contract: ContractInstanceListItem) => {
    setSendTarget(contract);
    setSendDialogOpen(true);
  }, []);

  // Copy Link
  const handleCopyLink = useCallback(async (contract: ContractInstanceListItem) => {
    // Bug #185: Use dynamic base URL instead of hardcoded domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const url = `${baseUrl}/c/${(contract as any).accessToken || contract.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  }, []);

  // Download PDF
  const handleDownload = useCallback((contract: ContractInstanceListItem) => {
    window.open(`/api/download/contract/${contract.id}`, '_blank');
  }, []);

  const columns = getContractColumns({
    onView: handleView,
    onDetails: (contract) => router.push(`/contracts/${contract.id}`),
    onCountersign: handleCountersign,
    onSend: handleSend,
    onResend: handleResend,
    onCopyLink: handleCopyLink,
    onDownload: handleDownload,
    onDelete: handleDelete,
  });

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-16">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No contracts yet</h3>
      <p className="text-muted-foreground mb-4">
        Create your first contract from a template to get started
      </p>
      <Button asChild>
        <Link href="/contracts/new">
          <Plus className="mr-2 h-4 w-4" />
          New Contract
        </Link>
      </Button>
    </div>
  );

  const contract = viewingContract;
  const config = contract ? (statusConfig[contract.status] || statusConfig.draft)! : statusConfig.draft!;

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        filterKey="contractName"
        filterPlaceholder="Search contracts..."
        statusOptions={contractStatusOptions}
        statusFilterKey="status"
        pageSizes={[10, 25, 50, 100]}
        emptyState={emptyState}
        onRowClick={(contract) => handleView(contract)}
      />

      {/* Loading overlay for async fetch */}
      {isLoadingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="rounded-lg bg-background p-4 shadow-lg flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading contract...</span>
          </div>
        </div>
      )}

      {/* Contract View Dialog */}
      <Dialog open={!!viewingContract} onOpenChange={(open) => !open && handleCloseView()}>
        <DialogContent className="!flex !flex-col !max-w-[860px] !max-h-[90vh] !p-0 !gap-0 overflow-hidden">
          <DialogTitle className="sr-only">Contract Preview</DialogTitle>
          {contract && (
            <>
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

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto bg-muted/20">
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
                  {(contract.signatureData || contract.status === 'pending' || contract.status === 'signed') && (
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
                    <div className="rounded-lg border bg-background p-4 [&_.ProseMirror]:!min-h-[100px] [&_.ProseMirror]:!max-h-[300px] [&_.ProseMirror]:overflow-y-auto [&_.prose]:!prose-sm">
                      <ContractEditor
                        key={contract.id}
                        content={contract.content}
                        editable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Footer Actions */}
              <div className="p-4 flex items-center justify-end">
                <div className="flex items-center gap-2">
                  {contract.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        handleCloseView();
                        const listItem = data.find((c) => c.id === contract.id);
                        if (listItem) handleSend(listItem);
                      }}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send to Client
                    </Button>
                  )}
                  {contract.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        handleCloseView();
                        const listItem = data.find((c) => c.id === contract.id);
                        if (listItem) handleCountersign(listItem);
                      }}
                    >
                      <PenLine className="mr-2 h-4 w-4" />
                      Countersign
                    </Button>
                  )}
                  {contract.status !== 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={`/c/${contract.accessToken}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View as Client
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      {sendTarget && (
        <SendEmailDialog
          open={sendDialogOpen}
          onOpenChange={setSendDialogOpen}
          type="contract"
          documentId={sendTarget.id}
          documentNumber={sendTarget.id.slice(0, 8)}
          recipientEmail={sendTarget.clientEmail || ''}
          recipientName={sendTarget.clientName}
          businessName={businessName}
          contractName={sendTarget.contractName}
          onSent={handleSendComplete}
        />
      )}

      {/* Countersign Dialog */}
      {countersignTarget && (
        <CountersignDialog
          open={countersignDialogOpen}
          onOpenChange={setCountersignDialogOpen}
          contractId={countersignTarget.id}
          contractName={countersignTarget.contractName}
          onCountersigned={handleCountersignComplete}
        />
      )}
    </>
  );
}
