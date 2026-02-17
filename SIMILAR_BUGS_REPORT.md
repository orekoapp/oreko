# Similar Bugs Report - Quote Software

**Date:** February 17, 2026
**Context:** After fixing 15 production bugs from Fixes16feb.pdf, a comprehensive scan was performed to find similar patterns across the codebase.

---

## Category 1: Prisma `findUnique` Misuse (4 additional bugs)

**Original Bug:** Bug #11 - `sendQuote()` used `findUnique` with non-unique compound where clause (`{ id, workspaceId }`).

### Bug S-1: PDF Generation - `getQuotePdfData()`
- **File:** `apps/web/lib/pdf/actions.ts` (lines 100-104)
- **Issue:** `findUnique` with `{ accessToken, deletedAt: null }` - `accessToken` is not a unique field
- **Fix:** Change to `findFirst`

### Bug S-2: PDF Generation - `getInvoicePdfData()`
- **File:** `apps/web/lib/pdf/actions.ts` (lines 280-284)
- **Issue:** Same `findUnique` with `{ accessToken, deletedAt: null }` pattern
- **Fix:** Change to `findFirst`

### Bug S-3: Quote Portal - `getQuoteForPortal()`
- **File:** `apps/web/lib/quotes/portal-actions.ts` (lines 88-92)
- **Issue:** `findUnique` with `{ accessToken, deletedAt: null }` compound where
- **Fix:** Change to `findFirst`

### Bug S-4: Invoice Portal - `getInvoiceForPortal()`
- **File:** `apps/web/lib/invoices/portal-actions.ts` (lines 92-120)
- **Issue:** `findUnique` with non-unique compound where clause
- **Fix:** Change to `findFirst`

---

## Category 2: Dark Mode / Hardcoded Colors (12+ instances)

**Original Bug:** Bug #21 - `bg-white` hardcoded on detail pages, invisible in dark mode.

### High Severity (visible in dark mode)
| File | Line(s) | Issue |
|------|---------|-------|
| `components/settings/email-template-form.tsx` | multiple | `bg-white` in email preview |
| `components/shared/signature-pad.tsx` | multiple | `bg-white` canvas background |
| `components/shared/logo-upload.tsx` | multiple | `bg-white` logo preview area |
| `components/quotes/editor/document-canvas.tsx` | multiple | `bg-white` document canvas |
| `components/quotes/editor/QuoteEditor.tsx` | multiple | `bg-white` in preview sections |

### Medium Severity (subtle dark mode issues)
| File | Line(s) | Issue |
|------|---------|-------|
| `components/dashboard/recent-items.tsx` | multiple | `bg-gray-50` background |
| `components/invoices/invoice-portal-view.tsx` | multiple | `bg-gray-50` sections |
| `components/settings/team-member-list.tsx` | multiple | `text-gray-*` hardcoded |
| `components/dashboard/recent-activity.tsx` | multiple | `bg-gray-50` cards |

**Fix Pattern:** Replace `bg-white` with `bg-card`, `bg-gray-50` with `bg-muted`, `text-gray-*` with `text-muted-foreground`.

---

## Category 3: Stub / Disabled UI Elements (5 issues)

**Original Bug:** Bug #10 - Internal notes textarea hardcoded as `disabled`.

### Bug S-5: Disabled "Accept & Pay Deposit" Button
- **File:** `components/quotes/editor/QuoteEditor.tsx` (lines 562-564)
- **Issue:** Button rendered as `disabled` with no onClick handler in payment preview mode
- **Severity:** HIGH - Core payment feature

### Bug S-6: Disabled "Download PDF Preview" Button
- **File:** `components/quotes/editor/QuoteEditor.tsx` (lines 585-588)
- **Issue:** Button rendered as `disabled` with no onClick handler in PDF preview mode
- **Severity:** HIGH - Core feature

### Bug S-7: Non-functional Help Topic Cards
- **File:** `app/(dashboard)/help/page.tsx` (lines 106-117)
- **Issue:** Cards have `cursor-pointer` and `hover:shadow-md` but no `onClick` or `href`
- **Severity:** MEDIUM - UX misleading

### Bug S-8: Disabled "Coming Soon" Live Chat
- **File:** `app/(dashboard)/help/page.tsx` (lines 166-168)
- **Issue:** `available: false` flag renders disabled "Coming Soon" button
- **Severity:** LOW - Feature not yet implemented

### Bug S-9: Email Preview Without Send Action
- **File:** `components/quotes/editor/QuoteEditor.tsx` (lines 567-581)
- **Issue:** Email preview text displayed but no action button to send
- **Severity:** MEDIUM

