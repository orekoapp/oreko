# QuoteCraft - Server Actions Contract

**Generated:** 2026-02-24
**Source:** `apps/web/lib/*/actions.ts` (16 modules)
**Runtime:** Next.js 15 Server Actions (`'use server'`)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Patterns](#authentication-patterns)
3. [Quotes Module](#1-quotes-module)
4. [Invoices Module](#2-invoices-module)
5. [Clients Module](#3-clients-module)
6. [Dashboard Module](#4-dashboard-module)
7. [Contracts Module](#5-contracts-module)
8. [Rate Cards Module](#6-rate-cards-module)
9. [Settings Module](#7-settings-module)
10. [Projects Module](#8-projects-module)
11. [Payments Module](#9-payments-module)
12. [Email Module](#10-email-module)
13. [Notifications Module](#11-notifications-module)
14. [Search Module](#12-search-module)
15. [Auth Module](#13-auth-module)
16. [Onboarding Module](#14-onboarding-module)
17. [PDF Module](#15-pdf-module)
18. [Workspace Module](#16-workspace-module)
19. [Cross-Cutting Concerns](#cross-cutting-concerns)

---

## Overview

QuoteCraft uses Next.js Server Actions as the primary API layer. All 16 modules follow consistent patterns for authentication, workspace isolation, soft deletes, and cache invalidation.

### Key Conventions

| Convention | Detail |
|---|---|
| **Auth helper** | `getCurrentUserWorkspace()` returns `{ workspaceId, userId }` |
| **Workspace isolation** | Every query includes `workspaceId` in its `WHERE` clause |
| **Soft deletes** | `deletedAt: null` filter on all reads; `deletedAt: new Date()` on deletes |
| **Cache invalidation** | `revalidatePath()` called after every mutation |
| **Monetary values** | Stored as dollars (Decimal), NOT cents. Stripe conversions multiply by 100 |
| **Number generation** | Atomic `$transaction` + `upsert` with `{ increment: 1 }` to prevent race conditions |
| **Email delivery** | Non-blocking via `.catch()` -- failures do not roll back the parent operation |
| **Audit events** | `QuoteEvent` / `InvoiceEvent` tables log lifecycle changes |

---

## Authentication Patterns

### Pattern A: Workspace-Scoped (majority of actions)

```typescript
const { workspaceId, userId } = await getCurrentUserWorkspace();
```

- Reads the NextAuth session
- Resolves the active workspace from the `active-workspace-id` cookie
- Validates the user is a member of that workspace
- Throws `'Unauthorized'` if session is missing
- Throws `'No workspace found'` if no membership exists

### Pattern B: Direct Auth (auth module only)

```typescript
const session = await auth();
if (!session?.user?.id) { return { success: false, error: 'Unauthorized' }; }
```

Used by `changePassword` and `updateProfile` which operate on the User model directly, not workspace-scoped data.

### Pattern C: Public Access (no auth)

Used by `getContractInstanceByToken`, `signContract`, `getQuotePdfDataByToken`, `getInvoicePdfDataByToken`. These accept an `accessToken` parameter and perform lookups by UUID token without any session requirement.

### Pattern D: Internal (no auth check)

`createNotification` and `notifyWorkspaceMembers` are called internally by other server actions. They accept `userId` and `workspaceId` as parameters directly.

---

## 1. Quotes Module

**File:** `apps/web/lib/quotes/actions.ts` (659 lines)
**Auth:** Pattern A (`getCurrentUserWorkspace`)

### Internal Helpers (not exported)

#### `getActiveWorkspace()`
- Returns `{ userId, workspace }` where workspace is the full Prisma workspace record
- Used by all exported functions in this module

#### `generateQuoteNumber(workspaceId: string): Promise<string>`
- Atomic number generation via `$transaction` + `numberSequence.upsert`
- Format: `{prefix}-{paddedValue}[-{suffix}]` (e.g., `QT-0001`)
- Race-condition safe through transactional upsert with `{ increment: 1 }`

---

### `createQuote(data)`

| Field | Value |
|---|---|
| **Signature** | `createQuote(data: { title: string; clientId: string; projectId?: string \| null; blocks?: QuoteBlock[] })` |
| **Returns** | `{ success: boolean; quote?: Quote; error?: string }` |
| **Auth** | Workspace-scoped |
| **Authorization** | Any workspace member |
| **Validation** | Client must exist in workspace and not be soft-deleted |
| **Transaction** | No explicit transaction; single `prisma.quote.create` with nested `lineItems.create` |
| **Side Effects** | (1) Generates next quote number atomically. (2) Creates `QuoteEvent` with type `created`. (3) `revalidatePath('/quotes')` |
| **Error Conditions** | Client not found -> `{ success: false, error: 'Client not found' }` |
| **Business Logic** | Extracts `service-item` blocks from blocks array, computes `subtotal`, `taxTotal`, `total`. Tax calculated as `quantity * rate * (taxRate / 100)`. Stores blocks in `settings.blocks` JSON AND creates `quoteLineItem` rows |

---

### `updateQuote(quoteId, data)`

| Field | Value |
|---|---|
| **Signature** | `updateQuote(quoteId: string, data: { title?: string; projectId?: string \| null; blocks?: QuoteBlock[]; notes?: string; terms?: string; internalNotes?: string; settings?: Record<string, unknown> })` |
| **Returns** | `{ success: boolean; quote?: Quote }` |
| **Auth** | Workspace-scoped |
| **Transaction** | Yes -- `$transaction`: (1) delete all existing line items, (2) update quote with new line items |
| **Side Effects** | `revalidatePath('/quotes')`, `revalidatePath('/quotes/${quoteId}')` |
| **Error Conditions** | Quote not found -> throws `Error('Quote not found')` |
| **Business Logic** | When blocks are provided: deletes ALL existing line items then recreates from blocks. Recalculates totals. Merges `settings` JSON preserving existing keys |

---

### `getQuote(quoteId)`

| Field | Value |
|---|---|
| **Signature** | `getQuote(quoteId: string): Promise<QuoteDocument \| null>` |
| **Returns** | `QuoteDocument` with blocks, settings, totals, linked invoice, client -- or `null` |
| **Auth** | Workspace-scoped |
| **Business Logic** | If `settings.blocks` is empty but `lineItems` exist, reconstructs blocks from line items (fallback for seeded data). Converts Decimal fields to numbers. Includes linked invoice summary (`id`, `invoiceNumber`, `status`) |

---

### `getQuotes(options?)`

| Field | Value |
|---|---|
| **Signature** | `getQuotes(options?: { status?: string; search?: string; limit?: number; offset?: number })` |
| **Returns** | `{ quotes: QuoteListItem[]; total: number }` |
| **Auth** | Workspace-scoped |
| **Business Logic** | Parallel fetch: `findMany` + `count`. Search across `title`, `quoteNumber`, `client.name` (case-insensitive). Default limit 20. Ordered by `createdAt desc`. Excludes soft-deleted |

---

### `deleteQuote(quoteId)`

| Field | Value |
|---|---|
| **Signature** | `deleteQuote(quoteId: string)` |
| **Returns** | `{ success: boolean; error?: string }` |
| **Auth** | Workspace-scoped |
| **Business Logic** | Soft delete (`deletedAt = new Date()`). **Blocked** if a linked invoice exists (non-deleted): returns `{ success: false, error: 'Cannot delete a quote that has a linked invoice...' }` |

---

### `duplicateQuote(quoteId)`

| Field | Value |
|---|---|
| **Signature** | `duplicateQuote(quoteId: string)` |
| **Returns** | `{ success: boolean; quoteId?: string }` |
| **Auth** | Workspace-scoped |
| **Business Logic** | Generates new quote number. Copies all fields including line items, settings JSON, discount/tax. Title appended with ` (Copy)`. Status reset to `draft`. No events or timestamps copied |

---

### `updateQuoteStatus(quoteId, status)`

| Field | Value |
|---|---|
| **Signature** | `updateQuoteStatus(quoteId: string, status: 'draft' \| 'sent' \| 'viewed' \| 'accepted' \| 'declined' \| 'expired')` |
| **Returns** | `{ success: boolean; error?: string }` |
| **Auth** | Workspace-scoped |
| **State Machine** | `draft -> [sent]`, `sent -> [viewed, accepted, declined, expired]`, `viewed -> [accepted, declined, expired]`, `accepted -> []`, `declined -> [draft]`, `expired -> [draft]` |
| **Side Effects** | Sets timestamp field (`sentAt`, `acceptedAt`, `declinedAt`) when transitioning. Creates `QuoteEvent` with type `status_changed_to_{status}` |
| **Error Conditions** | Quote not found -> `{ success: false }`. Invalid transition -> `{ success: false, error: 'Cannot change status...' }` |

---

### `sendQuote(quoteId)`

| Field | Value |
|---|---|
| **Signature** | `sendQuote(quoteId: string)` |
| **Returns** | `{ success: boolean; recipientEmail?: string; error?: string }` |
| **Auth** | Workspace-scoped |
| **Validation** | Client must have email. Quote total must be > 0 |
| **Side Effects** | (1) Sets `status = 'sent'` and `sentAt`. (2) Creates `QuoteEvent` with `quote_sent`. (3) Sends email via `sendQuoteSentEmail` (non-blocking). (4) Creates notification for sender (non-blocking) |
| **Error Conditions** | Quote not found, no client email, zero total |

---

## 2. Invoices Module

**File:** `apps/web/lib/invoices/actions.ts` (838 lines)
**Auth:** Pattern A (`getCurrentUserWorkspace`)

### Internal Helpers

#### `getActiveWorkspace()` -- same pattern as quotes module
#### `generateInvoiceNumber(workspaceId)` -- atomic upsert, format `INV-0001`
#### `calculateTotals(lineItems)` -- computes subtotal, taxTotal, total with 2-decimal rounding

---

### `createInvoice(data: CreateInvoiceData)`

| Field | Value |
|---|---|
| **Returns** | `{ success: boolean; invoice?: Invoice; error?: string }` |
| **Auth** | Workspace-scoped |
| **Validation** | Client must exist in workspace |
| **Side Effects** | Generates invoice number. Creates `InvoiceEvent` with `created`. `revalidatePath('/invoices')` |
| **Business Logic** | Sets `amountDue = total`, `issueDate = now`, `status = 'draft'` |

---

### `createInvoiceFromQuote(quoteId, options?)`

| Field | Value |
|---|---|
| **Signature** | `createInvoiceFromQuote(quoteId: string, options?: { dueDays?: number })` |
| **Returns** | `{ success: boolean; invoice?: Invoice; error?: string }` |
| **Transaction** | Yes -- `$transaction`: (1) create invoice with copied line items, (2) set quote status to `converted`, (3) create `QuoteEvent` with `converted_to_invoice`, (4) create `InvoiceEvent` with `created` |
| **Business Logic** | Checks no existing invoice for quote. Default `dueDays = 30`. Copies all amounts, discounts, line items, notes, terms. Links via `quoteId` foreign key |
| **Error Conditions** | Quote not found, invoice already exists for quote |

---

### `updateInvoice(invoiceId, data: UpdateInvoiceData)`

| Field | Value |
|---|---|
| **Returns** | `{ success: boolean; invoice?: Invoice; error?: string }` |
| **Transaction** | Yes -- delete existing line items then update with new ones |
| **Business Logic** | **Draft-only restriction**: returns error if status is not `draft`. Recalculates `amountDue = max(0, total - amountPaid)` when line items change |

---

### `getInvoice(invoiceId): Promise<InvoiceDocument | null>`

| Field | Value |
|---|---|
| **Returns** | Full `InvoiceDocument` with line items, client, project, payments, settings |
| **Business Logic** | Includes payment history. Converts Decimal to number. Merges defaults for settings (currency, payment terms, late fees, reminders) |

---

### `getInvoices(filters?): Promise<InvoiceListItem[]>`

| Field | Value |
|---|---|
| **Signature** | `getInvoices(filters?: { status?: InvoiceStatus; clientId?: string; search?: string })` |
| **Business Logic** | **Runtime overdue computation**: if `dueDate < now` and status is not `paid`, `voided`, `draft`, or `partial`, the returned status is set to `overdue`. The `overdue` status is never stored in the database. Search across `invoiceNumber`, `title`, `client.name` |

---

### `updateInvoiceStatus(invoiceId, status)`

| Field | Value |
|---|---|
| **Transaction** | Yes -- batched `$transaction` array: update invoice + create event |
| **Side Effects** | Sets `sentAt` (first send only), `paidAt` + amounts for `paid`, `voidedAt` + zero amountDue for `voided`. Creates `InvoiceEvent` with `status_changed_to_{status}` and previous status metadata |

---

### `sendInvoice(invoiceId)`

| Field | Value |
|---|---|
| **Business Logic** | Calls `updateInvoiceStatus(id, 'sent')` first, then sends email and creates notification (both non-blocking) |

---

### `deleteInvoice(invoiceId)`

| Field | Value |
|---|---|
| **Business Logic** | Soft delete. **Draft-only restriction**: returns `'Can only delete draft invoices. Use void for sent invoices.'` |

---

### `recordPayment(invoiceId, data)`

| Field | Value |
|---|---|
| **Signature** | `recordPayment(invoiceId: string, data: { amount: number; paymentMethod: string; referenceNumber?: string; notes?: string })` |
| **Transaction** | Yes -- batched: (1) create Payment, (2) update invoice amounts/status, (3) create InvoiceEvent |
| **Business Logic** | Auto-determines status: `paid` if `newAmountPaid >= total`, `partial` if `> 0`. Sets `paidAt` when fully paid. Amount must be > 0. Cannot record for voided invoices |

---

### `duplicateInvoice(invoiceId)`

| Field | Value |
|---|---|
| **Business Logic** | New invoice number, `status = 'draft'`, `amountPaid = 0`, `amountDue = total`. Due date set to 30 days from now. Title appended ` (Copy)` |

---

## 3. Clients Module

**File:** `apps/web/lib/clients/actions.ts` (693 lines)
**Auth:** Pattern A (`getCurrentUserWorkspace`)

### `getClients(filter: ClientFilter)`

| Field | Value |
|---|---|
| **Returns** | `PaginatedClients` with `data: ClientListItem[]` and `meta: { page, limit, total, totalPages }` |
| **Business Logic** | Computes `totalRevenue` from paid invoices. Client `type` derived from `metadata.type` with fallback `company ? 'company' : 'individual'`. Sort by any field, default `createdAt desc`. Type filter: `company` = `company IS NOT NULL`, `individual` = `company IS NULL` |

### `getClientById(id): Promise<ClientDetail>`

| Field | Value |
|---|---|
| **Returns** | Full client with recent quotes/invoices (last 10 each), computed `totalRevenue`, `outstandingAmount` |
| **Error** | Throws `NotFoundError('Client', id)` |

### `getClientActivity(clientId): Promise<ClientActivity[]>`

| Field | Value |
|---|---|
| **Returns** | Timeline of up to 50 activities from quote/invoice lifecycle events |
| **Business Logic** | Generates activities from quote timestamps (`sentAt`, `acceptedAt`, `declinedAt`) and invoice timestamps. Runtime overdue detection. Sorted by date descending |

### `createClient(input: CreateClientInput): Promise<{ id: string }>`

| Field | Value |
|---|---|
| **Business Logic** | Builds `metadata` JSON with `type`, `website`, `tags`, `contacts` (each contact gets `nanoid()` ID). Address stored as JSON. No email uniqueness enforcement (duplicates allowed across workspaces) |

### `updateClient(input: UpdateClientInput): Promise<{ id: string }>`

| Field | Value |
|---|---|
| **Business Logic** | Merges metadata: existing metadata preserved, only provided fields overwritten. Contacts without `id` get new `nanoid()`. All fields optional |

### `deleteClient(id): Promise<void>`

| Field | Value |
|---|---|
| **Business Logic** | Soft delete. Throws `NotFoundError` if not found |

### `deleteClients(ids: string[]): Promise<{ deleted: number }>`

| Field | Value |
|---|---|
| **Business Logic** | Bulk soft delete via `updateMany`. Returns count of actually deleted records |

### `getClientStats(): Promise<ClientStats>`

| Field | Value |
|---|---|
| **Returns** | `{ total, individuals, companies, withActiveQuotes, withUnpaidInvoices }` |
| **Business Logic** | Active quotes = status in `[draft, sent, viewed]`. Unpaid invoices = status in `[sent, viewed, partial]` |

### `importClients(data, skipDuplicates?): Promise<ClientImportResult>`

| Field | Value |
|---|---|
| **Returns** | `{ success, failed, skipped, errors }` |
| **Business Logic** | Row-by-row processing (not batched). Duplicate detection by email within workspace. Builds address JSON from flat fields. Auto-determines type from company field presence |

### `searchClients(query, limit?)`

| Field | Value |
|---|---|
| **Returns** | Array of `{ id, name, email, company }` for autocomplete, max `limit` (default 10) |

### `getClientsForSelect(): Promise<Array<{ id, name, company }>>`

| Field | Value |
|---|---|
| **Returns** | All non-deleted clients for dropdown usage, minimal fields, sorted by name |

---

## 4. Dashboard Module

**File:** `apps/web/lib/dashboard/actions.ts` (996 lines)
**Auth:** Pattern A (`getCurrentUserWorkspace`)

### `getDashboardStats(): Promise<DashboardStats>`

| Field | Value |
|---|---|
| **Returns** | `{ totalQuotes, totalInvoices, totalClients, totalRevenue, outstandingAmount, overdueAmount, quotesThisMonth, invoicesThisMonth, revenueThisMonth, conversionRate }` |
| **Business Logic** | 11 parallel queries. Revenue = sum of `amountPaid` from paid invoices. Outstanding = sum(total) - sum(amountPaid) for sent/viewed/partial/overdue. Overdue includes both stored `overdue` status AND runtime `dueDate < now`. This-month uses `issueDate` for quotes/invoices, `paidAt` for revenue. Conversion rate = accepted+converted / all-sent-lifecycle * 100 |

### `getQuoteStatusCounts(): Promise<QuoteStatusCounts>`

| Field | Value |
|---|---|
| **Returns** | `{ draft, sent, viewed, accepted, declined, expired, converted }` |
| **Business Logic** | `groupBy(['status'])` with workspace filter |

### `getInvoiceStatusCounts(): Promise<InvoiceStatusCounts>`

| Field | Value |
|---|---|
| **Returns** | `{ draft, sent, viewed, paid, partial, overdue, voided }` |

### `getRevenueData(period?): Promise<RevenueDataPoint[]>`

| Field | Value |
|---|---|
| **Signature** | `getRevenueData(period: DashboardPeriod = '30d')` where period is `'7d' \| '30d' \| '90d' \| '12m' \| 'all'` |
| **Returns** | Array of `{ date, revenue, invoiceCount }` grouped by day |

### `getRecentQuotes(limit?): Promise<RecentQuote[]>`

| Field | Value |
|---|---|
| **Returns** | Latest quotes with client name (company preferred), total, status |

### `getRecentInvoices(limit?): Promise<RecentInvoice[]>`

| Field | Value |
|---|---|
| **Returns** | Latest invoices with client name, total, amountPaid, status, dueDate |

### `getRecentActivity(limit?): Promise<ActivityItem[]>`

| Field | Value |
|---|---|
| **Returns** | Merged quote/invoice events sorted by date. Falls back to synthetic activity from recent records if no events exist |

### `getDashboardData(): Promise<DashboardData>`

| Field | Value |
|---|---|
| **Returns** | Bundle of all dashboard data via 7 parallel calls |

### `getAnalyticsStats(): Promise<AnalyticsStats>`

| Field | Value |
|---|---|
| **Returns** | Extends `DashboardStats` with `avgDealValue`, `prevMonthRevenue`, `prevMonthQuotes` |

### `getConversionFunnelData(dateRange?): Promise<ConversionFunnelData>`

| Field | Value |
|---|---|
| **Returns** | `{ quotesCreated, quotesSent, quotesViewed, quotesAccepted, invoicesCreated, invoicesPaid }` |

### `getPaymentAgingData(): Promise<PaymentAgingData>`

| Field | Value |
|---|---|
| **Returns** | `{ current, days1to30, days31to60, days61to90, days90plus, totalOutstanding }` |
| **Business Logic** | Calculates days past due from `dueDate`. Outstanding = total - amountPaid per invoice |

### `getClientDistributionData(limit?): Promise<ClientDistributionData[]>`

| Field | Value |
|---|---|
| **Returns** | Revenue by region (state/country from address JSON), sorted by client count |

### `getMonthlyComparisonData(months?): Promise<MonthlyComparisonData[]>`

| Field | Value |
|---|---|
| **Returns** | 12-month trends: revenue, quoteCount, invoiceCount, clientCount |
| **Business Logic** | **Optimized**: uses 4 raw SQL queries (`$queryRaw`) instead of N*4 ORM queries. Groups by `to_char(date, 'YYYY-MM')` |

### `getTopClientsByRevenue(limit?)`

| Field | Value |
|---|---|
| **Returns** | `{ name, revenue }[]` from paid invoice amounts, filtered to revenue > 0 |

### `getClientLTVData(limit?)`

| Field | Value |
|---|---|
| **Returns** | `{ clients: { id, name, email, ltv }[], averageLTV, totalClients }`. Average includes zero-revenue clients |

### `getRevenueForecast(historicalMonths?, forecastMonths?)`

| Field | Value |
|---|---|
| **Returns** | `ForecastDataPoint[]` with `actual` (historical) and `forecast`/`lowerBound`/`upperBound` (projected) |
| **Business Logic** | Uses raw SQL for historical data. Linear regression (slope/intercept). 15% confidence interval margin. Minimum 2 data points required |

---

## 5. Contracts Module

**File:** `apps/web/lib/contracts/actions.ts` (648 lines)
**Auth:** Pattern A for workspace functions, Pattern C for public token access

### `getContractTemplates(filter?): Promise<PaginatedContracts>`
### `getContractTemplateById(id): Promise<ContractTemplateDetail | null>`
### `createContractTemplate(input): Promise<ContractTemplateDetail>`
### `updateContractTemplate(input): Promise<ContractTemplateDetail>`
### `deleteContractTemplate(id): Promise<void>` -- soft delete
### `duplicateContractTemplate(id): Promise<ContractTemplateDetail>` -- name + ` (Copy)`

### `getContractInstances(filter?): Promise<PaginatedContractInstances>`

| Field | Value |
|---|---|
| **Business Logic** | Search across contract name, client name, client company. Pagination. Status/client filters |

### `getContractInstanceById(id): Promise<ContractInstanceDetail | null>`

### `getContractInstanceByToken(token): Promise<ContractInstanceDetail | null>`

| Field | Value |
|---|---|
| **Auth** | **No auth** -- public access via UUID token |
| **Side Effects** | Auto-marks as `viewed` on first access (sets `viewedAt`, `status = 'viewed'`) |

### `createContractInstance(input: CreateContractInstanceInput)`

| Field | Value |
|---|---|
| **Business Logic** | Processes template content with variable substitution: `{{key}}` replaced via regex. Also replaces `{{clientName}}`, `{{clientEmail}}`, `{{date}}`. Supports both `key` and `name` fields on variables (seed data compat). Verifies template, client, and optional quote all exist in workspace |

### `sendContractInstance(id): Promise<void>`

| Field | Value |
|---|---|
| **Side Effects** | Sets `status = 'sent'`, `sentAt`. Sends HTML email with link to `/c/{accessToken}` (non-blocking). Creates notification |

### `signContract(input: SignContractInput, ipAddress?): Promise<void>`

| Field | Value |
|---|---|
| **Auth** | **No auth** -- uses `accessToken` from input |
| **Business Logic** | Records `signedAt`, `signatureData` (JSON), `signerIpAddress`. Prevents double signing. Notifies all workspace members (non-blocking) |
| **Error Conditions** | Contract not found, already signed |

### `deleteContractInstance(id): Promise<void>` -- soft delete

---

## 6. Rate Cards Module

**File:** `apps/web/lib/rate-cards/actions.ts` (655 lines)
**Auth:** Pattern A

### Rate Card Actions

| Function | Returns | Notes |
|---|---|---|
| `getRateCards(filter?)` | `PaginatedRateCards` | Filters: search, categoryId, pricingType, isActive, minRate, maxRate. Includes usage count (quote + invoice line items) |
| `getRateCardById(id)` | `RateCardDetail` | Includes category, tax rate, usage count |
| `createRateCard(input)` | `{ id: string }` | Defaults: `pricingType = 'fixed'`, `isActive = true` |
| `updateRateCard(input)` | `{ id: string }` | Partial update. Category/taxRate use `connect`/`disconnect` |
| `deleteRateCard(id)` | `void` | Soft delete |
| `bulkDeleteRateCards(ids)` | `{ deleted: number }` | Bulk soft delete via `updateMany` |
| `toggleRateCardActive(id)` | `{ isActive: boolean }` | Flips current value |
| `duplicateRateCard(id, newName?)` | `{ id: string }` | Always `isActive = true` |
| `getRateCardsForSelection(categoryId?)` | `RateCardSelection[]` | Active only. Ordered by category sortOrder then name |
| `getRateCardStats()` | `RateCardStats` | Total, active, inactive counts. Grouped by category and pricing type |

### Category Actions

| Function | Returns | Notes |
|---|---|---|
| `getCategories()` | `CategoryListItem[]` | Includes rate card count. Ordered by `sortOrder asc` |
| `createCategory(input)` | `{ id: string }` | Auto-assigns next sortOrder |
| `updateCategory(input)` | `{ id: string }` | Partial update of name, color, sortOrder |
| `deleteCategory(id)` | `void` | **Blocked** if category has rate cards: `'Cannot delete category with rate cards...'` |
| `reorderCategories(categoryIds)` | `void` | Transaction: batch update sortOrder by array index |

### Import Action

| Function | Returns | Notes |
|---|---|---|
| `importRateCards(data, options?)` | `RateCardImportResult` | Auto-creates categories by name. Row-by-row. Skip duplicates by name (default) |

---

## 7. Settings Module

**File:** `apps/web/lib/settings/actions.ts` (984 lines)
**Auth:** Pattern A

### Workspace

| Function | Notes |
|---|---|
| `getWorkspace()` | Returns `{ id, name, slug, ownerId, createdAt }` |
| `updateWorkspaceName(name)` | Simple name update |

### Business Profile

| Function | Notes |
|---|---|
| `getBusinessProfile()` | Returns null if not set |
| `updateBusinessProfile(input)` | Upserts: creates with defaults if not exists. Partial update |
| `updateBusinessLogo(logoUrl)` | Upserts business profile. Accepts `null` to remove logo |

### Branding Settings

| Function | Notes |
|---|---|
| `getBrandingSettings()` | Returns null if not set |
| `updateBrandingSettings(input)` | Upserts. Defaults: primary `#3B82F6`, secondary `#8B5CF6`, accent `#F59E0B` |

### Payment Settings

| Function | Notes |
|---|---|
| `getPaymentSettings()` | Returns null if not set (from settings module; see also payments module) |
| `updatePaymentSettings(input)` | Upserts. Defaults: `['card']`, `passProcessingFees: false`, `defaultPaymentTerms: 30` |

### Tax Rates

| Function | Notes |
|---|---|
| `getTaxRates()` | All non-deleted, ordered by name |
| `createTaxRate(input)` | If `isDefault`, unsets all other defaults first |
| `updateTaxRate(input)` | Partial update. Default management same as create |
| `deleteTaxRate(id)` | **Blocked** if used by rate cards: `'Cannot delete tax rate. It is used by {N} rate card(s).'` |

### Number Sequences

| Function | Notes |
|---|---|
| `getNumberSequences()` | Ensures both `quote` and `invoice` sequences exist (auto-creates if missing) |
| `updateNumberSequence(input)` | **Zod validated**: `type` (enum), `prefix` (max 10), `suffix` (max 10), `currentValue` (int >= 0), `padding` (1-10). Upserts |

### Team

| Function | Notes |
|---|---|
| `getWorkspaceMembers()` | All members with user info, ordered by join date |
| `getCurrentUserRole()` | Returns role string |
| `updateMemberRole(memberId, newRole)` | **Permissions**: owner/admin only. Admin cannot promote to owner. Cannot demote last owner |
| `inviteMember(email, role?)` | **Permissions**: owner/admin only. Checks user exists (no invitation email yet). Checks not already member |
| `removeMember(memberId)` | **Permissions**: owner/admin only. Cannot remove last owner. Cannot remove self |

### Workspace Settings

| Function | Notes |
|---|---|
| `getWorkspaceSettings()` | Returns `{ id, name, slug }` |
| `updateWorkspaceSettings(input)` | **Owner only**. Slug uniqueness check. Records old slug in `WorkspaceSlugHistory` |
| `deleteWorkspace()` | **Owner only**. Soft delete |

### Invoice Defaults

| Function | Notes |
|---|---|
| `getInvoiceDefaults()` | From `workspace.settings.invoiceDefaults` JSON. Merges with defaults |
| `updateInvoiceDefaults(input)` | Merges into `workspace.settings.invoiceDefaults` JSON |

### Combined

| Function | Notes |
|---|---|
| `getAllSettings()` | Parallel fetch of businessProfile, branding, payment, taxRates, numberSequences |

---

## 8. Projects Module

**File:** `apps/web/lib/projects/actions.ts` (463 lines)
**Auth:** Pattern A
**Validation:** Zod schemas for create/update

### Zod Schemas

```typescript
createProjectSchema: { name: string (1-255), description?: string, clientId: string (min 1) }
updateProjectSchema: { name?: string (1-255), description?: string | null, isActive?: boolean }
```

| Function | Returns | Notes |
|---|---|---|
| `createProject(data)` | Project with client | Validates client belongs to workspace |
| `getProjects(options?)` | `{ projects, pagination }` | Filters: clientId, isActive, search. Default page size 25. Includes quote/invoice/contract counts |
| `getProject(projectId)` | Project with client, recent quotes (10), recent invoices (10), counts | Throws if not found |
| `updateProject(projectId, data)` | Updated project | Zod validates. Verifies ownership |
| `deleteProject(projectId)` | `{ success: true }` | Soft delete |
| `deactivateProject(projectId)` | Project | Calls `updateProject(id, { isActive: false })` |
| `reactivateProject(projectId)` | Project | Calls `updateProject(id, { isActive: true })` |
| `getClientProjects(clientId)` | `{ id, name, description }[]` | Active only, for dropdowns |
| `getProjectStats(projectId)` | `{ quotes: QuoteStats, invoices: InvoiceStats }` | Runtime overdue detection for invoices |
| `getProjectSummaryStats()` | `{ totalProjects, activeProjects, totalQuotes, totalInvoices }` | Optimized with parallel aggregate queries |

---

## 9. Payments Module

**File:** `apps/web/lib/payments/actions.ts` (497 lines)
**Auth:** Pattern A for workspace queries, Pattern C for public checkout

### `getPaymentSettings()` / `updatePaymentSettings(data)`

| Field | Value |
|---|---|
| **Business Logic** | Uses `upsert` for idempotent create/update. Returns sensible defaults when no settings exist |

### `createStripeOnboardingLink(): Promise<StripeOnboardingResult>`

| Field | Value |
|---|---|
| **Business Logic** | Creates Stripe Connect Standard account if none exists. Saves `stripeAccountId` to PaymentSettings. Returns onboarding URL. Guards: returns error if Stripe not configured |

### `checkStripeAccountStatus()`

| Field | Value |
|---|---|
| **Returns** | `{ connected, status, chargesEnabled, payoutsEnabled }` |
| **Side Effects** | Updates `stripeAccountStatus` and `stripeOnboardingComplete` in database |

### `createInvoicePaymentIntent(invoiceId, amount?, accessToken?)`

| Field | Value |
|---|---|
| **Auth** | Dual path: `accessToken` for public checkout (no session), workspace-scoped for authenticated |
| **Business Logic** | **Converts dollars to cents**: `Math.round(amountToPay * 100)` for Stripe. Creates pending Payment record. Gets/creates Stripe customer. Validates invoice is not paid/voided and amount > 0 |

### `getPayments(filter?): Promise<PaymentListItem[]>`

| Field | Value |
|---|---|
| **Business Logic** | Workspace-scoped via `invoice.workspaceId`. Filters: invoiceId, status. Default limit 50 |

### `getPaymentById(paymentId): Promise<PaymentDetail | null>`

### `processPaymentWebhook(paymentIntentId, status, chargeId?, receiptUrl?)`

| Field | Value |
|---|---|
| **Auth** | **No auth check** -- called from webhook handler which verifies Stripe signature |
| **Transaction** | Yes (for succeeded): update payment, update invoice amounts/status, create InvoiceEvent |
| **Business Logic** | Succeeded: sets payment `completed`, updates invoice `amountPaid`/`amountDue`, auto-determines `paid`/`partial` status. Failed: sets payment `failed` only |

---

## 10. Email Module

**File:** `apps/web/lib/email/actions.ts` (441 lines)
**Auth:** Pattern A

| Function | Returns | Notes |
|---|---|---|
| `getEmailTemplates(filter?)` | `EmailTemplateListItem[]` | Filter by type, search, isActive |
| `getEmailTemplateById(id)` | `EmailTemplateDetail \| null` | |
| `getActiveTemplateByType(type)` | `EmailTemplateDetail \| null` | Prefers `isDefault` template |
| `createEmailTemplate(input)` | `EmailTemplateDetail` | Default management: if `isDefault`, unsets others of same type |
| `updateEmailTemplate(input)` | `EmailTemplateDetail` | Same default management |
| `deleteEmailTemplate(id)` | `void` | Soft delete |
| `sendTemplatedEmail(params)` | `{ success, error? }` | Processes template with `{{variable}}` replacement and `{{#if var}}...{{/if}}` conditionals. Wraps in HTML layout. Sends via Resend |
| `getScheduledEmails(filter?)` | `ScheduledEmailListItem[]` | Default limit 50, ordered by scheduledFor |
| `cancelScheduledEmail(id)` | `void` | Only cancels `pending` emails |
| `sendContractSentEmail(params)` | `{ success, error? }` | Sends via `sendTemplatedEmail` with contract-specific variables |
| `sendContractSignedEmail(params)` | `{ success, error? }` | Sends to business email (not client). Returns error if no business email configured |

---

## 11. Notifications Module

**File:** `apps/web/lib/notifications/actions.ts` (123 lines)
**Auth:** Pattern A for reads, Pattern D (internal) for creates

| Function | Returns | Notes |
|---|---|---|
| `getNotifications(limit?)` | `NotificationData[]` | User + workspace scoped. Default 20, desc order |
| `getUnreadNotificationCount()` | `number` | User + workspace scoped |
| `markNotificationRead(id)` | `void` | Sets `isRead = true`, `readAt = now`. Uses `updateMany` for ownership check |
| `markAllNotificationsRead()` | `void` | User + workspace scoped batch update |
| `createNotification(input)` | `void` | **Internal**: accepts explicit userId/workspaceId |
| `notifyWorkspaceMembers(input)` | `void` | **Internal**: uses `createMany` for batch insert. Optional `excludeUserId` |

---

## 12. Search Module

**File:** `apps/web/lib/search/actions.ts` (127 lines)
**Auth:** Pattern A

### `globalSearch(query: string): Promise<SearchResult[]>`

| Field | Value |
|---|---|
| **Validation** | Minimum 2 characters, returns empty array otherwise |
| **Business Logic** | 5 parallel queries across quotes, invoices, clients, contracts, projects. Max 5 results per type. Case-insensitive. Returns `{ id, type, title, subtitle, href }`. Contracts differentiate template vs instance in href |

---

## 13. Auth Module

**File:** `apps/web/lib/auth/actions.ts` (123 lines)
**Auth:** Pattern B (direct `auth()`)

### `changePassword(input: { currentPassword?, newPassword }): Promise<ActionResult>`

| Field | Value |
|---|---|
| **Validation** | If user has existing password, current password required and verified via `bcrypt.compare`. New password: min 8 chars, must contain uppercase + lowercase + digit (regex) |
| **Side Effects** | Hashes with `bcrypt(12)`. Updates user record. `revalidatePath('/settings/account')` |
| **Error Handling** | Catches demo mode error specifically |

### `updateProfile(input: { name? }): Promise<ActionResult>`

| Field | Value |
|---|---|
| **Validation** | Name: 2-100 characters |
| **Side Effects** | `revalidatePath('/settings/account')`, `revalidatePath('/dashboard')` |

---

## 14. Onboarding Module

**File:** `apps/web/lib/onboarding/actions.ts` (137 lines)
**Auth:** Pattern A

### `getOnboardingProgress(): Promise<OnboardingProgress>`

| Field | Value |
|---|---|
| **Business Logic** | Parallel fetch of workspace, businessProfile, brandingSettings, paymentSettings. Step detection: `business` complete if businessName + email exist. `branding` complete if primaryColor or logoUrl exist. `payment` complete if Stripe onboarding done or skipped. Returns `currentStep`, `completedSteps[]`, `isComplete` |

### `completeOnboarding(): Promise<{ success: boolean }>`

| Field | Value |
|---|---|
| **Business Logic** | Sets `workspace.settings.onboardingCompleted = true`. Merges with existing settings JSON |

### `skipOnboardingStep(step): Promise<{ success: boolean }>`

| Field | Value |
|---|---|
| **Business Logic** | Currently a no-op (returns success without persisting) |

### `needsOnboarding(): Promise<boolean>`

| Field | Value |
|---|---|
| **Business Logic** | Checks `workspace.settings.onboardingCompleted !== true` |

---

## 15. PDF Module

**File:** `apps/web/lib/pdf/actions.ts` (365 lines)
**Auth:** Pattern A (authenticated) and Pattern C (public token)

### `getQuotePdfData(quoteId): Promise<QuotePdfData | null>`

| Field | Value |
|---|---|
| **Auth** | Workspace-scoped |
| **Returns** | Quote data with client info, business profile, branding colors, line items, signature data |

### `getQuotePdfDataByToken(accessToken): Promise<QuotePdfData | null>`

| Field | Value |
|---|---|
| **Auth** | **No auth** -- public access via UUID token |
| **Returns** | Same structure as authenticated version |

### `getInvoicePdfData(invoiceId): Promise<InvoicePdfData | null>`

| Field | Value |
|---|---|
| **Auth** | Workspace-scoped |
| **Returns** | Invoice data with payment history, business profile, branding colors, payment terms |

### `getInvoicePdfDataByToken(accessToken): Promise<InvoicePdfData | null>`

| Field | Value |
|---|---|
| **Auth** | **No auth** -- public access via UUID token |
| **Returns** | Same structure as authenticated version |

---

## 16. Workspace Module

**File:** `apps/web/lib/workspace/actions.ts` (289 lines)
**Auth:** Pattern B (direct `auth()`) for `getCurrentUserId()`

### `getUserWorkspaces(): Promise<WorkspaceWithRole[]>`

| Field | Value |
|---|---|
| **Returns** | All workspaces where user is a member, with role, ordered by createdAt asc |

### `getActiveWorkspaceId(): Promise<string>`

| Field | Value |
|---|---|
| **Business Logic** | Reads `active-workspace-id` cookie. Validates membership. Falls back to first workspace. Throws if no workspace exists |

### `getActiveWorkspace(): Promise<WorkspaceWithRole>`

| Field | Value |
|---|---|
| **Returns** | Active workspace details with user's role |

### `switchWorkspace(workspaceId): Promise<void>`

| Field | Value |
|---|---|
| **Business Logic** | Verifies membership. Sets `active-workspace-id` cookie (httpOnly, secure in prod, 1-year expiry). `revalidatePath('/', 'layout')` |

### `createWorkspace(input: { name: string }): Promise<WorkspaceWithRole>`

| Field | Value |
|---|---|
| **Transaction** | Yes -- creates workspace + member in transaction |
| **Business Logic** | Name min 2 chars. Generates slug: `name-lowercase-{random6}`. Sets onboarding to incomplete. Auto-switches to new workspace |

### `updateWorkspace(workspaceId, name): Promise<void>`

| Field | Value |
|---|---|
| **Permissions** | Owner or admin only |

### `deleteWorkspace(workspaceId): Promise<void>`

| Field | Value |
|---|---|
| **Permissions** | Owner only |
| **Business Logic** | **Hard delete** (cascade). Cannot delete last workspace. Auto-switches to next workspace |

---

## Cross-Cutting Concerns

### Error Response Patterns

Two patterns are used across all modules:

1. **Result objects**: `{ success: boolean; error?: string }` -- used by most mutations
2. **Thrown errors**: `throw new Error('...')` or `throw new NotFoundError(...)` -- used by some reads and updates

### Cache Invalidation Patterns

| Pattern | When Used |
|---|---|
| `revalidatePath('/quotes')` | After any quote list mutation |
| `revalidatePath('/quotes/${id}')` | After specific quote mutation |
| `revalidatePath('/', 'layout')` | After workspace switch/create |
| `revalidatePath('/settings')` | After settings mutations |
| `revalidatePath('/settings/{section}')` | After section-specific settings |

### Transaction Patterns

| Type | Example |
|---|---|
| **Interactive** (`$transaction(async (tx) => {...})`) | Quote/invoice line item updates (delete + recreate) |
| **Batched** (`$transaction([...])`) | Invoice status + event creation, payment recording |
| **Atomic upsert** | Number sequence generation |

### Monetary Value Handling

- All database values are in **dollars** (Decimal(12,2))
- `formatCurrency()` does NOT divide by 100
- Only Stripe conversion multiplies by 100: `Math.round(amountToPay * 100)`
- Tax calculation: `quantity * rate * (taxRate / 100)`
- Totals rounded to 2 decimal places in `calculateTotals`

### Soft Delete Convention

All important entities use `deletedAt` timestamp:
- **Reads**: always filter `deletedAt: null`
- **Deletes**: set `deletedAt: new Date()`
- **Exception**: `WorkspaceMember` uses hard delete for `removeMember`
- **Exception**: `deleteWorkspace` in workspace module uses hard `prisma.workspace.delete` (cascade)
