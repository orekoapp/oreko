'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  FileText,
  Receipt,
  Users,
  LayoutDashboard,
  BarChart3,
  Settings,
  HelpCircle,
  Plus,
  FolderKanban,
  ScrollText,
  Loader2,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { globalSearch, type SearchResult } from '@/lib/search/actions';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Debounced search
  React.useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await globalSearch(query);
        setResults(data);
      } catch {
        setResults([]);
        toast.error('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'quote': return <FileText className="mr-2 h-4 w-4" />;
      case 'invoice': return <Receipt className="mr-2 h-4 w-4" />;
      case 'client': return <Users className="mr-2 h-4 w-4" />;
      case 'contract': return <ScrollText className="mr-2 h-4 w-4" />;
      case 'project': return <FolderKanban className="mr-2 h-4 w-4" />;
      default: return null;
    }
  };

  const quoteResults = results.filter((r) => r.type === 'quote');
  const invoiceResults = results.filter((r) => r.type === 'invoice');
  const clientResults = results.filter((r) => r.type === 'client');
  const contractResults = results.filter((r) => r.type === 'contract');
  const projectResults = results.filter((r) => r.type === 'project');

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Type a command or search..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            'No results found.'
          )}
        </CommandEmpty>

        {/* Search Results */}
        {quoteResults.length > 0 && (
          <CommandGroup heading="Quotes">
            {quoteResults.map((result) => (
              <CommandItem
                key={result.id}
                value={`quote-${result.title}-${result.subtitle}`}
                onSelect={() => runCommand(() => router.push(result.href))}
              >
                {getIcon(result.type)}
                <div className="flex flex-col">
                  <span>{result.title}</span>
                  <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {invoiceResults.length > 0 && (
          <CommandGroup heading="Invoices">
            {invoiceResults.map((result) => (
              <CommandItem
                key={result.id}
                value={`invoice-${result.title}-${result.subtitle}`}
                onSelect={() => runCommand(() => router.push(result.href))}
              >
                {getIcon(result.type)}
                <div className="flex flex-col">
                  <span>{result.title}</span>
                  <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {clientResults.length > 0 && (
          <CommandGroup heading="Clients">
            {clientResults.map((result) => (
              <CommandItem
                key={result.id}
                value={`client-${result.title}-${result.subtitle}`}
                onSelect={() => runCommand(() => router.push(result.href))}
              >
                {getIcon(result.type)}
                <div className="flex flex-col">
                  <span>{result.title}</span>
                  <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {contractResults.length > 0 && (
          <CommandGroup heading="Contracts">
            {contractResults.map((result) => (
              <CommandItem
                key={result.id}
                value={`contract-${result.title}-${result.subtitle}`}
                onSelect={() => runCommand(() => router.push(result.href))}
              >
                {getIcon(result.type)}
                <div className="flex flex-col">
                  <span>{result.title}</span>
                  <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {projectResults.length > 0 && (
          <CommandGroup heading="Projects">
            {projectResults.map((result) => (
              <CommandItem
                key={result.id}
                value={`project-${result.title}-${result.subtitle}`}
                onSelect={() => runCommand(() => router.push(result.href))}
              >
                {getIcon(result.type)}
                <div className="flex flex-col">
                  <span>{result.title}</span>
                  <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {results.length > 0 && <CommandSeparator />}

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push('/quotes/new'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Quote</span>
            <CommandShortcut>Q</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/invoices/new'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Invoice</span>
            <CommandShortcut>I</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/clients/new'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Client</span>
            <CommandShortcut>C</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/quotes'))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Quotes</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/invoices'))}>
            <Receipt className="mr-2 h-4 w-4" />
            <span>Invoices</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/clients'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Clients</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/projects'))}>
            <FolderKanban className="mr-2 h-4 w-4" />
            <span>Projects</span>
          </CommandItem>
<CommandItem onSelect={() => runCommand(() => router.push('/analytics'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/help'))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
