# Implementation Plan: New Design Integration

**Date:** 2026-02-21
**Branch:** `new-design`
**Prerequisite:** Review `docs/NEW_DESIGN_ANALYSIS.md` first

---

## Overview

This plan integrates the designer's visual refresh and split-view editor pattern into our production codebase. The strategy is **theme-first, then UI components** — we update the visual layer before touching any page logic.

**Guiding Principle:** Take CSS/theming wholesale, take UI patterns as reference, NEVER overwrite server actions.

---

## Phase 1: CSS & Theming Layer (LOW RISK)

**Goal:** Apply the visual refresh without touching any component logic.

### Step 1.1: Update globals.css
- **Action:** Add the missing sections from designer's `globals.css` to ours
- **What to add:**
  1. `--font-size-scale: 1;` CSS variable in `:root`
  2. `html { font-size: calc(16px * var(--font-size-scale, 1)); }` rule
  3. Gradient utility classes (`.gradient-primary`, `.gradient-primary-subtle`, `.gradient-primary-text`, `.gradient-accent`, `.gradient-card-border`)
  4. Dark mode gradient override (`.dark .gradient-primary-subtle`)
  5. Elevated sidebar style block (`[data-sidebar-style="elevated"]` + dark mode variant)
- **What NOT to change:** All existing color variables, shadow variables, base styles (they're identical)
- **Risk:** LOW — purely additive CSS
- **Verification:** Build passes, existing pages render identically (new CSS classes are opt-in)

### Step 1.2: No changes to tailwind.config.ts
- **Action:** None — configs are identical
- **Verification:** Confirmed via diff

---

## Phase 2: Add Missing Utility Components (LOW RISK)

**Goal:** Add small reusable components the designer created that we're missing.

### Step 2.1: Add FontSizeProvider
- **Action:** Create `components/providers/font-size-provider.tsx`
- **Source:** Copy from designer's repo (pure client component, no server logic)
- **Purpose:** Controls `--font-size-scale` CSS variable for accessibility
- **Integration:** Wrap in root `layout.tsx` around children + Toaster
- **Risk:** LOW — additive provider, no behavior change at default scale of 1

### Step 2.2: Add UI chart component
- **Action:** Create `components/ui/chart.tsx`
- **Source:** Copy from designer's repo (standard Shadcn chart wrapper for Recharts)
- **Risk:** LOW — standalone utility component

### Step 2.3: Add UI form component
- **Action:** Create `components/ui/form.tsx`
- **Source:** Copy from designer's repo (standard Shadcn form wrapper for react-hook-form)
- **Risk:** LOW — standalone utility component, used by new editor forms

### Step 2.4: Verify build
- **Action:** Run `pnpm build` and confirm no errors
- **Risk:** LOW

---

## Phase 3: Split-View Invoice Editor (MEDIUM RISK)

**Goal:** Build the new invoice creation/editing UI matching the target design screenshot.

### Step 3.1: Study designer's new-invoice-form.tsx
- **Action:** Read and understand the designer's `new-invoice-form.tsx` component
- **DO NOT copy directly** — it uses mock data and may lack our server action integrations
- **Extract:** Layout structure, CSS classes, component hierarchy, tab pattern

### Step 3.2: Create invoice editor component
- **Action:** Create `components/invoices/invoice-editor.tsx` (new file)
- **Layout:** 60/40 split grid (`grid grid-cols-5 gap-6`)
  - Left (col-span-3): Invoice form
  - Right (col-span-2): Sticky preview panel
- **Left panel sections:**
  1. Client selector (reuse existing `ClientSelector` component)
  2. Metadata row: Due Date (DatePicker) | Invoice Number (Input) | Tax Rate (Select)
  3. Items section header with "Templates" button (disabled/coming-soon initially)
  4. Line items table: ITEMS | RATE | QTY | AMOUNT columns with inline editing
  5. `+ Add Items` button
  6. Totals section: Subtotal, Tax, Total
- **Right panel:**
  1. Tab bar: Payment Page | Email Preview | Invoice PDF
  2. Preview content area (sticky, scrolls independently)
  3. Payment Page tab: Rendered invoice summary with line items
  4. Email Preview tab: Sample email text
  5. Invoice PDF tab: Download button (disabled until saved)
- **State management:** react-hook-form + Zod validation (reuse existing invoice validation schema)
- **Server integration:** Wire to existing `createInvoice` / `updateInvoice` server actions
- **Risk:** MEDIUM — new UI component, but uses existing server actions and validation

### Step 3.3: Wire into new invoice page
- **Action:** Update `app/(dashboard)/invoices/new/page.tsx` to use new `InvoiceEditor`
- **Keep:** Existing server-side data fetching (clients, tax rates, defaults)
- **Replace:** Current `NewInvoiceForm` component with new `InvoiceEditor`
- **Risk:** MEDIUM — changes user-facing page

### Step 3.4: Wire into edit invoice page
- **Action:** Update `app/(dashboard)/invoices/[id]/edit/page.tsx` to use `InvoiceEditor` in edit mode
- **Keep:** Existing draft-only guard, server-side data fetching
- **Pass:** Existing invoice data as initial values
- **Risk:** MEDIUM — changes user-facing page

### Step 3.5: Verify invoice CRUD flow
- **Action:** Manual testing
  1. Create new invoice with line items
  2. Verify totals calculate correctly
  3. Edit draft invoice
  4. Verify saved data matches
  5. Test in dark mode
  6. Test on mobile viewport
- **Risk:** N/A — testing step

---

## Phase 4: Split-View Quote Editor (MEDIUM RISK)

**Goal:** Build the new quote editor with sections (Details, Items, Terms, Notes).

### Step 4.1: Study designer's QuoteEditor.tsx and sections
- **Action:** Read and understand the designer's split-view quote editor
- **Extract:** Section navigation pattern, layout, CSS classes

### Step 4.2: Create quote editor sections
- **Action:** Create section components under `components/quotes/editor/`:
  - `DetailsSection.tsx` — Client selector, project selector, title, expiration, tax rate
  - `ItemsSection.tsx` — Line items table with inline editing, add/remove
  - `TermsSection.tsx` — Terms textarea with "Use Default" button
  - `NotesSection.tsx` — Client notes + internal notes
- **State:** Wire to existing `useQuoteBuilderStore` Zustand store
- **Risk:** MEDIUM — new components, but existing state management

### Step 4.3: Create QuoteEditor wrapper
- **Action:** Create `components/quotes/editor/QuoteEditor.tsx`
- **Layout:** Same 60/40 split as invoice editor
- **Left panel:** Section tabs (Details | Items | Terms | Notes) + active section content
- **Right panel:** Sticky preview with Payment | Email | PDF tabs
- **Risk:** MEDIUM

### Step 4.4: Wire into quote pages
- **Action:** Update `app/(dashboard)/quotes/new/editor/page.tsx` and `app/(dashboard)/quotes/[id]/page.tsx` (edit mode)
- **Keep:** Existing server-side data fetching and server actions
- **Risk:** MEDIUM

### Step 4.5: Verify quote CRUD flow
- **Action:** Manual testing (same checklist as invoices)
- **Risk:** N/A

---

## Phase 5: Appearance Settings Page (LOW RISK)

**Goal:** Add the settings page for font size and sidebar style.

### Step 5.1: Create appearance settings page
- **Action:** Create `app/(dashboard)/settings/appearance/page.tsx`
- **Features:**
  - Font size slider (controls `--font-size-scale`)
  - Sidebar style toggle (default vs elevated)
  - Theme toggle (light/dark/system) — may already exist in settings
- **Risk:** LOW — new page, no existing functionality affected

---

## Phase 6: Package Updates (LOW-MEDIUM RISK)

**Goal:** Align dependency versions with designer's repo.

### Step 6.1: Add new dependencies
- **Action:** Add `html2canvas@^1.4.1` and `jspdf@^4.1.0` (needed for client-side PDF)
- **Risk:** LOW — new deps, no conflicts

### Step 6.2: Bump existing dependencies (OPTIONAL — defer if not needed)
- **Candidates:** `@hookform/resolvers`, `react-hook-form`, `zod`
- **Risk:** MEDIUM — could introduce breaking API changes
- **Recommendation:** Only bump if Phase 3/4 requires newer APIs. Test thoroughly after bumping.

---

## Phase 7: Verification & QA (REQUIRED)

### Step 7.1: Full build verification
- `pnpm build` must pass with zero errors
- All TypeScript strict mode checks must pass

### Step 7.2: Visual regression check
- Check every page in light mode AND dark mode:
  - Dashboard
  - Quotes list and detail
  - Invoices list and detail
  - Clients list and detail
  - Analytics
  - Settings (all tabs)
  - Rate Cards
  - Contracts

### Step 7.3: Functional regression check
- Create a quote end-to-end
- Convert quote to invoice
- Record a payment
- Verify dashboard totals update correctly
- Test demo mode login and flows

### Step 7.4: Mobile responsiveness
- Test all new split-view editors on mobile viewport
- Ensure preview panel stacks below form on small screens

---

## Execution Order Summary

```
Phase 1 (CSS)           → ~30 min, LOW risk
Phase 2 (Utilities)     → ~30 min, LOW risk
Phase 3 (Invoice Editor)→ ~3-4 hrs, MEDIUM risk  ← Main design change
Phase 4 (Quote Editor)  → ~3-4 hrs, MEDIUM risk  ← Main design change
Phase 5 (Settings)      → ~1 hr, LOW risk
Phase 6 (Packages)      → ~30 min, LOW-MEDIUM risk
Phase 7 (QA)            → ~2 hrs, REQUIRED
```

---

## DO NOT Touch List

These files/directories must NOT be modified during this implementation:

1. `lib/*/actions.ts` — All server actions (quotes, invoices, clients, etc.)
2. `packages/database/prisma/schema.prisma` — Database schema
3. `lib/auth/*` — Authentication config and logic
4. `lib/demo/*` — Demo mode logic
5. `packages/database/prisma/seed*.ts` — Seed scripts
6. `app/api/**` — API routes
7. `vercel.json` — Deployment config
8. `.env*` files — Environment configuration
9. `lib/services/*` — Email, PDF, Stripe services

---

## Rollback Plan

If any phase causes regressions:
1. Each phase should be its own commit
2. `git revert <commit>` to undo a specific phase
3. The `new-design` branch can be abandoned without affecting `main`
4. CSS changes (Phase 1) are the safest to keep even if later phases revert
