# QuoteCraft Developer Guide

This guide provides comprehensive documentation for developers working on QuoteCraft, an open-source, self-hosted visual quote and invoice management tool for small businesses, freelancers, and agencies.

---

## Table of Contents

1. [Development Environment Setup](#1-development-environment-setup)
2. [Project Architecture](#2-project-architecture)
3. [Code Style Guidelines](#3-code-style-guidelines)
4. [Database Operations](#4-database-operations)
5. [Server Actions Pattern](#5-server-actions-pattern)
6. [API Routes Pattern](#6-api-routes-pattern)
7. [Component Development](#7-component-development)
8. [Testing Guide](#8-testing-guide)
9. [Common Tasks](#9-common-tasks)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Development Environment Setup

### 1.1 Prerequisites

Ensure you have the following installed:

| Tool | Minimum Version | Purpose |
|------|-----------------|---------|
| Node.js | 20.x LTS | Runtime environment |
| pnpm | 9.x | Package manager |
| Docker | 24.x | Container runtime |
| Docker Compose | 2.x | Container orchestration |
| Git | 2.x | Version control |

### 1.2 Installation Steps

**Step 1: Clone the Repository**

```bash
git clone https://github.com/quotecraft/quotecraft.git
cd quote-software
```

**Step 2: Install Dependencies**

```bash
pnpm install
```

**Step 3: Set Up Environment Variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

Required variables for local development:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://quotecraft:quotecraft@localhost:5432/quotecraft?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-generated-secret>
```

**Step 4: Start Docker Services**

```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Mailpit for email testing (Web UI: 8025, SMTP: 1025)

**Step 5: Initialize the Database**

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed development data (optional)
pnpm db:seed
```

**Step 6: Start the Development Server**

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### 1.3 IDE Setup

**VS Code Extensions (Recommended)**

- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- Prisma
- TypeScript and JavaScript Language Features

**Settings (`.vscode/settings.json`)**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## 2. Project Architecture

### 2.1 Monorepo Structure

QuoteCraft uses a Turborepo-powered monorepo with pnpm workspaces:

```
quote-software/
├── apps/
│   └── web/                     # Next.js 14+ application
│       ├── app/                 # App Router pages
│       │   ├── (auth)/          # Authentication routes
│       │   ├── (dashboard)/     # Protected dashboard routes
│       │   ├── api/             # API routes
│       │   ├── q/[token]/       # Public quote view
│       │   ├── i/[token]/       # Public invoice view
│       │   └── c/[token]/       # Public contract view
│       ├── components/          # React components
│       ├── lib/                 # Business logic
│       ├── hooks/               # Custom React hooks
│       └── __tests__/           # Test files
│
├── packages/
│   ├── database/                # Prisma schema and client
│   ├── types/                   # Shared TypeScript types
│   ├── utils/                   # Shared utility functions
│   └── email-templates/         # React Email templates
│
├── docs/                        # Documentation
├── specs/                       # Specification documents
└── docker-compose.yml           # Docker services
```

### 2.2 Package Responsibilities

| Package | Purpose | Path |
|---------|---------|------|
| `@quotecraft/database` | Prisma schema, client, migrations, seeds | `packages/database/` |
| `@quotecraft/types` | Shared TypeScript type definitions | `packages/types/` |
| `@quotecraft/utils` | Shared utility functions (formatting, validation) | `packages/utils/` |
| `@quotecraft/email-templates` | React Email templates | `packages/email-templates/` |

### 2.3 Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│    Browser (React Components) / Client Portal                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                     NEXT.JS APP ROUTER                       │
│   ┌─────────────────┐  ┌─────────────────┐                  │
│   │  Server         │  │  API Routes     │                  │
│   │  Components     │  │  /api/*         │                  │
│   └────────┬────────┘  └────────┬────────┘                  │
│            │                    │                            │
│   ┌────────▼────────────────────▼────────┐                  │
│   │          SERVER ACTIONS               │                  │
│   │        lib/{domain}/actions.ts        │                  │
│   └────────────────┬─────────────────────┘                  │
└────────────────────┼────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Prisma   │  │  Redis   │  │  Stripe  │  │  Email   │    │
│  │ (PG)     │  │  Cache   │  │  API     │  │  Service │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Domain Structure

Business logic is organized by domain under `apps/web/lib/`:

```
lib/
├── auth/              # Authentication utilities
├── clients/           # Client management
│   ├── actions.ts     # Server actions
│   └── types.ts       # Types and schemas
├── contracts/         # Contract templates and instances
├── dashboard/         # Dashboard statistics
├── email/             # Email templates and sending
├── invoices/          # Invoice management
├── onboarding/        # User onboarding
├── payments/          # Stripe payment processing
├── pdf/               # PDF generation
├── quotes/            # Quote management
│   ├── actions.ts     # Server actions
│   ├── types.ts       # Types and schemas
│   └── hooks.ts       # React hooks
├── rate-cards/        # Rate card management
├── settings/          # Workspace settings
├── services/          # External service integrations
├── stores/            # Zustand state stores
└── utils.ts           # Utility functions
```

---

## 3. Code Style Guidelines

### 3.1 TypeScript Standards

**Strict Mode Required**

All code must pass TypeScript strict mode. Avoid `any` types.

```typescript
// Bad
function processData(data: any): any {
  return data.value;
}

// Good
interface DataInput {
  value: string;
}

function processData(data: DataInput): string {
  return data.value;
}
```

**Use Explicit Return Types**

```typescript
// Good - explicit return type
export async function getQuotes(filter: QuoteFilter): Promise<QuoteListItem[]> {
  // ...
}
```

### 3.2 React Patterns

**Server Components First**

Default to React Server Components. Use `'use client'` only when needed:

```typescript
// Server Component (default) - no directive needed
import { prisma } from '@quotecraft/database';

export async function QuoteList() {
  const quotes = await prisma.quote.findMany();
  return <ul>{quotes.map(q => <li key={q.id}>{q.title}</li>)}</ul>;
}
```

```typescript
// Client Component - add directive at top
'use client';

import { useState } from 'react';

export function QuoteBuilder() {
  const [blocks, setBlocks] = useState([]);
  // Client-side interactivity
}
```

**When to Use Client Components**

- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, IntersectionObserver)
- React hooks (useState, useEffect, useRef)
- Third-party client libraries (dnd-kit, Tiptap)

**Component Structure**

```typescript
// components/quotes/QuoteCard.tsx

interface QuoteCardProps {
  quote: Quote;
  onEdit?: (id: string) => void;
  className?: string;
}

export function QuoteCard({ quote, onEdit, className }: QuoteCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <CardHeader>
        <CardTitle>{quote.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
}
```

### 3.3 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `QuoteBuilder.tsx` |
| Hooks | camelCase with `use` prefix | `useAutoSave.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_LINE_ITEMS` |
| Types/Interfaces | PascalCase | `QuoteFilter` |
| Server Actions | camelCase with verb | `createQuote`, `updateClient` |
| Database tables | snake_case (via @@map) | `quote_line_items` |

### 3.4 File Organization

```
components/
└── quotes/
    ├── QuoteCard.tsx           # Component
    ├── QuoteCard.test.tsx      # Tests (co-located)
    ├── QuoteStatusBadge.tsx
    └── index.ts                # Barrel export
```

**Barrel Exports**

```typescript
// components/quotes/index.ts
export { QuoteCard } from './QuoteCard';
export { QuoteStatusBadge } from './QuoteStatusBadge';
export { QuoteBuilder } from './builder/QuoteBuilder';
```

### 3.5 Form Handling

Use `react-hook-form` with Zod schemas:

```typescript
// lib/quotes/schemas.ts
import { z } from 'zod';

export const createQuoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  clientId: z.string().uuid('Invalid client'),
  expirationDate: z.date().optional(),
  notes: z.string().max(5000).optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
```

```typescript
// components/quotes/QuoteForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createQuoteSchema, type CreateQuoteInput } from '@/lib/quotes/schemas';

export function QuoteForm() {
  const form = useForm<CreateQuoteInput>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      title: '',
      clientId: '',
    },
  });

  async function onSubmit(data: CreateQuoteInput) {
    // Server action call
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

---

## 4. Database Operations

### 4.1 Prisma Setup

The database package is located at `packages/database/`.

**Schema Location:** `packages/database/prisma/schema.prisma`

**Generate Prisma Client**

```bash
pnpm db:generate
```

**View Database in Browser**

```bash
pnpm db:studio
```

### 4.2 Migrations

**Create a New Migration**

```bash
pnpm db:migrate
```

This runs `prisma migrate dev` which:
1. Creates a new migration file
2. Applies the migration to the database
3. Regenerates the Prisma client

**Migration Naming Convention**

Migrations are automatically named with timestamps. You can provide a descriptive name:

```bash
cd packages/database
pnpm exec prisma migrate dev --name add_contracts_table
```

### 4.3 Seeding

**Seed File Location:** `packages/database/prisma/seed.ts`

**Run Seeds**

```bash
pnpm db:seed
```

**Example Seed**

```typescript
// packages/database/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'demo@quotecraft.app' },
    update: {},
    create: {
      email: 'demo@quotecraft.app',
      name: 'Demo User',
      passwordHash: await hash('demo123', 12),
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      slug: 'demo',
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
    },
  });

  console.log({ user, workspace });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### 4.4 Query Patterns

**Using Prisma in Server Actions**

```typescript
// lib/quotes/actions.ts
'use server';

import { prisma } from '@quotecraft/database';

export async function getQuotes(filter: QuoteFilter) {
  const quotes = await prisma.quote.findMany({
    where: {
      workspaceId: filter.workspaceId,
      status: filter.status,
      deletedAt: null, // Soft delete filter
    },
    include: {
      client: true,
      lineItems: true,
    },
    orderBy: { createdAt: 'desc' },
    take: filter.limit ?? 20,
    skip: filter.offset ?? 0,
  });

  return quotes;
}
```

**Transactions**

```typescript
export async function convertQuoteToInvoice(quoteId: string) {
  return prisma.$transaction(async (tx) => {
    // Fetch quote
    const quote = await tx.quote.findUniqueOrThrow({
      where: { id: quoteId },
      include: { lineItems: true },
    });

    // Create invoice
    const invoice = await tx.invoice.create({
      data: {
        workspaceId: quote.workspaceId,
        clientId: quote.clientId,
        quoteId: quote.id,
        // ... copy quote data
      },
    });

    // Update quote status
    await tx.quote.update({
      where: { id: quoteId },
      data: { status: 'accepted', convertedToInvoiceId: invoice.id },
    });

    return invoice;
  });
}
```

### 4.5 Soft Deletes

Important entities use soft deletes:

```typescript
// Delete (soft)
export async function deleteQuote(quoteId: string) {
  await prisma.quote.update({
    where: { id: quoteId },
    data: { deletedAt: new Date() },
  });
}

// Query (exclude deleted)
const quotes = await prisma.quote.findMany({
  where: {
    workspaceId,
    deletedAt: null, // Always filter soft-deleted records
  },
});
```

---

## 5. Server Actions Pattern

Server Actions are the primary way to handle mutations in QuoteCraft.

### 5.1 Creating a New Server Action

**Step 1: Create the Action File**

```typescript
// lib/quotes/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@quotecraft/database';
import { auth } from '@/lib/auth';
import { createQuoteSchema } from './schemas';

export async function createQuote(input: unknown) {
  // 1. Authenticate
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // 2. Get workspace context
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

  if (!membership) {
    throw new Error('No workspace found');
  }

  // 3. Validate input
  const validated = createQuoteSchema.parse(input);

  // 4. Perform database operation
  const quote = await prisma.quote.create({
    data: {
      workspaceId: membership.workspace.id,
      clientId: validated.clientId,
      title: validated.title,
      status: 'draft',
      // ... other fields
    },
  });

  // 5. Revalidate cache
  revalidatePath('/quotes');

  // 6. Return result
  return { success: true, quote };
}
```

### 5.2 Action Response Pattern

```typescript
// Consistent response shape
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createQuote(input: unknown): Promise<ActionResult<Quote>> {
  try {
    // ... implementation
    return { success: true, data: quote };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: 'Invalid input' };
    }
    return { success: false, error: 'Failed to create quote' };
  }
}
```

### 5.3 Using Actions in Components

**Server Component**

```typescript
// app/(dashboard)/quotes/page.tsx
import { getQuotes } from '@/lib/quotes/actions';

export default async function QuotesPage() {
  const quotes = await getQuotes({ limit: 20 });

  return (
    <QuoteList quotes={quotes} />
  );
}
```

**Client Component**

```typescript
// components/quotes/CreateQuoteButton.tsx
'use client';

import { useTransition } from 'react';
import { createQuote } from '@/lib/quotes/actions';
import { toast } from 'sonner';

export function CreateQuoteButton() {
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const result = await createQuote({
        title: 'New Quote',
        clientId: 'client-123',
      });

      if (result.success) {
        toast.success('Quote created');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button onClick={handleCreate} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Quote'}
    </Button>
  );
}
```

### 5.4 Existing Server Actions Reference

| Domain | File | Key Actions |
|--------|------|-------------|
| Quotes | `lib/quotes/actions.ts` | `createQuote`, `updateQuote`, `deleteQuote`, `sendQuote`, `duplicateQuote` |
| Invoices | `lib/invoices/actions.ts` | `createInvoice`, `updateInvoice`, `sendInvoice`, `markAsPaid`, `voidInvoice` |
| Clients | `lib/clients/actions.ts` | `createClient`, `updateClient`, `deleteClient`, `getClientStats` |
| Rate Cards | `lib/rate-cards/actions.ts` | `createRateCard`, `updateRateCard`, `deleteRateCard`, `getCategories` |
| Contracts | `lib/contracts/actions.ts` | `createContractTemplate`, `createContractInstance`, `signContract` |
| Settings | `lib/settings/actions.ts` | `updateBusinessProfile`, `updateBrandingSettings`, `updateTaxRates` |
| Payments | `lib/payments/actions.ts` | `createPaymentIntent`, `processPaymentWebhook` |
| Dashboard | `lib/dashboard/actions.ts` | `getDashboardStats`, `getRevenueData`, `getRecentActivity` |

---

## 6. API Routes Pattern

API routes are used for webhooks, PDF generation, and public endpoints.

### 6.1 Creating an API Route

**File Location:** `app/api/{route}/route.ts`

```typescript
// app/api/quotes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@quotecraft/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: { client: true, lineItems: true },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: quote });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 6.2 Webhook Handler Pattern

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/services/stripe';
import { processPaymentWebhook } from '@/lib/payments/actions';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await processPaymentWebhook(event.data.object.id, 'succeeded');
        break;
      case 'payment_intent.payment_failed':
        await processPaymentWebhook(event.data.object.id, 'failed');
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

### 6.3 Existing API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth authentication |
| `/api/auth/register` | POST | User registration |
| `/api/webhooks/stripe` | POST | Stripe payment webhooks |
| `/api/pdf/quote/[quoteId]` | GET | Generate quote PDF HTML |
| `/api/pdf/invoice/[invoiceId]` | GET | Generate invoice PDF HTML |
| `/api/checkout/invoice/[invoiceId]` | POST | Create payment intent |
| `/api/health` | GET | Health check endpoint |

---

## 7. Component Development

### 7.1 Shadcn UI Integration

Components are built using Shadcn UI, located in `components/ui/`.

**Adding a New Shadcn Component**

```bash
cd apps/web
pnpm dlx shadcn@latest add button
```

**Using Components**

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### 7.2 Quote Builder Block System

The quote builder uses a block-based system for content:

**Block Types**

| Type | Component | Purpose |
|------|-----------|---------|
| `text` | `TextBlock` | Rich text content (Tiptap) |
| `service-item` | `LineItemsBlock` | Services/products with pricing |
| `image` | `ImageBlock` | Image content |
| `divider` | `DividerBlock` | Visual separator |
| `signature` | `SignatureBlock` | E-signature capture |

**Block Interface**

```typescript
// lib/quotes/types.ts
interface BaseBlock {
  id: string;
  type: string;
}

interface TextBlock extends BaseBlock {
  type: 'text';
  content: {
    html: string;
  };
}

interface ServiceItemBlock extends BaseBlock {
  type: 'service-item';
  content: {
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    taxRate?: number;
  };
}

type QuoteBlock = TextBlock | ServiceItemBlock | ImageBlock | DividerBlock | SignatureBlock;
```

**Creating a New Block Type**

1. Add the type to `lib/quotes/types.ts`
2. Create the component in `components/quotes/blocks/`
3. Register in `QuoteBlockRenderer.tsx`

### 7.3 Component Patterns

**Page Header**

```typescript
import { PageHeader } from '@/components/shared/PageHeader';

export default function QuotesPage() {
  return (
    <>
      <PageHeader
        title="Quotes"
        description="Manage your quotes"
        action={
          <Button asChild>
            <Link href="/quotes/new">New Quote</Link>
          </Button>
        }
      />
      {/* Page content */}
    </>
  );
}
```

**Empty State**

```typescript
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';

export function QuoteList({ quotes }) {
  if (quotes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No quotes yet"
        description="Create your first quote to get started"
        action={
          <Button asChild>
            <Link href="/quotes/new">Create Quote</Link>
          </Button>
        }
      />
    );
  }

  return <ul>{/* Render quotes */}</ul>;
}
```

### 7.4 Design System

**Colors**

| Name | Value | Usage |
|------|-------|-------|
| Primary | #3B82F6 (Blue-500) | Buttons, links, focus states |
| Secondary | #8B5CF6 (Violet-500) | Secondary actions |
| Accent | #F59E0B (Amber-500) | Highlights, badges |
| Destructive | #EF4444 (Red-500) | Delete actions, errors |

**Spacing**

Use Tailwind's spacing scale consistently:
- `p-4` for card padding
- `gap-4` for flex/grid gaps
- `space-y-4` for vertical stacking

**Typography**

- Font family: Inter (UI), JetBrains Mono (code)
- Use semantic headings: `<h1>` for page titles, `<h2>` for sections

---

## 8. Testing Guide

### 8.1 Test Stack

| Tool | Purpose |
|------|---------|
| Vitest | Unit and integration tests |
| React Testing Library | Component testing |
| Playwright | End-to-end tests |

### 8.2 Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

### 8.3 Vitest Configuration

Located at `apps/web/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'dist', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### 8.4 Writing Unit Tests

**Testing Server Actions**

```typescript
// __tests__/lib/quotes/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock modules
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const mockPrisma = {
  quote: {
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  workspaceMember: {
    findFirst: vi.fn(),
  },
};

vi.mock('@quotecraft/database', () => ({
  prisma: mockPrisma,
}));

import { auth } from '@/lib/auth';
import { createQuote } from '@/lib/quotes/actions';

describe('createQuote', () => {
  const mockSession = {
    user: { id: 'user-123' },
  };

  const mockWorkspace = {
    id: 'ws-123',
    name: 'Test Workspace',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession);
    mockPrisma.workspaceMember.findFirst.mockResolvedValue({
      workspace: mockWorkspace,
    });
  });

  it('creates a quote with valid data', async () => {
    mockPrisma.quote.findFirst.mockResolvedValue(null);
    mockPrisma.quote.create.mockResolvedValue({
      id: 'quote-123',
      title: 'Test Quote',
    });

    const result = await createQuote({
      title: 'Test Quote',
      clientId: 'client-123',
    });

    expect(result.success).toBe(true);
    expect(result.quote.title).toBe('Test Quote');
  });

  it('throws error when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    await expect(createQuote({
      title: 'Test',
      clientId: 'client-123',
    })).rejects.toThrow('Unauthorized');
  });
});
```

**Testing Components**

```typescript
// __tests__/components/quotes/QuoteCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuoteCard } from '@/components/quotes/QuoteCard';

describe('QuoteCard', () => {
  const mockQuote = {
    id: 'quote-123',
    title: 'Website Redesign',
    status: 'draft',
    total: 5000,
    client: { name: 'Acme Corp' },
  };

  it('renders quote title', () => {
    render(<QuoteCard quote={mockQuote} />);
    expect(screen.getByText('Website Redesign')).toBeInTheDocument();
  });

  it('displays client name', () => {
    render(<QuoteCard quote={mockQuote} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('shows formatted total', () => {
    render(<QuoteCard quote={mockQuote} />);
    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
  });
});
```

### 8.5 E2E Tests with Playwright

```typescript
// e2e/quotes.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Quotes', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('creates a new quote', async ({ page }) => {
    await page.goto('/quotes/new');

    // Fill quote details
    await page.fill('[name="title"]', 'New Project Quote');
    await page.click('[data-testid="client-selector"]');
    await page.click('text=Acme Corp');

    // Save quote
    await page.click('text=Save');

    // Verify redirect and success
    await expect(page).toHaveURL(/\/quotes\/[\w-]+/);
    await expect(page.getByText('New Project Quote')).toBeVisible();
  });
});
```

---

## 9. Common Tasks

### 9.1 Adding a New Feature

**Example: Adding a Notes Field to Quotes**

1. **Update Database Schema**

```prisma
// packages/database/prisma/schema.prisma
model Quote {
  // ... existing fields
  notes         String?   @db.Text
  internalNotes String?   @db.Text  @map("internal_notes")
}
```

2. **Run Migration**

```bash
pnpm db:migrate
```

3. **Update Types**

```typescript
// lib/quotes/types.ts
export interface QuoteDetail {
  // ... existing fields
  notes?: string;
  internalNotes?: string;
}
```

4. **Update Validation Schema**

```typescript
// lib/quotes/schemas.ts
export const updateQuoteSchema = z.object({
  // ... existing fields
  notes: z.string().max(5000).optional(),
  internalNotes: z.string().max(5000).optional(),
});
```

5. **Update Server Action**

```typescript
// lib/quotes/actions.ts
export async function updateQuote(quoteId: string, data: UpdateQuoteInput) {
  // ... validation and auth

  const quote = await prisma.quote.update({
    where: { id: quoteId },
    data: {
      ...data,
      notes: data.notes,
      internalNotes: data.internalNotes,
    },
  });

  revalidatePath(`/quotes/${quoteId}`);
  return { success: true, quote };
}
```

6. **Add UI Component**

```typescript
// components/quotes/QuoteNotesEditor.tsx
'use client';

export function QuoteNotesEditor({ quoteId, initialNotes }) {
  // ... component implementation
}
```

7. **Write Tests**

```typescript
// __tests__/lib/quotes/actions.test.ts
it('updates quote notes', async () => {
  // ... test implementation
});
```

### 9.2 Adding a New API Endpoint

1. Create route file at `app/api/{path}/route.ts`
2. Implement HTTP methods (GET, POST, PUT, DELETE)
3. Add authentication if needed
4. Add validation for inputs
5. Return consistent response format

### 9.3 Adding Email Templates

1. Create template in `packages/email-templates/src/`
2. Export from `packages/email-templates/src/index.ts`
3. Use in email actions with Resend

### 9.4 Debugging Tips

**Prisma Query Logging**

```typescript
// packages/database/src/client.ts
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});
```

**React DevTools**

Install the React DevTools browser extension for component debugging.

**Network Debugging**

Use browser DevTools Network tab to inspect API calls.

---

## 10. Troubleshooting

### 10.1 Common Issues

**Issue: "Prisma client not found"**

```bash
# Regenerate Prisma client
pnpm db:generate
```

**Issue: "Cannot find module '@quotecraft/database'"**

```bash
# Rebuild packages
pnpm build
```

**Issue: Database connection fails**

1. Check Docker is running: `docker-compose ps`
2. Verify `.env.local` has correct `DATABASE_URL`
3. Check PostgreSQL is healthy: `docker-compose logs postgres`

**Issue: "NEXTAUTH_SECRET not set"**

```bash
# Generate a secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=<generated-secret>
```

**Issue: Migrations fail**

```bash
# Reset database (development only)
pnpm db:push --force-reset

