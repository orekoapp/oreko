'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Save,
  Download,
  Send,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  ZoomIn,
  ZoomOut,
  Loader2,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { createQuote, updateQuote, sendQuote } from '@/lib/quotes/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function BuilderToolbar() {
  const router = useRouter();
  const [isSendLoading, setIsSendLoading] = useState(false);

  const {
    document,
    isDirty,
    isSaving,
    previewMode,
    zoom,
    showBlocksPanel,
    showPropertiesPanel,
    showRateCardPanel,
    historyIndex,
    history,
    toggleBlocksPanel,
    togglePropertiesPanel,
    toggleRateCardPanel,
    togglePreviewMode,
    setZoom,
    undo,
    redo,
    setSaving,
    markSaved,
    updateDocumentId,
  } = useQuoteBuilderStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleSave = async (): Promise<boolean> => {
    if (!document) {
      toast.error('No document to save');
      return false;
    }

    setSaving(true);
    try {
      // New quote: create in database first
      if (!document.id) {
        if (!document.clientId) {
          toast.error('Please select a client before saving');
          setSaving(false);
          return false;
        }

        const result = await createQuote({
          title: document.title || 'Untitled Quote',
          clientId: document.clientId,
          projectId: document.projectId,
          blocks: document.blocks,
        });

        if (result.success && result.quote) {
          updateDocumentId(result.quote.id, result.quote.quoteNumber);
          markSaved();
          toast.success('Quote created successfully');
          router.replace(`/quotes/${result.quote.id}/builder`);
          return true;
        } else {
          toast.error(result.error || 'Failed to create quote');
          return false;
        }
      }

      // Existing quote: update
      const result = await updateQuote(document.id, {
        title: document.title,
        blocks: document.blocks,
        notes: document.notes,
        terms: document.terms,
        internalNotes: document.internalNotes,
      });

      if (result.success) {
        markSaved();
        toast.success('Quote saved successfully');
        return true;
      } else {
        toast.error(result.error || 'Failed to save quote');
        return false;
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save quote');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    // TODO: Implement PDF export
    toast.info('PDF export coming soon');
  };

  const handleSend = async () => {
    if (!document || !document.id) {
      toast.error('Please save the quote first');
      return;
    }

    // Save first if there are unsaved changes
    if (isDirty) {
      const saved = await handleSave();
      if (!saved) return;
    }

    setIsSendLoading(true);
    try {
      const result = await sendQuote(document.id);

      if (result.success) {
        if (result.emailSent) {
          toast.success('Quote sent and email delivered');
        } else {
          toast.warning('Quote marked as sent, but email delivery failed. Please check your email configuration.');
        }
        router.push(`/quotes/${document.id}`);
      } else {
        toast.error(result.error || 'Failed to send quote');
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send quote');
    } finally {
      setIsSendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between border-b bg-card px-2 py-2 md:px-4">
      {/* Left section */}
      <div className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="icon" asChild aria-label="Back to quotes">
          <Link href="/quotes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="mx-1 h-6 w-px bg-border hidden md:block" />

        <Button
          variant={showBlocksPanel ? 'secondary' : 'ghost'}
          size="icon"
          onClick={toggleBlocksPanel}
          title={showBlocksPanel ? 'Hide blocks panel' : 'Show blocks panel'}
        >
          {showBlocksPanel ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant={showRateCardPanel ? 'secondary' : 'ghost'}
          size="icon"
          onClick={toggleRateCardPanel}
          title={showRateCardPanel ? 'Hide rate cards' : 'Show rate cards'}
          className="hidden sm:inline-flex"
        >
          <Package className="h-4 w-4" />
        </Button>

        <Button
          variant={showPropertiesPanel ? 'secondary' : 'ghost'}
          size="icon"
          onClick={togglePropertiesPanel}
          title={showPropertiesPanel ? 'Hide properties panel' : 'Show properties panel'}
        >
          {showPropertiesPanel ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>

        <div className="mx-1 h-6 w-px bg-border hidden md:block" />

        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="hidden sm:inline-flex"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="hidden sm:inline-flex"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Center section - Document title */}
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="font-medium truncate text-sm md:text-base">
          {document?.title || 'Untitled Quote'}
        </h1>
        {isDirty && (
          <span className="text-xs text-muted-foreground hidden sm:inline">(unsaved)</span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Zoom controls - hidden on mobile */}
        <div className="hidden lg:flex items-center gap-1 rounded-md border bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            disabled={zoom <= 50}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="w-12 text-center text-sm">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            disabled={zoom >= 200}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>

        <Button
          variant={previewMode ? 'default' : 'outline'}
          size="sm"
          onClick={togglePreviewMode}
          className="hidden sm:inline-flex"
        >
          {previewMode ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Edit
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </>
          )}
        </Button>

        {/* Mobile preview icon-only button */}
        <Button
          variant={previewMode ? 'default' : 'outline'}
          size="icon"
          onClick={togglePreviewMode}
          className="sm:hidden"
        >
          {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>

        <div className="mx-1 h-6 w-px bg-border hidden md:block" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="hidden md:inline-flex"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>

        {/* Mobile save icon-only */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="md:hidden"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden md:inline-flex">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDF}>
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem>Export as Image</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Copy shareable link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile Export icon-only */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDF}>
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem>Export as Image</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Copy shareable link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" onClick={handleSend} disabled={isSendLoading} className="hidden md:inline-flex">
          {isSendLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send
        </Button>

        {/* Mobile Send icon-only */}
        <Button size="icon" onClick={handleSend} disabled={isSendLoading} className="md:hidden">
          {isSendLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
