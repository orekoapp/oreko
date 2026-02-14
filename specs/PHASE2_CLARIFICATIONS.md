# Phase 2 Requirements Clarifications

**Generated:** 2026-02-13
**Phase:** 0.5 Requirements Clarification

---

## Overview

Based on the brief analysis and gap analysis, the following clarifications document the assumptions and decisions made for Phase 2 implementation.

---

## 1. Navigation Architecture

### Decision: Nested Sidebar Structure

**Requirement:** REQ-NAV-001

**Decision Made:**
- "Projects" will be a parent menu item with expandable children: Quotes, Invoices, Contracts
- The sidebar will maintain the existing Shadcn UI `SidebarMenuSub` pattern
- Collapsed mode will show a flyout submenu on hover (following existing Shadcn behavior)

**Rationale:** The existing sidebar already supports collapsible submenus via Shadcn UI conventions. We will extend, not replace.

---

## 2. Project Entity

### Decision: New Database Model with Optional Association

**Requirement:** REQ-DATA-001

**Decision Made:**
- Create new `Project` model: `id`, `name`, `description`, `clientId`, `isActive`, timestamps
- Add nullable `projectId` to Quote, Invoice, and ContractInstance models
- For backward compatibility, existing quotes/invoices will have `projectId = null` (no project)
- UI will show "No Project" option when creating quotes/invoices

**Migration Strategy:**
1. Add Project table
2. Add nullable projectId column to Quote, Invoice, ContractInstance
3. DO NOT auto-create default projects (keep existing data as-is)
4. New items can optionally be associated with a project

**Rationale:** Non-breaking migration allows gradual adoption without disrupting existing data.

---

## 3. Status Badge Styling

### Decision: Extend Badge Component with Status Variants

**Requirement:** REQ-UI-003

**Decision Made:**

| Status | Type | Style |
|--------|------|-------|
| **Quote: Draft** | Quote | Gray outline |
| **Quote: Sent** | Quote | Blue outline |
| **Quote: Accepted** | Quote | Green outline |
| **Quote: Expired** | Quote | Red outline |
| **Invoice: Pending** | Invoice | Amber/Yellow outline |
| **Invoice: Paid** | Invoice | Green solid |
| **Invoice: Overdue** | Invoice | Red solid |
| **Invoice: Partial** | Invoice | Blue outline |

**Implementation:**
- Add new variants to badge.tsx: `draft`, `sent`, `accepted`, `expired`, `pending`, `paid`, `overdue`, `partial`
- Create `getStatusBadgeVariant(entity: 'quote' | 'invoice', status: string)` utility

---

## 4. Analytics Dashboard Structure

### Decision: Four Section Layout

**Requirement:** REQ-ANALYTICS-001 through 004

**Decision Made:**
- Analytics page will display 4 collapsible sections:
  1. **Sales Pipeline** - Conversion rate (radial), Quotes by Status (bar), Avg Deal Value
  2. **Financial Health** - AR Aging (horizontal bar), Revenue Forecast (dual area)
  3. **Client Insights** - Top Clients Revenue (bar), Client LTV (leaderboard)
  4. **Service Performance** - Top Services (bar), Revenue by Category (donut)

**Data Fetching Strategy:**
- Use existing server actions where available
- Create new endpoints only for missing data:
  - `/api/analytics/client-ltv` - New
  - `/api/analytics/top-services` - New (can derive from line items)
  - `/api/analytics/revenue-by-category` - New

---

## 5. DataTable Component

### Decision: Build Generic DataTable with TanStack Table

**Requirement:** REQ-UI-001, REQ-UI-002

**Decision Made:**
- Create `DataTable` component using TanStack Table (@tanstack/react-table)
- Features: sorting, filtering, row selection, pagination, bulk actions
- Apply to both Quotes and Invoices list views
- Integrate with existing server actions for data fetching

**Props Interface:**
```typescript
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  filterKey?: string // column to filter on
  filterPlaceholder?: string
  statusOptions?: { value: string; label: string }[]
  onRowSelect?: (rows: TData[]) => void
  pageSizes?: number[] // default: [10, 25, 50, 100]
}
```

---

## 6. Quote Builder Enhancements

### Decision: Add Preview Tabs

**Requirement:** REQ-BUILDER-001

**Decision Made:**
- Add 3 preview tabs to existing quote builder:
  1. **Payment Page** - Client-facing view (existing)
  2. **Email Preview** - Email template preview (new)
  3. **Invoice PDF** - PDF preview (new, uses existing PDF generation)

**Implementation:**
- Add Tabs component to builder preview pane
- Reuse existing `QuotePortalView` for Payment Page
- Create `QuoteEmailPreview` component
- Create `QuotePdfPreview` component (iframe with PDF URL)

---

## 7. Color Consistency

### Decision: Use Existing Design Tokens

**Requirement:** From Design Discovery inconsistencies

**Decision Made:**
- Phase 2 will use HSL tokens from globals.css exclusively
- New semantic colors will be added via CSS custom properties:
  - `--status-draft`
  - `--status-sent`
  - `--status-accepted`
  - `--status-expired`
  - `--status-pending`
  - `--status-paid`
  - `--status-overdue`

---

## 8. Responsive Behavior

### Decision: Follow Existing Breakpoints

**Requirement:** REQ-NFR-003

**Decision Made:**
- Use existing Tailwind breakpoints: sm (640), md (768), lg (1024), xl (1280)
- Sidebar behavior:
  - Desktop (≥1024px): Expanded by default
  - Tablet (768-1023px): Collapsed by default (icons only)
  - Mobile (<768px): Hidden, hamburger menu overlay
- DataTables: Horizontal scroll on small screens

---

## 9. Performance Targets

### Decision: Maintain Phase 1 Targets

**Requirement:** REQ-NFR-004

**Targets:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- API responses < 500ms (95th percentile)
- Analytics chart render < 1s

---

## Summary

All requirements from the brief have been reviewed and clarified. No blocking ambiguities remain. Proceed to Phase 1 (Estimation).
