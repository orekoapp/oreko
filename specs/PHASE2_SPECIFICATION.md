# Phase 2 Functional Specification

**Version:** 1.0
**Date:** 2026-02-13
**Owner:** Requirements Analyzer Agent
**Status:** Draft for Review

---

## Document Metadata

| Attribute | Value |
|-----------|-------|
| **Document ID** | SPEC-P2-001 |
| **Project** | Oreko - Phase 2 |
| **Based On** | REQUIREMENTS.md, ACCEPTANCE_CRITERIA.md |
| **Clarifications** | PHASE2_CLARIFICATIONS.md |
| **Estimation** | PHASE2_ESTIMATION.md |
| **Gap Analysis** | GAP_ANALYSIS.md |
| **Approvers** | TBD |

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Functional Requirements](#functional-requirements)
   - [Navigation & Information Architecture](#1-navigation--information-architecture)
   - [Data Model](#2-data-model)
   - [UI Components](#3-ui-components)
   - [Analytics](#4-analytics)
   - [Workflow](#5-workflow)
3. [Non-Functional Requirements](#non-functional-requirements)
4. [Dependency Manifest](#dependency-manifest)
5. [Out-of-Scope Items](#out-of-scope-items)
6. [Requirement Traceability Matrix](#requirement-traceability-matrix)

---

## Executive Summary

### Scope Overview

Phase 2 introduces enhanced navigation architecture, a Project entity for hierarchical organization, advanced data tables, comprehensive analytics reports, and visual builder improvements.

### Requirements Summary

| Category | P0 (Critical) | P1 (High) | P2 (Medium) | Total |
|----------|---------------|-----------|-------------|-------|
| Navigation | 2 | 2 | 0 | 4 |
| Data Model | 3 | 1 | 0 | 4 |
| UI Components | 2 | 2 | 0 | 4 |
| Analytics | 2 | 2 | 0 | 4 |
| Workflow | 2 | 0 | 0 | 2 |
| **Total** | **11** | **7** | **0** | **18** |

### Gap Classification Summary

| Classification | Count | Description |
|----------------|-------|-------------|
| REUSABLE | 5 | Existing code fully meets requirement (>90% match) |
| EXTEND | 9 | Existing code needs modification (60-90% match) |
| PARTIAL | 2 | Some code reusable, significant new work (30-60% match) |
| NEW | 2 | Build from scratch (<30% match) |

---

## Functional Requirements

### 1. Navigation & Information Architecture

#### FR-P2-001: Hierarchical Sidebar Navigation Structure

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-001 |
| **Title** | Hierarchical Sidebar Navigation Structure |
| **Source** | REQ-NAV-001 |
| **Priority** | P0 - Critical |
| **Gap Classification** | EXTEND (75% match) |
| **Dependencies** | None |
| **WBS Reference** | WBS-200 (WBS-201 to WBS-204) |

**Description:**

The application sidebar must implement the following hierarchical navigation structure:

```
Platform
+-- Dashboard (Overview)
+-- Analytics (Detailed Reports)
+-- Clients (List & Detail views)
+-- Projects (Parent container, expandable)
|   +-- Quotes (sub-item)
|   +-- Invoices (sub-item)
|   +-- Contracts (sub-item)
+-- Settings (User & App config)
```

**Functional Details:**

1. The "Projects" menu item shall be a collapsible parent container
2. Clicking "Projects" shall expand/collapse the submenu with animation
3. When collapsed, a chevron icon shall rotate to indicate state (right = collapsed, down = expanded)
4. Sub-items (Quotes, Invoices, Contracts) shall be visible only when parent is expanded
5. Each navigation item shall display an appropriate icon

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-001.1 | Sidebar displays all items in correct hierarchical order |
| AC-001.5 | Project submenu expands/collapses with chevron animation |
| AC-001.6 | Active nav item has highlighted background; sub-item highlights both itself and parent |

---

#### FR-P2-002: Sidebar Collapse Behavior

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-002 |
| **Title** | Sidebar Collapse/Expand Toggle |
| **Source** | REQ-NAV-002 |
| **Priority** | P0 - Critical |
| **Gap Classification** | REUSABLE (95% match) |
| **Dependencies** | FR-P2-001 |
| **WBS Reference** | WBS-233, WBS-234 |

**Description:**

The sidebar must support expanded and collapsed display modes with smooth transitions.

**Functional Details:**

1. Sidebar shall support expanded mode (256px width) with full labels visible
2. Sidebar shall support collapsed mode (64px width) showing icons only
3. A toggle button shall be present in the header area for switching modes
4. In collapsed mode, hovering over any navigation icon shall display a tooltip with the item label
5. Logo shall transition to icon-only display in collapsed mode
6. Submenu items shall display as flyout menu on hover when sidebar is collapsed

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-001.2 | Sidebar animates from 256px to 64px; labels hide; only icons visible |
| AC-001.3 | Sidebar animates from 64px to 256px; labels appear; full logo shows |
| AC-001.4 | Tooltips appear on hover for collapsed nav icons |

---

#### FR-P2-003: User Profile Section

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-003 |
| **Title** | User Profile Display in Sidebar Footer |
| **Source** | REQ-NAV-003 |
| **Priority** | P1 - High |
| **Gap Classification** | EXTEND (60% match) |
| **Dependencies** | FR-P2-002 |
| **WBS Reference** | WBS-210 (WBS-211 to WBS-214) |

**Description:**

The sidebar footer shall display the currently logged-in user's profile information.

**Functional Details:**

1. User avatar shall be displayed at the bottom of the sidebar
2. If no avatar image is available, display initials in a colored circle
3. User's full name shall be visible in expanded mode
4. User's email address shall be visible in expanded mode
5. A dropdown chevron shall be present for accessing profile menu
6. Dropdown menu shall include: "Profile Settings", "Log Out"
7. In collapsed mode, clicking avatar shall open dropdown directly

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-001.7 | User avatar (or initials), name, email, and dropdown chevron visible in expanded mode |

---

#### FR-P2-004: Workspace Switcher

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-004 |
| **Title** | Workspace/Organization Switcher |
| **Source** | REQ-NAV-004 |
| **Priority** | P1 - High |
| **Gap Classification** | EXTEND (70% match) |
| **Dependencies** | FR-P2-001 |
| **WBS Reference** | WBS-220 (WBS-221 to WBS-224) |

**Description:**

The top of the sidebar shall display the current workspace with tier indicator and switching capability.

**Functional Details:**

1. "Quote Craft" branding shall be displayed at sidebar top
2. Current workspace/organization name shall be shown
3. Tier indicator badge (e.g., "Enterprise", "Pro", "Free") shall be displayed
4. A dropdown shall allow switching between workspaces (for multi-tenant support)
5. Workspace context shall be available throughout the application via context provider

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| - | (Implicit in AC-001.1 for branding presence) |

---

### 2. Data Model

#### FR-P2-005: Project Entity with Entity Hierarchy

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-005 |
| **Title** | Project Entity and Client-Project-Document Hierarchy |
| **Source** | REQ-DATA-001 |
| **Priority** | P0 - Critical |
| **Gap Classification** | NEW (<30% match) |
| **Dependencies** | None |
| **WBS Reference** | WBS-100 (WBS-101 to WBS-110) |

**Description:**

A new Project entity shall be introduced to enable hierarchical organization of quotes, invoices, and contracts under client projects.

**Entity Hierarchy:**

```
Client (1) ------> (N) Project
Project (1) -----> (N) Quote
Project (1) -----> (N) Invoice
Project (1) -----> (N) Contract
Quote (1) -------> (0..1) Invoice (conversion link)
```

**Functional Details:**

1. Project model shall include: id, name, description, clientId, isActive, createdAt, updatedAt
2. Quote, Invoice, and ContractInstance models shall have nullable `projectId` foreign key
3. Existing quotes/invoices without projects shall continue to function (projectId = null)
4. UI shall provide "No Project" option when creating quotes/invoices
5. Project list and detail views shall be created
6. Project selector shall be added to quote/invoice creation forms

**Data Model:**

```
Project {
  id: String (cuid)
  name: String
  description: String?
  clientId: String (FK to Client)
  isActive: Boolean (default: true)
  createdAt: DateTime
  updatedAt: DateTime

  // Relations
  client: Client
  quotes: Quote[]
  invoices: Invoice[]
  contracts: ContractInstance[]
}
```

**Migration Strategy:**

1. Add Project table (non-breaking)
2. Add nullable projectId to Quote, Invoice, ContractInstance
3. Existing data remains unchanged (projectId = null)
4. New items can optionally be associated with a project

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| - | Project CRUD operations function correctly |
| - | Quotes/Invoices can be associated with or without projects |
| - | Backward compatibility: existing workflows unaffected |

---

#### FR-P2-006: Quote Status Tracking

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-006 |
| **Title** | Quote Status Lifecycle |
| **Source** | REQ-DATA-002 |
| **Priority** | P0 - Critical |
| **Gap Classification** | REUSABLE (100% match) |
| **Dependencies** | None |
| **WBS Reference** | N/A (existing) |

**Description:**

Quotes shall track the following statuses throughout their lifecycle.

**Status Values:**

| Status | Description | Badge Style |
|--------|-------------|-------------|
| DRAFT | Quote created but not sent | Gray outline |
| SENT | Quote sent to client | Blue outline |
| EXPIRED | Quote past expiry date without acceptance | Red outline |
| ACCEPTED | Client accepted the quote | Green outline |

**Note:** Current implementation includes additional statuses (`viewed`, `declined`) which exceed requirements.

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-002.3 | Status badges display correct colors per status |

---

#### FR-P2-007: Invoice Status Tracking

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-007 |
| **Title** | Invoice Payment Status Lifecycle |
| **Source** | REQ-DATA-003 |
| **Priority** | P0 - Critical |
| **Gap Classification** | REUSABLE (95% match) |
| **Dependencies** | None |
| **WBS Reference** | WBS-322 |

**Description:**

Invoices shall track the following payment statuses.

**Status Values:**

| Status | Description | Badge Style |
|--------|-------------|-------------|
| PENDING | Invoice sent, awaiting payment | Amber/Yellow outline |
| PAID | Payment received in full | Green solid |
| OVERDUE | Past due date without payment | Red solid |
| PARTIAL | Partial payment received | Blue outline |

**Note:** Current `sent`/`viewed` statuses map to PENDING semantically.

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-002.4 | Invoice status badges display correct colors and styles |

---

#### FR-P2-008: Quote-Invoice Bidirectional Linkage

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-008 |
| **Title** | Quote-Invoice Conversion Link Display |
| **Source** | REQ-DATA-004 |
| **Priority** | P1 - High |
| **Gap Classification** | REUSABLE (92% match) |
| **Dependencies** | FR-P2-006, FR-P2-007 |
| **WBS Reference** | WBS-520 (WBS-521 to WBS-523) |

**Description:**

When a quote is converted to an invoice, bidirectional links shall be maintained and displayed.

**Functional Details:**

1. Quote detail view shall show linked Invoice number (clickable)
2. Quote detail view shall show linked Invoice status badge
3. Invoice detail view shall show source Quote reference (clickable)
4. Navigation between linked documents shall be one-click

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-003.5 | Linked Invoice section visible on converted quote; shows invoice number and status |
| AC-003.6 | Already-converted quotes have disabled/hidden Convert button |

---

### 3. UI Components

#### FR-P2-009: Application Shell with Breadcrumb

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-009 |
| **Title** | Application Shell Layout with Breadcrumb Navigation |
| **Source** | REQ-UI-001 |
| **Priority** | P0 - Critical |
| **Gap Classification** | EXTEND (85% match) |
| **Dependencies** | FR-P2-001, FR-P2-002 |
| **WBS Reference** | WBS-230 (WBS-231 to WBS-234) |

**Description:**

The application shall implement a consistent shell layout with breadcrumb navigation.

**Functional Details:**

1. Full-height sidebar with fixed positioning
2. Main content area occupies remaining width
3. Breadcrumb navigation in header area showing current route path
4. Breadcrumb shall be clickable for navigation to parent routes
5. Responsive behavior:
   - Desktop (>= 1280px): Full sidebar expanded by default
   - Tablet (768-1279px): Sidebar collapsed by default
   - Mobile (< 768px): Sidebar hidden, hamburger menu overlay

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-006.1 | Desktop: full sidebar visible, expanded by default |
| AC-006.2 | Tablet: sidebar collapsed by default, can be expanded |
| AC-006.3 | Mobile: sidebar hidden, hamburger menu to open |

---

#### FR-P2-010: Enhanced Data Tables

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-010 |
| **Title** | Feature-Rich Data Table Component |
| **Source** | REQ-UI-002 |
| **Priority** | P0 - Critical |
| **Gap Classification** | EXTEND (70% match) |
| **Dependencies** | None |
| **WBS Reference** | WBS-300 (WBS-301 to WBS-311) |

**Description:**

A generic DataTable component shall be created with comprehensive features for list views.

**Features Required:**

1. **Column Headers:** Clickable for sorting with sort direction indicators
2. **Row Selection:** Checkbox column for bulk selection
3. **Search Input:** Text filter with 300ms debounce
4. **Status Filter:** Dropdown to filter by status value
5. **Pagination Controls:** Previous/Next buttons, page numbers, current page highlight
6. **Page Size Selector:** "Show X entries" dropdown (10, 25, 50, 100)
7. **Row Actions:** Action icons per row:
   - Download (PDF)
   - View (navigate to detail)
   - More (...) dropdown: Edit, Duplicate, Delete

**Component Interface:**

```typescript
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  filterKey?: string
  filterPlaceholder?: string
  statusOptions?: { value: string; label: string }[]
  onRowSelect?: (rows: TData[]) => void
  pageSizes?: number[] // default: [10, 25, 50, 100]
}
```

**Quotes Table Columns:**
- Checkbox, Quote ID, Status, Client (with avatar), Total, Expiry Date, Actions

**Invoices Table Columns:**
- Checkbox, Invoice ID, Status, Client (with avatar), Amount, Issued Date, Actions

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-002.1 | Quotes table displays required columns |
| AC-002.2 | Invoices table displays required columns |
| AC-002.5 | Search filters after 300ms debounce; matches ID, client name, email |
| AC-002.6 | Status filter shows only matching rows; pagination resets |
| AC-002.7 | Pagination shows "X to Y of Z"; buttons work; current page highlighted |
| AC-002.8 | Page size dropdown changes displayed rows |
| AC-002.9 | Row actions function correctly (download, view, more menu) |

---

#### FR-P2-011: Status Badge Variants

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-011 |
| **Title** | Status-Specific Badge Styling |
| **Source** | REQ-UI-003 |
| **Priority** | P1 - High |
| **Gap Classification** | EXTEND (80% match) |
| **Dependencies** | None |
| **WBS Reference** | WBS-320 (WBS-321 to WBS-324) |

**Description:**

Status badges shall have consistent styling based on entity type and status.

**Badge Variants:**

| Entity | Status | Style | CSS Variable |
|--------|--------|-------|--------------|
| Quote | Draft | Gray outline | --status-draft |
| Quote | Sent | Blue outline | --status-sent |
| Quote | Accepted | Green outline | --status-accepted |
| Quote | Expired | Red outline | --status-expired |
| Invoice | Pending | Amber/Yellow outline | --status-pending |
| Invoice | Paid | Green solid | --status-paid |
| Invoice | Overdue | Red solid | --status-overdue |
| Invoice | Partial | Blue outline | --status-partial |

**Utility Function:**

```typescript
function getStatusBadgeVariant(
  entity: 'quote' | 'invoice',
  status: string
): BadgeVariant
```

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-002.3 | Quote status badges display correct outline colors |
| AC-002.4 | Invoice status badges display correct styles (solid/outline) |

---

#### FR-P2-012: Charts and Visualizations

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-012 |
| **Title** | Chart Components with Consistent Styling |
| **Source** | REQ-UI-004 |
| **Priority** | P1 - High |
| **Gap Classification** | REUSABLE (90% match) |
| **Dependencies** | None |
| **WBS Reference** | WBS-330 (WBS-331 to WBS-333) |

**Description:**

Chart components shall provide consistent, accessible visualizations.

**Functional Details:**

1. Style: Minimalist with gradients
2. Tooltips on hover for data points
3. Responsive sizing to container
4. Color palette: Primary blue (#3B82F6), Secondary violet (#8B5CF6), Accent amber (#F59E0B)

**New Chart Types Required:**

| Chart Type | Use Case | WBS |
|------------|----------|-----|
| Radial Progress | Conversion rate display | WBS-331 |
| Dual Area | Revenue forecast (projected vs actual) | WBS-332 |

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-004.1 | Radial chart displays conversion rate with trend indicator |
| AC-004.4 | Dual-area chart shows projected vs actual with legend |

---

### 4. Analytics

#### FR-P2-013: Sales Pipeline Report

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-013 |
| **Title** | Sales Pipeline Analytics Section |
| **Source** | REQ-ANALYTICS-001 |
| **Priority** | P0 - Critical |
| **Gap Classification** | EXTEND (75% match) |
| **Dependencies** | FR-P2-012 |
| **WBS Reference** | WBS-400 (WBS-401 to WBS-406) |

**Description:**

The Sales Pipeline report shall track quote conversion efficiency with key metrics and visualizations.

**Metrics:**

| Metric | Calculation |
|--------|-------------|
| Quote Conversion Rate | (Accepted Quotes / Total Sent Quotes) * 100 |
| Average Deal Value | Total Value of Accepted Quotes / Count of Accepted Quotes |

**Visualizations:**

1. **Radial Progress Chart:** Display conversion rate as percentage (0-100%)
2. **Bar Chart:** Quotes by status (Draft, Sent, Expired, Accepted)
3. **Trend Indicator:** Up/down arrow with percentage change vs previous period

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-004.1 | Conversion rate displays as percentage in radial chart with trend |
| AC-004.2 | Bar chart shows quote counts by status with distinct colors and tooltips |

---

#### FR-P2-014: Financial Health Report

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-014 |
| **Title** | Financial Health Analytics Section |
| **Source** | REQ-ANALYTICS-002 |
| **Priority** | P0 - Critical |
| **Gap Classification** | EXTEND (80% match) |
| **Dependencies** | FR-P2-012 |
| **WBS Reference** | WBS-410 (WBS-411 to WBS-416) |

**Description:**

The Financial Health report shall provide cash flow management insights.

**Metrics:**

| Metric | Description |
|--------|-------------|
| Accounts Receivable Aging | Group unpaid invoices by age: 0-30, 31-60, 60+ days |
| Revenue Forecast | Compare potential (accepted quotes) vs actual (invoices) |
| Sales Tax Summary | Total tax collected within date range |

**Visualizations:**

1. **Horizontal Bar Chart:** AR aging buckets, color-coded:
   - 0-30 days: Blue
   - 31-60 days: Orange
   - 60+ days: Red (with warning indicator)
2. **Dual-Area Chart:** Revenue forecast with projected vs actual series
3. **Data Table:** Tax summary by period

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-004.3 | AR aging horizontal bars with color coding and dollar amounts |
| AC-004.4 | Revenue forecast dual-area chart with legend distinguishing series |

---

#### FR-P2-015: Client Insights Report

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-015 |
| **Title** | Client Insights Analytics Section |
| **Source** | REQ-ANALYTICS-003 |
| **Priority** | P1 - High |
| **Gap Classification** | PARTIAL (50% match) |
| **Dependencies** | FR-P2-012 |
| **WBS Reference** | WBS-420 (WBS-421 to WBS-427) |

**Description:**

The Client Insights report shall identify high-value clients and payment patterns.

**Metrics:**

| Metric | Calculation |
|--------|-------------|
| Revenue per Client | Sum of paid invoices per client |
| Client Lifetime Value (LTV) | Total revenue since first invoice |
| Average Days to Pay | AVG(Payment Date - Invoice Sent Date) per client |

**Visualizations:**

1. **Horizontal Bar Chart:** Top 5 clients by revenue (sorted descending)
2. **Leaderboard List:** Client LTV with avatar, name, email, amount

**New Server Actions Required:**

- `getTopClientsByRevenue()`
- `getClientLTV()`
- `getClientPaymentSpeed()`

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-004.5 | Top clients bar chart sorted descending by revenue |
| AC-004.6 | LTV leaderboard shows avatar, name, email, LTV sorted descending |

---

#### FR-P2-016: Service Performance Report

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-016 |
| **Title** | Service Performance Analytics Section |
| **Source** | REQ-ANALYTICS-004 |
| **Priority** | P1 - High |
| **Gap Classification** | PARTIAL (45% match) |
| **Dependencies** | FR-P2-012 |
| **WBS Reference** | WBS-430 (WBS-431 to WBS-435) |

**Description:**

The Service Performance report shall provide service/product optimization insights.

**Metrics:**

| Metric | Description |
|--------|-------------|
| Top Services/Products | Most frequently quoted line items |
| Revenue by Category | Group services by category for profitability |

**Visualizations:**

1. **Vertical Bar Chart:** Top services by frequency (item names on X-axis)
2. **Donut/Pie Chart:** Revenue distribution by category with legend

**New Server Actions Required:**

- `getTopServices()`
- `getRevenueByCategory()`

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-004.7 | Top services bar chart with item names and counts |
| AC-004.8 | Revenue by category donut with legend, percentages, and amounts |

---

#### FR-P2-017: Analytics Date Range Filter

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-017 |
| **Title** | Global Analytics Date Range Filter |
| **Source** | REQ-ANALYTICS-* (cross-cutting) |
| **Priority** | P1 - High |
| **Gap Classification** | EXTEND |
| **Dependencies** | FR-P2-013, FR-P2-014, FR-P2-015, FR-P2-016 |
| **WBS Reference** | WBS-416 |

**Description:**

A global date range filter shall control all analytics report data.

**Functional Details:**

1. Dropdown selector with predefined ranges:
   - This Week, This Month, This Quarter, This Year
   - Last 7 Days, Last 30 Days, Last 90 Days
   - Custom date range picker
2. All analytics charts shall update when date range changes
3. Loading states shall display during data fetch
4. Selected range shall persist across page navigation

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-004.9 | All charts update on date range change with loading states |

---

### 5. Workflow

#### FR-P2-018: Quote-to-Invoice Conversion Flow

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-018 |
| **Title** | Quote-to-Invoice Conversion Workflow |
| **Source** | REQ-FLOW-001 |
| **Priority** | P0 - Critical |
| **Gap Classification** | REUSABLE (95% match) |
| **Dependencies** | FR-P2-006, FR-P2-007, FR-P2-008 |
| **WBS Reference** | N/A (existing) |

**Description:**

The complete quote-to-invoice conversion workflow.

**Workflow Steps:**

1. User creates Quote within a Project (optional)
2. User sends Quote to Client (Status changes to SENT)
3. Client accepts Quote (Status changes to ACCEPTED)
4. User clicks "Convert to Invoice" button (visible only for ACCEPTED quotes)
5. Conversion dialog opens with:
   - Quote number
   - Client name
   - Amount
   - Invoice date (default: today)
   - Due date (default: +30 days)
   - Checkboxes: "Copy line items", "Send immediately"
6. System generates Invoice linked to Quote and Project
7. Quote detail shows "Linked Invoice: [Status]"
8. User redirected to invoice detail page

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-003.1 | Convert button visible only for ACCEPTED quotes |
| AC-003.2 | Convert button NOT visible for DRAFT/SENT/EXPIRED |
| AC-003.3 | Dialog shows quote details with date fields and checkboxes |
| AC-003.4 | Invoice created with correct linkage; redirect to invoice detail |
| AC-003.5 | Quote shows linked invoice section after conversion |
| AC-003.6 | Already-converted quotes have disabled/hidden convert button |

---

#### FR-P2-019: Visual Quote Builder Enhancements

| Attribute | Value |
|-----------|-------|
| **FR ID** | FR-P2-019 |
| **Title** | Enhanced Visual Quote Builder |
| **Source** | REQ-FLOW-002 |
| **Priority** | P0 - Critical |
| **Gap Classification** | EXTEND (85% match) |
| **Dependencies** | None |
| **WBS Reference** | WBS-500 (WBS-501 to WBS-523) |

**Description:**

The visual quote builder shall be enhanced with preview tabs and logo upload.

**Functional Details:**

1. **Split-Pane Layout:** Form editor (~60% left) + Live preview (~40% right)
2. **Preview Tabs:**
   - Payment Page: Client-facing view
   - Email Preview: Email template preview
   - Invoice PDF: Downloadable PDF format
3. **Logo Upload:**
   - Click to upload in header section
   - Accepts PNG/JPG only
   - Max 2MB file size
   - Preview updates immediately after upload
4. **Line Items:**
   - Item name, Rate, Quantity, Amount (auto-calculated)
   - Real-time total updates
   - "+ Add Items" button for new rows
5. **Customer Selection:**
   - Type-ahead search for existing clients
   - Auto-populate email when client selected
   - Option to create new client inline
6. **Templates:** Dropdown for quick line item insertion from rate cards
7. **Real-time Preview:** Updates within 200ms of any field change

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-005.1 | Split-pane layout with ~60/40 division |
| AC-005.2 | Logo upload with file type/size validation and immediate preview |
| AC-005.3 | Customer type-ahead with auto-populate email |
| AC-005.4 | Line item amount auto-calculates; total updates in preview |
| AC-005.5 | Preview updates within 200ms of changes |
| AC-005.6 | Preview tabs switch between Payment Page, Email, PDF views |
| AC-005.7 | Save Draft saves with DRAFT status and shows success toast |
| AC-005.8 | Send Quote shows confirmation, updates to SENT, sends email |

---

## Non-Functional Requirements

### NFR-P2-001: Performance

| Attribute | Value |
|-----------|-------|
| **NFR ID** | NFR-P2-001 |
| **Title** | Performance Metrics |
| **Source** | REQ-NFR-001 |
| **Priority** | P0 - Critical |
| **Gap Classification** | REUSABLE (90% match) |
| **WBS Reference** | WBS-610 (WBS-611 to WBS-614) |

**Requirements:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse/WebPageTest |
| First Input Delay (FID) | < 100ms | Lighthouse/WebPageTest |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse/WebPageTest |
| API Response Time (95th percentile) | < 500ms | Server metrics |
| Analytics Chart Render | < 1s | Client-side timing |

**Implementation:**

1. Performance audit with Lighthouse (WBS-611)
2. Optimize analytics queries with indexing (WBS-612)
3. Add loading skeletons for new sections (WBS-613)
4. Code splitting for analytics page (WBS-614)

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-007.1 | LCP < 2.5s |
| AC-007.2 | FID < 100ms |
| AC-007.3 | CLS < 0.1 |
| AC-007.4 | API 95th percentile < 500ms |

---

### NFR-P2-002: Accessibility

| Attribute | Value |
|-----------|-------|
| **NFR ID** | NFR-P2-002 |
| **Title** | Accessibility Compliance |
| **Source** | REQ-NFR-002 |
| **Priority** | P1 - High |
| **Gap Classification** | EXTEND (75% match) |
| **WBS Reference** | WBS-600 (WBS-601 to WBS-604) |

**Requirements:**

1. WCAG 2.1 AA compliance
2. Keyboard navigation support for all interactive elements
3. Screen reader compatibility (proper ARIA labels)
4. Color contrast ratios meeting AA standards (4.5:1 for normal text)

**Implementation:**

1. Add aria-labels to icon-only buttons (WBS-601)
2. Ensure focus trap in all dialogs (WBS-602)
3. Document keyboard shortcuts (WBS-603)
4. Color contrast audit and fixes (WBS-604)

---

### NFR-P2-003: Responsiveness

| Attribute | Value |
|-----------|-------|
| **NFR ID** | NFR-P2-003 |
| **Title** | Responsive Design |
| **Source** | REQ-NFR-003 |
| **Priority** | P1 - High |
| **Gap Classification** | REUSABLE (90% match) |
| **WBS Reference** | WBS-620 (WBS-621 to WBS-623) |

**Breakpoints:**

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Desktop | >= 1280px (xl) | Full sidebar expanded, content uses remaining width |
| Tablet | 768-1279px (md-lg) | Sidebar collapsed by default (icons only), expandable |
| Mobile | < 768px (sm) | Sidebar hidden, hamburger menu overlay, full-width content |

**Implementation:**

1. DataTable horizontal scroll on mobile (WBS-621)
2. Analytics cards responsive grid (WBS-622)
3. Cross-browser testing (WBS-623)

**Acceptance Criteria:**

| AC Reference | Description |
|--------------|-------------|
| AC-006.1 | Desktop behavior correct |
| AC-006.2 | Tablet behavior correct |
| AC-006.3 | Mobile behavior correct |

---

## Dependency Manifest

### NPM Packages Required

| Package | Version | Purpose | WBS Reference |
|---------|---------|---------|---------------|
| @tanstack/react-table | ^8.x | DataTable with sorting, filtering, pagination | WBS-301 |

### Existing Packages (Already Installed)

| Package | Purpose |
|---------|---------|
| recharts | Chart visualizations |
| @radix-ui/* | Accessible UI primitives |
| lucide-react | Icons |
| react-hook-form | Form handling |
| zod | Schema validation |
| @prisma/client | Database ORM |
| next-auth | Authentication |

### Database Migrations Required

| Migration | Description | WBS Reference |
|-----------|-------------|---------------|
| Add Project model | New table with client relation | WBS-101, WBS-102 |
| Add projectId to Quote | Nullable foreign key | WBS-104 |
| Add projectId to Invoice | Nullable foreign key | WBS-105 |
| Add projectId to ContractInstance | Nullable foreign key | WBS-106 |

### New API Endpoints

| Endpoint | Method | Purpose | WBS Reference |
|----------|--------|---------|---------------|
| /api/analytics/client-ltv | GET | Client lifetime value data | WBS-423 |
| /api/analytics/top-services | GET | Top services by frequency | WBS-432 |
| /api/analytics/revenue-by-category | GET | Revenue grouped by category | WBS-433 |

### New Server Actions

| Action | Purpose | WBS Reference |
|--------|---------|---------------|
| createProject | Create new project | WBS-103 |
| getProjects | List projects | WBS-103 |
| getProject | Get project details | WBS-103 |
| updateProject | Update project | WBS-103 |
| deleteProject | Soft delete project | WBS-103 |
| getTopClientsByRevenue | Top clients analytics | WBS-422 |
| getClientLTV | Client lifetime value | WBS-423 |
| getClientPaymentSpeed | Avg days to pay | WBS-424 |
| getTopServices | Frequently quoted items | WBS-432 |
| getRevenueByCategory | Revenue by category | WBS-433 |

### CSS Custom Properties (New)

```css
/* Status Colors */
--status-draft: /* gray */
--status-sent: /* blue */
--status-accepted: /* green */
--status-expired: /* red */
--status-pending: /* amber */
--status-paid: /* green */
--status-overdue: /* red */
--status-partial: /* blue */
```

---

## Out-of-Scope Items

The following items are explicitly **NOT** included in Phase 2:

### Deferred to Future Phases

| Item | Reason | Target Phase |
|------|--------|--------------|
| Contract Templates | Not in Phase 2 requirements | Phase 3 |
| Team/Multi-User Support | Requires role-based access control | Phase 3+ |
| QuickBooks Integration | External integration complexity | Phase 3+ |
| API Access (Public API) | Requires API documentation, rate limiting | Phase 3+ |
| White Label Options | Branding customization | Phase 3+ |
| Recurring Invoices | Scheduled automation | Phase 3 |
| Milestone Payments | Payment splitting | Phase 3 |

### Not Required

| Item | Reason |
|------|--------|
| Auto-create default projects | Per PHASE2_CLARIFICATIONS.md - keep existing data as-is |
| Drag-and-drop project reordering | Not specified in requirements |
| Project archiving workflow | isActive flag sufficient for MVP |
| Multi-level project hierarchy | Single level (Client > Project) per requirements |
| Analytics export to CSV | Not in Phase 2 acceptance criteria |
| Scheduled report emails | Not in Phase 2 requirements |

### Explicitly Excluded

| Item | Reason |
|------|--------|
| Breaking changes to existing workflows | Backward compatibility required |
| Migration backfill of existing quotes/invoices to default projects | Per clarification decision |
| Custom chart color themes | Use standard design system colors |
| PDF template customization | Existing templates sufficient |

---

## Requirement Traceability Matrix

| FR ID | Source Requirement | Acceptance Criteria | WBS IDs | Priority | Gap Class |
|-------|-------------------|---------------------|---------|----------|-----------|
| FR-P2-001 | REQ-NAV-001 | AC-001.1, AC-001.5, AC-001.6 | WBS-201-204 | P0 | EXTEND |
| FR-P2-002 | REQ-NAV-002 | AC-001.2, AC-001.3, AC-001.4 | WBS-233, WBS-234 | P0 | REUSABLE |
| FR-P2-003 | REQ-NAV-003 | AC-001.7 | WBS-211-214 | P1 | EXTEND |
| FR-P2-004 | REQ-NAV-004 | - | WBS-221-224 | P1 | EXTEND |
| FR-P2-005 | REQ-DATA-001 | - | WBS-101-110 | P0 | NEW |
| FR-P2-006 | REQ-DATA-002 | AC-002.3 | N/A | P0 | REUSABLE |
| FR-P2-007 | REQ-DATA-003 | AC-002.4 | WBS-322 | P0 | REUSABLE |
| FR-P2-008 | REQ-DATA-004 | AC-003.5, AC-003.6 | WBS-521-523 | P1 | REUSABLE |
| FR-P2-009 | REQ-UI-001 | AC-006.1, AC-006.2, AC-006.3 | WBS-231-234 | P0 | EXTEND |
| FR-P2-010 | REQ-UI-002 | AC-002.1, AC-002.2, AC-002.5-9 | WBS-301-311 | P0 | EXTEND |
| FR-P2-011 | REQ-UI-003 | AC-002.3, AC-002.4 | WBS-321-324 | P1 | EXTEND |
| FR-P2-012 | REQ-UI-004 | AC-004.1, AC-004.4 | WBS-331-333 | P1 | REUSABLE |
| FR-P2-013 | REQ-ANALYTICS-001 | AC-004.1, AC-004.2 | WBS-401-406 | P0 | EXTEND |
| FR-P2-014 | REQ-ANALYTICS-002 | AC-004.3, AC-004.4 | WBS-411-416 | P0 | EXTEND |
| FR-P2-015 | REQ-ANALYTICS-003 | AC-004.5, AC-004.6 | WBS-421-427 | P1 | PARTIAL |
| FR-P2-016 | REQ-ANALYTICS-004 | AC-004.7, AC-004.8 | WBS-431-435 | P1 | PARTIAL |
| FR-P2-017 | REQ-ANALYTICS-* | AC-004.9 | WBS-416 | P1 | EXTEND |
| FR-P2-018 | REQ-FLOW-001 | AC-003.1-6 | N/A | P0 | REUSABLE |
| FR-P2-019 | REQ-FLOW-002 | AC-005.1-8 | WBS-501-523 | P0 | EXTEND |
| NFR-P2-001 | REQ-NFR-001 | AC-007.1-4 | WBS-611-614 | P0 | REUSABLE |
| NFR-P2-002 | REQ-NFR-002 | - | WBS-601-604 | P1 | EXTEND |
| NFR-P2-003 | REQ-NFR-003 | AC-006.1-3 | WBS-621-623 | P1 | REUSABLE |

---

## Appendix A: Requirement ID Reference

### Functional Requirements (FR-P2-xxx)

| ID Range | Category |
|----------|----------|
| FR-P2-001 to FR-P2-004 | Navigation & Information Architecture |
| FR-P2-005 to FR-P2-008 | Data Model |
| FR-P2-009 to FR-P2-012 | UI Components |
| FR-P2-013 to FR-P2-017 | Analytics |
| FR-P2-018 to FR-P2-019 | Workflow |

### Non-Functional Requirements (NFR-P2-xxx)

| ID Range | Category |
|----------|----------|
| NFR-P2-001 | Performance |
| NFR-P2-002 | Accessibility |
| NFR-P2-003 | Responsiveness |

---

## Appendix B: Acceptance Criteria Cross-Reference

| AC ID | Related FR IDs |
|-------|---------------|
| AC-001.x | FR-P2-001, FR-P2-002, FR-P2-003 |
| AC-002.x | FR-P2-006, FR-P2-007, FR-P2-010, FR-P2-011 |
| AC-003.x | FR-P2-008, FR-P2-018 |
| AC-004.x | FR-P2-012, FR-P2-013, FR-P2-014, FR-P2-015, FR-P2-016, FR-P2-017 |
| AC-005.x | FR-P2-019 |
| AC-006.x | FR-P2-009, NFR-P2-003 |
| AC-007.x | NFR-P2-001 |

---

*Document generated by Requirements Analyzer Agent*
*Version 1.0 - 2026-02-13*
