'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { updateQuote } from './actions';

/**
 * Hook to auto-save the quote document
 * Saves after a debounce period when changes are detected
 */
export function useAutoSave(quoteId: string | null, debounceMs = 2000) {
  const {
    document,
    isDirty,
    setSaving,
    markSaved,
  } = useQuoteBuilderStore();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string | null>(null);

  const save = useCallback(async () => {
    if (!quoteId || !document || !isDirty) return;

    // Create a hash of the current state to avoid duplicate saves
    const stateHash = JSON.stringify({
      title: document.title,
      blocks: document.blocks,
      notes: document.notes,
      terms: document.terms,
    });

    if (stateHash === lastSavedRef.current) return;

    try {
      setSaving(true);

      await updateQuote(quoteId, {
        title: document.title,
        blocks: document.blocks,
        notes: document.notes,
        terms: document.terms,
        internalNotes: document.internalNotes,
        settings: document.settings as unknown as Record<string, unknown>,
      });

      lastSavedRef.current = stateHash;
      markSaved();
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Could show a toast notification here
    }
  }, [quoteId, document, isDirty, setSaving, markSaved]);

  useEffect(() => {
    if (!isDirty || !quoteId) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(save, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDirty, quoteId, save, debounceMs]);

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (isDirty && quoteId) {
        save();
      }
    };
  }, [isDirty, quoteId, save]);

  return { save };
}

/**
 * Hook to handle keyboard shortcuts in the quote builder
 */
export function useBuilderKeyboardShortcuts() {
  const {
    undo,
    redo,
    selectedBlockId,
    removeBlock,
    duplicateBlock,
    togglePreviewMode,
  } = useQuoteBuilderStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl/Cmd + Z
      if (modKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((modKey && e.shiftKey && e.key === 'z') || (modKey && e.key === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete selected block: Backspace or Delete
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedBlockId) {
        e.preventDefault();
        removeBlock(selectedBlockId);
        return;
      }

      // Duplicate: Ctrl/Cmd + D
      if (modKey && e.key === 'd' && selectedBlockId) {
        e.preventDefault();
        duplicateBlock(selectedBlockId);
        return;
      }

      // Toggle preview: Ctrl/Cmd + P
      if (modKey && e.key === 'p') {
        e.preventDefault();
        togglePreviewMode();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedBlockId, removeBlock, duplicateBlock, togglePreviewMode]);
}
