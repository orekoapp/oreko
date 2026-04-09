# Oreko Bug Report - Feb 17, 2026

**Tester:** Automated Code Audit (adopting human tester mindset from Fixes16feb.pdf)
**Scope:** Demo user (demo@oreko.demo) + Test user (test@oreko.dev) - Full application
**Method:** Deep code analysis of every page, component, server action, and API route
**Total Bugs Found:** 73

---

## Summary by Severity

| Severity | Count |
|----------|-------|
| Critical | 8 |
| High | 15 |
| Medium | 25 |
| Low | 25 |
| **Total** | **73** |

## Summary by Area

| Area | Count |
|------|-------|
| Invoices | 20 |
| Quotes | 10 |
| Contracts/Clients/Projects | 15 |
| Settings/Auth/Dark Mode/Navigation | 20 |
| Rate Cards/Templates/Public Pages/Email | 8 |

---

## CRITICAL BUGS

### BUG-001 [CRITICAL] - Invoice edit page does not exist (404)
- **Area:** Invoices
- **Files:**
  - `apps/web/components/invoices/invoice-actions.tsx:74`
  - `apps/web/components/invoices/invoices-data-table.tsx:30`
  - `apps/web/components/invoices/invoice-table.tsx:30`
- **Description:** Multiple UI elements link to `/invoices/{id}/edit` but no edit page exists in the filesystem. Only `/invoices/new/` and `/invoices/[id]/` (detail) exist. Clicking edit results in a 404 error.
- **Expected:** Edit page opens with invoice data pre-populated for draft invoices.
- **Actual:** 404 Not Found.

### BUG-002 [CRITICAL] - "Import from Rate Cards" navigates away, loses all form data
- **Area:** Invoices + Quotes
- **Files:**
  - `apps/web/app/(dashboard)/invoices/new/new-invoice-form.tsx:287-289`
  - `apps/web/components/quotes/editor/sections/ItemsSection.tsx:49-52`
- **Description:** The "Import from Rate Cards" button is a `<Link>` to `/rate-cards`. Clicking it navigates the user away from the invoice/quote creation form, losing ALL entered data (client, items, dates, etc.). No modal or side panel is used.
- **Expected:** Opens a modal/dialog to select rate cards, then returns items to the form.
- **Actual:** Full page navigation to rate cards page; all form data is lost.

### BUG-003 [CRITICAL] - Stripe payment button is non-functional (console.log only)
- **Area:** Public Pages / Client Portal
- **File:** `apps/web/components/client-portal/invoice-portal-view.tsx:76-79`
- **Description:** The "Pay" button on the client-facing invoice portal calls `handlePayment()` which contains only a `TODO` comment and `console.log()`. No Stripe checkout session, no payment intent, no redirect. Clients cannot pay invoices.
- **Expected:** Clicking "Pay" initiates Stripe payment flow.
- **Actual:** Nothing happens. Console log only.

### BUG-004 [CRITICAL] - Email notifications not implemented for ANY send actions
- **Area:** Invoices, Quotes, Contracts
- **Files:**
  - `apps/web/lib/invoices/actions.ts:553` - `// TODO: Send email`
  - `apps/web/lib/quotes/portal-actions.ts` - TODO in acceptQuote
  - `apps/web/lib/contracts/actions.ts:489,519` - TODO comments
- **Description:** The `sendInvoice()`, `sendQuote()`, `sendContract()`, and acceptance confirmation functions all have TODO comments instead of actual email sending. Users can click "Send" but no email reaches the client.
- **Expected:** Clients receive email notifications when quotes/invoices/contracts are sent.
- **Actual:** Status updated in database only; no email sent.

### BUG-005 [CRITICAL] - Invoice preview tabs (Email, PDF) are non-functional
- **Area:** Invoices
- **File:** `apps/web/app/(dashboard)/invoices/new/new-invoice-form.tsx:500-502`
- **Description:** The new invoice form has three preview tabs (Payment Page, Email Preview, Invoice PDF). Only the Payment Page tab renders content. Switching to Email or PDF tabs shows the same payment preview or empty content.
- **Expected:** Each tab shows appropriate preview (email template, PDF layout, payment page).
- **Actual:** Only payment preview renders regardless of selected tab.

### BUG-006 [CRITICAL] - Invoice status enum mismatch causes validation failures
- **Area:** Invoices
- **Files:**
  - `apps/web/lib/validations/invoice.ts:7-13` (schema: `partially_paid`, `cancelled`, `refunded`)
  - `apps/web/lib/invoices/types.ts:5-13` (code: `partial`, `voided`)
- **Description:** Zod validation schema uses `partially_paid` but runtime code uses `partial`. Schema uses `cancelled` but code uses `voided`. Schema has `refunded` which doesn't exist in code. Status updates that use the wrong enum will fail validation silently.
- **Expected:** Consistent status enums across validation and runtime.
- **Actual:** Two different sets of statuses; validation will reject valid runtime statuses.

