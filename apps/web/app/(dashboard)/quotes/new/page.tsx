'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Search, User, Building2, ArrowRight } from 'lucide-react';
import { useQuoteBuilderStore } from '@/lib/stores/quote-builder-store';
import { searchClients } from '@/lib/clients/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ClientOption {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

export default function NewQuotePage() {
  const router = useRouter();
  const { resetDocument, initDocument } = useQuoteBuilderStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Search clients when query changes
  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setClients([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchClients(searchQuery);
        setClients(results);
      } catch (error) {
        console.error('Failed to search clients:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Load initial clients on mount
  useEffect(() => {
    const loadInitialClients = async () => {
      try {
        const results = await searchClients('');
        setClients(results);
      } catch (error) {
        console.error('Failed to load clients:', error);
      }
    };
    loadInitialClients();
  }, []);

  const handleCreateQuote = () => {
    setIsCreating(true);

    // Reset and initialize document with selected client
    resetDocument();

    // Navigate to form-based editor (default) - the client ID will be passed as a query param
    if (selectedClient) {
      router.push(`/quotes/new/editor?clientId=${selectedClient.id}`);
    } else {
      router.push('/quotes/new/editor');
    }
  };

  const handleSkipClientSelection = () => {
    setIsCreating(true);
    resetDocument();
    router.push('/quotes/new/editor');
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/quotes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Quote</h1>
          <p className="text-muted-foreground">Select a client or create a new one</p>
        </div>
      </div>

      {/* Client Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Client</CardTitle>
          <CardDescription>
            Choose an existing client for this quote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients by name, email, or company..."
              className="pl-9"
            />
          </div>

          {/* Client List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                    selectedClient?.id === client.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {client.company ? (
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {client.company || client.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {client.company ? `${client.name} - ` : ''}{client.email}
                    </p>
                  </div>
                  {selectedClient?.id === client.id && (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              ))
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                No clients found matching "{searchQuery}"
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Start typing to search for clients
              </div>
            )}
          </div>

          {/* Create New Client Link */}
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              Can&apos;t find the client?
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Client
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Client Summary */}
      {selectedClient && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {selectedClient.company ? (
                  <Building2 className="h-5 w-5 text-primary" />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium">{selectedClient.company || selectedClient.name}</p>
                <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)}>
              Change
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleSkipClientSelection} disabled={isCreating}>
          Skip for now
        </Button>
        <Button onClick={handleCreateQuote} disabled={isCreating}>
          {isCreating ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Creating...
            </>
          ) : (
            <>
              Continue to Editor
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
