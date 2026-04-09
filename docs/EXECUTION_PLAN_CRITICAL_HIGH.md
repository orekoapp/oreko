# Oreko Execution Plan: Critical & High Priority Items

> From `docs/ARCHITECTURE_ANALYSIS.md` — 7 work streams, ordered by dependency chain.
> **Status: PLAN ONLY — not yet executed.**

---

## Dependency Graph

```
Stream 1: Financial Record Immutability  ← no dependencies
Stream 2: Remove Redis Dependency        ← no dependencies (already done — verify only)
Stream 3: Simplify Production Deployment ← depends on Stream 2
Stream 4: Minor Units Migration          ← should complete before Stream 5
Stream 5: Multi-Currency Per Document    ← depends on Stream 4
Stream 6: Plugin/Extensibility Foundation← no dependencies (can parallel with 4-5)
Stream 7: Internationalization Foundation← no dependencies (can parallel with 4-6)
```

**Recommended execution order:** 1 → 2 → 6 → 4 → 3 → 5 → 7

Rationale: Stream 1 (immutability) is the highest legal risk and has no dependencies. Stream 2 is already done (just needs verification/cleanup). Stream 6 (extensibility) is infrastructure that benefits from being in place before other streams add complexity. Stream 4 (minor units) must precede Stream 5 (multi-currency). Stream 7 (i18n) is independent and can slot in anywhere.

---

## Stream 1: Financial Record Immutability

**Priority:** CRITICAL
**Estimated scope:** ~15 files, ~400 lines changed
**Risk:** HIGH — touches core financial data model

### Current State

- Invoices have `deletedAt DateTime?` for soft-delete
- Delete action in `lib/invoices/actions.ts` already restricts deletion to `draft` only
- Status flow exists: `draft → sent → viewed → partial → paid → overdue → voided`
- `voided` is terminal (correct)
- Editing restricted to `draft` only (correct)
- Credit note model EXISTS in schema (`CreditNote`, `CreditNoteLineItem`, `CreditNoteEvent`)
- Credit note UI exists (`credit-note-dialog.tsx`, `credit-notes-list.tsx`)
- Credit note actions exist (`lib/credit-notes/actions.ts`)
- Invoice number generation uses `NumberSequence` table with atomic `upsert + increment` (gap-free)
- Quote-to-invoice conversion works in transaction, copies all financial fields

### What's Already Correct

- Status flow with `voided` as terminal state
- Editing locked to `draft` status
- Credit note model, actions, and UI all exist
- Sequential gap-free invoice numbering via `NumberSequence`
- Audit event logging on state transitions (`InvoiceEvent`, `QuoteEvent`)

### Remaining Gaps

| Gap | Severity | Files |
|---|---|---|
| `deletedAt` still exists on Invoice model | High | `schema.prisma`, `actions.ts`, API routes |
| Credit notes don't adjust `amountDue`/`amountPaid` | High | `lib/credit-notes/actions.ts` |
| Line items are mutable after invoice is issued | Medium | `lib/invoices/actions.ts` |
| No amendment chain (original → amended invoice link) | Low | `schema.prisma` |

### Tasks

#### 1.1 Remove `deletedAt` from Invoice model

**Files:**
- `packages/database/prisma/schema.prisma` — Remove `deletedAt DateTime?` from Invoice model
- `apps/web/lib/invoices/actions.ts` — Remove `deleteInvoice` action entirely; remove all `deletedAt: null` filters
- `apps/web/lib/invoices/internal.ts` — Remove any `deletedAt` filters
- `apps/web/app/api/invoices/route.ts` — Remove `deletedAt: null` from query
- `apps/web/lib/dashboard/actions.ts` — Remove `deletedAt: null` from invoice aggregation queries

**Migration approach:**
1. Remove the column from schema
2. Run `prisma db push` — this drops the column (safe: no production invoices should be soft-deleted if the business rule is "draft only")
3. Replace all `deletedAt: null` filters with no filter (or status-based filtering)
4. The `deleteInvoice` function becomes `voidInvoice` — transition to `voided` status instead

**Edge case:** Any existing soft-deleted invoices in production need to be either hard-deleted (if draft) or restored with `voided` status (if sent/paid). Write a one-time migration script.