### BUG-007 [CRITICAL] - PDF download routes lack authentication check
- **Area:** API / Security
- **Files:**
  - `apps/web/app/api/download/invoice/[invoiceId]/route.ts:10-17`
  - `apps/web/app/api/download/quote/[quoteId]/route.ts:10-17`
- **Description:** The PDF download routes at `/api/download/invoice/[id]` and `/api/download/quote/[id]` have NO authentication check (`auth()` or session validation). Any unauthenticated user can attempt to download PDFs by guessing invoice/quote IDs.
- **Expected:** Only authenticated users with workspace access can download PDFs.
- **Actual:** No auth middleware; routes are publicly accessible.

### BUG-008 [CRITICAL] - Hardcoded invoice number "#0001" in preview
- **Area:** Invoices
- **File:** `apps/web/app/(dashboard)/invoices/new/new-invoice-form.tsx:435`
- **Description:** The invoice preview card always displays "Invoice #0001" regardless of the actual next invoice number from the numbering sequence settings.
- **Expected:** Preview shows the actual next invoice number that will be generated.
- **Actual:** Always shows hardcoded "#0001".

---

## HIGH SEVERITY BUGS

### BUG-009 [HIGH] - Internal notes are never saved to database (quotes)
- **Area:** Quotes
- **File:** `apps/web/components/quotes/editor/QuoteEditor.tsx:228-234`
- **Description:** The `handleSave()` function in QuoteEditor does NOT pass `internalNotes` to `updateQuote()`. The Notes section UI allows editing internal notes, but they are never persisted.
- **Expected:** Internal notes saved when quote is saved.
- **Actual:** Internal notes discarded on save; data loss.

### BUG-010 [HIGH] - "Send to Client" button on quote detail page has no click handler
- **Area:** Quotes
- **File:** `apps/web/app/(dashboard)/quotes/[id]/page.tsx:76-80`
- **Description:** The "Send to Client" button for draft quotes is a plain `<Button>` with no `onClick` handler, `asChild`, or Link wrapper. Clicking it does absolutely nothing.
- **Expected:** Clicking sends quote to client (email + status change).
- **Actual:** Button is non-functional.

### BUG-011 [HIGH] - "Duplicate Quote" button has no click handler
- **Area:** Quotes
- **File:** `apps/web/app/(dashboard)/quotes/[id]/page.tsx:60-63`
- **Description:** The "Duplicate" button is a plain `<Button>` with no handler. The `duplicateQuote` action exists in the codebase but is not wired to this button.
- **Expected:** Clicking creates a copy of the current quote.
- **Actual:** Button does nothing.

### BUG-012 [HIGH] - Payment method validation mismatch between UI and schema
- **Area:** Invoices
- **Files:**
  - `apps/web/lib/validations/invoice.ts:19-24` (schema: `stripe`, `bank_transfer`, `check`, `cash`, `other`)
  - `apps/web/components/invoices/record-payment-dialog.tsx:34-37` (dialog: `card`, `bank_transfer`, `cash`, `other`)
- **Description:** RecordPaymentDialog allows `card` but schema expects `stripe`. Schema supports `check` but dialog doesn't. Recording a payment with "card" will fail server-side validation.
- **Expected:** Payment methods match between UI and validation.
- **Actual:** Mismatch causes validation rejection when recording card payments.

### BUG-013 [HIGH] - Projects bulk delete only deletes FIRST selected item
- **Area:** Projects
- **File:** `apps/web/components/projects/project-list.tsx:201`
- **Description:** When multiple projects are selected, the bulk delete button shows "Delete N" count but only passes `selected[0]` to the delete function. Only the first selected project gets deleted.
- **Expected:** All selected projects are deleted.
- **Actual:** Only first selected project deleted; rest remain.

### BUG-014 [HIGH] - Signature pad ink is hardcoded black - invisible in dark mode
- **Area:** Dark Mode / Client Portal
- **Files:**
  - `apps/web/components/client-portal/signature-pad.tsx:75` - `penColor="black"`
  - `apps/web/components/contracts/signature-pad.tsx:39` - `ctx.strokeStyle = '#000'`
- **Description:** Both signature pad components hardcode ink color to black. On dark mode backgrounds, signatures are invisible.
- **Expected:** Ink color adapts to theme (black in light, white in dark).
- **Actual:** Always black; invisible on dark backgrounds.

### BUG-015 [HIGH] - Document canvas hardcoded bg-white without dark mode variant
- **Area:** Dark Mode / Quotes
- **File:** `apps/web/components/quotes/builder/document-canvas.tsx`
- **Description:** The quote builder document canvas uses `bg-white` without `dark:` variants. In dark mode, this creates a jarring white rectangle or contrast issues.
- **Expected:** Document maintains white for print fidelity; surrounding UI respects dark mode.
- **Actual:** Hardcoded white only.

