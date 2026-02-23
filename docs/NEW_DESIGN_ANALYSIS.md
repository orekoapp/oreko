# New Design Analysis: Designer's Frontend vs Our Codebase

**Date:** 2026-02-21
**Source Repo:** https://github.com/sk-1208/qms-frontend (private)
**Target Design:** https://i.postimg.cc/CLvKqfp0/builder.png
**Branch:** `new-design`

---

## 1. Target Design Summary

The screenshot shows a **split-view invoice editor** with:

- **Left panel (~60%)**: Inline invoice form
  - Client selector (Globe Corporation with avatar)
  - Metadata row: Due Date | Invoice Number | Tax rate dropdown
  - "Items" section header with "Templates" button
  - Items table: ITEMS (name + description) | RATE | QTY columns
  - `+ Add Items` button at bottom
  - Three line items: Photo Session ($600 x 1), Photo Editing ($25 x 30), Digital Delivery ($100 x 1)

- **Right panel (~40%)**: Live preview with 3 tabs
  - **Payment Page** tab (active): Rendered invoice showing client name, total ($1650.00), line items breakdown, "Download Invoice" CTA
  - **Email Preview** tab
  - **Invoice PDF** tab

- **Header**: Breadcrumb navigation (Home > Invoices > New), search bar, user avatar
- **Sidebar**: Collapsible, grouped (Platform / Resources / Settings), "New Quote" quick action

---

## 2. Schema Comparison

**Result: IDENTICAL** — Both repos share the exact same Prisma schema with all models, fields, relations, and indexes matching line-for-line. No database migration needed.

---

## 3. File Structure Comparison

### Files only in designer's repo (not in ours):
| File | Purpose | Risk to Add |
|------|---------|-------------|
| `components/dashboard/charts/metric-cards.tsx` | Dashboard metric cards | LOW — standalone UI |
| `components/providers/font-size-provider.tsx` | Font size scaling provider | LOW — new feature |
| `components/ui/chart.tsx` | Recharts wrapper component | LOW — shadcn utility |
| `components/ui/form.tsx` | react-hook-form wrapper | LOW — shadcn utility |
| `app/(dashboard)/settings/appearance/page.tsx` | Appearance settings page | LOW — new route |
| `components/quotes/editor/QuoteEditor.tsx` | Split-view quote editor | MEDIUM — net-new UI |
| `components/quotes/editor/sections/*.tsx` | Editor sub-sections | MEDIUM — net-new UI |

### Files only in our repo (not in designer's):
| File | Purpose | Status |
|------|---------|--------|
| `app/(dashboard)/invoices/[id]/edit/edit-invoice-form.tsx` | Invoice edit form | KEEP — production feature |
| `app/(dashboard)/quotes/[id]/builder/layout.tsx` | Builder layout | KEEP — production feature |
| `app/(dashboard)/quotes/new/layout.tsx` | New quote layout | KEEP — production feature |
| `app/(dashboard)/clients/new/layout.tsx` | New client layout | KEEP — production feature |

---

## 4. CSS & Theming Comparison

### globals.css

**Base theming is IDENTICAL** — both use the same OKLCH color palettes, same semantic color mappings, same dark mode variables, same shadow scale.

**Designer adds these extras:**

1. **Font size scaling** (2 lines):
   ```css
   --font-size-scale: 1;
   /* and in html: */
   html { font-size: calc(16px * var(--font-size-scale, 1)); }
   ```

2. **Gradient utilities** (~30 lines):
   ```css
   .gradient-primary { ... }
   .gradient-primary-subtle { ... }
   .gradient-primary-text { ... }
   .gradient-accent { ... }
   .gradient-card-border { ... }
   ```

3. **Elevated sidebar style** (~80 lines):
   ```css
   [data-sidebar-style="elevated"] { ... }
   /* Gray canvas with white cards, custom active states, dark mode variants */
   ```

### tailwind.config.ts

**IDENTICAL** — same colors, same shadows, same fonts, same animations, same plugins. No changes needed.

---

## 5. Layout & Root Comparison

### Root layout (app/layout.tsx)

