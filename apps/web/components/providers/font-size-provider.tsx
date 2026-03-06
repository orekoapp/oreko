'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

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

const FONT_SIZE_STORAGE_KEY = 'quotecraft-font-size';
const SIDEBAR_STYLE_STORAGE_KEY = 'quotecraft-sidebar-style';

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

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSizeKey>('default');
  const [sidebarStyle, setSidebarStyleState] = useState<SidebarStyleKey>('default');

  useEffect(() => {
    const storedFont = localStorage.getItem(FONT_SIZE_STORAGE_KEY) as FontSizeKey | null;
    if (storedFont && FONT_SIZE_OPTIONS.some((o) => o.key === storedFont)) {
      setFontSizeState(storedFont);
      applyFontSize(storedFont);
    }

    const storedSidebar = localStorage.getItem(SIDEBAR_STYLE_STORAGE_KEY) as SidebarStyleKey | null;
    if (storedSidebar && SIDEBAR_STYLE_OPTIONS.some((o) => o.key === storedSidebar)) {
      setSidebarStyleState(storedSidebar);
      applySidebarStyle(storedSidebar);
    }
  }, []);

  const setFontSize = useCallback((size: FontSizeKey) => {
    setFontSizeState(size);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, size);
    applyFontSize(size);
  }, []);

  const setSidebarStyle = useCallback((style: SidebarStyleKey) => {
    setSidebarStyleState(style);
    localStorage.setItem(SIDEBAR_STYLE_STORAGE_KEY, style);
    applySidebarStyle(style);
  }, []);

  return (
    <AppearanceContext.Provider value={{ fontSize, setFontSize, sidebarStyle, setSidebarStyle }}>
      {children}
    </AppearanceContext.Provider>
  );
}