### BUG-016 [HIGH] - Account name update doesn't propagate to session/JWT
- **Area:** Settings / Auth
- **Files:**
  - `apps/web/lib/auth/actions.ts:100-125` - `updateProfile` function
  - `apps/web/lib/auth/config.ts:49-66` - JWT callback
- **Description:** The `updateProfile` action updates the DB and calls `router.refresh()`, but doesn't trigger a JWT token refresh via `update()` from `next-auth/react`. The session name doesn't update until the user logs out and back in.
- **Expected:** Updated name appears immediately in header after save.
- **Actual:** Old name persists until logout + login.

### BUG-017 [HIGH] - Missing email on contract send and sign operations
- **Area:** Contracts
- **File:** `apps/web/lib/contracts/actions.ts:489,519`
- **Description:** `sendContract()` and `signContract()` have `// TODO: Send email notification` comments. Clients receive no notification when contracts are sent for signature or when signed.
- **Expected:** Email sent to client when contract sent/signed.
- **Actual:** No email; only DB status updated.

### BUG-018 [HIGH] - Tax rate from form editor not saved to database (quotes)
- **Area:** Quotes
- **File:** `apps/web/components/quotes/editor/QuoteEditor.tsx:87,390`
- **Description:** The QuoteEditor has a `taxRate` state variable used for preview calculations, but `handleSave()` (lines 209-245) never passes tax rate to `createQuote()` or `updateQuote()`. Tax rate is cosmetic only in form editor.
- **Expected:** Tax rate saved to database with quote.
- **Actual:** Tax rate only used for preview; lost on save.

### BUG-019 [HIGH] - Contract instances listing shows deleted records
- **Area:** Contracts
- **File:** `apps/web/lib/contracts/actions.ts:222-277`
- **Description:** `getContractInstances()` doesn't include `deletedAt: null` in the where clause, unlike other list queries (`getClients`, `getQuotes`). Soft-deleted contracts appear in the list.
- **Expected:** Only non-deleted instances listed.
- **Actual:** Deleted contract instances appear in list.

### BUG-020 [HIGH] - Client type filter parameter is ignored in backend
- **Area:** Clients
- **Files:**
  - `apps/web/app/(dashboard)/clients/page.tsx:118-124` - passes type filter
  - `apps/web/lib/clients/actions.ts:35-115` - no type filter implemented
- **Description:** The clients page passes a `type` parameter (`individual`/`company`) from the UI filter, but `getClients()` doesn't implement type filtering. The filter dropdown exists but does nothing.
- **Expected:** Filtering by individual/company works.
- **Actual:** Type filter completely ignored; all clients shown regardless.

### BUG-021 [HIGH] - "Options" dropdown items on invoice form are non-functional stubs
- **Area:** Invoices
- **File:** `apps/web/app/(dashboard)/invoices/new/new-invoice-form.tsx:194-196`
- **Description:** The "Options" dropdown contains "Add custom field", "Set default values", "Import from template" - none have onClick handlers. All three are clickable but do nothing.
- **Expected:** Menu items are functional or hidden until implemented.
- **Actual:** Clickable stubs with no functionality.

### BUG-022 [HIGH] - Invoice PDF download serves HTML, not PDF
- **Area:** Quotes
- **File:** `apps/web/app/(dashboard)/quotes/[id]/page.tsx:65`
- **Description:** The "Download PDF" button links to `/api/pdf/quote/${id}` which returns `Content-Type: text/html` (route.ts line 26), not `application/pdf`. The button opens an HTML page instead of downloading a PDF.
- **Expected:** Button downloads a PDF file.
- **Actual:** Opens an HTML page in new tab.

### BUG-023 [HIGH] - Payment processing fees flag stored but never applied
- **Area:** Payments
- **File:** `apps/web/lib/payments/actions.ts:67-69,260-270`
- **Description:** Payment settings store `passProcessingFees` flag, but the payment intent creation logic never adds Stripe processing fees to the amount even when enabled.
- **Expected:** When `passProcessingFees=true`, Stripe fees added to payment amount.
- **Actual:** Flag ignored; payment amount unchanged.

---

## MEDIUM SEVERITY BUGS

### BUG-024 [MEDIUM] - Visual Builder send button uses wrong action
- **Area:** Quotes
- **File:** `apps/web/components/quotes/builder/builder-toolbar.tsx:115`
- **Description:** Builder toolbar "Send" calls `updateQuoteStatus(id, 'sent')` instead of `sendQuote(quoteId)`. The correct `sendQuote()` validates client email and logs the send event. Builder bypasses these checks.
- **Expected:** Uses `sendQuote()` with proper validation.
- **Actual:** Uses `updateQuoteStatus()` which skips email validation.

