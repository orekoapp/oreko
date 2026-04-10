'use client';

import { TooltipProvider } from '@/components/ui/tooltip';

export function UiProvider({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
