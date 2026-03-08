import type { Client, Quote, Invoice } from '@quotecraft/database';

// Client with relations
export type ClientWithRelations = Client & {
  quotes?: Quote[];
  invoices?: Invoice[];
  _count?: {
    quotes: number;
    invoices: number;
  };
};

// Client contact type (stored in metadata JSON)
export interface ClientContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
}

// Client address type (stored in JSON)
export interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Client metadata (stored in metadata JSON)
export interface ClientMetadata {
  type?: 'individual' | 'company';
  website?: string;
  contacts?: ClientContact[];
  tags?: string[];
}

/**
 * Bug #136: Safely parse address JSON from DB. Returns typed object with defaults.
 */
export function safeParseAddress(raw: unknown): ClientAddress {
  if (!raw || typeof raw !== 'object') return {};
  const addr = raw as Record<string, unknown>;
  return {
    street: typeof addr.street === 'string' ? addr.street : (typeof addr.line1 === 'string' ? addr.line1 : undefined),
    city: typeof addr.city === 'string' ? addr.city : undefined,
    state: typeof addr.state === 'string' ? addr.state : undefined,
    postalCode: typeof addr.postalCode === 'string' ? addr.postalCode : (typeof addr.zip === 'string' ? addr.zip : undefined),
    country: typeof addr.country === 'string' ? addr.country : undefined,
  };
}

/**
 * Bug #139: Safely parse client metadata from DB JSON. Returns typed object with defaults.
 */
export function safeParseMetadata(raw: unknown): ClientMetadata {
  if (!raw || typeof raw !== 'object') return { type: 'individual', tags: [], contacts: [] };
  const meta = raw as Record<string, unknown>;
  return {
    type: (meta.type === 'company' || meta.type === 'individual') ? meta.type : 'individual',
    website: typeof meta.website === 'string' ? meta.website : undefined,
    tags: Array.isArray(meta.tags) ? meta.tags.filter((t): t is string => typeof t === 'string') : [],
    contacts: Array.isArray(meta.contacts) ? meta.contacts as ClientContact[] : [],
  };
}

// Client list item (for list views)
export interface ClientListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  type: string;
  totalQuotes: number;
  totalInvoices: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

// Client detail (for detail views)
export interface ClientDetail {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: ClientAddress | null;
  billingAddress: ClientAddress | null;
  taxId: string | null;
  notes: string | null;
  metadata: ClientMetadata;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  quotes?: Quote[];
  invoices?: Invoice[];
  _count?: {
    quotes: number;
    invoices: number;
  };
  // Computed fields
  contacts: ClientContact[];
  tags: string[];
  type: string;
  website: string | null;
  totalRevenue: number;
  outstandingAmount: number;
}

// Client activity item
export interface ClientActivity {
  id: string;
  type: 'quote_created' | 'quote_sent' | 'quote_accepted' | 'quote_declined' | 'invoice_created' | 'invoice_sent' | 'invoice_paid' | 'invoice_overdue';
  title: string;
  description?: string;
  amount?: number;
  date: Date;
  relatedId?: string;
}

// Create client input
export interface CreateClientInput {
  type?: 'individual' | 'company';
  name: string;
  email: string;
  phone?: string;
  website?: string;
  company?: string;
  taxId?: string;
  address?: ClientAddress;
  billingAddress?: ClientAddress;
  notes?: string;
  tags?: string[];
  contacts?: Omit<ClientContact, 'id'>[];
}

// Update client input
export interface UpdateClientInput extends Partial<CreateClientInput> {
  id: string;
}

// Client filter
export interface ClientFilter {
  search?: string;
  type?: 'individual' | 'company';
  tags?: string[];
  hasQuotes?: boolean;
  hasInvoices?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Client stats
export interface ClientStats {
  total: number;
  individuals: number;
  companies: number;
  withActiveQuotes: number;
  withUnpaidInvoices: number;
}

// Paginated result
export interface PaginatedClients {
  data: ClientListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Client import result
export interface ClientImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}
