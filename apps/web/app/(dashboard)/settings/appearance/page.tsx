'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useFontSize } from '@/components/providers/font-size-provider';
import { cn } from '@/lib/utils';

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { scale, setScale } = useFontSize();
  const [mounted, setMounted] = React.useState(false);
  const [sidebarStyle, setSidebarStyleState] = React.useState<'default' | 'elevated'>('default');

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar-style');
    if (saved === 'elevated') {
      setSidebarStyleState('elevated');
    }
  }, []);

  function handleSidebarStyleChange(style: 'default' | 'elevated') {
    setSidebarStyleState(style);
    if (style === 'elevated') {
      document.body.setAttribute('data-sidebar-style', 'elevated');
      localStorage.setItem('sidebar-style', 'elevated');
    } else {
      document.body.removeAttribute('data-sidebar-style');
      localStorage.setItem('sidebar-style', 'default');
    }
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="container py-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-muted-foreground">
          Customize the look and feel of your workspace
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Theme</CardTitle>
            <CardDescription>Choose between light, dark, or system theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {themeOptions.map((option) => {
                const isActive = mounted && theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <option.icon className={cn(
                      'h-6 w-6',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <span className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Font Size */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Font Size</CardTitle>
            <CardDescription>Adjust the base font size for the entire application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Scale: {Math.round(scale * 100)}%</Label>
              <button
                type="button"
                onClick={() => setScale(1)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset to default
              </button>
            </div>
            <Slider
              value={[scale]}
              onValueChange={(values) => setScale(values[0] ?? 1)}
              min={0.75}
              max={1.5}
              step={0.05}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>75%</span>
              <span>100%</span>
              <span>125%</span>
              <span>150%</span>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm">
                Preview: This text will change size as you adjust the slider above.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Style */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sidebar Style</CardTitle>
            <CardDescription>Choose the visual style for the navigation sidebar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <SidebarStyleOption
                label="Default"
                description="Clean, minimal sidebar"
                active={mounted && sidebarStyle === 'default'}
                onClick={() => handleSidebarStyleChange('default')}
              />
              <SidebarStyleOption
                label="Elevated"
                description="Raised sidebar with shadow"
                active={mounted && sidebarStyle === 'elevated'}
                onClick={() => handleSidebarStyleChange('elevated')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SidebarStyleOption({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-colors',
        active
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      )}
    >
      <span className={cn(
        'text-sm font-medium',
        active ? 'text-primary' : 'text-foreground'
      )}>
        {label}
      </span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  );
}