### BUG-025 [MEDIUM] - Quote status badges missing dark mode on detail page
- **Area:** Quotes / Dark Mode
- **File:** `apps/web/app/(dashboard)/quotes/[id]/page.tsx:16-24`
- **Description:** Status color mappings use hardcoded light-mode colors (`bg-gray-100`, `text-gray-700`). No `dark:` variants. Unreadable in dark mode.
- **Expected:** Status badges readable in both light and dark modes.
- **Actual:** Poor contrast in dark mode.

### BUG-026 [MEDIUM] - Client URL validation inconsistency
- **Area:** Clients
- **File:** `apps/web/lib/validations/common.ts:50-60`
- **Description:** URL schema transforms plain domains to add `https://` prefix then validates. But the transform is redundant since it auto-corrects. Users see "Please enter a URL" error for `google.com` but the code should accept it.
- **Expected:** Accept `google.com` and auto-prepend `https://`.
- **Actual:** Validation error shown to user despite auto-correction logic.

### BUG-027 [MEDIUM] - Logo upload uses object URL - lost on page refresh
- **Area:** Invoices / Quotes
- **File:** `apps/web/components/shared/logo-upload.tsx:60-65`
- **Description:** Logo upload uses `URL.createObjectURL()` which is revoked on unmount/refresh. Logo preview breaks on page reload. No persistent storage (S3, base64, etc.).
- **Expected:** Logo persisted to storage service.
- **Actual:** Logo lost on page refresh.

### BUG-028 [MEDIUM] - Invoice settings stored as empty object, defaults applied at read time
- **Area:** Invoices
- **File:** `apps/web/lib/invoices/actions.ts:116`
- **Description:** Creating an invoice stores `settings: {}`. Defaults only applied when reading via `getInvoice()`. This creates inconsistency between stored and read-time data.
- **Expected:** Settings initialized with DEFAULT_INVOICE_SETTINGS on create.
- **Actual:** Empty object stored; defaults applied inconsistently.

### BUG-029 [MEDIUM] - Tax rate per-line-item field unused; global tax calculation confusing
- **Area:** Invoices
- **File:** `apps/web/app/(dashboard)/invoices/new/new-invoice-form.tsx:73`
- **Description:** Each line item has an optional `taxRate` field that's never set. Global `taxRate` used for calculation only, not stored per item. Changing global rate retroactively changes existing invoices' calculations.
- **Expected:** Tax rate stored per item or clearly documented as global.
- **Actual:** Confusing mix of per-item (unused) and global (not persisted) tax.

### BUG-030 [MEDIUM] - Contract required variables not enforced in form submission
- **Area:** Contracts
- **Files:**
  - `apps/web/components/contracts/variable-manager.tsx`
  - `apps/web/components/contracts/create-contract-form.tsx:211-252`
- **Description:** Variables can be marked `required: true` in templates, but the form that creates contract instances doesn't enforce required fields. Users can submit with empty required variables.
- **Expected:** Form prevents submission with empty required variables.
- **Actual:** Form allows empty required variables.

### BUG-031 [MEDIUM] - Recent items status badges use inline color maps, no dark mode
- **Area:** Dashboard / Dark Mode
- **File:** `apps/web/components/dashboard/recent-items.tsx:18-46`
- **Description:** Dashboard recent items define `quoteStatusColors` and `invoiceStatusColors` as inline objects with hardcoded light-mode classes. Doesn't use Badge component's dark mode variants.
- **Expected:** Uses Badge component for consistent theming.
- **Actual:** Inline className color maps without dark mode.

### BUG-032 [MEDIUM] - Branding presets have no click handler
- **Area:** Settings
- **File:** `apps/web/components/settings/branding-settings-form.tsx:47-90`
- **Description:** Branding form shows color presets but clicking a preset does nothing. No `onClick` handler wired to update form values.
- **Expected:** Clicking preset updates color inputs and shows live preview.
- **Actual:** Presets displayed but non-functional.

### BUG-033 [MEDIUM] - Number sequence form lacks server-side validation
- **Area:** Settings
- **File:** `apps/web/components/settings/number-sequence-form.tsx:85-92`
- **Description:** Padding input has `min="1"` and `max="10"` HTML attributes only. No server-side validation in `updateNumberSequence`. Bypassing client validation can set invalid padding.
- **Expected:** Server-side validation enforces 1-10 range.
- **Actual:** Only client-side HTML validation.

### BUG-034 [MEDIUM] - Invoice settings page incomplete - only numbering shown
- **Area:** Settings
- **File:** `apps/web/app/(dashboard)/settings/invoices/page.tsx`
- **Description:** Invoice settings page only shows number sequence configuration. Missing payment terms defaults, due date config, late payment settings, and reminder settings per spec.
- **Expected:** Full invoice configuration (payment terms, due dates, reminders).
- **Actual:** Only number sequence form.

