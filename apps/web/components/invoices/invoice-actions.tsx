'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Edit,
  Send,
  Download,
  Copy,
  MoreHorizontal,
  Trash2,
  Ban,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { InvoiceDocument } from '@/lib/invoices/types';
import { sendInvoice, deleteInvoice, updateInvoiceStatus, duplicateInvoice } from '@/lib/invoices/actions';

interface InvoiceActionsProps {
  invoice: InvoiceDocument;
  isOverdue: boolean;
}

export function InvoiceActions({ invoice, isOverdue }: InvoiceActionsProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await sendInvoice(invoice.id);
      if (result.success) {
        toast.success('Invoice sent successfully');
        router.refresh();
        setShowSendDialog(false);
      } else {
        toast.error(result.error || 'Failed to send invoice');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteInvoice(invoice.id);
      if (result.success) {
        toast.success('Invoice deleted successfully');
        router.push('/invoices');
      } else {
        toast.error(result.error || 'Failed to delete invoice');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVoid = async () => {
    setIsVoiding(true);
    try {
      const result = await updateInvoiceStatus(invoice.id, 'voided');
      if (result.success) {
        toast.success('Invoice voided successfully');
        router.refresh();
        setShowVoidDialog(false);
      } else {
        toast.error(result.error || 'Failed to void invoice');
      }
    } finally {
      setIsVoiding(false);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const result = await duplicateInvoice(invoice.id);
      if (result.success && result.invoiceId) {
        toast.success('Invoice duplicated successfully');
        router.push(`/invoices/${result.invoiceId}`);
      } else {
        toast.error(result.error || 'Failed to duplicate invoice');
      }
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDownload = () => {
    window.open(`/api/pdf/invoice/${invoice.id}`, '_blank');
  };

  const canEdit = invoice.status === 'draft';
  const canSend = invoice.status === 'draft';
  const canVoid = invoice.status !== 'draft' && invoice.status !== 'voided' && invoice.status !== 'paid';
  const canDelete = invoice.status === 'draft';

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={isDuplicating}>
          {isDuplicating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
          Duplicate
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        {canEdit && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}
        {canSend && (
          <Button size="sm" onClick={() => setShowSendDialog(true)}>
            <Send className="mr-2 h-4 w-4" />
            Send to Client
          </Button>
        )}
        {invoice.status !== 'draft' && invoice.status !== 'voided' && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/i/${invoice.id}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Portal
            </Link>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canVoid && (
              <DropdownMenuItem onClick={() => setShowVoidDialog(true)} className="text-orange-600">
                <Ban className="mr-2 h-4 w-4" />
                Void Invoice
              </DropdownMenuItem>
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Invoice
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Send Confirmation Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to send this invoice to the client? They will receive an email
              with a link to view and pay the invoice.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Void Confirmation Dialog */}
      <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to void this invoice? This action cannot be undone.
              The invoice will be marked as voided and the client will no longer be able to pay it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVoidDialog(false)} disabled={isVoiding}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleVoid} disabled={isVoiding}>
              {isVoiding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Void Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
