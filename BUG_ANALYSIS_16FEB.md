# Bug Analysis Report - Fixes16feb.pdf

**Date:** 2026-02-17
**Source:** Production demo at https://quote-software-gamma.vercel.app/login
**Total Bugs:** 22

## Classification Summary

| Category | Count | Bugs |
|----------|-------|------|
| Application-wide bugs | 14 | #1, #3, #4, #7, #8, #9, #10, #11, #14, #15, #16, #18, #21, #22 |
| Demo-only issues | 4 | #5, #6, #12, #17 |
| Incomplete features | 3 | #2, #16, #19 |
| Not reproduced / unclear | 2 | #13, #20 |

## Detailed Root Cause Analysis

### CRITICAL BUGS (break core functionality)

| # | Bug | Root Cause | File | Scope |
|---|-----|-----------|------|-------|
| 11 | Send quote says "quote not found" | `sendQuote()` uses `findUnique()` with compound where (id + workspaceId) which Prisma doesn't support | `lib/quotes/actions.ts:527-531` | App-wide |
| 1 | Failed to create invoice, no error | Generic catch swallows actual error including DemoModeError | `invoices/new/page.tsx:123-127` | App-wide |
| 5+6 | No clients/projects in invoice dropdown | Hardcoded `<SelectItem value="demo-client">` instead of DB fetch | `invoices/new/page.tsx:199` | Demo-only |
| 21 | Dark mode: white text on white bg | Hardcoded `bg-white` instead of `bg-card` | Multiple detail pages | App-wide |

### HIGH SEVERITY (features visibly broken)

| # | Bug | Root Cause | File | Scope |
|---|-----|-----------|------|-------|
| 3 | Table rows not clickable | No `onClick` handler on `<TableRow>` | `data-table.tsx:120-129` | App-wide |
| 10 | Internal notes disabled in quotes | Hardcoded `disabled` attribute, no store method | `NotesSection.tsx:56` | App-wide |
| 12 | Save quote fails | `assertNotDemo()` blocks, error not surfaced | `quotes/actions.ts:92,163` | Demo-only |
| 15 | Download PDF disabled in quotes | Hardcoded `disabled`, no onClick handler | `QuoteEditor.tsx:583` | App-wide |
| 18 | Account name doesn't update | DB updated but NextAuth session not refreshed | `auth/actions.ts:87-126` | App-wide |
| 22 | Import from rate cards doesn't work | Just a `<Link>` to /rate-cards, no import flow | `ItemsSection.tsx:49-52` | App-wide |

### MEDIUM SEVERITY (UX / design issues)

| # | Bug | Root Cause | File | Scope |
|---|-----|-----------|------|-------|
| 4 | Inconsistent status badge styles | Three different style maps across entities | Multiple columns files | App-wide |
| 7 | Memo dropdown options don't work | No onClick/onSelect handlers on menu items | `invoices/new/page.tsx:360-364` | App-wide |
| 8 | Memo/terms not shown in invoice preview | Preview card omits notes/terms sections | `invoices/new/page.tsx:412-485` | App-wide |
| 9 | Invoices vs quotes have different UI | Different design paradigms (tabs vs flat) | Design decision | App-wide |
| 14 | Client URL rejects non-https URLs | Zod `.url()` requires protocol prefix | `validations/common.ts:49-54` | App-wide |
| 16 | Tax rates don't apply to invoices/quotes | Line items store raw Decimal, not TaxRate reference | `schema.prisma:708-725` | App-wide |

### LOW SEVERITY / NOT CONFIRMED

| # | Bug | Root Cause | File | Scope |
|---|-----|-----------|------|-------|
| 2 | Invoice settings not implemented | Only number sequencing exists | `settings/invoices/page.tsx` | Incomplete |
| 13 | Cross-workspace data leak | Proper filtering found in code | Not confirmed | Needs testing |
| 17 | Email not setup | SMTP not configured, invite has TODO | `settings/actions.ts:657-701` | Demo/infra |
| 19 | No bulk edit on tables | Checkbox exists but no action buttons | `data-table-toolbar.tsx:150-157` | Missing feature |
| 20 | Contracts broken | No clear code-level breakage | Needs runtime testing | Unclear |

## Why These Bugs Weren't Caught

| Root Cause Category | Bugs | Explanation |
|---------------------|------|-------------|
| Stub/placeholder UI shipped | #7, #10, #15, #22 | Buttons rendered with `disabled` or no handlers |
| No error surfacing | #1, #11, #12 | Generic catch blocks swallow meaningful errors |
| Hardcoded demo data | #5, #6 | Invoice form hardcodes fake client ID |
| Missing integration | #8, #16, #18 | Features exist in isolation but aren't connected |
| No dark mode testing | #21 | Hardcoded `bg-white` instead of theme-aware classes |
| Inconsistent patterns | #3, #4, #9 | No shared status badge, no row-click behavior |

## Fix Plan

### Phase 1 — Critical Fixes
1. Bug #11 — `findUnique()` → `findFirst()` in sendQuote
2. Bug #1 — Surface error messages in invoice creation
3. Bug #5+6 — Fetch real clients for invoice form
4. Bug #21 — Replace `bg-white` with `bg-card`

### Phase 2 — High Severity Fixes
5. Bug #3 — Add row click handler to data tables
6. Bug #10 — Enable internal notes in quotes
7. Bug #15 — Implement or remove PDF download button
8. Bug #18 — Refresh NextAuth session after profile update
9. Bug #22 — Rate card import dialog
10. Bug #12 — Surface DemoModeError message

### Phase 3 — UX Polish
11. Bug #4 — Unified StatusBadge component
12. Bug #8 — Notes/terms in invoice preview
13. Bug #7 — Implement or remove memo dropdown
14. Bug #14 — Auto-prepend https:// for plain domains
15. Bug #9 — Align invoice/quote editors

### Phase 4 — Feature Completion
16. Bug #16 — Tax rate selector in line items
17. Bug #2 — Invoice settings (payment terms, defaults)
18. Bug #19 — Bulk action toolbar
19. Bug #17 — SMTP setup documentation

### Phase 5 — Investigation
20. Bug #13 — Test cross-workspace isolation
21. Bug #20 — Debug contracts at runtime