### BUG-035 [MEDIUM] - Tax rate settings don't propagate to quote/invoice creation
- **Area:** Settings / Invoices / Quotes
- **Description:** Tax rates configured in Settings > Tax Rates are saved to the database, but the invoice and quote creation forms use a hardcoded dropdown of tax rates (0%, 5%, 10%, etc.) instead of fetching from the workspace's configured tax rates.
- **Expected:** Tax rate dropdown populated from workspace's configured rates.
- **Actual:** Hardcoded percentage list; custom rates ignored.

### BUG-036 [MEDIUM] - "Pay Now" button permanently disabled in invoice preview
- **Area:** Invoices
- **File:** `apps/web/app/(dashboard)/invoices/new/new-invoice-form.tsx:501`
- **Description:** The "Pay Now" button in new invoice preview is disabled with no tooltip or explanation. Users see a greyed-out button without understanding why.
- **Expected:** Button removed or tooltip explains "Available after invoice is sent".
- **Actual:** Disabled button with no context.

### BUG-037 [MEDIUM] - Tax rate decimal precision not validated
- **Area:** Settings
- **File:** `apps/web/components/settings/tax-rates-manager.tsx:75-80`
- **Description:** Tax rate input parses as float without limiting decimal places. Users can enter `5.123456%` which stores unexpected precision.
- **Expected:** Limited to 2 decimal places.
- **Actual:** Accepts any decimal precision.

### BUG-038 [MEDIUM] - ProjectSelector silently fails without user feedback
- **Area:** Projects
- **File:** `apps/web/components/projects/project-selector.tsx:41-51`
- **Description:** When `getClientProjects` fails, error is caught and projects set to empty array. No toast or error message shown. User sees empty dropdown without knowing why.
- **Expected:** Error toast shown on load failure.
- **Actual:** Silent failure; empty dropdown.

### BUG-039 [MEDIUM] - Download PDF button on invoice portal is non-functional
- **Area:** Public Pages
- **File:** `apps/web/components/client-portal/invoice-portal-header.tsx:40-43`
- **Description:** The "Download PDF" button in invoice portal header has no `onClick` or `href`. Dead button.
- **Expected:** Downloads invoice as PDF.
- **Actual:** Button does nothing.

### BUG-040 [MEDIUM] - Templates page only shows contracts, misleading route
- **Area:** Templates
- **File:** `apps/web/app/(dashboard)/templates/page.tsx:52-54`
- **Description:** Route `/templates` only shows "Contract Templates" using `ContractTemplateList`. No quote templates or invoice templates. Route name suggests general templates.
- **Expected:** Clear distinction between template types, or templates for all document types.
- **Actual:** Only contract templates under generic "Templates" name.

### BUG-041 [MEDIUM] - Workspace settings form type mismatch with action
- **Area:** Settings
- **Files:**
  - `apps/web/components/settings/workspace-settings-form.tsx:9`
  - `apps/web/lib/settings/actions.ts:813`
- **Description:** Form imports `WorkspaceSettings` type (includes `id`) but action `updateWorkspaceSettings` expects `{ name?: string; slug?: string }`. Type mismatch between form and action.
- **Expected:** Consistent types.
- **Actual:** Type mismatch.

### BUG-042 [MEDIUM] - New contract page loads 100 full client objects for dropdown
- **Area:** Contracts / Performance
- **File:** `apps/web/app/(dashboard)/contracts/new/page.tsx:26-29`
- **Description:** Uses `getClients({ limit: 100 })` instead of lightweight `getClientsForSelect()`. Fetches full client objects with all fields for a simple dropdown.
- **Expected:** Use `getClientsForSelect()` for dropdown.
- **Actual:** Full client objects fetched unnecessarily.

### BUG-043 [MEDIUM] - Missing rate limit on invoices API (quotes has it)
- **Area:** API / Security
- **Files:**
  - `apps/web/app/api/invoices/route.ts:9-24` - no rate limit
  - `apps/web/app/api/quotes/route.ts:11-23` - has rate limit
- **Description:** Quotes API implements `checkRateLimit()` but invoices API does not. Inconsistent security.
- **Expected:** Both APIs have rate limiting.
- **Actual:** Only quotes API rate-limited.

### BUG-044 [MEDIUM] - Missing workspace isolation in project summary stats
- **Area:** Projects / Security
- **File:** `apps/web/lib/projects/actions.ts:440-471`
- **Description:** `getProjectSummaryStats` doesn't validate workspace ownership before calculating stats. Could potentially allow cross-workspace data leakage through aggregate queries.
- **Expected:** All queries scoped to current workspace.
- **Actual:** Potential for workspace data leak.

