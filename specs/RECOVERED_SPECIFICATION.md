# QuoteCraft - Recovered Functional Specification

**Recovered from codebase:** 2026-02-24
**Source:** Server actions, API routes, database schema, and component analysis
**Version:** As implemented in production (main branch)

---

## 1. Product Overview

**QuoteCraft** is a self-hosted, multi-tenant SaaS application for visual quote and invoice management. It targets freelancers, agencies, and small businesses who need to create professional quotes, convert them to invoices, collect payments, and manage client relationships -- all from a single platform.

**Key Value Proposition:** A block-based visual quote builder with seamless quote-to-invoice conversion, client portals for acceptance/payment, e-signature contracts, and analytics dashboards. Positioned as the open-source alternative to Bloom and Bonsai.

**Target Users:**
- Freelancers and independent consultants
- Small agencies and creative studios
- Service-based small businesses

**Tech Stack:** Next.js 15 (App Router), TypeScript, PostgreSQL (Neon), Prisma 5, Stripe Connect, Resend email, Puppeteer PDF generation, Shadcn UI + Tailwind CSS. Deployed on Vercel with auto-deploy from main branch.

---

## 2. Functional Requirements

---

### FR-100: Authentication & Authorization

#### FR-101: User Registration
- **Description:** New users register with email and password. Password is hashed with bcrypt.
- **Server Action / API:** `POST /api/auth/register`
- **Business Rules:**
  - Email must be unique across all users.
  - Upon registration, a default workspace is created and the user is assigned the `owner` role.
  - Registration creates a `User` record plus an initial `Workspace` and `WorkspaceMember`.

#### FR-102: User Login
- **Description:** Users authenticate via email/password credentials or OAuth providers (Google, GitHub).
- **Server Action / API:** NextAuth.js v5 handler at `/api/auth/[...nextauth]`
- **Business Rules:**
  - Credentials provider uses bcrypt comparison.
  - OAuth providers link via the `Account` model (provider + providerAccountId).
  - Sessions track IP address and user agent.