#### 1.2 Make credit notes affect invoice financials

**Files:**
- `apps/web/lib/credit-notes/actions.ts` — Add `applyCreditNote` action
- `apps/web/lib/credit-notes/internal.ts` — Business logic for recalculating invoice amounts

**Logic:**
```
When a credit note is issued (status: draft → issued):
  1. Validate: creditNote.amount <= invoice.amountDue
  2. Update invoice: amountDue -= creditNote.amount
  3. If amountDue === 0: transition invoice to "paid" (or add a "credited" status)
  4. Log InvoiceEvent: "credit_note_applied" with creditNoteId in metadata
  5. Log CreditNoteEvent: "issued" with invoiceId in metadata
```

#### 1.3 Lock line items after invoice is issued

**Files:**
- `apps/web/lib/invoices/actions.ts` — `updateInvoice` function

**Current state:** Editing is already restricted to `draft` status (line 362). Verify this covers line items too, not just header fields.

**Action:** Audit the `updateInvoice` function to confirm that line item modifications are blocked when `status !== 'draft'`. If any code path allows line item changes post-issuance, add a guard.

#### 1.4 Data migration script

**Files:**
- `packages/database/prisma/migrations/` — New migration file
- `scripts/migrate-invoice-immutability.ts` — One-time script

**Logic:**
```sql
-- Restore any soft-deleted invoices as voided
UPDATE "Invoice" SET status = 'voided', "voidedAt" = "deletedAt"
  WHERE "deletedAt" IS NOT NULL AND status != 'draft';

-- Hard-delete soft-deleted drafts (they were never issued)
DELETE FROM "Invoice" WHERE "deletedAt" IS NOT NULL AND status = 'draft';

-- Then drop the column via prisma schema change
```

### Verification

- [ ] No `deletedAt` references remain in codebase (grep)
- [ ] `deleteInvoice` action removed or replaced with `voidInvoice`
- [ ] Credit note issuance reduces `amountDue` on parent invoice
- [ ] Line items immutable after status leaves `draft`
- [ ] All invoice queries work without `deletedAt` filter
- [ ] Dashboard totals unchanged (they already filter on status, not deletedAt)

---

## Stream 2: Remove Redis Dependency

**Priority:** HIGH
**Estimated scope:** Verification only — ~0 code changes
**Risk:** LOW

### Current State

Redis is **already not used** in the codebase:
- No Redis client library installed (`ioredis`, `@upstash/redis`, etc.)
- No `REDIS_URL` in any source file
- Sessions use JWT strategy (stored in cookies, no server-side store)
- Rate limiting uses in-memory `Map` in `lib/rate-limit.ts`
- OTP storage uses in-memory `Map` in `lib/signing/otp.ts`
- No BullMQ or job queue system exists
- Docker compose files already don't include Redis

### Tasks

#### 2.1 Verify and clean up references

**Files to check:**
- `CLAUDE.md` — Still lists "Redis + BullMQ" in tech stack table. Update to reflect reality.
- `.env.example` — Check for any `REDIS_URL` reference. Remove if present.
- `docker-compose.yml` — Confirm no redis service
- `docker-compose.prod.yml` — Confirm no redis service
- `docs/ARCHITECTURE_ANALYSIS.md` — Already documents this finding

**Action:** Update documentation to state Redis is optional/planned, not required. Remove any dead references.

#### 2.2 Document in-memory limitations

**Files:**
- `apps/web/lib/rate-limit.ts` — Already has comment about limitation
- `apps/web/lib/signing/otp.ts` — Already has comment about limitation

**Action:** No code changes needed. The in-memory approach is correct for single-instance deployment. Add a note to the deployment docs about Redis being recommended for multi-instance deployments.

### Verification

- [ ] No `REDIS_URL` in `.env.example`
- [ ] No redis service in any docker-compose file
- [ ] `CLAUDE.md` tech stack reflects actual dependencies
- [ ] Rate limiter and OTP store have documented limitations

---

## Stream 3: Simplify Production Deployment

**Priority:** HIGH
**Estimated scope:** ~5 files, ~200 lines changed
**Risk:** LOW

### Current State