### BUG-045 [MEDIUM] - Invoice number generation uses createdAt ordering instead of numeric
- **Area:** Invoices
- **File:** `apps/web/lib/invoices/actions.ts:38-48`
- **Description:** `generateInvoiceNumber()` gets last invoice by `createdAt` ordering and extracts number. If clock skews or concurrent creates occur, duplicate or skipped numbers possible.
- **Expected:** Query by highest invoice number (numeric sort).
- **Actual:** Uses createdAt ordering which can be unreliable.

### BUG-046 [MEDIUM] - Landing page CTA section uses hardcoded colors
- **Area:** Landing Page
- **File:** `apps/web/components/landing/final-cta-section.tsx:13-46`
- **Description:** Final CTA uses hardcoded `bg-white text-blue-700` and `border-white/30 text-white` that assume specific background color. Won't adapt if design changes.
- **Expected:** Dynamic colors based on theme.
- **Actual:** Hardcoded values.

### BUG-047 [MEDIUM] - Success message in workspace form hardcoded green
- **Area:** Settings / Dark Mode
- **File:** `apps/web/components/settings/workspace-settings-form.tsx:42`
- **Description:** Uses `text-green-600` without `dark:text-green-400` variant. Hard to read on dark backgrounds.
- **Expected:** Visible in both themes.
- **Actual:** Poor contrast in dark mode.

### BUG-048 [MEDIUM] - Invoice status badge colors use inline classes instead of Badge variants
- **Area:** Invoices / Design Consistency
- **File:** `apps/web/components/invoices/invoice-columns.tsx:14-22`
- **Description:** Status colors use inline `className` with hardcoded values (`bg-blue-500 hover:bg-blue-600`) instead of Badge component's variant system. Breaks design system consistency and dark mode.
- **Expected:** Use Badge component variants.
- **Actual:** Custom inline classes.

---

## LOW SEVERITY BUGS

### BUG-049 [LOW] - Activity section hardcoded "No activity yet" on invoice detail
- **Area:** Invoices
- **File:** `apps/web/app/(dashboard)/invoices/[id]/page.tsx:303-307`
- **Description:** Activity section never queries or displays activity history. Always shows "No activity yet" even for invoices with recorded payments or status changes.
- **Expected:** Displays invoice events (status changes, payments).
- **Actual:** Static "No activity yet" message.

### BUG-050 [LOW] - Client dropdown shows no required indicator
- **Area:** Invoices
- **File:** `apps/web/app/(dashboard)/invoices/new/new-invoice-form.tsx:200-221`
- **Description:** No asterisk, required indicator, or inline error message on the client dropdown label. Only toast error appears on submit attempt.
- **Expected:** Red asterisk or "required" indicator.
- **Actual:** No visual indication client is required.

### BUG-051 [LOW] - Quote "not found" error page lacks navigation options
- **Area:** Quotes
- **File:** `apps/web/app/(dashboard)/quotes/[id]/builder/page.tsx:165-175`
- **Description:** When a quote fails to load in builder, error page shows "Quote not found" with no link back to quotes list or helpful guidance.
- **Expected:** Error page with "Back to Quotes" link and guidance.
- **Actual:** Plain error message only.

### BUG-052 [LOW] - Rate Card import link navigates away from quote editor
- **Area:** Quotes
- **File:** `apps/web/components/quotes/editor/sections/ItemsSection.tsx:49-52`
- **Description:** Form editor uses `<Link to="/rate-cards">` while Visual Builder has a proper `RateCardPanel` side panel. Inconsistent approach between editors.
- **Expected:** Consistent import experience across editors.
- **Actual:** Form editor loses context; builder has proper panel.

### BUG-053 [LOW] - Contracts table row clickability not obvious
- **Area:** Contracts
- **Files:**
  - `apps/web/components/contracts/contracts-data-table.tsx:98`
  - `apps/web/components/contracts/contracts-columns.tsx:189-227`
- **Description:** Data table has `onRowClick` but no visible hover styling or cursor change to indicate clickability. Only eye icon suggests viewing. Users may not realize rows are clickable.
- **Expected:** Hover state and cursor pointer on rows.
- **Actual:** No visual indication of clickability.

### BUG-054 [LOW] - Project form missing Cancel button
- **Area:** Projects
- **File:** `apps/web/components/projects/project-form.tsx:122-130`
- **Description:** Form only has submit button, no cancel/back button. Inconsistent with ClientForm and ContractTemplateForm which have cancel options.
- **Expected:** Cancel button to return to project list.
- **Actual:** No cancel option.

### BUG-055 [LOW] - Contracts columns missing variable preview
- **Area:** Contracts
- **File:** `apps/web/components/contracts/contract-template-list.tsx:145-148`
- **Description:** Template list shows variable count but users can't preview variable details without opening the template. A tooltip or hover preview would help.
- **Expected:** Tooltip showing variable names on hover.
- **Actual:** Must open template to see details.