#### FR-103: Password Reset Flow
- **Description:** Users can request a password reset email and set a new password via a token-based flow.
- **Server Action / API:** `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- **Business Rules:**
  - A `PasswordResetToken` is created with an expiration time.
  - Tokens are single-use and expire.

#### FR-104: Session Management
- **Description:** Active sessions are tracked with IP and user-agent metadata.
- **Business Rules:**
  - Sessions are stored in the `Session` model.
  - NextAuth middleware protects all `/dashboard`, `/quotes`, `/invoices`, `/clients`, `/settings`, `/rate-cards`, `/templates`, `/contracts`, `/onboarding`, `/projects`, `/analytics`, `/help` routes.
  - Public routes (portals, auth pages, marketing) do not require authentication.

#### FR-105: Role-based Access
- **Description:** Workspace members have roles that control permissions.
- **Server Action:** `getCurrentUserRole()`, `updateMemberRole()` in `settings/actions.ts`
- **Roles:**
  - `owner` -- Full control, can delete workspace, manage all members, change settings.
  - `admin` -- Can invite/remove members, change roles (except promoting to owner).
  - `member` -- Standard access to workspace features.
  - `viewer` -- Read-only access (defined in type but not heavily enforced yet).
- **Business Rules:**
  - Only owners and admins can change member roles.
  - Admins cannot promote to owner.
  - The last owner cannot be demoted or removed.
  - Users cannot remove themselves from a workspace.

#### FR-106: Workspace Isolation
- **Description:** Every data query is scoped to the current user's active workspace via `workspaceId`.
- **Server Action:** `getCurrentUserWorkspace()` is called at the start of every server action.
- **Business Rules:**
  - All entities (clients, quotes, invoices, contracts, rate cards, projects, settings) are workspace-scoped.
  - Queries always include `workspaceId` and `deletedAt: null` filters.
  - Active workspace is stored in an HTTP-only cookie (`active-workspace-id`).

---

### FR-200: Workspace Management

#### FR-201: Create Workspace
- **Description:** Users can create new workspaces. A workspace is the top-level multi-tenant container.
- **Server Action:** `createWorkspace()` in `workspace/actions.ts`
- **Business Rules:**
  - Name must be at least 2 characters.
  - A unique slug is auto-generated from the name with a random suffix.
  - Creator is assigned the `owner` role.
  - A transaction creates both the `Workspace` and `WorkspaceMember` records atomically.
  - The user is automatically switched to the new workspace after creation.

#### FR-202: Switch Workspace
- **Description:** Users can switch between their workspaces.
- **Server Action:** `switchWorkspace()` in `workspace/actions.ts`
- **Business Rules:**
  - Verifies user has a `WorkspaceMember` record for the target workspace.
  - Sets the `active-workspace-id` cookie (HTTP-only, secure, 1-year expiry).
  - Triggers full layout revalidation.

#### FR-203: Workspace Settings
- **Description:** Owners can update workspace name and slug.
- **Server Action:** `updateWorkspaceSettings()` in `settings/actions.ts`
- **Business Rules:**
  - Only owners can update workspace settings.
  - Slug must be unique across all workspaces.
  - Slug changes are recorded in `WorkspaceSlugHistory` for audit.

#### FR-204: Team Member Management
- **Description:** Invite, manage roles, and remove workspace members.
- **Server Actions:** `getWorkspaceMembers()`, `inviteMember()`, `updateMemberRole()`, `removeMember()` in `settings/actions.ts`
- **Business Rules:**
  - Only owners and admins can invite or remove members.
  - Inviting currently requires the user to already exist (invitation emails marked as TODO).
  - Duplicate membership check prevents re-adding existing members.
  - Cannot remove the last owner.
  - Cannot remove yourself.
  - Owners can be promoted/demoted but not by admins.

#### FR-205: Business Profile Management
- **Description:** Configure business identity: name, logo, email, phone, website, address, tax ID, currency, timezone.
- **Server Actions:** `getBusinessProfile()`, `updateBusinessProfile()`, `updateBusinessLogo()` in `settings/actions.ts`
- **Business Rules:**
  - Uses upsert pattern -- creates profile if it does not exist.
  - Default currency is USD; default timezone is UTC.
  - Address stored as JSON (street, city, state, postalCode, country).

#### FR-206: Branding Customization
- **Description:** Customize portal branding: colors (primary, secondary, accent), logo, favicon, font family, custom CSS.
- **Server Actions:** `getBrandingSettings()`, `updateBrandingSettings()` in `settings/actions.ts`
- **Business Rules:**
  - Default colors: primary #3B82F6, secondary #8B5CF6, accent #F59E0B.
  - Uses upsert pattern.
  - Branding is applied to public client portals.

---

### FR-300: Client Management

#### FR-301: Create/Update Client
- **Description:** CRUD operations for client records with rich metadata.
- **Server Actions:** `createClient()`, `updateClient()` in `clients/actions.ts`
- **Business Rules:**
  - Client fields: name (required), email (required), phone, company, address (JSON), billingAddress (JSON), taxId, notes.
  - Metadata stored as JSON: `type` (individual/company), `website`, `tags[]`, `contacts[]`.
  - Each contact gets a `nanoid()` ID on creation.
  - Update merges metadata -- existing metadata fields are preserved unless explicitly overridden.
  - All clients are workspace-scoped.

#### FR-302: Client List
- **Description:** Paginated, searchable, filterable client list with revenue calculations.
- **Server Action:** `getClients()` in `clients/actions.ts`
- **Business Rules:**
  - Search across name, email, and company (case-insensitive).
  - Filter by type: `company` (has company field), `individual` (no company field).
  - Type detection: `metadata.type` first, then fallback to `company ? 'company' : 'individual'`.
  - Each client includes counts of quotes and invoices (excluding soft-deleted).
  - `totalRevenue` is computed from paid invoice totals.
  - Default: 20 items per page, sorted by `createdAt` descending.
  - Configurable sort field and order.

#### FR-303: Client Detail
- **Description:** Full client profile with associated quotes, invoices, and computed financial totals.
- **Server Action:** `getClientById()` in `clients/actions.ts`
- **Business Rules:**
  - Returns last 10 quotes and invoices ordered by creation date.
  - `totalRevenue` = sum of `amountPaid` from all invoices for this client.
  - `outstandingAmount` = sum of `total` minus sum of `amountPaid` from all invoices.
  - Computed fields extracted from metadata: contacts, tags, type, website.

#### FR-304: Client Activity Timeline
- **Description:** Chronological activity feed from quote and invoice lifecycle events.
- **Server Action:** `getClientActivity()` in `clients/actions.ts`
- **Business Rules:**
  - Generates activities from quote lifecycle: created, sent (sentAt), accepted (acceptedAt), declined (declinedAt).
  - Generates activities from invoice lifecycle: created, sent (sentAt), paid (paidAt).
  - Overdue is computed at runtime: `status not in [paid, voided, draft] AND dueDate < now`.
  - Sorted by date descending, limited to 50 items.

#### FR-305: Bulk Delete
- **Description:** Soft delete multiple clients at once.
- **Server Action:** `deleteClients()` in `clients/actions.ts`
- **Business Rules:**
  - Sets `deletedAt` timestamp on all matching clients within the workspace.
  - Returns count of deleted records.

#### FR-306: CSV Import
- **Description:** Import clients from structured data with duplicate detection.
- **Server Action:** `importClients()` in `clients/actions.ts`
- **Business Rules:**
  - Input fields: name, email, phone, company, street, city, state, postalCode, country.
  - `skipDuplicates` flag (default: true) skips rows where email already exists in workspace.
  - Auto-detects type: `company` if company field is present, otherwise `individual`.
  - Builds address JSON from address fields if any are provided.
  - Returns result: `{ success, failed, skipped, errors[] }`.
  - Errors include row number and message.

#### FR-307: Client Statistics
- **Description:** Aggregate statistics across all workspace clients.
- **Server Action:** `getClientStats()` in `clients/actions.ts`
- **Business Rules:**
  - Returns: total count, individuals count, companies count, clients with active quotes, clients with unpaid invoices.
  - Active quotes = status in [draft, sent, viewed].
  - Unpaid invoices = status in [sent, viewed, partial].

---

### FR-400: Quote Management

#### FR-401: Create Quote
- **Description:** Create a new quote with title, client, optional project, and block content.
- **Server Action:** `createQuote()` in `quotes/actions.ts`
- **Business Rules:**
  - Client must belong to the same workspace (verified before creation).
  - A unique `quoteNumber` is generated atomically (see FR-406).
  - Initial status is always `draft`.
  - Blocks are stored in `settings.blocks` JSON field.
  - A `QuoteEvent` with type `created` is logged.
  - Path `/quotes` is revalidated.

#### FR-402: Quote Line Items
- **Description:** Line items are extracted from `service-item` blocks during create/update.
- **Server Action:** Part of `createQuote()` and `updateQuote()` in `quotes/actions.ts`
- **Business Rules:**
  - Only blocks with `type === 'service-item'` produce line items.
  - Each line item: name, description, quantity, rate, amount (quantity * rate), taxRate, taxAmount.
  - `taxAmount = quantity * rate * (taxRate / 100)` if taxRate is present.
  - `subtotal` = sum of all line item amounts.
  - `taxTotal` = sum of all line item tax amounts.
  - `total` = subtotal + taxTotal.
  - Line items are stored in both the `QuoteLineItem` table AND `settings.blocks` JSON (dual storage).

#### FR-403: Block-based Visual Builder
- **Description:** Quotes use a block-based document model for visual layout.
- **State Management:** Zustand store (`quote-builder-store.ts`) with immer, devtools, and localStorage persistence.
- **Block Types:** header, text, divider, spacer, image, signature, service-item, service-group, columns, table.
- **Store Actions:** addBlock, updateBlock, removeBlock, moveBlock, duplicateBlock, undo, redo, recalculateTotals.
- **Business Rules:**
  - Blocks are stored in `settings.blocks` as a JSON array.
  - Each block has: id, type, createdAt, updatedAt, and a type-specific `content` object.
  - The builder supports drag-and-drop via dnd-kit.
  - Selected block ID, panel visibility, and preview mode are tracked in store state.

#### FR-404: Quote Status Machine
- **Description:** Quotes follow a defined state machine for lifecycle transitions.
- **Server Action:** `updateQuoteStatus()` in `quotes/actions.ts`
- **Valid Transitions:**
  - `draft` -> `sent`
  - `sent` -> `viewed`, `accepted`, `declined`, `expired`
  - `viewed` -> `accepted`, `declined`, `expired`
  - `accepted` -> (none; `converted` is set internally by `createInvoiceFromQuote`)
  - `declined` -> `draft` (re-draft)
  - `expired` -> `draft` (re-draft)
- **Business Rules:**
  - Invalid transitions return `{ success: false, error: "..." }`.
  - Status-specific timestamps are set: `sentAt`, `acceptedAt`, `declinedAt`.
  - A `QuoteEvent` is created for every status change with type `status_changed_to_{status}`.

#### FR-405: Send Quote
- **Description:** Set quote status to `sent` and email the client a portal link.
- **Server Action:** `sendQuote()` in `quotes/actions.ts`
- **Business Rules:**
  - Client must have an email address.
  - Quote total must be greater than zero (cannot send empty quotes).
  - Sets `sentAt` timestamp.
  - Sends email via Resend (non-blocking; failure is logged but does not fail the action).
  - Portal URL: `{APP_URL}/q/{accessToken}`.
  - Creates a `QuoteEvent` with type `quote_sent` including recipient email.
  - Creates an in-app notification for the sender.

#### FR-406: Quote Number Generation
- **Description:** Atomic, race-condition-safe quote number generation.
- **Server Action:** `generateQuoteNumber()` (internal) in `quotes/actions.ts`
- **Business Rules:**
  - Uses `$transaction` with `upsert` on the `NumberSequence` table (compound key: workspaceId + type).
  - Default prefix: `QT`, default padding: 4 digits.
  - Format: `{prefix}-{paddedValue}` or `{prefix}-{paddedValue}-{suffix}` if suffix exists.
  - Example: `QT-0001`, `QT-0042-2024`.
  - Prefix trailing hyphens are stripped before formatting.

#### FR-407: Duplicate Quote
- **Description:** Clone an existing quote with a new number and draft status.
- **Server Action:** `duplicateQuote()` in `quotes/actions.ts`
- **Business Rules:**
  - Copies: clientId, projectId, title (appended with " (Copy)"), all financial fields, notes, terms, settings (blocks), and line items.
  - Resets: status to `draft`, generates new quoteNumber.
  - Does NOT copy: signatureData, sentAt, acceptedAt, declinedAt, accessToken (new one auto-generated).

#### FR-408: Delete Quote
- **Description:** Soft delete a quote.
- **Server Action:** `deleteQuote()` in `quotes/actions.ts`
- **Business Rules:**
  - Sets `deletedAt` timestamp (does not hard delete).
  - **Blocked** if a linked invoice exists (non-deleted). Returns error: "Cannot delete a quote that has a linked invoice."
  - Revalidates `/quotes`.

#### FR-409: Quote Settings
- **Description:** Per-quote configuration options stored in the `settings` JSON field.
- **Fields (from `getQuote()` deserialization):**
  - `requireSignature` (boolean, default: true)
  - `autoConvertToInvoice` (boolean, default: false)
  - `depositRequired` (boolean, default: false)
  - `depositType` ('percentage' | 'fixed', default: 'percentage')
  - `depositValue` (number, default: 50)
  - `showLineItemPrices` (boolean, default: true)
  - `allowPartialAcceptance` (boolean, default: false)
  - `currency` (string, default: 'USD')
  - `taxInclusive` (boolean, default: false)

#### FR-410: Quote-to-Invoice Conversion
- **Description:** Convert an accepted quote into a draft invoice in a single transaction.
- **Server Action:** `createInvoiceFromQuote()` in `invoices/actions.ts`
- **Business Rules:**
  - Quote must exist and belong to the workspace.
  - Only one invoice per quote (checks for existing invoice; returns error if found).
  - Runs in a `$transaction`:
    1. Creates the invoice with all financial fields copied from the quote.
    2. Copies all line items from quote to invoice.
    3. Sets `amountDue` = quote total, `amountPaid` = 0.
    4. Sets quote status to `converted`.
    5. Creates a `QuoteEvent` with type `converted_to_invoice`.
    6. Creates an `InvoiceEvent` with type `created` and metadata `fromQuoteId`.
  - Due date default: 30 days from now (configurable via `dueDays` parameter).
  - Invoice links back to quote via `quoteId` field.
  - Revalidates both `/invoices` and `/quotes` paths.

---

### FR-500: Invoice Management

#### FR-501: Create Invoice
- **Description:** Create a standalone invoice with line items.
- **Server Action:** `createInvoice()` in `invoices/actions.ts`
- **Business Rules:**
  - Client must belong to workspace (verified).
  - Invoice number generated atomically (same pattern as quotes but with `INV` prefix).
  - Initial status: `draft`.
  - `amountDue` = total (no payments yet).
  - Totals rounded to 2 decimal places: `Math.round(value * 100) / 100`.
  - An `InvoiceEvent` with type `created` is logged.

#### FR-502: Create Invoice from Quote
- See FR-410 above.

#### FR-503: Invoice Line Items
- **Description:** Line items for invoices follow the same structure as quote line items.
- **Fields:** name, description, quantity, rate, amount (qty * rate), taxRate, taxAmount, sortOrder.
- **Business Rules:**
  - Same tax calculation as quotes: `taxAmount = qty * rate * (taxRate / 100)`.
  - Line items are deleted and recreated on update (transactional).

#### FR-504: Invoice Status Machine
- **Description:** Invoices follow a lifecycle with status transitions and timestamps.
- **Server Action:** `updateInvoiceStatus()` in `invoices/actions.ts`
- **Statuses:** draft, sent, viewed, partial, paid, overdue, voided.
- **Business Rules:**
  - Status `sent` sets `sentAt` if not already set.
  - Status `paid` sets `paidAt`, `amountPaid` = total, `amountDue` = 0.
  - Status `voided` sets `voidedAt`, `amountDue` = 0.
  - An `InvoiceEvent` is created for every status change with `previousStatus` in metadata.

#### FR-505: Runtime Overdue Calculation
- **Description:** The `overdue` status is computed at runtime, not stored in the database.
- **Server Action:** `getInvoices()` in `invoices/actions.ts`
- **Business Rules:**
  - An invoice is overdue if: `status not in [paid, voided, draft] AND dueDate < now`.
  - The list endpoint returns `overdue` as the status for qualifying invoices.
  - Exception: `partial` status invoices retain their status even when past due.
  - Dashboard stats query both stored `overdue` status AND runtime computation via OR clause.

#### FR-506: Send Invoice
- **Description:** Set invoice status to `sent` and email the client a portal link.
- **Server Action:** `sendInvoice()` in `invoices/actions.ts`
- **Business Rules:**
  - Delegates to `updateInvoiceStatus(id, 'sent')` first.
  - Sends email via Resend with portal URL: `{APP_URL}/i/{accessToken}`.
  - Email includes formatted amount and due date.
  - Creates in-app notification for sender.
  - Email failures are caught and logged (non-blocking).

#### FR-507: Record Payment
- **Description:** Manually record a payment against an invoice.
- **Server Action:** `recordPayment()` in `invoices/actions.ts`
- **Business Rules:**
  - Cannot record payment for voided invoices.
  - Amount must be greater than zero.
  - Updates `amountPaid` (cumulative) and `amountDue` (total - amountPaid, min 0).
  - Auto-determines status:
    - `amountPaid >= total` -> `paid` (also sets `paidAt`)
    - `amountPaid > 0 but < total` -> `partial`
    - Otherwise retains current status.
  - Creates a `Payment` record with status `completed` and `processedAt`.
  - Creates an `InvoiceEvent` with type `payment_recorded` and payment details in metadata.
  - All updates run in a single `$transaction`.

#### FR-508: Invoice Number Generation
- **Description:** Same atomic pattern as quote numbers.
- **Server Action:** `generateInvoiceNumber()` (internal) in `invoices/actions.ts`
- **Business Rules:**
  - Uses `NumberSequence` table with type `invoice`.
  - Default prefix: `INV`, default padding: 4 digits.
  - Format: `INV-0001`, etc.

#### FR-509: Duplicate Invoice
- **Description:** Clone an invoice with a new number, fresh dates, and reset payment state.
- **Server Action:** `duplicateInvoice()` in `invoices/actions.ts`
- **Business Rules:**
  - Copies: clientId, projectId, title (appended " (Copy)"), all financial fields, notes, terms, settings, line items.
  - Resets: status to `draft`, `amountPaid` = 0, `amountDue` = total.
  - New due date: 30 days from now.
  - New issue date: today.
  - Does NOT copy: quoteId, sentAt, paidAt, voidedAt, accessToken, payments.

#### FR-510: Delete Invoice
- **Description:** Soft delete for draft invoices; void suggested for sent invoices.
- **Server Action:** `deleteInvoice()` in `invoices/actions.ts`
- **Business Rules:**
  - Only draft invoices can be deleted (sets `deletedAt`).
  - Non-draft invoices return error: "Can only delete draft invoices. Use void for sent invoices."

---

### FR-600: Payments

#### FR-601: Stripe Connect Integration
- **Description:** Workspaces connect their Stripe accounts for payment processing.
- **Server Actions:** `createStripeOnboardingLink()`, `checkStripeAccountStatus()` in `payments/actions.ts`
- **Business Rules:**
  - Creates a Stripe Connect account (type: standard) if one doesn't exist.
  - Stores `stripeAccountId`, `stripeAccountStatus`, and `stripeOnboardingComplete` in `PaymentSettings`.
  - Onboarding link redirects back to `/settings/payments` with success/refresh query params.
  - Account status is refreshed from Stripe API on check: `chargesEnabled`, `payoutsEnabled`.

#### FR-602: Create Checkout Session / Payment Intent
- **Description:** Create a Stripe payment intent for invoice payment.
- **Server Action:** `createInvoicePaymentIntent()` in `payments/actions.ts`
- **API Route:** `POST /api/checkout/invoice/[invoiceId]`
- **Business Rules:**
  - Supports both authenticated (workspace-scoped) and public (accessToken-scoped) flows.
  - Cannot pay already-paid or voided invoices.
  - Amount defaults to `amountDue`; can be overridden for partial payments.
  - Converts to cents for Stripe: `Math.round(amount * 100)`.
  - Creates or retrieves a Stripe customer using client email.
  - Creates a `Payment` record with status `pending` and the `stripePaymentIntentId`.

#### FR-603: Webhook Processing
- **Description:** Process Stripe webhooks for payment completion.
- **Server Action:** `processPaymentWebhook()` in `payments/actions.ts`
- **API Route:** `POST /api/webhooks/stripe`
- **Business Rules:**
  - On success: updates payment to `completed`, updates invoice `amountPaid`/`amountDue`, determines `paid` or `partial` status, creates `InvoiceEvent`.
  - On failure: updates payment to `failed`.
  - All invoice updates run in a `$transaction`.

#### FR-604: Payment Recording (Manual)
- See FR-507 (Record Payment).

#### FR-605: Milestone/Scheduled Payments
- **Description:** Payment schedules with milestones.
- **Database Model:** `PaymentSchedule` -- type, amount/percentage, dueDate, status.
- **Status:** Schema exists but full implementation is in the data model only (P1 feature).

---

### FR-700: Client Portal

#### FR-701: Public Quote View
- **Description:** Clients view quotes via a public URL using an access token.
- **URL:** `/q/[token]`
- **Business Rules:**
  - No authentication required; access is via UUID token in the `accessToken` field.
  - Displays quote blocks, line items, totals, and business branding.
  - View tracking: count, timestamp, IP, user agent.

#### FR-702: Accept Quote
- **Description:** Clients accept a quote, optionally with an e-signature.
- **Business Rules:**
  - Sets status to `accepted` with `acceptedAt` timestamp.
  - If `requireSignature` is enabled, signature canvas data is captured and stored in `signatureData`.
  - Triggers notification to workspace members.

#### FR-703: Decline Quote
- **Description:** Clients decline a quote with an optional reason.
- **Business Rules:**
  - Sets status to `declined` with `declinedAt` timestamp.
  - Reason is stored in event metadata.

#### FR-704: Public Invoice View
- **Description:** Clients view invoices via a public URL.
- **URL:** `/i/[token]`
- **Business Rules:**
  - No authentication required.
  - Displays line items, totals, payment status, and amount due.
  - View tracking enabled.

#### FR-705: Online Payment
- **Description:** Clients pay invoices via Stripe from the portal.
- **Business Rules:**
  - Creates a Stripe checkout session/payment intent.
  - Supports partial payments.
  - Payment confirmation handled via webhooks (FR-603).

#### FR-706: Contract Signing Portal
- **Description:** Clients view and sign contracts via a public URL.
- **URL:** `/c/[token]`
- **Business Rules:**
  - First view sets `viewedAt` and status to `viewed`.
  - Signing captures signature data and IP address (see FR-803).

#### FR-707: View Tracking
- **Description:** Track when clients view portal pages.
- **Business Rules:**
  - Records `viewedAt` timestamp on first view.
  - Contract instances update status to `viewed`.
  - Quote view events are tracked in `QuoteEvent`.
  - Invoice view events are tracked in `InvoiceEvent`.

---

### FR-800: Contracts

#### FR-801: Contract Templates
- **Description:** Rich-text contract templates with variable placeholders.
- **Server Actions:** `createContractTemplate()`, `updateContractTemplate()`, `deleteContractTemplate()`, `duplicateContractTemplate()` in `contracts/actions.ts`
- **Business Rules:**
  - Templates have: name, content (HTML/rich text), isTemplate flag, variables (JSON array).
  - Variables define: key, label, type, defaultValue.
  - Soft delete via `deletedAt`.
  - Duplicate appends " (Copy)" to name.
  - Templates are paginated, searchable by name, and include instance count.

#### FR-802: Contract Instances
- **Description:** Concrete contracts created from templates, linked to clients and optionally quotes.
- **Server Actions:** `createContractInstance()`, `sendContractInstance()`, `getContractInstances()`, `deleteContractInstance()` in `contracts/actions.ts`
- **Business Rules:**
  - Created from a template: copies content and processes variable placeholders.
  - Variable substitution: `{{variableKey}}` replaced with provided values or defaults.
  - Common placeholders auto-replaced: `{{clientName}}`, `{{clientEmail}}`, `{{date}}`.
  - Initial status: `draft`.
  - Send: sets status to `sent`, `sentAt` timestamp, emails client with portal link.
  - Portal URL: `{APP_URL}/c/{accessToken}`.
  - Email uses custom HTML template (not React Email for contracts).
  - Creates in-app notification for sender.

#### FR-803: E-Signature Capture
- **Description:** Canvas-based signature capture in the client portal.
- **Server Action:** `signContract()` in `contracts/actions.ts`
- **Business Rules:**
  - Called from public portal (no auth required; uses access token).
  - Cannot sign an already-signed contract.
  - Sets status to `signed`, `signedAt` timestamp.
  - Stores `signatureData` (canvas data as JSON) and `signerIpAddress`.
  - Notifies all workspace members of the signing.

#### FR-804: Signature Audit Trail
- **Description:** Captured metadata for legal compliance.
- **Fields:** `signedAt` (timestamp), `signerIpAddress`, `signatureData` (canvas bitmap/path data), user agent (from request headers).

---

### FR-900: Rate Cards

#### FR-901: Rate Card Categories
- **Description:** Organize rate cards into colored, sortable categories.
- **Server Actions:** `getCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()`, `reorderCategories()` in `rate-cards/actions.ts`
- **Business Rules:**
  - Fields: name, color (nullable), sortOrder.
  - Auto-assigns next sortOrder on creation (max + 1).
  - Cannot delete a category that contains rate cards (must reassign or remove first).
  - Reorder updates sortOrder for all categories in a single transaction.
  - Soft delete via `deletedAt`.

#### FR-902: Rate Card CRUD
- **Description:** Pricing templates for quick line item entry in the quote builder.
- **Server Actions:** `createRateCard()`, `updateRateCard()`, `deleteRateCard()`, `duplicateRateCard()`, `toggleRateCardActive()`, `bulkDeleteRateCards()` in `rate-cards/actions.ts`
- **Business Rules:**
  - Fields: name, description, pricingType (fixed/hourly), rate (Decimal), unit, categoryId, taxRateId, isActive.
  - `usageCount` = count of linked QuoteLineItems + InvoiceLineItems.
  - Duplicate appends " (Copy)" to name, resets isActive to true.
  - Toggle flips the `isActive` boolean.
  - Soft delete via `deletedAt`.
  - Paginated list with filters: search, categoryId, pricingType, isActive, minRate, maxRate.
  - Stats: total, active, inactive, breakdown by category and pricing type.

#### FR-903: Rate Card Picker in Builder
- **Description:** Select rate cards from the quote builder to insert as service-item blocks.
- **Server Action:** `getRateCardsForSelection()` in `rate-cards/actions.ts`
- **Business Rules:**
  - Returns only active, non-deleted rate cards.
  - Optionally filtered by category.
  - Sorted by category sortOrder, then by name.
  - Returns: id, name, description, pricingType, rate, unit, categoryId, categoryName, categoryColor, taxRateId.

#### FR-904: Rate Card Import
- **Description:** Bulk import rate cards from structured data.
- **Server Action:** `importRateCards()` in `rate-cards/actions.ts`
- **Business Rules:**
  - Input fields: name, description, pricingType, rate, unit, categoryName.
  - Auto-creates categories that don't exist.
  - `skipDuplicates` (default: true) skips rows where name matches existing rate card.
  - Returns: `{ success, failed, skipped, errors[] }`.

---

### FR-1000: Projects

#### FR-1001: Project CRUD
- **Description:** Projects group quotes, invoices, and contracts under a client.
- **Server Actions:** `createProject()`, `getProjects()`, `getProject()`, `updateProject()`, `deleteProject()` in `projects/actions.ts`
- **Business Rules:**
  - Fields: name (required, max 255), description, clientId (required), isActive.
  - Client must belong to workspace (verified on creation).
  - Validated with Zod schemas.
  - Project detail includes: last 10 quotes, last 10 invoices, counts of quotes/invoices/contractInstances.
  - Paginated list with filters: clientId, isActive, search (name/description).
  - Default page size: 25.
  - Soft delete via `deletedAt`.

#### FR-1002: Project Statistics
- **Description:** Aggregate financial stats per project.
- **Server Action:** `getProjectStats()` in `projects/actions.ts`
- **Business Rules:**
  - Quote stats: total count, by status (draft/sent/accepted/expired), total value, accepted value.
  - Invoice stats: total count, pending, paid, overdue (runtime calculation), partial, total value, total paid, total due.
  - Summary stats across all projects: `getProjectSummaryStats()` returns totalProjects, activeProjects, totalQuotes, totalInvoices.

#### FR-1003: Activate/Deactivate
- **Description:** Toggle project active status without deletion.
- **Server Actions:** `deactivateProject()`, `reactivateProject()` in `projects/actions.ts`
- **Business Rules:**
  - Delegates to `updateProject(id, { isActive: false/true })`.
  - Inactive projects can be filtered out of lists.

---

### FR-1100: Dashboard & Analytics

#### FR-1101: KPI Cards
- **Description:** Top-level business health metrics.
- **Server Action:** `getDashboardStats()` in `dashboard/actions.ts`
- **Metrics:**
  - `totalRevenue` -- sum of `amountPaid` from paid invoices.
  - `outstandingAmount` -- sum of `total` minus sum of `amountPaid` from invoices with status in [sent, viewed, partial, overdue].
  - `overdueAmount` -- same calculation but only for invoices that are stored as `overdue` OR have `dueDate < now` with status in [sent, viewed, partial].
  - `conversionRate` -- (accepted + converted quotes) / (all quotes that were at least sent) * 100.
  - `quotesThisMonth` -- quotes with `issueDate` in current calendar month.
  - `invoicesThisMonth` -- invoices with `issueDate` in current calendar month.
  - `revenueThisMonth` -- sum of `amountPaid` from invoices paid this month (by `paidAt`).
  - `totalQuotes`, `totalInvoices`, `totalClients` -- simple counts.

#### FR-1102: Revenue Over Time Chart
- **Description:** Revenue data points grouped by date.
- **Server Action:** `getRevenueData()` in `dashboard/actions.ts`
- **Business Rules:**
  - Period filter: 7d, 30d, 90d, 12m, all.
  - Groups paid invoices by `paidAt` date.
  - Each data point: date, revenue, invoiceCount.
  - Date library: date-fns.

#### FR-1103: Quote/Invoice Status Breakdown
- **Description:** Count of entities by status.
- **Server Actions:** `getQuoteStatusCounts()`, `getInvoiceStatusCounts()` in `dashboard/actions.ts`
- **Business Rules:**
  - Uses Prisma `groupBy` on status field.
  - Quote statuses: draft, sent, viewed, accepted, declined, expired, converted.
  - Invoice statuses: draft, sent, viewed, paid, partial, overdue, voided.

#### FR-1104: Recent Activity Feed
- **Description:** Timeline of recent quote and invoice events.
- **Server Action:** `getRecentActivity()` in `dashboard/actions.ts`
- **Business Rules:**
  - Pulls from `QuoteEvent` and `InvoiceEvent` tables.
  - Fallback: if no events exist, generates synthetic activity from recent quotes/invoices.
  - Maps event types to activity types (e.g., `created` -> `quote_created`).
  - Sorted by date descending, limited to configurable count (default: 10).

#### FR-1105: Conversion Funnel
- **Description:** Quote-to-payment funnel visualization.
- **Server Action:** `getConversionFunnelData()` in `dashboard/actions.ts`
- **Stages:** quotesCreated -> quotesSent -> quotesViewed -> quotesAccepted -> invoicesCreated (from quotes) -> invoicesPaid (from quotes).
- **Business Rules:**
  - Optional date range filter.
  - "Accepted" includes both `accepted` and `converted` statuses.
  - Invoice stages only count invoices linked to quotes (`quoteId not null`).

#### FR-1106: Payment Aging (AR Buckets)
- **Description:** Accounts receivable aging analysis.
- **Server Action:** `getPaymentAgingData()` in `dashboard/actions.ts`
- **Buckets:** current (not yet due), 1-30 days past due, 31-60, 61-90, 90+ days.
- **Business Rules:**
  - Considers invoices with status in [sent, viewed, partial, overdue].
  - Outstanding per invoice = total - amountPaid.
  - Days past due = floor((now - dueDate) / (1 day)).
  - Invoices without dueDate are classified as `current`.

#### FR-1107: Monthly Comparison Trends
- **Description:** 12-month trend data for revenue, quotes, invoices, and new clients.
- **Server Action:** `getMonthlyComparisonData()` in `dashboard/actions.ts`
- **Business Rules:**
  - Optimized: 4 raw SQL queries instead of N per month.
  - Uses `to_char(date_column, 'YYYY-MM')` for monthly grouping.
  - Revenue from paid invoices (by `paid_at`).
  - Counts from `created_at` for quotes, invoices, and clients.

#### FR-1108: Client Distribution
- **Description:** Revenue breakdown by geographic region.
- **Server Action:** `getClientDistributionData()` in `dashboard/actions.ts`
- **Business Rules:**
  - Region extracted from client address JSON: `state` or `country`, fallback to "Unknown".
  - Per region: clientCount, totalRevenue (from paid invoices), quoteCount, invoiceCount.
  - Sorted by clientCount descending, limited to top N (default: 10).

#### FR-1109: Revenue Forecast
- **Description:** Linear regression forecast based on historical revenue.
- **Server Action:** `getRevenueForecast()` in `dashboard/actions.ts`
- **Business Rules:**
  - Default: 6 months historical, 3 months forecast.
  - Uses simple linear regression: calculates slope and intercept from historical monthly revenue.
  - Projected values clamped to minimum 0 (no negative revenue).
  - 15% confidence interval around projected values.
  - Returns both historical data points (with `actual` values) and forecast points (with `forecast`, `lowerBound`, `upperBound`).
  - Requires at least 2 historical data points.

#### FR-1110: Top Clients by Revenue
- **Description:** Ranked list of highest-revenue clients.
- **Server Actions:** `getTopClientsByRevenue()`, `getClientLTVData()` in `dashboard/actions.ts`
- **Business Rules:**
  - Revenue = sum of `amountPaid` from paid invoices per client.
  - Only includes clients with revenue > 0.
  - LTV data includes average LTV across ALL clients (including zero-revenue).
  - Default limit: 5.

#### FR-1111: Analytics Stats (Extended)
- **Description:** Dashboard stats extended with previous-month comparisons.
- **Server Action:** `getAnalyticsStats()` in `dashboard/actions.ts`
- **Additional Fields:**
  - `avgDealValue` -- average `total` from accepted/converted quotes.
  - `prevMonthRevenue` -- revenue from previous calendar month.
  - `prevMonthQuotes` -- quote count from previous calendar month.

---

### FR-1200: Configuration

#### FR-1201: Tax Rate Management
- **Description:** Workspace-scoped tax rates for applying to line items and rate cards.
- **Server Actions:** `getTaxRates()`, `createTaxRate()`, `updateTaxRate()`, `deleteTaxRate()` in `settings/actions.ts`
- **Business Rules:**
  - Fields: name, rate (Decimal), description, isInclusive, isDefault, isActive.
  - Only one default tax rate per workspace (setting a new default unsets others).
  - Cannot delete a tax rate that is used by active rate cards (returns error with count).
  - Soft delete via `deletedAt`.

#### FR-1202: Number Sequences
- **Description:** Configurable auto-numbering for quotes and invoices.
- **Server Actions:** `getNumberSequences()`, `updateNumberSequence()` in `settings/actions.ts`
- **Business Rules:**
  - Types: `quote` and `invoice`.
  - Configurable: prefix (max 10 chars), suffix (max 10 chars), currentValue (non-negative integer), padding (1-10).
  - Validated with Zod schema.
  - Auto-creates missing sequences when fetched (defaults: QT/INV prefix, 0 current value, 4 padding).
  - Format: `{prefix}-{paddedValue}[-{suffix}]`.

#### FR-1203: Email Templates
- **Description:** Customizable email templates for notifications.
- **Database Model:** `EmailTemplate` -- type, name, subject, body, isActive, isDefault.
- **Server Actions:** CRUD in `email/actions.ts`.
- **Business Rules:**
  - Templates are workspace-scoped.
  - Types correspond to notification events (quote_sent, invoice_sent, etc.).

#### FR-1204: Invoice Defaults
- **Description:** Default settings applied to new invoices.
- **Server Actions:** `getInvoiceDefaults()`, `updateInvoiceDefaults()` in `settings/actions.ts`
- **Fields:**
  - `paymentTerms` (string, default: 'net30')
  - `defaultNotes` (string)
  - `defaultTerms` (string)
  - `lateFeeEnabled` (boolean, default: false)
  - `lateFeeType` ('percentage' | 'fixed', default: 'percentage')
  - `lateFeeValue` (number, default: 0)
  - `reminderEnabled` (boolean, default: true)
  - `reminderDays` (number[], default: [7, 3, 1])
- **Business Rules:**
  - Stored in `workspace.settings.invoiceDefaults` JSON.
  - Merges with defaults on read.

#### FR-1205: Appearance Settings
- **Description:** User-facing theme and display preferences.
- **Implementation:** next-themes ThemeProvider + custom FontSizeProvider.
- **Options:** Dark/light theme mode, font size adjustment.
- **Business Rules:**
  - Theme preference persisted client-side.
  - Applied globally across dashboard.

---

### FR-1300: Supporting Features

#### FR-1301: PDF Generation
- **Description:** Generate downloadable PDFs for quotes and invoices.
- **Server Actions:** In `pdf/actions.ts`.
- **API Routes:** `GET /api/pdf/quote/[quoteId]`, `GET /api/pdf/invoice/[invoiceId]`, `GET /api/download/quote/[quoteId]`, `GET /api/download/invoice/[invoiceId]`.
- **Business Rules:**
  - Uses Puppeteer for server-side HTML-to-PDF rendering.
  - Separate endpoints for generation (render) and download (attachment disposition).

#### FR-1302: Email Notifications
- **Description:** Transactional emails via Resend.
- **Service:** `lib/services/email.ts`
- **Email Types:**
  - `sendQuoteSentEmail()` -- Quote sent to client with portal link.
  - `sendInvoiceSentEmail()` -- Invoice sent with amount and due date.
  - `sendPaymentReceivedEmail()` -- Payment confirmation.
  - `sendQuoteAcceptedEmail()` -- Quote accepted notification.
  - `sendInvoiceReminderEmail()` -- Payment reminder.
- **Business Rules:**
  - All emails are non-blocking (fire-and-forget with catch).
  - Emails include business name and branded content.
  - Scheduled emails supported via `ScheduledEmail` model.

#### FR-1303: In-app Notifications
- **Description:** In-app notification system.
- **Server Actions:** In `notifications/actions.ts`.
- **Business Rules:**
  - Fields: type, title, message, entityType, entityId, link, isRead.
  - `createNotification()` creates for a specific user.
  - `notifyWorkspaceMembers()` creates for all members in a workspace.
  - Mark as read functionality.

#### FR-1304: Global Search
- **Description:** Search across quotes, invoices, clients, contracts, and projects.
- **Server Action:** `globalSearch()` in `search/actions.ts`
- **Business Rules:**
  - Minimum query length: 2 characters.
  - Searches: quote title/number, invoice number, client name/email/company, contract name, project name/description.
  - All searches are case-insensitive and workspace-scoped.
  - Returns up to 5 results per entity type.
  - Each result includes: id, type, title, subtitle, href.

#### FR-1305: Onboarding Wizard
- **Description:** Setup wizard for new workspaces.
- **Server Actions:** In `onboarding/actions.ts`.
- **Steps:** Business profile, branding, payment setup, completion.
- **Business Rules:**
  - Tracks completion state in `workspace.settings.onboardingCompleted`.

#### FR-1306: Demo Mode
- **Description:** Full-interactivity demo with daily data reset.
- **Business Rules:**
  - Demo user identified by `DEMO_USER_EMAIL` env var or workspace slug match.
  - `isDemoSession()` checks email or slug.
  - Demo guard has been removed -- full interactivity allowed.
  - `/api/cron/reset-demo` Vercel cron job resets demo data daily.

---

## 3. Non-Functional Requirements

#### NFR-01: Multi-tenant Workspace Isolation
- Every database query includes `workspaceId` filter.
- `getCurrentUserWorkspace()` is called at the entry point of every server action.
- Active workspace stored in HTTP-only cookie.
- Queries also filter `deletedAt: null` for soft-deleted records.

#### NFR-02: Soft Deletes
- All important entities use `deletedAt` timestamp instead of hard deletes.
- Affected models: Client, Quote, Invoice, Contract, ContractInstance, RateCard, RateCardCategory, TaxRate, Project, Workspace.
- Delete operations set `deletedAt = new Date()`.

#### NFR-03: Audit Trails
- `QuoteEvent` tracks all quote lifecycle events: created, sent, viewed, accepted, declined, expired, converted_to_invoice, status changes.
- `InvoiceEvent` tracks all invoice lifecycle events: created, sent, viewed, paid, voided, payment_recorded, payment_received, status changes.
- Events record: actorId, actorType (user/system), metadata (JSON), ipAddress, userAgent.
- Contracts track: signedAt, signerIpAddress, signatureData.

#### NFR-04: Atomic Number Sequence Generation
- Quote and invoice numbers use `$transaction` with `upsert` on the `NumberSequence` table.
- Compound unique key: `workspaceId_type`.
- Atomic increment prevents race conditions in concurrent environments.
- Format: `{prefix}-{paddedValue}[-{suffix}]`.

#### NFR-05: Database Stores Dollars (Not Cents)
- All monetary values (rate, amount, subtotal, total, amountPaid, amountDue) are stored in dollars as `Decimal(12,2)`.
- `rate: 150` means $150, NOT $1.50.
- The global `formatCurrency()` utility does NOT divide by 100.
- Exception: Stripe integration converts to cents (`Math.round(amount * 100)`) only when creating payment intents.

#### NFR-06: Server Components First
- Default to React Server Components.
- `'use client'` directive used only for: event handlers, browser APIs, React hooks (useState, useEffect), third-party client libraries.
- Server Actions (`'use server'`) are the primary API for mutations.
- REST API routes exist as secondary/fallback endpoints.

#### NFR-07: Responsive Design
- Mobile-first Tailwind CSS utility classes.
- Mobile navigation component for small screens.
- Sidebar collapses on mobile.

#### NFR-08: WCAG AA Accessibility
- Skip-to-content link component.
- Semantic HTML structure.
- Shadcn UI components built on Radix primitives with accessibility features.

#### NFR-09: Dark/Light Theme Support
- Implemented via `next-themes` ThemeProvider.
- Theme toggle component in header.
- All pages tested in both modes.

#### NFR-10: Auto-deploy from Main Branch
- Production URL: `https://quote-software-gamma.vercel.app`
- Vercel auto-deploys on push to `main`.
- `vercel.json` buildCommand includes `npx prisma db push --accept-data-loss` for schema sync.
- Deployment takes approximately 2 minutes.

