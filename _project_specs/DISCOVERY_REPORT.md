# Oreko Code Discovery Report

> Generated: 2026-02-13
>
> This report provides a human-readable summary of the Oreko codebase capabilities.

---

## Executive Summary

Oreko is a full-featured visual quote and invoice management application built with Next.js 14 App Router, TypeScript, Prisma, and Shadcn UI. The codebase follows a well-organized monorepo structure using Turborepo with pnpm workspaces.

### Key Statistics

| Metric | Value |
|--------|-------|
| **Total TypeScript Files** | 414 |
| **Total Lines of Code** | ~72,125 |
| **React Components (TSX)** | 228 |
| **UI Components (Shadcn)** | 34 |
| **Domain Components** | 80+ |
| **Server Actions** | 90+ |
| **API Routes** | 15 |
| **Database Models** | 18 |
| **Page Routes** | 50+ |

---

## Project Structure Overview

```
oreko/
+-- apps/
|   +-- web/                    # Next.js 14 application
|       +-- app/                # App Router pages (50+ routes)
|       +-- components/         # React components (80+ domain components)
|       +-- lib/                # Business logic (actions, stores, types)
|       +-- hooks/              # Custom React hooks
+-- packages/
|   +-- database/               # Prisma schema and client
|   +-- types/                  # Shared TypeScript types
|   +-- utils/                  # Shared utility functions
+-- docs/                       # Documentation
+-- specs/                      # Specification documents
```

---

## Components Discovered

### UI Components (Shadcn/UI): 34 components

Located in `/apps/web/components/ui/`:

| Category | Components |
|----------|------------|
| **Form Controls** | Button, Input, Textarea, Select, Checkbox, Switch, Slider, DatePicker, ColorPicker, FileUpload |
| **Display** | Card, Badge, Avatar, Skeleton, Progress, Separator, Label |
| **Navigation** | Tabs, Breadcrumb, Sidebar, Pagination |
| **Overlay** | Dialog, AlertDialog, Sheet, Popover, Tooltip, DropdownMenu |
| **Data** | Table, Accordion, ScrollArea |
| **Feedback** | Toast, Toaster, Alert |

### Domain Components: 80+ components

| Domain | Count | Key Components |
|--------|-------|----------------|
| **Dashboard** | 9 | AppHeader, AppSidebar, StatsCards, RecentActivity, RecentItems, Nav, MobileNav |
| **Quote Builder** | 6 | BlockRenderer, BlocksPanel, BuilderToolbar, DocumentCanvas, PropertiesPanel, RateCardPanel |
| **Quote Blocks** | 10 | HeaderBlock, TextBlock, ServiceItemBlock, ServiceGroupBlock, ImageBlock, DividerBlock, SpacerBlock, ColumnsBlock, TableBlock, SignatureBlock |
| **Quote Editor** | 5 | QuoteEditor, DetailsSection, ItemsSection, NotesSection, TermsSection |
| **Clients** | 3 | ClientList, ClientDetail, ClientForm |
| **Invoices** | 2 | InvoiceActions, RecordPaymentDialog |
| **Rate Cards** | 4 | RateCardList, RateCardForm, RateCardPicker, CategoryManager |
| **Contracts** | 7 | ContractEditor, ContractTemplateList, ContractTemplateForm, ContractInstanceList, CreateContractForm, VariableManager, SignaturePad |
| **Settings** | 8 | BusinessProfileForm, BrandingSettingsForm, TaxRatesManager, NumberSequenceForm, TeamMemberList, InviteMemberButton, WorkspaceSettingsForm, DangerZone |
| **Client Portal** | 10 | QuotePortalView, QuotePortalHeader, AcceptQuoteDialog, DeclineQuoteDialog, InvoicePortalView, InvoicePortalHeader, QuoteBlockRenderer, SignaturePad |
| **Landing** | 11 | HeroSection, FeaturesSection, ProblemSection, HowItWorks, PricingSection, TestimonialsSection, OpenSourceSection, FaqSection, FinalCtaSection, MarketingHeader, MarketingFooter |
| **Onboarding** | 5 | OnboardingWizard, BusinessStep, BrandingStep, PaymentStep, CompleteStep |
| **Email** | 3 | EmailTemplateList, EmailTemplateForm, ScheduledEmailList |
| **Shared** | 7 | EmptyState, ErrorBoundary, LoadingSkeletons, PageContainer, PageHeader, SkipToContent, ThemeToggle |
| **Payments** | 1 | PaymentSettingsForm |

---

## Server Actions Breakdown

### Core Business Logic: 90+ server actions

