# QuoteCraft Code Discovery Report

> Generated: 2026-01-30
>
> This report summarizes the code capabilities discovered in the QuoteCraft codebase.

---

## Executive Summary

QuoteCraft is a full-featured visual quote and invoice management application built with Next.js 14 App Router, TypeScript, Prisma, and Shadcn UI. The codebase follows a well-organized monorepo structure using Turborepo.

### Key Statistics

| Category | Count |
|----------|-------|
| **UI Components (Shadcn)** | 43 |
| **Domain Components** | 50+ |
| **Server Actions** | 80+ |
| **API Routes** | 5 |
| **Database Models** | 18 |
| **Custom Hooks** | 3 |
| **Utility Functions** | 25+ |
| **Type Definitions** | 30+ |

---

## Component Breakdown

### UI Components (Shadcn/UI): 43 components

These are the base UI building blocks:
- Form controls: Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider
- Display: Card, Badge, Avatar, Skeleton, Progress, Separator
- Navigation: Tabs, Breadcrumb, NavigationMenu, Menubar, Pagination
- Overlay: Dialog, AlertDialog, Sheet, Drawer, Popover, HoverCard, Tooltip
- Data: Table, DataTable, Accordion, Collapsible, ScrollArea
- Feedback: Toast, Sonner (toast notifications)

### Domain Components: 50+ components

Organized by feature domain:
- **Quote Builder (10)**: Visual drag-and-drop quote creation
- **Quote Management (6)**: Listing, filtering, actions
- **Invoice (6)**: Invoice management components
- **Client (5)**: Client management components
- **Rate Card (4)**: Pricing/rate management
- **Contract (4)**: Contract templates and signing
- **Dashboard (5)**: Stats, charts, activity feed
- **Settings (5)**: Business profile, branding, email, payments
- **Shared (8)**: Common layout components
- **Portal (6)**: Client-facing public views

---

## Server Actions Breakdown

### Core Business Logic: 80+ server actions

| Domain | Actions | Key Functions |
|--------|---------|---------------|
| **Quotes** | 15 | CRUD, send, convert to invoice, public access |
| **Invoices** | 15 | CRUD, send, mark as paid, void, public access |
| **Clients** | 6 | CRUD, stats retrieval |
| **Rate Cards** | 10 | CRUD for cards and categories |
| **Contracts** | 15 | Templates, instances, signing, sending |
| **Dashboard** | 8 | Stats, counts, revenue data, activity |
| **Settings** | 10 | Business profile, branding, tax rates, terms |
| **Email** | 10 | Templates, scheduled emails, notifications |
| **Payments** | 8 | Stripe Connect, payment intents, webhooks |
| **PDF** | 4 | Quote and invoice PDF data generation |
| **Onboarding** | 4 | Progress tracking, completion |

---

## Database Schema Summary

### 18 Database Models

**Core Entities:**
- User, Account, Session, VerificationToken (Authentication)
- Workspace, WorkspaceMember (Multi-tenancy)
- BusinessProfile, BrandingSettings, PaymentSettings (Configuration)

**Business Entities:**
- Client (Customer records)
- RateCard, RateCardCategory, TaxRate (Pricing)
- Quote, QuoteLineItem, QuoteEvent (Quotes)
- Invoice, InvoiceLineItem, InvoiceEvent, Payment (Invoicing)
- Contract, ContractInstance (Contracts)
- EmailTemplate, ScheduledEmail (Communications)

### Key Relationships

```
Workspace (1) ----< (*) WorkspaceMember >---- (1) User
    |
    +----< (*) Client
    |         |
    |         +----< (*) Quote ----< (*) QuoteLineItem
    |         |         |
    |         |         +----< (*) QuoteEvent
    |         |
    |         +----< (*) Invoice ----< (*) InvoiceLineItem
    |                   |
    |                   +----< (*) Payment
    |                   +----< (*) InvoiceEvent
    |
    +----< (*) Contract ----< (*) ContractInstance
    |
    +----< (*) RateCard
    |
    +----< (*) TaxRate
    |
    +---- (1) BusinessProfile
    +---- (1) BrandingSettings
    +---- (1) PaymentSettings
```

---

## API Routes Summary

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET, POST | NextAuth.js handlers |
| `/api/auth/register` | POST | User registration |
| `/api/webhooks/stripe` | POST | Stripe payment webhooks |
| `/api/pdf/quote/[quoteId]` | GET | Quote PDF HTML generation |
| `/api/pdf/invoice/[invoiceId]` | GET | Invoice PDF HTML generation |
| `/api/checkout/invoice/[invoiceId]` | POST | Create payment intent |

---

## Hooks Summary

| Hook | Location | Purpose |
|------|----------|---------|
| `useAutoSave` | `lib/quotes/hooks.ts` | Auto-save quote with debouncing |
| `useBuilderKeyboardShortcuts` | `lib/quotes/hooks.ts` | Quote builder keyboard shortcuts |
| `useToast` | `hooks/use-toast.ts` | Toast notification management |