---

## 4. Data Constraints

| Constraint | Details |
|-----------|---------|
| Quote/invoice numbers | Unique per workspace (enforced by `NumberSequence` atomic upsert) |
| Client email | Unique per workspace (enforced by duplicate check on import; Prisma unique constraint) |
| Access tokens | UUIDs auto-generated by Prisma `@default(uuid())` for public portal URLs |
| Monetary values | `Decimal(12,2)` stored in dollars; rounded to 2 decimal places in calculations |
| JSON fields | `settings`, `address`, `billingAddress`, `metadata`, `variables`, `signatureData` stored as JSONB |
| Workspace slug | Globally unique, recorded in `WorkspaceSlugHistory` on change |
| Soft deletes | `deletedAt DateTime?` on all important entities; all queries filter `deletedAt: null` |
| Status enums | Stored as strings; validated by server action state machines (not DB-level enums) |
| File uploads | Tracked via `Attachment` model: filename, filePath, fileSize, mimeType, entityType/entityId |
| Tax rates | `Decimal` rate stored as percentage value (e.g., `10.0` = 10%); only one default per workspace |
| Number sequences | Prefix max 10 chars, suffix max 10 chars, padding 1-10, currentValue non-negative integer |
| Search minimum | Global search requires minimum 2 characters |
| Pagination defaults | Clients: 20/page, Rate cards: 20/page, Projects: 25/page, Contracts: 10/page |