| Domain | File | Actions | Key Functions |
|--------|------|---------|---------------|
| **Quotes** | `lib/quotes/actions.ts` | 12 | getQuotes, createQuote, updateQuote, deleteQuote, duplicateQuote, sendQuote, acceptQuote, declineQuote, getQuoteByToken |
| **Invoices** | `lib/invoices/actions.ts` | 11 | getInvoices, createInvoice, updateInvoice, deleteInvoice, sendInvoice, recordPayment, voidInvoice, convertQuoteToInvoice |
| **Clients** | `lib/clients/actions.ts` | 8 | getClients, getClientById, createClient, updateClient, deleteClient, getClientQuotes, getClientInvoices |
| **Rate Cards** | `lib/rate-cards/actions.ts` | 16 | getRateCards, createRateCard, updateRateCard, deleteRateCard, bulkDeleteRateCards, toggleRateCardActive, duplicateRateCard, getCategories, createCategory, updateCategory, importRateCards |
| **Contracts** | `lib/contracts/actions.ts` | 12 | getContractTemplates, createContractTemplate, updateContractTemplate, deleteContractTemplate, duplicateContractTemplate, getContractInstances, createContractInstance, sendContractInstance, signContract |
| **Dashboard** | `lib/dashboard/actions.ts` | 13 | getDashboardStats, getQuoteStatusCounts, getInvoiceStatusCounts, getRevenueData, getRecentQuotes, getRecentInvoices, getRecentActivity, getConversionFunnelData, getPaymentAgingData, getClientDistributionData, getMonthlyComparisonData, getRevenueForecast |
| **Settings** | `lib/settings/actions.ts` | 20+ | getWorkspace, updateWorkspaceName, getBusinessProfile, updateBusinessProfile, getBrandingSettings, updateBrandingSettings, getTaxRates, createTaxRate, getWorkspaceMembers, inviteMember, removeMember, deleteWorkspace |

---

## API Routes Registered

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js authentication |
| `/api/auth/register` | POST | User registration |
| `/api/auth/forgot-password` | POST | Password reset request |
| `/api/auth/reset-password` | POST | Password reset |
| `/api/quotes` | GET/POST | List/create quotes |
| `/api/invoices` | GET/POST | List/create invoices |
| `/api/clients` | GET/POST | List/create clients |
| `/api/pdf/quote/[quoteId]` | GET | Generate quote PDF |
| `/api/pdf/invoice/[invoiceId]` | GET | Generate invoice PDF |
| `/api/download/quote/[quoteId]` | GET | Download quote PDF |
| `/api/download/invoice/[invoiceId]` | GET | Download invoice PDF |
| `/api/checkout/invoice/[invoiceId]` | POST | Create Stripe checkout session |
| `/api/webhooks/stripe` | POST | Stripe payment webhooks |
| `/api/health` | GET | Health check endpoint |
| `/api/cron/reset-demo` | POST | Reset demo data |

---

## Database Models Found

### Prisma Schema: 18+ Models

**Authentication & Users:**
- `User` - User accounts
- `Account` - OAuth providers (NextAuth)
- `Session` - Auth sessions (NextAuth)
- `VerificationToken` - Email verification

**Multi-tenancy:**
- `Workspace` - Organizations/businesses
- `WorkspaceMember` - User-workspace membership

**Configuration:**
- `BusinessProfile` - Business information
- `BrandingSettings` - Logo, colors, fonts
- `PaymentSettings` - Stripe Connect settings

**Business Entities:**
- `Client` - Customer records
- `RateCard` - Service/product pricing
- `RateCardCategory` - Rate card grouping
- `TaxRate` - Tax configurations
- `NumberSequence` - Document numbering

**Documents:**
- `Quote` - Quote documents
- `QuoteLineItem` - Quote line items
- `QuoteBlock` - Visual builder blocks
- `QuoteEvent` - Quote audit trail
- `Invoice` - Invoice documents
- `InvoiceLineItem` - Invoice line items
- `InvoiceEvent` - Invoice audit trail
- `Payment` - Payment records

**Contracts:**
- `Contract` - Contract templates
- `ContractInstance` - Signed contracts

**Communications:**
- `EmailTemplate` - Email templates
- `ScheduledEmail` - Scheduled emails

### Entity Relationships

```
Workspace (1)
    |
    +----< WorkspaceMember >---- User
    |
    +---- BusinessProfile
    +---- BrandingSettings
    +---- PaymentSettings
    |
    +----< Client
    |         |
    |         +----< Quote ----< QuoteLineItem
    |         |         +----< QuoteBlock
    |         |         +----< QuoteEvent
    |         |
    |         +----< Invoice ----< InvoiceLineItem
    |                   +----< Payment
    |                   +----< InvoiceEvent
    |
    +----< Contract ----< ContractInstance
    |
    +----< RateCard ---- RateCardCategory
    |
    +----< TaxRate
    |
    +----< EmailTemplate
    +----< ScheduledEmail
```

---

## Third-Party Integrations

| Service | Purpose | Location |
|---------|---------|----------|
| **Stripe** | Payment processing | `lib/services/stripe.ts` |
| **NextAuth.js v5** | Authentication | `lib/auth/` |
| **Prisma** | Database ORM | `packages/database/` |
| **Zustand** | State management | `lib/stores/` |
| **Zod** | Validation schemas | `lib/validations/` |
| **date-fns** | Date formatting | Various |
| **Lucide React** | Icons | Components |

---

## Design Patterns Detected

### Architecture Patterns