Three docker-compose configs already exist:
- `docker-compose.yml` — dev (postgres + mailpit)
- `docker-compose.simple.yml` — minimal production (web + postgres, no reverse proxy)
- `docker-compose.prod.yml` — full production (web + postgres + Traefik with auto-SSL)

A setup script exists at `scripts/setup.sh` that generates `.env` interactively.

### Remaining Gaps

| Gap | Files |
|---|---|
| No `docker-compose.simple.yml` with Caddy option | New file or modify existing |
| No automated database backup in simple mode | `docker-compose.simple.yml` |
| No documented upgrade path | `docs/` |
| No pre-built Docker image on GHCR/Docker Hub | `.github/workflows/` |

### Tasks

#### 3.1 Add Caddy reverse proxy option

**Files:**
- `docker-compose.caddy.yml` — New override file for Caddy-based SSL
- `Caddyfile` — Simple reverse proxy config

**Content:**
```yaml
# docker-compose.caddy.yml — use with: docker compose -f docker-compose.simple.yml -f docker-compose.caddy.yml up
services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - web

volumes:
  caddy_data:
```

```
# Caddyfile
{$DOMAIN} {
    reverse_proxy web:3000
}
```

This is dramatically simpler than the Traefik labels-based config while providing identical auto-SSL via Let's Encrypt.

#### 3.2 Add database backup container to production compose

**Files:**
- `docker-compose.prod.yml` — Add backup service

**Content:**
```yaml
  backup:
    image: prodrigestivill/postgres-backup-local:16
    environment:
      POSTGRES_HOST: postgres
      POSTGRES_DB: oreko
      POSTGRES_USER: oreko
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      SCHEDULE: "@daily"
      BACKUP_KEEP_DAYS: 7
      BACKUP_KEEP_WEEKS: 4
    volumes:
      - ./backups:/backups
    depends_on:
      - postgres
```

#### 3.3 Document upgrade path

**Files:**
- `docs/UPGRADE_GUIDE.md` — New file

**Content outline:**
1. Backup database before upgrading (`pg_dump`)
2. Pull latest image or `git pull` + rebuild
3. Run `npx prisma migrate deploy` (or `db push` for schema sync)
4. Restart containers
5. Verify health endpoint
6. Rollback instructions

#### 3.4 Add GitHub Actions workflow for Docker image publishing

**Files:**
- `.github/workflows/docker-publish.yml` — New workflow

**Trigger:** On release tag (`v*`)
**Action:** Build multi-arch image (amd64 + arm64), push to `ghcr.io/oreko/oreko:latest` and `:v1.x.x`

### Verification

- [ ] `docker compose -f docker-compose.simple.yml up` starts with 2 services
- [ ] Caddy overlay provides HTTPS automatically
- [ ] Backup container creates daily `pg_dump` files
- [ ] Upgrade guide covers backup → update → migrate → verify flow
- [ ] Docker image builds and pushes on release

---

## Stream 4: Store Monetary Values as Minor Units (Cents)

**Priority:** HIGH
**Estimated scope:** ~30 files, ~600 lines changed
**Risk:** HIGH — touches every financial calculation and display

### Current State

- All `Decimal(12,2)` fields store **dollars** (major units): `rate: 150.00` = $150
- JavaScript floating-point arithmetic with `Math.round(x * 100) / 100` rounding
- `formatCurrency()` in `lib/utils.ts` does NOT divide by 100
- 14+ local `formatCurrency` re-implementations scattered across components
- Stripe integration already converts: `amount * 100` for payment intents, `/ 100` for webhooks
- Dashboard aggregations use `_sum` directly on dollar values

### Migration Strategy

**Phase 4A: Schema + storage migration (database layer)**
**Phase 4B: Application layer update (formatting, calculations)**
**Phase 4C: Consolidate formatCurrency implementations**

### Tasks

#### 4.1 Update schema to use integer cents

**Files:**
- `packages/database/prisma/schema.prisma`

**Changes:** Convert all monetary `Decimal(12,2)` fields to `Int` (cents). Exception: `taxRate` and `discountValue` (when percentage) stay as `Decimal(5,2)` since they represent percentages, not money.

Fields to convert (25 fields across 10 models):