# Or drop and recreate
docker-compose down -v
docker-compose up -d
pnpm db:migrate
```

### 10.2 Development Server Issues

**Port already in use**

```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Hot reload not working**

```bash
# Clear Next.js cache
rm -rf apps/web/.next
pnpm dev
```

### 10.3 TypeScript Errors

**Type mismatch after schema change**

```bash
# Regenerate types
pnpm db:generate

# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

### 10.4 Docker Issues

**Container won't start**

```bash
# Check logs
docker-compose logs <service-name>

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

**Volume permissions**

```bash
# Reset volumes
docker-compose down -v
docker-compose up -d
```

### 10.5 Getting Help

1. Check existing documentation in `/docs` and `/specs`
2. Search GitHub Issues
3. Review `CLAUDE.md` for AI-assisted development guidelines
4. Check the `CONSTITUTION.md` for project principles

---

## Appendix

### A. Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:push` | Push schema changes (no migration) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed database |
| `pnpm clean` | Clean build artifacts |

### B. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `NEXTAUTH_URL` | Yes | Application URL |
| `NEXTAUTH_SECRET` | Yes | NextAuth session secret |
| `STRIPE_SECRET_KEY` | No | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key |
| `RESEND_API_KEY` | No | Resend API key for emails |
| `EMAIL_FROM` | No | Default "from" email address |
| `STORAGE_PROVIDER` | No | File storage provider (local, s3) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |

### C. Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn UI Components](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [React Hook Form](https://react-hook-form.com/docs)
- [Zod Documentation](https://zod.dev)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev/docs)

---

*Last updated: 2026-01-30*