| Pattern | Implementation |
|---------|----------------|
| **Server Actions** | All mutations via Next.js 14 Server Actions |
| **Repository Pattern** | Centralized data access through action files |
| **Component Composition** | Shadcn UI primitives + domain wrappers |
| **Multi-tenancy** | Workspace-scoped queries throughout |
| **Soft Deletes** | `deletedAt` field on important entities |
| **Event Sourcing (Light)** | QuoteEvent/InvoiceEvent audit trails |
| **Store Pattern** | Zustand for client-side state |

### Code Organization

| Aspect | Pattern |
|--------|---------|
| **File Naming** | kebab-case for components |
| **Export Style** | Named exports preferred |
| **Component Structure** | Props interface + function component |
| **Type Safety** | TypeScript strict mode enabled |
| **Validation** | Zod schemas for all inputs |

---

## State Management

### Client-side State (Zustand)

**Quote Builder Store** (`lib/stores/quote-builder-store.ts`):
- Document state
- UI state (panels, zoom, preview)
- History (undo/redo)
- Block selection

### Server-side State

- Server Actions for all data mutations
- Server Components for data fetching
- Revalidation via `revalidatePath`

---

## Feature Completeness Assessment

### Implemented (P0 - MVP)

| Feature | Status | Evidence |
|---------|--------|----------|
| Visual Quote Builder | Complete | `components/quotes/builder/`, 10+ block types |
| Client Management | Complete | `components/clients/`, full CRUD |
| Rate Card System | Complete | `components/rate-cards/`, categories, import |
| Quote-to-Invoice Conversion | Complete | `convertQuoteToInvoice` action |
| Client Portal | Complete | `/q/[token]`, `/i/[token]` routes |
| E-Signature Capture | Complete | `SignaturePad` component, signature data |
| Stripe Payments | Complete | `lib/services/stripe.ts`, webhooks |
| PDF Generation | Complete | `/api/pdf/` routes |
| Email Notifications | Complete | Email templates, scheduled emails |
| Dashboard | Complete | Stats, charts, activity feed |
| Form-based Quote Editor | Complete | `components/quotes/editor/` |

### Implemented (P1 - v1.1)

| Feature | Status | Evidence |
|---------|--------|----------|
| Contract Templates | Complete | `components/contracts/` |
| Email Template Customization | Complete | `components/email/` |
| Branding Settings | Complete | `BrandingSettingsForm` |
| Team Members | Complete | `TeamMemberList`, invites |

### Partially Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| Recurring Invoices | Not Found | No evidence in codebase |
| Milestone Payments | Not Found | No evidence in codebase |
| Export to CSV | Not Found | No export functionality |

---

## Code Quality Observations

### Strengths

1. **Consistent Patterns**: All actions follow the same structure
2. **Type Safety**: Full TypeScript with strict mode
3. **Separation of Concerns**: Clear domain boundaries
4. **Reusable Components**: Well-organized component library
5. **Multi-tenant Ready**: All queries scoped by workspace
6. **Modern Stack**: Next.js 14 App Router, React Server Components

### Areas for Enhancement

1. **Test Coverage**: No test files discovered
2. **Error Boundaries**: Basic implementation, could be expanded
3. **Caching**: Room for React Query or SWR integration
4. **API Documentation**: Could add OpenAPI specs
5. **Logging**: Structured logging not yet implemented

---

## File Statistics by Directory

| Directory | Files | Description |
|-----------|-------|-------------|
| `apps/web/components/ui/` | 34 | Shadcn UI components |
| `apps/web/components/dashboard/` | 9 | Dashboard components |
| `apps/web/components/quotes/` | 21 | Quote-related components |
| `apps/web/components/clients/` | 3 | Client components |
| `apps/web/components/invoices/` | 2 | Invoice components |
| `apps/web/components/rate-cards/` | 4 | Rate card components |
| `apps/web/components/contracts/` | 7 | Contract components |
| `apps/web/components/settings/` | 8 | Settings components |
| `apps/web/components/client-portal/` | 10 | Portal components |
| `apps/web/components/landing/` | 11 | Landing page components |
| `apps/web/components/onboarding/` | 5 | Onboarding components |
| `apps/web/components/email/` | 3 | Email components |
| `apps/web/components/shared/` | 7 | Shared components |
| `apps/web/lib/*/actions.ts` | 7 | Server action files |
| `apps/web/lib/validations/` | 8 | Zod schemas |
| `apps/web/app/api/` | 15 | API route handlers |
| `packages/database/` | 1 | Prisma schema |
| `packages/types/` | 3 | Type definitions |
| `packages/utils/` | 5 | Utility functions |

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
3. Update code index when adding new capabilities

---

## Summary

Oreko is a mature, well-structured codebase with:

- **Complete MVP features**: All P0 features are implemented
- **Extensible architecture**: Clear patterns for adding new features
- **Production-ready components**: 80+ domain components, 34 UI components
- **Comprehensive business logic**: 90+ server actions covering all workflows
- **Solid data model**: 18+ database models with proper relationships

The codebase demonstrates professional-grade engineering with consistent patterns, type safety, and clear separation of concerns.

---

*Report generated by Code Capability Indexer*
*Last updated: 2026-02-13*
