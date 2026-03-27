'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  getUserPreferences,
  updateUserPreferences,
} from '@/lib/user/preferences-actions';

export type FontSizeKey = 'xs' | 'sm' | 'default' | 'md' | 'lg' | 'xl';
export type SidebarStyleKey = 'default' | 'elevated';

interface FontSizeOption {
  key: FontSizeKey;
  label: string;
  scale: number;
  description: string;
}

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { key: 'xs', label: 'Extra Small', scale: 0.85, description: 'Compact view with smaller text' },
  { key: 'sm', label: 'Small', scale: 0.925, description: 'Slightly smaller than default' },
  { key: 'default', label: 'Default', scale: 1, description: 'Standard font size' },
  { key: 'md', label: 'Medium', scale: 1.03, description: 'A touch larger than default' },
  { key: 'lg', label: 'Large', scale: 1.075, description: 'Slightly larger than default' },
  { key: 'xl', label: 'Extra Large', scale: 1.15, description: 'Maximum readability' },
];

export interface SidebarStyleOption {
  key: SidebarStyleKey;
  label: string;
  description: string;
}

export const SIDEBAR_STYLE_OPTIONS: SidebarStyleOption[] = [
  { key: 'default', label: 'Flat', description: 'White background across the entire app' },
  { key: 'elevated', label: 'Elevated', description: 'Gray canvas with cards and content on white' },
];

const FONT_SIZE_STORAGE_KEY = 'oreko-font-size';
const SIDEBAR_STYLE_STORAGE_KEY = 'oreko-sidebar-style';

interface AppearanceContextValue {
  fontSize: FontSizeKey;
  setFontSize: (size: FontSizeKey) => void;
  sidebarStyle: SidebarStyleKey;
  setSidebarStyle: (style: SidebarStyleKey) => void;
}

const AppearanceContext = createContext<AppearanceContextValue>({
  fontSize: 'default',
  setFontSize: () => {},
  sidebarStyle: 'default',
  setSidebarStyle: () => {},
});

export function useFontSize() {
  const { fontSize, setFontSize } = useContext(AppearanceContext);
  return { fontSize, setFontSize };
}

export function useSidebarStyle() {
  const { sidebarStyle, setSidebarStyle } = useContext(AppearanceContext);
  return { sidebarStyle, setSidebarStyle };
}

function applyFontSize(key: FontSizeKey) {
  const option = FONT_SIZE_OPTIONS.find((o) => o.key === key) ?? FONT_SIZE_OPTIONS[2]!;
  document.documentElement.style.setProperty('--font-size-scale', String(option.scale));
}

function applySidebarStyle(key: SidebarStyleKey) {
  document.documentElement.setAttribute('data-sidebar-style', key);
}

function isValidFontSize(v: unknown): v is FontSizeKey {
  return typeof v === 'string' && FONT_SIZE_OPTIONS.some((o) => o.key === v);
}

function isValidSidebarStyle(v: unknown): v is SidebarStyleKey {
  return typeof v === 'string' && SIDEBAR_STYLE_OPTIONS.some((o) => o.key === v);
}

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSizeKey>('default');
  const [sidebarStyle, setSidebarStyleState] = useState<SidebarStyleKey>('default');
  const serverLoaded = useRef(false);

  // On mount: apply localStorage immediately (avoids FOUC), then fetch server prefs
  useEffect(() => {
    // 1. Apply localStorage instantly
    const storedFont = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    if (isValidFontSize(storedFont)) {
      setFontSizeState(storedFont);
      applyFontSize(storedFont);
    }

    const storedSidebar = localStorage.getItem(SIDEBAR_STYLE_STORAGE_KEY);
    if (isValidSidebarStyle(storedSidebar)) {
      setSidebarStyleState(storedSidebar);
      applySidebarStyle(storedSidebar);
    }

    // 2. Fetch server preferences (authoritative source)
    getUserPreferences()
      .then((prefs) => {
        serverLoaded.current = true;

        if (isValidFontSize(prefs.fontSize)) {
          setFontSizeState(prefs.fontSize);
          applyFontSize(prefs.fontSize);
          localStorage.setItem(FONT_SIZE_STORAGE_KEY, prefs.fontSize);
        }

        if (isValidSidebarStyle(prefs.sidebarStyle)) {
          setSidebarStyleState(prefs.sidebarStyle);
          applySidebarStyle(prefs.sidebarStyle);
          localStorage.setItem(SIDEBAR_STYLE_STORAGE_KEY, prefs.sidebarStyle);
        }
      })
      .catch(() => {
        // Server fetch failed — localStorage values are already applied, so no-op
      });
  }, []);

  const setFontSize = useCallback((size: FontSizeKey) => {
    setFontSizeState(size);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
    applyFontSize(size);
    // Fire-and-forget server save
    updateUserPreferences({ fontSize: size }).catch(() => {});
  }, []);

  const setSidebarStyle = useCallback((style: SidebarStyleKey) => {
    setSidebarStyleState(style);
    localStorage.setItem(SIDEBAR_STYLE_STORAGE_KEY, style);
    applySidebarStyle(style);
    // Fire-and-forget server save
    updateUserPreferences({ sidebarStyle: style }).catch(() => {});
  }, []);

  return (
    <AppearanceContext.Provider value={{ fontSize, setFontSize, sidebarStyle, setSidebarStyle }}>
      {children}
    </AppearanceContext.Provider>
  );
}