---

## Category 4: Silent Error Handling (18+ instances)

**Original Bug:** Bug #1 - Invoice creation showed generic "Something went wrong" instead of actual error.

### Critical (user-facing operations with swallowed errors)
| File | Function/Handler | Issue |
|------|-----------------|-------|
| `components/contracts/contract-template-form.tsx` | `onSubmit` catch | Catches error, logs to console, no user feedback |
| `components/contracts/contract-template-list.tsx` | `handleDuplicate` | Silent catch with `console.error` only |
| `components/contracts/contract-template-list.tsx` | `handleDelete` | Silent catch with `console.error` only |
| `components/rate-cards/rate-card-list.tsx` | 3 handlers | All have silent `console.error` catches |

### Medium (data operations with generic errors)
| File | Function/Handler | Issue |
|------|-----------------|-------|
| `components/clients/client-detail.tsx` | error handler | Generic error message |
| `components/projects/project-detail.tsx` | error handler | Generic error message |
| `components/quotes/quotes-data-table.tsx` | 2 handlers | Generic error feedback |
| `components/invoices/invoices-data-table.tsx` | 2 handlers | Generic error feedback |
| `components/contracts/contracts-data-table.tsx` | 2 handlers | Generic error feedback |
| `components/quotes/builder/builder-toolbar.tsx` | 2 handlers | Generic error feedback |
| `components/client-portal/accept-quote-dialog.tsx` | handler | Generic error message |

### Missing Error Boundaries
- `app/(dashboard)/quotes/[id]/page.tsx` - No error boundary for detail page
- `app/(dashboard)/invoices/[id]/page.tsx` - No error boundary for detail page
- `app/(dashboard)/clients/[id]/page.tsx` - No error boundary for detail page

---

## Category 5: Hardcoded Data / Missing Server-Side Fetching (8 issues)

**Original Bug:** Bug #5/#6 - Invoice creation used hardcoded client dropdown instead of fetched data.

### Bug S-10: Hardcoded Tax Rates
- **File:** `components/quotes/editor/sections/DetailsSection.tsx` (lines 124-136)
- **Issue:** Tax rates are 6 static `<SelectItem>` values (0%, 5%, 7.5%, 10%, 15%, 20%) instead of fetched from workspace settings
- **Severity:** HIGH

### Bug S-11: Missing Tax Rates in Rate Card Forms
- **File:** `app/(dashboard)/rate-cards/new/page.tsx` (line 51)
- **File:** `app/(dashboard)/rate-cards/[id]/edit/page.tsx` (line 95)
- **Issue:** `taxRates={[]}` with `// TODO: Load tax rates` comment
- **Severity:** HIGH

### Bug S-12: Client-Side Pages That Should Be Server Components
| File | Issue |
|------|-------|
| `app/(dashboard)/rate-cards/new/page.tsx` | `'use client'` - loads categories via useEffect |
| `app/(dashboard)/rate-cards/[id]/edit/page.tsx` | `'use client'` - loads data via useEffect, flicker |
| `app/(dashboard)/clients/[id]/edit/page.tsx` | `'use client'` - loads client via useEffect |
| `app/(dashboard)/projects/new/page.tsx` | `'use client'` - loads clients via useEffect |

**Fix Pattern:** Convert to async server components that fetch data before render, pass as props to client form components.

### Bug S-13: Hardcoded Expiration Periods
- **File:** `components/quotes/editor/sections/DetailsSection.tsx` (lines 111-119)
- **Issue:** Expiration options (7, 14, 30, 45, 60, 90 days) are hardcoded, not configurable per workspace

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| Prisma findUnique misuse | 4 | CRITICAL - Runtime errors on portal pages |
| Dark mode hardcoded colors | 12+ | HIGH - Broken dark mode experience |
| Stub/disabled UI elements | 5 | MEDIUM - Misleading UX |
| Silent error handling | 18+ | HIGH - Users get no feedback on errors |
| Hardcoded data / missing fetching | 8 | HIGH - Missing/incorrect data |
| **Total** | **47+** | |

## Recommended Fix Priority

1. **P0 (Critical):** Fix 4 `findUnique` bugs in portal/PDF actions (users can't view quotes/invoices via portal)
2. **P1 (High):** Fix silent error handling in contract/rate-card forms, add toast notifications
3. **P1 (High):** Fix dark mode `bg-white` issues in editor/signature/logo components
4. **P2 (Medium):** Convert client-side pages to server components, load tax rates
5. **P3 (Low):** Remove or implement stub UI elements, make expiration configurable