| Model | Fields → Int (cents) |
|---|---|
| `RateCard` | `rate` |
| `Quote` | `subtotal`, `discountAmount`, `taxTotal`, `total` |
| `Quote` | `discountValue` — only when `discountType = 'fixed'` (see note) |
| `QuoteLineItem` | `rate`, `amount`, `taxAmount` |
| `Invoice` | `subtotal`, `discountAmount`, `taxTotal`, `total`, `amountPaid`, `amountDue` |
| `Invoice` | `discountValue` — only when `discountType = 'fixed'` |
| `InvoiceLineItem` | `rate`, `amount`, `taxAmount` |
| `Payment` | `amount`, `refundAmount` |
| `PaymentSchedule` | `amount` |
| `CreditNote` | `amount` |
| `CreditNoteLineItem` | `rate`, `amount` |

**Note on `discountValue`:** This field is dual-purpose — it stores either a fixed dollar amount or a percentage. Two approaches:
- **Option A (recommended):** Keep as `Decimal(12,2)` but interpret based on `discountType`. When `discountType = 'fixed'`, the value is in cents (integer). When `discountType = 'percentage'`, the value is a percentage (decimal).
- **Option B:** Split into `discountFixed Int?` and `discountPercent Decimal(5,2)?`

Recommend **Option A** for minimal schema disruption.

**Note on `quantity`:** Keep as `Decimal(10,2)` — quantity is not money (e.g., 2.5 hours).

#### 4.2 Write data migration script

**Files:**
- `scripts/migrate-to-cents.ts` — Prisma-based migration script

**Logic:**
```sql
-- For each monetary field, multiply by 100 and cast to integer
UPDATE "RateCard" SET rate = rate * 100;
UPDATE "Quote" SET subtotal = subtotal * 100, "discountAmount" = "discountAmount" * 100,
  "taxTotal" = "taxTotal" * 100, total = total * 100;
-- ... same for all other models
-- discountValue: only multiply when discountType = 'fixed'
UPDATE "Quote" SET "discountValue" = "discountValue" * 100 WHERE "discountType" = 'fixed';
UPDATE "Invoice" SET "discountValue" = "discountValue" * 100 WHERE "discountType" = 'fixed';
```

**Safety:**
- Run inside a transaction
- Verify row counts before and after
- Log before/after values for spot-check
- Must run BEFORE schema type change (multiply while still Decimal, then alter column type)

#### 4.3 Update global `formatCurrency` to accept cents

**Files:**
- `apps/web/lib/utils.ts`

**Change:**
```typescript
// Before
export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

// After
export function formatCurrency(cents: number, currency = 'USD', locale = 'en-US'): string {
  const major = cents / 100;
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(major);
}
```

#### 4.4 Consolidate all local `formatCurrency` implementations

**Files with local re-implementations (all must be replaced with import from `lib/utils`):**

| File | Current local function |
|---|---|
| `components/invoices/credit-note-dialog.tsx:120` | Hardcodes USD |
| `components/client-portal/invoice-portal-view.tsx:16` | Default USD |
| `components/client-portal/payment-form.tsx:27` | Default USD |
| `components/invoices/record-payment-dialog.tsx:42` | Default USD |
| `app/(dashboard)/invoices/[id]/page.tsx:49` | Default USD |
| `lib/pdf/templates.ts:32` | Default USD |
| `components/analytics/analytics-dashboard.tsx:83` | Hardcodes USD |
| `components/analytics/financial-health-section.tsx:19` | Inline USD |
| `components/analytics/sales-pipeline-section.tsx:29` | Inline USD |
| `components/analytics/revenue-comparison-chart.tsx:23` | Inline USD |
| `components/analytics/revenue-forecast-chart.tsx:25` | Inline USD |
| `components/analytics/client-lifetime-value.tsx:25` | Inline USD |
| `components/analytics/top-clients-chart.tsx:30` | Inline USD |

**Action:** Delete every local `formatCurrency` and replace with `import { formatCurrency } from '@/lib/utils'`. Pass the document's `currency` field instead of hardcoding USD.

#### 4.5 Update all calculation logic