**Differences:**
| Aspect | Our Code | Designer's Code |
|--------|----------|----------------|
| FontSizeProvider | Not present | Wraps children + Toaster |
| CSS import path | `@/styles/globals.css` | `@/styles/globals.css` |
| Metadata | Identical | Identical |
| JSON-LD | Identical | Identical |
| Fonts | GeistSans + GeistMono | GeistSans + GeistMono |

Only change: Designer wraps content in `<FontSizeProvider>`.

### Dashboard layout

**IDENTICAL** structure: `SidebarProvider > AppSidebar + SidebarInset > AppHeader + main`

---

## 6. Dependency Comparison

### New dependencies in designer's repo:
| Package | Version | Purpose |
|---------|---------|---------|
| `html2canvas` | ^1.4.1 | Screenshot/PDF generation |
| `jspdf` | ^4.1.0 | Client-side PDF generation |
| `dotenv` | ^17.3.1 | Environment variable loading |
| `tsx` (devDep) | ^4.19.0 | TypeScript execution |

### Version bumps in designer's repo:
| Package | Ours | Designer's |
|---------|------|-----------|
| `@hookform/resolvers` | ^3.9.0 | ^3.10.0 |
| `react-hook-form` | ^7.54.0 | ^7.71.1 |
| `zod` | ^3.24.0 | ^3.25.76 |
| `recharts` | ^2.15.0 | ^2.15.4 |
| `@radix-ui/react-label` | ^2.1.0 | ^2.1.8 |
| `@radix-ui/react-toast` | ^1.2.0 | ^1.2.15 |

---

## 7. Key New UI Components in Designer's Repo

### QuoteEditor (split-view)
- **Location:** `components/quotes/editor/QuoteEditor.tsx`
- **Pattern:** 60/40 split with left form + right sticky preview
- **Sub-sections:** DetailsSection, ItemsSection, TermsSection, NotesSection
- **State:** Zustand store (`useQuoteBuilderStore`)
- **Preview tabs:** Payment | Email | PDF

### New Invoice Form (split-view)
- **Location:** `app/(dashboard)/invoices/new/new-invoice-form.tsx`
- **Pattern:** Same 60/40 split as QuoteEditor
- **Fields:** Client selector, invoice number, dates, tax rate, line items table
- **Preview:** Same 3-tab preview panel

### FontSizeProvider
- **Location:** `components/providers/font-size-provider.tsx`
- **Purpose:** Global font size scaling via CSS variable `--font-size-scale`
- **Usage:** Wraps root layout for accessibility

---

## 8. Server Actions Comparison

**WARNING: DO NOT COPY server actions from designer's repo.**

Our server actions (`lib/*/actions.ts`) have been hardened through 6+ QA sessions:
- Soft-delete filters on all queries
- Workspace isolation on every query
- Double-encoding fixes for contract variables
- Demo workspace guards
- Production-tested edge case handling

The designer's server actions may not include these fixes. Use ours as the source of truth.

---

## 9. Risk Assessment

| Category | Risk Level | Notes |
|----------|-----------|-------|
| Prisma schema | NONE | Identical |
| Tailwind config | NONE | Identical |
| globals.css additions | LOW | Additive only (gradients, elevated style) |
| Root layout change | LOW | Only adds FontSizeProvider wrapper |
| New UI components | MEDIUM | Net-new code, needs integration with our server actions |
| Server actions | HIGH | Must NOT be overwritten |
| Package version bumps | MEDIUM | Could introduce breaking changes |
| E2E tests | N/A | Designer's tests are not transferable |

---

## 10. What the Designer Built Well

1. The split-view editor pattern (form + live preview) is a significant UX improvement
2. The elevated sidebar style adds visual depth
3. Gradient utilities are reusable across the app
4. Font size scaling is a good accessibility feature
5. The items table inline editing UX matches modern SaaS patterns

## 11. What We Must Protect

1. All server actions — our implementations are battle-tested
2. Quote builder Zustand store — our state management handles edge cases
3. Soft-delete patterns throughout the codebase
4. Workspace data isolation in every query
5. Demo mode guards and seed data handling
6. Production deployment config (vercel.json, env files)
