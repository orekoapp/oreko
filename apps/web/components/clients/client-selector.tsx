'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, ChevronsUpDown, User, Building2, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { searchClients } from '@/lib/clients/actions';
import Link from 'next/link';

interface ClientOption {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

interface ClientSelectorProps {
  value: ClientOption | null;
  onChange: (client: ClientOption | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ClientSelector({
  value,
  onChange,
  placeholder = 'Search clients...',
  disabled = false,
}: ClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 1) {
      setClients([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchClients(query, 10);
      setClients(results);
    } catch (error) {
      console.error('Failed to search clients:', error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearch(search);
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, handleSearch]);

  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSelect = (client: ClientOption) => {
    onChange(client);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {value ? (
            <div className="flex items-center gap-2 truncate">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0">
                {value.company ? (
                  <Building2 className="h-3 w-3 text-primary" />
                ) : (
                  <User className="h-3 w-3 text-primary" />
                )}
              </div>
              <span className="truncate">
                {value.company || value.name}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2">
            <Input
              ref={inputRef}
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8 px-0"
            />
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Results */}
          <div className="max-h-[200px] overflow-y-auto">
            {clients.length === 0 && !isLoading && search.length > 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No clients found
              </div>
            )}

            {clients.length === 0 && search.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Start typing to search clients
              </div>
            )}

            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleSelect(client)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors',
                  value?.id === client.id && 'bg-accent'
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  {client.company ? (
                    <Building2 className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {client.company || client.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {client.email}
                  </p>
                </div>
                {value?.id === client.id && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Add New Client Link */}
          <div className="border-t p-2">
            <Link
              href="/clients/new"
              className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-accent rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add new client
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