**Files:**
- `apps/web/lib/invoices/actions.ts` — Line item calculations
- `apps/web/lib/quotes/actions.ts` — Line item calculations
- `apps/web/lib/payments/internal.ts` — Stripe amount conversion (currently `* 100`, becomes identity)
- `apps/web/lib/payments/actions.ts` — Payment recording
- `apps/web/lib/credit-notes/actions.ts` — Credit note amounts
- `apps/web/lib/dashboard/actions.ts` — Aggregation queries

**Key changes:**
- All arithmetic operates on integers: `amount = quantity * rateCents` (round once)
- Remove `Math.round(x * 100) / 100` patterns — integer math doesn't need rounding
- Stripe integration simplifies: stored cents = Stripe cents (no conversion needed)
- Stripe webhook: refund amount from Stripe is already in cents (remove `/ 100`)

#### 4.6 Update dashboard chart utilities

**Files:**
- `apps/web/lib/dashboard/chart-utils.ts`

**Changes:**
- `formatChartCurrency(value, currency)` — divide by 100 before formatting
- `formatFullCurrency(value, currency)` — divide by 100 before formatting
- All `toNumber()` conversions from Prisma aggregates now return cents

#### 4.7 Update seed data

**Files:**
- `packages/database/prisma/seed.ts` (or wherever seed data lives)

**Changes:** All seeded monetary values must be in cents. `rate: 15000` = $150.00, `total: 450000` = $4,500.00.

### Verification

- [ ] All monetary DB values are integers in cents
- [ ] `formatCurrency(15000)` displays "$150.00"
- [ ] Stripe payment intent amount matches DB amount (no conversion needed)
- [ ] Dashboard totals display correctly
- [ ] PDF amounts display correctly
- [ ] No `Math.round(x * 100) / 100` patterns remain
- [ ] No local `formatCurrency` implementations remain
- [ ] Quote-to-invoice conversion preserves correct amounts
- [ ] Existing production data migrated correctly (spot-check)

---

## Stream 5: Multi-Currency Per Document

**Priority:** CRITICAL
**Estimated scope:** ~20 files, ~300 lines changed
**Risk:** MEDIUM — schema already supports per-document currency

### Current State

- `Quote.currency`, `Invoice.currency`, `Payment.currency`, `CreditNote.currency` all exist in schema
- `BusinessProfile.currency` serves as workspace default
- `createQuote` and `createInvoice` already fall back: `data.currency || profile.currency || 'USD'`
- Quote-to-invoice conversion copies `quote.currency` to invoice
- Stripe payment intent correctly uses `invoice.currency`
- **All 7 analytics components hardcode USD**
- Quote builder store initializes with `currency: 'USD'` instead of workspace default
- PDF generation falls back to settings JSON, not top-level `currency` field
- `formatCurrency` in `lib/utils.ts` is properly parameterized (accepts currency arg)

### What's Already Working

The schema and core creation logic are correct. The gaps are in:
1. UI components not passing `currency` to `formatCurrency`
2. Analytics dashboard hardcoded to USD
3. Quote builder not loading workspace currency

### Tasks

#### 5.1 Fix analytics components to use workspace currency

**Files (7 components):**
- `components/analytics/analytics-dashboard.tsx`
- `components/analytics/financial-health-section.tsx`
- `components/analytics/sales-pipeline-section.tsx`
- `components/analytics/revenue-comparison-chart.tsx`
- `components/analytics/revenue-forecast-chart.tsx`
- `components/analytics/client-lifetime-value.tsx`
- `components/analytics/top-clients-chart.tsx`

