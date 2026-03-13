'use client';

import { Check, Type, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  useFontSize,
  useSidebarStyle,
  FONT_SIZE_OPTIONS,
  SIDEBAR_STYLE_OPTIONS,
  type SidebarStyleKey,
} from '@/components/providers/font-size-provider';
import { cn } from '@/lib/utils';

const PREVIEW_TEXT = 'The quick brown fox jumps over the lazy dog. 0123456789';

function CanvasPreview({ styleKey }: { styleKey: SidebarStyleKey }) {
  const isElevated = styleKey === 'elevated';
  const canvasBg = isElevated ? 'bg-muted' : 'bg-background';
  const cardBg = isElevated ? 'bg-background shadow-sm' : 'bg-background border';
  return (
    <div className={cn('w-full h-28 rounded-md border overflow-hidden flex', canvasBg)}>
      {/* Mini sidebar */}
      <div className={cn('w-14 h-full flex flex-col gap-1.5 p-2 shrink-0', canvasBg, !isElevated && 'border-r')}>
        <div className={cn('h-2 w-full rounded-sm', isElevated ? 'bg-background shadow-sm' : 'bg-muted')} />
        <div className="h-2 w-8 rounded-sm bg-muted-foreground/15" />
        <div className="h-2 w-10 rounded-sm bg-muted-foreground/15" />
        <div className="h-2 w-7 rounded-sm bg-muted-foreground/15" />
      </div>
      {/* Mini content area */}
      <div className={cn('flex-1 p-2.5 flex flex-col gap-2', canvasBg)}>
        {/* Header bar */}
        <div className="h-2.5 w-16 rounded-sm bg-muted-foreground/20" />
        {/* Cards row */}
        <div className="flex gap-2 flex-1">
          <div className={cn('flex-1 rounded p-1.5', cardBg)}>
            <div className="h-1.5 w-8 rounded-sm bg-muted-foreground/15 mb-1" />
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/10" />
          </div>
          <div className={cn('flex-1 rounded p-1.5', cardBg)}>
            <div className="h-1.5 w-6 rounded-sm bg-muted-foreground/15 mb-1" />
            <div className="h-1.5 w-full rounded-sm bg-muted-foreground/10" />
          </div>
        </div>
        {/* Larger card */}
        <div className={cn('flex-1 rounded p-1.5', cardBg)}>
          <div className="h-1.5 w-12 rounded-sm bg-muted-foreground/15 mb-1" />
          <div className="h-1.5 w-3/4 rounded-sm bg-muted-foreground/10" />
        </div>
      </div>
    </div>
  );
}

export default function AppearanceSettingsPage() {
  const { fontSize, setFontSize } = useFontSize();
  const { sidebarStyle, setSidebarStyle } = useSidebarStyle();

  return (
    <div className="space-y-6">
      {/* Font Size */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Font Size
          </CardTitle>
          <CardDescription>
            Choose a font size that works best for you. This applies across the entire application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {FONT_SIZE_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => setFontSize(option.key)}
                className={cn(
                  'flex items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50',
                  fontSize === option.key
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    fontSize === option.key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30'
                  )}
                >
                  {fontSize === option.key && <Check className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(option.scale * 100)}%)
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <span
                  className="shrink-0 text-muted-foreground"
                  style={{ fontSize: `${option.scale * 16}px` }}
                >
                  Aa
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 mt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Preview
            </p>
            <p className="text-base">{PREVIEW_TEXT}</p>
            <p className="text-sm text-muted-foreground mt-1">{PREVIEW_TEXT}</p>
          </div>

          {fontSize !== 'default' && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setFontSize('default')}>
                Reset to default
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canvas Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Canvas Style
          </CardTitle>
          <CardDescription>
            Choose the overall look of the app. Elevated adds a subtle gray canvas with content sitting on white.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {SIDEBAR_STYLE_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => setSidebarStyle(option.key)}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 space-y-3',
                  sidebarStyle === option.key
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border'
                )}
              >
                <CanvasPreview styleKey={option.key} />
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      sidebarStyle === option.key
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {sidebarStyle === option.key && <Check className="h-3 w-3" />}
                  </div>
                  <span className="font-medium text-sm">{option.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
