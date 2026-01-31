'use client';

import Link from 'next/link';
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
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
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
  } = useQuoteBuilderStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleSave = async () => {
    // TODO: Implement save functionality
    console.log('Save quote', document);
  };

  const handleExportPDF = async () => {
    // TODO: Implement PDF export
    console.log('Export PDF');
  };

  const handleSend = async () => {
    // TODO: Implement send functionality
    console.log('Send quote');
  };

  return (
    <div className="flex items-center justify-between border-b bg-card px-4 py-2">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/quotes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="mx-2 h-6 w-px bg-border" />

        <Button
          variant="ghost"
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
        >
          <Package className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
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

        <div className="mx-2 h-6 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Center section - Document title */}
      <div className="flex items-center gap-2">
        <h1 className="font-medium">
          {document?.title || 'Untitled Quote'}
        </h1>
        {isDirty && (
          <span className="text-xs text-muted-foreground">(unsaved changes)</span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-1 rounded-md border bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            disabled={zoom <= 50}
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
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>

        <Button
          variant={previewMode ? 'default' : 'outline'}
          size="sm"
          onClick={togglePreviewMode}
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

        <div className="mx-2 h-6 w-px bg-border" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !isDirty}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
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

        <Button size="sm" onClick={handleSend}>
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