**Change:** Each component should receive `currency` as a prop (from the workspace's `BusinessProfile.currency`). The parent page (`analytics/page.tsx` or `analytics-dashboard.tsx`) should fetch the workspace currency and pass it down.

#### 5.2 Fix quote builder to use workspace currency

**Files:**
- `apps/web/lib/stores/quote-builder-store.ts` — Default `currency` from workspace profile instead of hardcoded `'USD'`
- `apps/web/components/quotes/editor/QuoteEditor.tsx` — Pass workspace currency when initializing new quote

#### 5.3 Fix PDF generation currency sourcing

**Files:**
- `apps/web/lib/pdf/actions.ts` — Use `quote.currency` or `invoice.currency` (top-level field) instead of `settings?.currency`

#### 5.4 Add currency selector to quote and invoice forms

**Files:**
- Quote builder UI — Add currency dropdown (ISO 4217 codes)
- Invoice creation form — Add currency dropdown

**Behavior:** Default to workspace currency, allow override per document. Once a quote converts to invoice, currency is locked.

#### 5.5 Dashboard aggregation with mixed currencies

**Files:**
- `apps/web/lib/dashboard/actions.ts`

**Current approach:** Simple SUM aggregation assumes single currency. With mixed currencies, options:

**Recommended approach (from ARCHITECTURE_ANALYSIS.md):** Face-value totals grouped by currency. Display: "$12,500 USD | €3,200 EUR" rather than converting everything to a base currency. This avoids the need for exchange rate data and is more accurate for a small business tool.

**Implementation:**
```typescript
// Group by currency in aggregation
const totals = await prisma.invoice.groupBy({
  by: ['currency'],
  where: { workspaceId, status: { in: ['paid', 'partial'] } },
  _sum: { amountPaid: true },
});
// Returns: [{ currency: 'USD', _sum: { amountPaid: 1250000 } }, { currency: 'EUR', _sum: { amountPaid: 320000 } }]
```

#### 5.6 Ensure all formatCurrency callsites pass the document currency

**Systematic sweep:** After Stream 4 consolidates all `formatCurrency` to the single global function, ensure every callsite passes the entity's `currency` field rather than relying on the `'USD'` default.

### Verification

- [ ] Creating a quote in EUR stores `currency: 'EUR'`
- [ ] Converting EUR quote to invoice preserves EUR
- [ ] Invoice PDF shows correct currency symbol
- [ ] Dashboard displays grouped totals when mixed currencies exist
- [ ] Analytics charts use workspace currency
- [ ] Stripe checkout uses document currency
- [ ] New quote defaults to workspace currency, not USD

---

## Stream 6: Plugin/Extensibility Foundation

**Priority:** CRITICAL
**Estimated scope:** ~15 files, ~500 lines changed
**Risk:** MEDIUM — infrastructure change, existing dead code can be activated

### Current State

**Provider interfaces EXIST but are not used:**
- `lib/providers/payment.ts` — `PaymentProvider` interface defined
- `lib/providers/pdf.ts` — `PdfProvider` interface defined
- `lib/providers/stripe-provider.ts` — Implements `PaymentProvider`
- `lib/providers/puppeteer-pdf-provider.ts` — Implements `PdfProvider`
- `lib/providers/index.ts` — Exports `getPaymentProvider()`, `getPdfProvider()` factories
- **No application code calls these factories** — all code imports directly from `lib/services/`

**Event system EXISTS but is not wired:**
- `lib/events/types.ts` — 12 domain events defined
- `lib/events/emitter.ts` — `DomainEventEmitter` class with singleton `domainEvents`
- **No business logic emits events** — `actions.ts` files don't call `domainEvents.emit()`

**Outbound webhooks EXIST and are wired to event bus:**
- `lib/webhooks/outbound.ts` — `initOutboundWebhooks()` registers listeners on `domainEvents`
- `lib/webhooks/actions.ts` — CRUD for webhook endpoints
- UI at `settings/webhooks/` — Webhook management page
- But since no events are emitted, webhooks never fire

### Tasks

#### 6.1 Wire event emissions into business logic

**Files:**
- `apps/web/lib/quotes/actions.ts` — Emit: `quote.created`, `quote.sent`, `quote.accepted`, `quote.declined`
- `apps/web/lib/invoices/actions.ts` — Emit: `invoice.created`, `invoice.sent`, `invoice.paid`, `invoice.voided`
- `apps/web/lib/payments/internal.ts` — Emit: `payment.received`, `payment.refunded`
- `apps/web/lib/clients/actions.ts` — Emit: `client.created`
- `apps/web/lib/credit-notes/actions.ts` — Emit: `credit_note.issued`

**Pattern:**
```typescript
import { domainEvents } from '@/lib/events/emitter';

// At end of createQuote, after DB write:
domainEvents.emit('quote.created', {
  quoteId: quote.id,
  workspaceId,
  actorId: session.user.id,
  timestamp: new Date(),
});
```

**Important:** Emit AFTER the database transaction succeeds. Events are fire-and-forget (handler errors don't propagate, per current emitter design).

#### 6.2 Initialize outbound webhooks on app startup

**Files:**
- `apps/web/lib/events/init.ts` — New file, calls `initOutboundWebhooks()` once
- `apps/web/app/layout.tsx` or `apps/web/instrumentation.ts` — Import to trigger initialization

**Approach:** Use Next.js `instrumentation.ts` (stable in Next 15) to run one-time initialization:
```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initOutboundWebhooks } = await import('@/lib/webhooks/outbound');
    initOutboundWebhooks();
  }
}
```

#### 6.3 Switch application code to use provider factories

**Files (high-traffic callsites):**
- `apps/web/lib/payments/internal.ts` — Replace `import { stripe } from '@/lib/services/stripe'` with `getPaymentProvider()`
- `apps/web/lib/payments/actions.ts` — Same
- `apps/web/app/api/webhooks/stripe/route.ts` — Keep direct Stripe import (webhook verification is Stripe-specific)
- `apps/web/app/api/download/*/route.ts` — Replace PDF imports with `getPdfProvider()`

**Note:** Not all callsites need to switch immediately. The webhook route, for example, is inherently Stripe-specific. Focus on the business logic layer (`lib/payments/`, `lib/invoices/`, `lib/quotes/`) where provider abstraction enables future gateway swaps.

#### 6.4 Add EmailProvider interface

**Files:**
- `apps/web/lib/providers/email.ts` — New: `EmailProvider` interface
- `apps/web/lib/providers/resend-provider.ts` — New: Implements `EmailProvider` wrapping `lib/services/email`
- `apps/web/lib/providers/index.ts` — Add `getEmailProvider()` factory

**Interface:**
```typescript
export interface EmailProvider {
  sendEmail(params: { to: string; subject: string; html: string; from?: string }): Promise<void>;
}
```

#### 6.5 Add StorageProvider to factory

**Files:**
- `apps/web/lib/providers/storage.ts` — New: `StorageProvider` interface (or formalize existing)
- `apps/web/lib/providers/index.ts` — Add `getStorageProvider()` factory

The storage module already has a partial provider pattern internally. Formalize it into the `lib/providers/` pattern.

### Verification

- [ ] Creating a quote emits `quote.created` event
- [ ] Outbound webhooks fire when events are emitted (test with webhook.site)
- [ ] Payment flow works through `getPaymentProvider()` abstraction
- [ ] PDF generation works through `getPdfProvider()` abstraction
- [ ] Webhook management UI at `/settings/webhooks` shows delivery logs
- [ ] All 12 domain events are emitted at appropriate points

---

## Stream 7: Internationalization Foundation

**Priority:** HIGH
**Estimated scope:** ~40 files, ~800 lines changed
**Risk:** LOW — additive change, no data model impact

### Current State

**Infrastructure exists (partially):**
- `next-intl` v4.8.3 installed and configured
- 7 locales declared: `en`, `es`, `fr`, `de`, `pt`, `ja`, `zh`
- `messages/en.json` exists with 8 namespaces
- `app/layout.tsx` wraps with `NextIntlClientProvider`
- `i18n/request.ts` resolves locale from cookie → Accept-Language → `'en'`

**What's not done:**
- Only dashboard page uses `getTranslations()` — rest of app has hardcoded English
- No translation files for non-English locales (`es.json`, `fr.json`, etc. don't exist)
- 4 different date formatting patterns used inconsistently
- All `'en-US'` hardcoded in `toLocaleDateString` calls
- No RTL support
- Missing i18n namespaces: contracts, templates, analytics, projects, rate-cards, onboarding, payments, billing, help

### Tasks

#### 7.1 Complete `en.json` with all namespaces

**Files:**
- `apps/web/messages/en.json`

**Action:** Add missing namespaces: `analytics`, `contracts`, `payments`, `billing`, `rateCards`, `projects`, `templates`, `onboarding`, `help`, `portal` (client-facing portal strings), `pdf` (PDF template strings), `email` (email template strings).

Extract strings systematically from each page/component.

#### 7.2 Migrate core pages to use translations

**Priority order** (by user-facing importance):

1. **Client portal pages** (public-facing, most likely to need non-English):
   - `components/client-portal/quote-portal-view.tsx`
   - `components/client-portal/invoice-portal-view.tsx`
   - `components/client-portal/payment-form.tsx`

2. **Auth pages:**
   - `app/(auth)/login/login-form.tsx`
   - `app/(auth)/register/register-form.tsx`
   - `app/(auth)/reset-password/reset-password-form.tsx`

3. **Dashboard:**
   - Already partially done — complete remaining strings

4. **Quotes section:**
   - `app/(dashboard)/quotes/` pages
   - `components/quotes/` components

5. **Invoices section:**
   - `app/(dashboard)/invoices/` pages
   - `components/invoices/` components

6. **Settings, clients, analytics** — lower priority

**Pattern for server components:**
```typescript
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('invoices');
// Use: t('status.paid'), t('actions.send'), etc.
```

**Pattern for client components:**
```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('invoices');
```

#### 7.3 Standardize date formatting

**Files:**
- `apps/web/lib/utils.ts` — Add `formatDate(date: Date, locale?: string)` utility

**Action:** Create one `formatDate` function that uses `Intl.DateTimeFormat` with the user's locale. Replace all 4 competing patterns:
- `toLocaleDateString()` without locale
- `toLocaleDateString('en-US', ...)`
- `formatDate()` from lib/utils (update existing)
- `format()` from date-fns

Consolidate to a single function that accepts a locale parameter (from next-intl's locale context).

#### 7.4 Add locale selector to settings

**Files:**
- `apps/web/app/(dashboard)/settings/page.tsx` — Add locale preference
- `apps/web/lib/settings/actions.ts` — Save locale preference to user profile or cookie

**Behavior:** Dropdown with supported locales. Saves to a cookie (`locale`) that `i18n/request.ts` already reads.

#### 7.5 Create placeholder translation files

**Files:**
- `apps/web/messages/es.json`
- `apps/web/messages/fr.json`
- `apps/web/messages/de.json`
- `apps/web/messages/pt.json`
- `apps/web/messages/ja.json`
- `apps/web/messages/zh.json`

**Action:** Copy `en.json` structure with English values as placeholders. Mark with `"_translator_note": "Machine translation needed"`. This unblocks community contributors from adding translations without needing to understand the app's key structure.

### Verification

- [ ] Setting locale to `es` shows Spanish UI (once translations added)
- [ ] Client portal pages use translation keys (no hardcoded English)
- [ ] All dates formatted consistently using locale-aware function
- [ ] Locale preference persists across sessions (cookie-based)
- [ ] `en.json` covers all user-visible strings
- [ ] Placeholder files exist for all 7 locales

---

## Implementation Schedule (Suggested)

| Week | Stream | Parallelizable? |
|---|---|---|
| Week 1 | Stream 1: Financial Immutability | Solo |
| Week 1 | Stream 2: Redis Cleanup (verification) | Parallel with Stream 1 |
| Week 2 | Stream 6: Extensibility Foundation | Solo |
| Week 3 | Stream 4: Minor Units Migration | Solo (high risk, needs focus) |
| Week 3 | Stream 3: Deployment Simplification | Parallel with Stream 4 |
| Week 4 | Stream 5: Multi-Currency | Depends on Stream 4 |
| Week 4-5 | Stream 7: Internationalization | Parallel with Stream 5 |

**Total estimated effort:** 4-5 weeks for one developer.

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Minor units migration breaks production data | Run migration script on staging first. Backup before production run. Verify totals match pre/post. |
| Removing `deletedAt` loses invoice data | Migration script handles: soft-deleted non-drafts → voided, soft-deleted drafts → hard-deleted |
| Event emissions slow down request handling | Events are fire-and-forget (async handlers). If webhook delivery is slow, it doesn't block the response. |
| Multi-currency breaks dashboard totals | Group-by-currency approach avoids exchange rate complexity. Display multiple totals. |
| i18n migration is incomplete at launch | English remains the default. Untranslated strings fall back to English via next-intl's fallback mechanism. |
