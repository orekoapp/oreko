'use client';

import * as React from 'react';

type FontSizeContextType = {
  scale: number;
  setScale: (scale: number) => void;
};

const FontSizeContext = React.createContext<FontSizeContextType>({
  scale: 1,
  setScale: () => {},
});

export function useFontSize() {
  return React.useContext(FontSizeContext);
}

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const saved = localStorage.getItem('font-size-scale');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.75 && parsed <= 1.5) {
        setScale(parsed);
      }
    }

    // Restore sidebar style preference
    const sidebarStyle = localStorage.getItem('sidebar-style');
    if (sidebarStyle === 'elevated') {
      document.body.setAttribute('data-sidebar-style', 'elevated');
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--font-size-scale', String(scale));
    localStorage.setItem('font-size-scale', String(scale));
  }, [scale]);

  return (
    <FontSizeContext.Provider value={{ scale, setScale }}>
      {children}
    </FontSizeContext.Provider>
  );
}