---

## Utility Functions Summary

### Core Utilities (14 functions)

| Category | Functions |
|----------|-----------|
| **Formatting** | `formatCurrency`, `formatDate`, `formatDateTime`, `formatRelativeTime`, `formatNumber`, `formatPercentage` |
| **String** | `slugify`, `truncate`, `generateInitials`, `capitalizeFirst` |
| **Validation** | `isValidEmail` |
| **Helpers** | `cn` (classnames), `delay` |

### Package Utilities (15+ functions)

| Category | Functions |
|----------|-----------|
| **Format** | `formatCurrency`, `formatNumber`, `formatDate`, `formatRelativeTime`, `formatPercentage`, `formatFileSize`, `formatPhoneNumber`, `formatDocumentNumber` |
| **Validation Schemas** | `emailSchema`, `passwordSchema`, `phoneSchema`, `urlSchema`, `slugSchema`, `currencyCodeSchema`, `moneySchema`, `percentageSchema`, `uuidSchema`, `addressSchema` |
| **Validation Functions** | `isValidEmail`, `isValidUrl`, `isValidUuid` |

---

## Type Definitions Summary

### Core Model Types (15+)

- `User`, `Workspace`, `WorkspaceMember`, `WorkspaceSettings`
- `BusinessProfile`, `Client`, `RateCard`
- `Quote`, `QuoteSettings`, `QuoteLineItem`, `QuoteStatus`
- `Invoice`, `InvoiceSettings`, `InvoiceLineItem`, `InvoiceStatus`
- `Payment`, `PaymentStatus`, `TaxRate`
- `SignatureData`, `Address`, `BaseModel`, `SoftDeletable`

### Feature-Specific Types (15+)

- Quote types: `QuoteBlock`, `QuoteDocument`, `QuoteListItem`, `QuoteDetail`, `CreateQuoteInput`, `UpdateQuoteInput`
- Invoice types: `InvoiceListItem`, `InvoiceDetail`, `CreateInvoiceInput`, `UpdateInvoiceInput`
- Dashboard types: `DashboardStats`, `DashboardData`, `RevenueDataPoint`, `ActivityItem`
- Portal types: `PublicQuoteData`, `PublicInvoiceData`

---

## Architecture Highlights

### Design Patterns Used

1. **Server Actions Pattern**: All mutations use Next.js Server Actions
2. **Repository Pattern**: Data access through centralized action functions
3. **Component Composition**: Shadcn UI base + domain-specific wrappers
4. **Multi-tenancy**: Workspace-based data isolation
5. **Soft Deletes**: Important entities use deletedAt instead of hard delete
6. **Event Sourcing (Light)**: Quote/Invoice events track activity history

### Tech Stack Integration

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| UI | React + Shadcn/UI + Tailwind CSS |
| State | Zustand (client), Server Actions (server) |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 |
| Payments | Stripe Connect |
| Email | Custom service (ready for SMTP) |
| PDF | HTML templates + Puppeteer |

---

## Code Quality Observations

### Strengths

1. **Consistent patterns**: All actions follow the same structure
2. **Type safety**: Full TypeScript with strict mode
3. **Separation of concerns**: Clear domain boundaries
4. **Reusable components**: Well-organized component library
5. **Multi-tenant ready**: All queries scoped by workspace

### Areas for Future Enhancement

1. **Test coverage**: No tests discovered yet
2. **Error handling**: Could use centralized error types
3. **Caching**: Room for React Query or SWR integration
4. **Documentation**: Inline JSDoc could be expanded
5. **Logging**: Structured logging not yet implemented

---

## File Counts by Directory

| Directory | File Count | File Types |
|-----------|------------|------------|
| `apps/web/components/ui/` | 43 | TSX |
| `apps/web/components/**/` | 50+ | TSX |
| `apps/web/lib/*/actions.ts` | 10 | TS |
| `apps/web/app/api/` | 5 | TS route handlers |
| `packages/database/prisma/` | 1 | Prisma schema |
| `packages/types/src/` | 3+ | TS |
| `packages/utils/src/` | 3+ | TS |

---

## Recommendations

### For New Developers

1. Start with `CLAUDE.md` for project overview
2. Review `packages/types/src/models.ts` for data structures
3. Explore `apps/web/lib/*/actions.ts` for business logic
4. Check `apps/web/components/ui/` for UI primitives

### For Feature Development

1. Follow existing action patterns in `lib/` directories
2. Use existing UI components from `components/ui/`
3. Add types to appropriate `types.ts` files
4. Maintain workspace-scoped queries

### For Code Maintenance

1. Run `pnpm lint` before commits
2. Keep Prisma schema in sync with types
3. Update this index when adding new capabilities

---

*Report generated by Code Capability Indexer*
*Last updated: 2026-01-30*