### BUG-056 [LOW] - Missing error handling for invalid invoice ID
- **Area:** Invoices
- **File:** `apps/web/app/(dashboard)/invoices/[id]/page.tsx:73`
- **Description:** Uses `notFound()` for missing invoice but doesn't catch other query errors (DB failures, connection issues). Page will crash on non-404 errors.
- **Expected:** Catches and displays error for database failures.
- **Actual:** Only handles "not found" case.

### BUG-057 [LOW] - Notification bell has no unread indicator implementation
- **Area:** Navigation / UI
- **File:** `apps/web/components/dashboard/app-header.tsx:230-250`
- **Description:** Notification dropdown always shows "No new notifications". No mechanism for red dot/badge when unread notifications exist.
- **Expected:** Visual indicator for unread notifications.
- **Actual:** Always empty state.

### BUG-058 [LOW] - Public portal pages lack dark mode support
- **Area:** Public Pages / Dark Mode
- **Files:**
  - `apps/web/app/q/[token]/page.tsx`
  - `apps/web/app/i/[token]/page.tsx`
  - `apps/web/app/c/[token]/page.tsx`
- **Description:** Portal components use hardcoded colors (#3B82F6) and Tailwind classes without `dark:` prefixes. Hard to read in dark mode.
- **Expected:** Portal pages adapt to user's dark mode preference.
- **Actual:** No dark mode support on public pages.

### BUG-059 [LOW] - Auth layout bg-muted/50 may have insufficient contrast in dark mode
- **Area:** Auth / Dark Mode
- **File:** `apps/web/app/(auth)/layout.tsx:2`
- **Description:** Semi-transparent `bg-muted/50` may create contrast issues in dark mode.
- **Expected:** Good contrast in both themes.
- **Actual:** Potentially reduced contrast.

### BUG-060 [LOW] - Missing ARIA label on user menu button
- **Area:** Accessibility
- **File:** `apps/web/components/dashboard/app-header.tsx:224-227`
- **Description:** User menu button has `data-testid` but no `aria-label`. Screen readers can't identify the button's purpose.
- **Expected:** `aria-label="User menu"` or equivalent.
- **Actual:** No descriptive label.

### BUG-061 [LOW] - Breadcrumb generation doesn't handle special characters
- **Area:** Navigation
- **File:** `apps/web/components/dashboard/app-header.tsx:85-110`
- **Description:** Breadcrumb splits on hyphens only. Route segments with underscores, dots, or other delimiters won't format correctly.
- **Expected:** Handles all common delimiters.
- **Actual:** Only hyphen-delimited slugs work.

### BUG-062 [LOW] - Invoice preview doesn't show unnamed items (form vs preview inconsistency)
- **Area:** Invoices
- **File:** `apps/web/app/(dashboard)/invoices/new/new-invoice-form.tsx:458-463`
- **Description:** Preview filters items by `.filter(item => item.name)`, hiding items being typed. Creates a confusing delay between form and preview.
- **Expected:** Preview shows all items or indicates "name required".
- **Actual:** Items disappear from preview until name is filled in.

### BUG-063 [LOW] - Billing page has hardcoded styling issues
- **Area:** Settings
- **File:** `apps/web/app/(dashboard)/settings/billing/page.tsx:49-65`
- **Description:** Payment method display uses `bg-muted` which works but card layout could have better dark mode contrast.
- **Expected:** Better dark mode contrast.
- **Actual:** Acceptable but suboptimal.

### BUG-064 [LOW] - Help page has no link to actual documentation
- **Area:** Help
- **File:** `apps/web/app/(dashboard)/help/page.tsx:16-37`
- **Description:** Help topics (Getting Started, Documentation, Video Tutorials, Tips & Tricks) are cards with no links. They're informational dead ends - users can't click through to actual content.
- **Expected:** Cards link to actual help content.
- **Actual:** Non-clickable cards with descriptions only.

### BUG-065 [LOW] - "Coming Soon" on Live Chat has no timeline
- **Area:** Help
- **File:** `apps/web/app/(dashboard)/help/page.tsx:46`
- **Description:** Live Chat shows "Coming Soon" disabled button with no ETA or alternative. Could frustrate users expecting support.
- **Expected:** Timeline or alternative contact method.
- **Actual:** Disabled button only.

### BUG-066 [LOW] - New project error display disconnected from form fields
- **Area:** Projects
- **File:** `apps/web/app/(dashboard)/projects/new/new-project-form-wrapper.tsx:24-37`
- **Description:** Errors caught and displayed above form, not integrated into field-level validation display. Errors appear disconnected from the fields that caused them.
- **Expected:** Errors shown contextually near relevant fields.
- **Actual:** Generic error above form.

### BUG-067 [LOW] - Workspace slug change in settings can break bookmarks
- **Area:** Settings
- **Description:** If a user changes their workspace slug in settings, all existing bookmarked URLs to their workspace become invalid. No redirect from old slug to new slug.
- **Expected:** Redirect from old slug or warning about URL change.
- **Actual:** Old URLs break silently.

### BUG-068 [LOW] - Memo section "Configure payment methods" option is a stub
- **Area:** Invoices
- **File:** `apps/web/app/(dashboard)/invoices/new/new-invoice-form.tsx` (Memo section Options dropdown)
- **Description:** All three options under Memo > Options dropdown ("Configure payment methods", "Set default notes", "Save as template") have no click handlers. Clickable but non-functional.
- **Expected:** Options are functional or hidden.
- **Actual:** Stub buttons that do nothing.

### BUG-069 [LOW] - Memo and Terms text not displayed in invoice preview
- **Area:** Invoices
- **Description:** When users type in "Notes for Client" and "Terms & Conditions" fields, the text does not appear in the invoice preview panel on the right. The preview only shows line items, totals, and client info.
- **Expected:** Memo and terms visible in preview.
- **Actual:** Not rendered in preview.

### BUG-070 [LOW] - No bulk actions on data tables (quotes, invoices, clients)
- **Area:** All tables
- **Description:** Selecting multiple rows via checkboxes shows a count ("N of M row(s) selected") but no bulk action buttons appear (bulk delete, bulk status change, bulk export). Selection is UI-only.
- **Expected:** Bulk action toolbar appears on selection.
- **Actual:** Row selection count shown but no bulk actions available.

### BUG-071 [LOW] - Table rows not directly clickable to open detail (invoices, some tables)
- **Area:** Invoices / Tables
- **Description:** Clicking a table row doesn't navigate to the detail page. Users must click the eye icon in the actions column. This is inconsistent with expected table behavior.
- **Expected:** Clicking anywhere on the row opens the detail page.
- **Actual:** Only eye icon opens detail.

### BUG-072 [LOW] - Invoice and Quote UI layout inconsistency
- **Area:** UI/UX
- **Description:** Invoices use a single-page form with inline line items. Quotes use a tabbed interface (Details, Items, Terms, Notes). The inconsistency confuses users switching between the two.
- **Expected:** Consistent layout between invoices and quotes.
- **Actual:** Different UX patterns for similar workflows.

### BUG-073 [LOW] - No "unsaved changes" warning when navigating away from forms
- **Area:** All forms
- **Description:** Invoice creation, quote editor, client form, and project form have no `beforeunload` event or navigation guard. Users can lose all entered data by accidentally clicking a sidebar link.
- **Expected:** Browser prompt "You have unsaved changes" on navigation.
- **Actual:** No warning; data lost silently.

---

## CROSS-REFERENCE: PDF Tester's Bugs (Fixes16feb.pdf) Status

| PDF Bug# | Description | Status in Code |
|----------|-------------|----------------|
| 1 | Failed to create invoice | BUG-006 (status enum mismatch) likely cause |
| 2 | Invoice settings not implemented | BUG-034 (settings page incomplete) |
| 3 | Table row click doesn't open item | BUG-071 (rows not clickable) |
| 4 | Status badge inconsistent styles | BUG-048, BUG-025, BUG-031 |
| 5 | No projects in invoice dropdown | BUG-038 (silent failure) |
| 6 | No clients in dropdown | Likely fixed in previous session |
| 7 | Memo options don't work | BUG-068 (stub buttons) |
| 8 | Memo/Terms not in preview | BUG-069 |
| 9 | Invoice vs Quote UI different | BUG-072 |
| 10 | Internal notes disabled | BUG-009 (never saved) |
| 11 | "Quote not found" on send | BUG-010 (no click handler) |
| 12 | Failed to save quote | BUG-009, BUG-018 (data not passed to action) |
| 13 | Cross-workspace data leakage | BUG-044 (missing workspace filter) |
| 14 | URL validation too strict | BUG-026 (validation inconsistency) |
| 15 | PDF download disabled | BUG-022 (serves HTML not PDF) |
| 16 | Tax rates don't show in quotes/invoices | BUG-035 (hardcoded dropdown) |
| 17 | Email not set up | BUG-004 (all email TODOs) |
| 18 | Account name not updated | BUG-016 (JWT not refreshed) |
| 19 | No bulk edit | BUG-070 (selection UI only) |
| 20 | Contracts broken | BUG-019 (deleted records shown) + runtime crash |
| 21 | Dark mode broken | BUG-014, BUG-015, BUG-025, BUG-031, BUG-058 |
| 22 | Import from rate cards broken | BUG-002 (navigates away, loses data) |

---

*Report generated: Feb 17, 2026*
*Method: Static code analysis across all application files*
