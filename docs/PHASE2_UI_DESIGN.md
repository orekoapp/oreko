# Phase 2 UI/UX Design Specification

**Version:** 1.0
**Date:** 2026-02-13
**Owner:** UI/UX Design Agent
**Status:** Ready for Implementation

---

## Document Metadata

| Attribute | Value |
|-----------|-------|
| **Document ID** | UI-P2-001 |
| **Project** | QuoteCraft - Phase 2 |
| **Based On** | UI_REFERENCES.md, IMAGE_ANNOTATIONS.md, DESIGN_DISCOVERY.md, PHASE2_SPECIFICATION.md |
| **Design System** | Shadcn UI + Custom Extensions |
| **Approvers** | TBD |

---

## Table of Contents

1. [Design System Extensions](#1-design-system-extensions)
2. [Component Specifications](#2-component-specifications)
3. [Responsive Specifications](#3-responsive-specifications)
4. [Accessibility Requirements](#4-accessibility-requirements)
5. [Animation Specifications](#5-animation-specifications)
6. [Implementation Guidelines](#6-implementation-guidelines)

---

## 1. Design System Extensions

### 1.1 New Design Tokens

The following CSS custom properties extend the existing design system. All tokens use HSL format for consistency with the current implementation.

#### Status Colors

Add to `apps/web/app/globals.css` in `:root` and `.dark` selectors:

```css
:root {
  /* Quote Status Colors */
  --status-draft: 220 9% 46%;           /* Gray - #6B7280 */
  --status-draft-bg: 220 9% 46% / 0.1;
  --status-sent: 217 91% 60%;           /* Blue - #3B82F6 */
  --status-sent-bg: 217 91% 60% / 0.1;
  --status-accepted: 142 71% 45%;       /* Green - #22C55E */
  --status-accepted-bg: 142 71% 45% / 0.1;
  --status-expired: 0 84% 60%;          /* Red - #EF4444 */
  --status-expired-bg: 0 84% 60% / 0.1;

  /* Invoice Status Colors */
  --status-pending: 38 92% 50%;         /* Amber - #F59E0B */
  --status-pending-bg: 38 92% 50% / 0.1;
  --status-paid: 142 71% 45%;           /* Green - #22C55E */
  --status-paid-bg: 142 71% 45%;        /* Solid background */
  --status-overdue: 0 84% 60%;          /* Red - #EF4444 */
  --status-overdue-bg: 0 84% 60%;       /* Solid background */
  --status-partial: 217 91% 60%;        /* Blue - #3B82F6 */
  --status-partial-bg: 217 91% 60% / 0.1;

  /* Chart Colors (Phase 2 Analytics) */
  --chart-ar-current: 217 91% 60%;      /* 0-30 days - Blue */
  --chart-ar-warning: 25 95% 53%;       /* 31-60 days - Orange #FB923C */
  --chart-ar-critical: 0 91% 71%;       /* 60+ days - Red #F87171 */
  --chart-projected: 270 67% 85%;       /* Light purple - #C4B5FD */
  --chart-actual: 263 70% 50%;          /* Dark purple - #7C3AED */

  /* Sidebar Enhancement Colors */
  --sidebar-submenu-bg: 0 0% 96%;       /* Subtle submenu background */
  --sidebar-submenu-indent: 24px;       /* Submenu item indentation */
}

.dark {
  /* Quote Status Colors - Dark Mode */
  --status-draft: 218 11% 65%;
  --status-draft-bg: 218 11% 65% / 0.15;
  --status-sent: 217 91% 60%;
  --status-sent-bg: 217 91% 60% / 0.15;
  --status-accepted: 142 71% 45%;
  --status-accepted-bg: 142 71% 45% / 0.15;
  --status-expired: 0 84% 60%;
  --status-expired-bg: 0 84% 60% / 0.15;

  /* Invoice Status Colors - Dark Mode */
  --status-pending: 38 92% 50%;
  --status-pending-bg: 38 92% 50% / 0.15;
  --status-paid: 142 71% 45%;
  --status-paid-bg: 142 71% 45%;
  --status-overdue: 0 84% 60%;
  --status-overdue-bg: 0 84% 60%;
  --status-partial: 217 91% 60%;
  --status-partial-bg: 217 91% 60% / 0.15;

  /* Sidebar Enhancement Colors - Dark Mode */
  --sidebar-submenu-bg: 240 6% 10%;
}
```

#### New Spacing Tokens

```css
:root {
  /* Sidebar Dimensions */
  --sidebar-width-expanded: 256px;
  --sidebar-width-collapsed: 64px;

  /* Table Dimensions */
  --table-row-height: 56px;
  --table-header-height: 48px;

  /* Chart Dimensions */
  --chart-bar-height: 32px;
  --chart-bar-gap: 16px;
  --radial-chart-size: 160px;
  --radial-stroke-width: 12px;
}
```

### 1.2 Extended Badge Variants

Add status-specific variants to the Badge component:

```typescript
// apps/web/components/ui/badge.tsx - Extended variants

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Existing variants...
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground shadow",
        warning: "border-transparent bg-warning text-warning-foreground shadow",
        info: "border-transparent bg-info text-info-foreground shadow",

        // NEW: Quote Status Variants (outline style)
        "status-draft": "border-[hsl(var(--status-draft))] text-[hsl(var(--status-draft))] bg-[hsl(var(--status-draft-bg))]",
        "status-sent": "border-[hsl(var(--status-sent))] text-[hsl(var(--status-sent))] bg-[hsl(var(--status-sent-bg))]",
        "status-accepted": "border-[hsl(var(--status-accepted))] text-[hsl(var(--status-accepted))] bg-[hsl(var(--status-accepted-bg))]",
        "status-expired": "border-[hsl(var(--status-expired))] text-[hsl(var(--status-expired))] bg-[hsl(var(--status-expired-bg))]",

        // NEW: Invoice Status Variants
        "status-pending": "border-[hsl(var(--status-pending))] text-[hsl(var(--status-pending))] bg-[hsl(var(--status-pending-bg))]",
        "status-paid": "border-transparent bg-[hsl(var(--status-paid-bg))] text-white",
        "status-overdue": "border-transparent bg-[hsl(var(--status-overdue-bg))] text-white",
        "status-partial": "border-[hsl(var(--status-partial))] text-[hsl(var(--status-partial))] bg-[hsl(var(--status-partial-bg))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

---

## 2. Component Specifications

### 2.1 AppSidebar (Enhanced)

**File:** `apps/web/components/layout/app-sidebar.tsx`

**FR Reference:** FR-P2-001, FR-P2-002, FR-P2-003, FR-P2-004

#### Component Structure

```
AppSidebar
+-- SidebarHeader
|   +-- WorkspaceSwitcher
|       +-- Logo (icon + text)
|       +-- Workspace name
|       +-- Tier badge
|       +-- Dropdown chevron
+-- SidebarContent
|   +-- SidebarGroup ("Platform")
|       +-- SidebarMenu
|           +-- SidebarMenuItem (Dashboard)
|           +-- SidebarMenuItem (Analytics)
|           +-- SidebarMenuItem (Clients)
|           +-- CollapsibleNavItem (Projects)
|           |   +-- SidebarMenuItem (Quotes)
|           |   +-- SidebarMenuItem (Invoices)
|           |   +-- SidebarMenuItem (Contracts)
|           +-- SidebarMenuItem (Settings)
+-- SidebarFooter
    +-- UserProfileSection
        +-- Avatar
        +-- User name
        +-- User email
        +-- Dropdown menu
```

#### Props Interface

```typescript
interface AppSidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    initials?: string;
  };
  workspace: {
    name: string;
    tier: "free" | "pro" | "enterprise";
    logo?: string;
  };
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavItem[];
  badge?: string | number;
  isActive?: boolean;
}
```

#### Visual Specifications

| Property | Expanded | Collapsed |
|----------|----------|-----------|
| Width | 256px (16rem) | 64px (4rem) |
| Background | `hsl(var(--sidebar-background))` | Same |
| Border | 1px `hsl(var(--sidebar-border))` right | Same |
| Logo | Full logo + text | Icon only |
| Nav items | Icon + label | Icon only + tooltip |
| User section | Avatar + name + email | Avatar only + tooltip |
| Submenu | Visible when parent expanded | Flyout on hover |

#### State Specifications

| State | Visual Treatment |
|-------|------------------|
| Default nav item | `text-sidebar-foreground/70` |
| Hover nav item | `bg-sidebar-accent text-sidebar-accent-foreground` |
| Active nav item | `bg-sidebar-primary text-sidebar-primary-foreground` |
| Active parent (child selected) | `bg-sidebar-accent` with `text-sidebar-foreground` |
| Submenu item default | `text-muted-foreground` with 24px left indent |
| Submenu item hover | `bg-muted/50` |
| Submenu item active | `bg-primary/10 text-primary` |

#### Measurements

```
Sidebar Expanded:
+------------------------------------------+
|  16px padding                            |
|  +--------------------------------------+|
|  | Logo (24x24) + 8px + Text            ||  <- 48px height
|  | "Quote Craft"                         ||
|  | [Enterprise] badge (20px height)     ||
|  +--------------------------------------+|
|  8px gap                                 |
|  +--------------------------------------+|
|  | Section: "Platform" (uppercase)      ||  <- 24px height
|  +--------------------------------------+|
|  4px gap                                 |
|  +--------------------------------------+|
|  | NavItem: Icon(20x20) + 12px + Label  ||  <- 40px height
|  +--------------------------------------+|
|  2px gap between items                   |
|                                          |
|  Submenu items:                          |
|  | 24px indent | Icon(16x16) + Label    ||  <- 36px height
|                                          |
+------------------------------------------+
```

---

### 2.2 DataTable (Generic)

**File:** `apps/web/components/ui/data-table.tsx`

**FR Reference:** FR-P2-010

#### Component Structure

```
DataTable
+-- DataTableToolbar
|   +-- PageSizeSelector ("Show X entries")
|   +-- CreateButton (primary action)
|   +-- SearchInput
|   +-- StatusFilter (dropdown)
|   +-- SettingsButton (optional)
+-- Table
|   +-- TableHeader
|   |   +-- TableHead (checkbox)
|   |   +-- TableHead (sortable columns)
|   +-- TableBody
|       +-- TableRow (selectable)
|           +-- TableCell (checkbox)
|           +-- TableCell (data cells)
|           +-- TableCell (actions)
+-- DataTablePagination
    +-- ResultsSummary ("Showing X to Y of Z")
    +-- PaginationButtons
```

#### Props Interface

```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: keyof TData;
  searchPlaceholder?: string;
  statusKey?: keyof TData;
  statusOptions?: { value: string; label: string }[];
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  onRowClick?: (row: TData) => void;
  onRowSelect?: (rows: TData[]) => void;
  createButton?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  emptyState?: {
    title: string;
    description: string;
    action?: { label: string; onClick: () => void };
  };
}

interface RowActionsProps<TData> {
  row: TData;
  actions: {
    download?: () => void;
    view?: () => void;
    edit?: () => void;
    duplicate?: () => void;
    delete?: () => void;
  };
}
```

#### Column Specifications

**Quotes Table:**

| Column | Width | Sortable | Alignment | Content |
|--------|-------|----------|-----------|---------|
| Checkbox | 40px | No | Center | Checkbox component |
| Quote ID | 100px | Yes | Left | `#QT-XXX` format, monospace |
| Status | 100px | Yes | Left | StatusBadge component |
| Client | flex (1fr) | Yes | Left | Avatar (32px) + Name + Email stack |
| Total | 100px | Yes | Right | Currency format with symbol |
| Expiry Date | 120px | Yes | Left | `YYYY-MM-DD` format |
| Actions | 100px | No | Right | Icon buttons |

**Invoices Table:**

| Column | Width | Sortable | Alignment | Content |
|--------|-------|----------|-----------|---------|
| Checkbox | 40px | No | Center | Checkbox component |
| Invoice ID | 100px | Yes | Left | `#INV-XXX` format, monospace |
| Status | 100px | Yes | Left | StatusBadge component |
| Client | flex (1fr) | Yes | Left | Avatar (32px) + Name + Email stack |
| Amount | 100px | Yes | Right | Currency format with symbol |
| Issued Date | 120px | Yes | Left | `YYYY-MM-DD` format |
| Actions | 100px | No | Right | Icon buttons |

#### Visual Specifications

```
DataTable Toolbar:
+------------------------------------------------------------------------+
| Show [10 v]  [+ New Quote]    [Search quotes...]    [All v]    [gear] |
+------------------------------------------------------------------------+
   ^            ^                 ^                     ^          ^
   |            |                 |                     |          |
   40px         primary btn       flex (240px min)      120px      36px

Table Row:
+------------------------------------------------------------------------+
| [ ] | #QT-101 | [Draft] | [O] John Doe        | $4,500 | 2023-11-01 | [...] |
|     |         |         |     john@email.com  |        |            |       |
+------------------------------------------------------------------------+
  40    100       100        flex                  100      120          100

Cell heights:
- Header: 48px
- Body row: 56px (allows for two-line client cell)
- Row hover: bg-muted/50
- Selected row: bg-muted
```

#### Action Icons

| Action | Icon | Size | Tooltip |
|--------|------|------|---------|
| Download | `Download` | 16px | "Download PDF" |
| View | `Eye` | 16px | "View details" |
| More | `MoreHorizontal` | 16px | "More actions" |

**More Dropdown Menu:**

| Item | Icon | Destructive |
|------|------|-------------|
| Edit | `Pencil` | No |
| Duplicate | `Copy` | No |
| --- | (separator) | - |
| Delete | `Trash2` | Yes |

---

### 2.3 StatusBadge

**File:** `apps/web/components/ui/status-badge.tsx`

**FR Reference:** FR-P2-011

#### Component Structure

```typescript
interface StatusBadgeProps {
  entity: "quote" | "invoice";
  status: QuoteStatus | InvoiceStatus;
  size?: "sm" | "md";
}

type QuoteStatus = "draft" | "sent" | "accepted" | "expired";
type InvoiceStatus = "pending" | "paid" | "overdue" | "partial";
```

#### Status Mapping

```typescript
const statusConfig = {
  quote: {
    draft: {
      variant: "status-draft",
      label: "Draft",
      icon: FileText
    },
    sent: {
      variant: "status-sent",
      label: "Sent",
      icon: Send
    },
    accepted: {
      variant: "status-accepted",
      label: "Accepted",
      icon: CheckCircle
    },
    expired: {
      variant: "status-expired",
      label: "Expired",
      icon: Clock
    },
  },
  invoice: {
    pending: {
      variant: "status-pending",
      label: "Pending",
      icon: Clock
    },
    paid: {
      variant: "status-paid",
      label: "Paid",
      icon: CheckCircle
    },
    overdue: {
      variant: "status-overdue",
      label: "Overdue",
      icon: AlertTriangle
    },
    partial: {
      variant: "status-partial",
      label: "Partial",
      icon: CreditCard
    },
  },
};
```

#### Visual Specifications

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| sm | 20px | px-2 py-0.5 | 10px | 12px |
| md (default) | 24px | px-2.5 py-0.5 | 12px | 14px |

**Quote Badges (Outline Style):**

| Status | Border | Text | Background |
|--------|--------|------|------------|
| Draft | Gray (#6B7280) | Gray | Gray/10% |
| Sent | Blue (#3B82F6) | Blue | Blue/10% |
| Accepted | Green (#22C55E) | Green | Green/10% |
| Expired | Red (#EF4444) | Red | Red/10% |

**Invoice Badges (Mixed Style):**

| Status | Border | Text | Background |
|--------|--------|------|------------|
| Pending | Amber (#F59E0B) | Amber | Amber/10% |
| Paid | None | White | Green solid (#22C55E) |
| Overdue | None | White | Red solid (#EF4444) |
| Partial | Blue (#3B82F6) | Blue | Blue/10% |

---

### 2.4 AnalyticsSection (Collapsible Card Group)

**File:** `apps/web/components/analytics/analytics-section.tsx`

**FR Reference:** FR-P2-013, FR-P2-014, FR-P2-015, FR-P2-016

#### Component Structure

```
AnalyticsSection
+-- SectionHeader
|   +-- SectionLabel (uppercase, muted)
|   +-- CollapseToggle (chevron)
+-- Collapsible
    +-- CardGrid
        +-- AnalyticsCard[]
```

#### Props Interface

```typescript
interface AnalyticsSectionProps {
  label: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}
```

#### Section Layout

```
FINANCIAL HEALTH                                               [^]
+------------------------------------------------------------------+
|  +---------------------------+  +---------------------------+    |
|  | Revenue Forecast          |  | Accounts Receivable Aging |    |
|  | Actual vs Projected       |  | Outstanding invoices      |    |
|  |                           |  |                           |    |
|  | [Area Chart]              |  | [Horizontal Bar Chart]    |    |
|  |                           |  |                           |    |
|  | Legend: Projected, Actual |  | Warning: $1,200 overdue   |    |
|  +---------------------------+  +---------------------------+    |
+------------------------------------------------------------------+
```

#### Visual Specifications

| Element | Specification |
|---------|---------------|
| Section label | `text-xs font-medium uppercase tracking-wider text-muted-foreground` |
| Section gap | 16px between header and cards |
| Card grid | 2 columns on desktop, 1 column on mobile |
| Card gap | 24px |
| Card padding | 24px (p-6) |
| Card shadow | shadow-sm |
| Card radius | rounded-xl (12px) |

---

### 2.5 RadialProgressChart

**File:** `apps/web/components/charts/radial-progress-chart.tsx`

**FR Reference:** FR-P2-012, FR-P2-013

#### Component Structure

```
RadialProgressChart
+-- SVG Container
|   +-- Background Track (circle)
|   +-- Progress Arc (circle with stroke-dasharray)
+-- CenterContent
    +-- Value (large percentage)
    +-- Label ("Converted")
    +-- TrendIndicator (optional)
```

#### Props Interface

```typescript
interface RadialProgressChartProps {
  value: number;              // 0-100 percentage
  label?: string;
  size?: number;              // Default: 160
  strokeWidth?: number;       // Default: 12
  trackColor?: string;        // Default: --muted
  progressColor?: string;     // Default: --primary
  trend?: {
    direction: "up" | "down";
    value: number;            // Percentage change
    period?: string;          // e.g., "vs last month"
  };
  className?: string;
}
```

#### Visual Specifications

```
        +---------------+
       /                 \
      |    +---------+    |
      |    |   68%   |    |   <- Large value text
      |    | Converted|    |   <- Label text
      |    |  +5.2%  |    |   <- Trend (green/red)
      |    +---------+    |
       \                 /
        +---------------+

Size: 160px diameter (default)
Track: 12px stroke, muted color
Progress: 12px stroke, primary color
Animation: stroke-dashoffset transition 1s ease-out
```

| Element | Specification |
|---------|---------------|
| Container | 160x160px (default) |
| Track circle | stroke-width: 12px, stroke: `hsl(var(--muted))` |
| Progress circle | stroke-width: 12px, stroke: `hsl(var(--primary))` |
| Value text | text-3xl font-bold |
| Label text | text-sm text-muted-foreground |
| Trend up | text-sm text-green-600, ChevronUp icon |
| Trend down | text-sm text-red-600, ChevronDown icon |

---

### 2.6 PreviewTabs

**File:** `apps/web/components/quotes/preview-tabs.tsx`

**FR Reference:** FR-P2-019

#### Component Structure

```
PreviewTabs
+-- TabsList
|   +-- TabsTrigger (Payment Page)
|   +-- TabsTrigger (Email Preview)
|   +-- TabsTrigger (Invoice PDF)
+-- TabsContent (Payment Page)
|   +-- PaymentPagePreview
+-- TabsContent (Email Preview)
|   +-- EmailTemplatePreview
+-- TabsContent (Invoice PDF)
    +-- PDFPreview
```

#### Props Interface

```typescript
interface PreviewTabsProps {
  quoteData: QuoteFormData;
  activeTab?: "payment" | "email" | "pdf";
  onTabChange?: (tab: string) => void;
  className?: string;
}

interface QuoteFormData {
  logo?: string;
  businessName?: string;
  clientName?: string;
  clientEmail?: string;
  invoiceNumber?: string;
  dueDate?: Date;
  lineItems?: LineItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
}
```

#### Visual Specifications

```
Preview Panel (40% width):
+------------------------------------------+
| [Payment Page] [Email Preview] [Invoice] |  <- Tabs
+------------------------------------------+
|  +--------------------------------------+|
|  |  Your Business          $0.00       ||  <- Header
|  |  Due on Feb 24, 2026                ||
|  +--------------------------------------+|
|  |  Client Name                        ||
|  |  client@email.com                   ||
|  |  [Client Portal]                    ||
|  +--------------------------------------+|
|  |  Invoice Details                    ||
|  |  Invoice #0001                      ||
|  |  [Hide details]                     ||
|  |                                     ||
|  |  Subtotal           $0.00          ||
|  |  Total              $0.00          ||
|  |  Paid               $0.00          ||
|  |  Balance Due        $0.00          ||
|  +--------------------------------------+|
|  |  Thank you for your business!       ||
|  |                                     ||
|  |  [Download Invoice]                 ||
|  |                                     ||
|  |  Questions? Contact us...           ||
|  +--------------------------------------+|
+------------------------------------------+
```

| Element | Specification |
|---------|---------------|
| Tab list | h-9, inline-flex, rounded-lg bg-muted p-1 |
| Tab trigger | px-3 py-1.5, text-sm, rounded-md |
| Tab trigger active | bg-background shadow-sm |
| Preview container | bg-muted/30, rounded-lg, p-4 |
| Preview card | bg-white, rounded-lg, shadow-sm |
| Business name | text-lg font-semibold |
| Amount | text-2xl font-bold |
| Section headers | text-sm font-medium text-muted-foreground |

---

## 3. Responsive Specifications

### 3.1 Breakpoint System

| Breakpoint | Width | Tailwind Class |
|------------|-------|----------------|
| Mobile | < 640px | (default) |
| Small | >= 640px | `sm:` |
| Medium | >= 768px | `md:` |
| Large | >= 1024px | `lg:` |
| Desktop | >= 1280px | `xl:` |
| Wide | >= 1536px | `2xl:` |

### 3.2 Sidebar Behavior

| Breakpoint | Default State | Toggle Available | Layout Mode |
|------------|---------------|------------------|-------------|
| Mobile (< 768px) | Hidden | Sheet overlay | Fullscreen overlay |
| Tablet (768-1279px) | Collapsed (64px) | Yes | Icon + flyout |
| Desktop (>= 1280px) | Expanded (256px) | Yes | Full sidebar |

#### Mobile Sidebar (Sheet)

```typescript
// Mobile: Use Sheet component
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-[280px] p-0">
    <AppSidebar mobile />
  </SheetContent>
</Sheet>
```

#### Tablet Sidebar (Collapsed)

```css
@media (min-width: 768px) and (max-width: 1279px) {
  [data-sidebar="sidebar"] {
    width: var(--sidebar-width-collapsed);
  }
  [data-sidebar="content"] {
    margin-left: var(--sidebar-width-collapsed);
  }
}
```

#### Desktop Sidebar (Expanded)

```css
@media (min-width: 1280px) {
  [data-sidebar="sidebar"] {
    width: var(--sidebar-width-expanded);
  }
  [data-sidebar="content"] {
    margin-left: var(--sidebar-width-expanded);
  }
}
```

### 3.3 DataTable Responsive Behavior

| Breakpoint | Columns Visible | Layout |
|------------|-----------------|--------|
| Mobile | ID, Status, Actions | Horizontal scroll |
| Tablet | ID, Status, Client (name only), Total, Actions | Full width |
| Desktop | All columns | Full width |

#### Mobile Table

```typescript
// Horizontal scroll wrapper
<div className="overflow-x-auto -mx-4 px-4">
  <Table className="min-w-[600px]">
    {/* ... */}
  </Table>
</div>

// Column visibility
const visibleColumns = {
  mobile: ['id', 'status', 'actions'],
  tablet: ['id', 'status', 'client', 'total', 'actions'],
  desktop: ['checkbox', 'id', 'status', 'client', 'total', 'date', 'actions'],
};
```

### 3.4 Analytics Grid Layout

```css
/* Mobile: Single column */
.analytics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Tablet: Two columns */
@media (min-width: 768px) {
  .analytics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

/* Desktop: Flexible layout with span */
@media (min-width: 1280px) {
  .analytics-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  .analytics-card--wide {
    grid-column: span 2;
  }
}
```

### 3.5 Quote Builder Split-Pane

| Breakpoint | Layout | Form Width | Preview Width |
|------------|--------|------------|---------------|
| Mobile | Stacked (tabs) | 100% | 100% |
| Tablet | Side-by-side | 50% | 50% |
| Desktop | Side-by-side | 60% | 40% |

```typescript
// Mobile: Toggle between form and preview
<Tabs defaultValue="form" className="lg:hidden">
  <TabsList>
    <TabsTrigger value="form">Edit</TabsTrigger>
    <TabsTrigger value="preview">Preview</TabsTrigger>
  </TabsList>
  <TabsContent value="form">{/* Form */}</TabsContent>
  <TabsContent value="preview">{/* Preview */}</TabsContent>
</Tabs>

// Desktop: Split pane
<div className="hidden lg:flex gap-6">
  <div className="w-[60%]">{/* Form */}</div>
  <div className="w-[40%]">{/* Preview */}</div>
</div>
```

---

## 4. Accessibility Requirements

### 4.1 ARIA Roles by Component

#### AppSidebar

| Element | Role | ARIA Attributes |
|---------|------|-----------------|
| Sidebar container | `navigation` | `aria-label="Main navigation"` |
| Nav group | `group` | `aria-labelledby={sectionId}` |
| Nav item link | `link` | `aria-current="page"` (when active) |
| Collapsible parent | `button` | `aria-expanded`, `aria-controls` |
| Submenu | `menu` | `aria-labelledby={parentId}` |
| Collapse toggle | `button` | `aria-label="Toggle sidebar"`, `aria-expanded` |
| User dropdown | `button` | `aria-haspopup="menu"`, `aria-expanded` |

```typescript
// Example implementation
<nav role="navigation" aria-label="Main navigation">
  <div role="group" aria-labelledby="nav-section-platform">
    <span id="nav-section-platform" className="sr-only">Platform</span>
    <button
      role="button"
      aria-expanded={isExpanded}
      aria-controls="projects-submenu"
      onClick={() => setExpanded(!isExpanded)}
    >
      <FolderIcon />
      <span>Projects</span>
      <ChevronDown aria-hidden="true" />
    </button>
    <div id="projects-submenu" role="menu" hidden={!isExpanded}>
      {/* submenu items */}
    </div>
  </div>
</nav>
```

#### DataTable

| Element | Role | ARIA Attributes |
|---------|------|-----------------|
| Table container | `table` | `aria-label="Quotes table"` |
| Table header | `rowgroup` | - |
| Header row | `row` | - |
| Header cell | `columnheader` | `aria-sort="ascending|descending|none"` |
| Table body | `rowgroup` | - |
| Body row | `row` | `aria-selected` (when selectable) |
| Body cell | `cell` | - |
| Select all checkbox | `checkbox` | `aria-label="Select all rows"` |
| Row checkbox | `checkbox` | `aria-label="Select row"` |
| Sort button | `button` | `aria-label="Sort by {column}"` |
| Pagination | `navigation` | `aria-label="Table pagination"` |

```typescript
// Sort header example
<TableHead>
  <Button
    variant="ghost"
    onClick={() => handleSort('client')}
    aria-label={`Sort by client ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
  >
    Client
    <ArrowUpDown className="ml-2 h-4 w-4" aria-hidden="true" />
  </Button>
</TableHead>
```

#### StatusBadge

| Element | Role | ARIA Attributes |
|---------|------|-----------------|
| Badge | `status` | `aria-label="{entity} status: {status}"` |

```typescript
<Badge
  role="status"
  aria-label={`Quote status: ${status}`}
  variant={`status-${status}`}
>
  {statusLabel}
</Badge>
```

#### RadialProgressChart

| Element | Role | ARIA Attributes |
|---------|------|-----------------|
| Chart container | `img` | `aria-label="Conversion rate: {value}%"` |
| Progress indicator | `progressbar` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

```typescript
<div
  role="img"
  aria-label={`Conversion rate: ${value}% ${trend ? `${trend.direction === 'up' ? 'up' : 'down'} ${trend.value}%` : ''}`}
>
  <svg role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    {/* ... */}
  </svg>
</div>
```

#### AnalyticsSection

| Element | Role | ARIA Attributes |
|---------|------|-----------------|
| Section | `region` | `aria-labelledby={headingId}` |
| Section heading | `heading` | `id={headingId}` |
| Collapse toggle | `button` | `aria-expanded`, `aria-controls` |
| Content area | - | `id={contentId}` |

### 4.2 Keyboard Navigation

#### Global Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus to next interactive element |
| `Shift + Tab` | Move focus to previous interactive element |
| `Enter` / `Space` | Activate focused element |
| `Escape` | Close modal/dropdown/menu |
| `Arrow Down/Up` | Navigate within dropdown/menu |

#### Sidebar Navigation

| Key | Context | Action |
|-----|---------|--------|
| `Tab` | Sidebar | Move through nav items |
| `Enter` | Nav item | Navigate to page |
| `Enter` | Collapsible parent | Toggle submenu |
| `Arrow Down` | Expanded submenu | Move to next item |
| `Arrow Up` | Expanded submenu | Move to previous item |
| `Arrow Right` | Collapsed parent | Expand submenu |
| `Arrow Left` | Expanded submenu | Collapse submenu |
| `Home` | Nav list | Move to first item |
| `End` | Nav list | Move to last item |

#### DataTable

| Key | Context | Action |
|-----|---------|--------|
| `Tab` | Table | Move through interactive cells |
| `Space` | Checkbox | Toggle selection |
| `Enter` | Row | View detail (if onRowClick) |
| `Enter` | Sort header | Toggle sort direction |
| `Arrow Up/Down` | Row focus | Move between rows |
| `Page Up/Down` | Table | Navigate pages |

### 4.3 Focus Management

#### Focus Indicators

```css
/* Global focus ring */
*:focus-visible {
  outline: none;
  ring: 2px solid hsl(var(--ring));
  ring-offset: 2px;
  ring-offset-color: hsl(var(--background));
}

/* Skip to content link */
.skip-to-content {
  position: absolute;
  left: -9999px;
  z-index: 9999;
}

.skip-to-content:focus {
  left: 8px;
  top: 8px;
  padding: 8px 16px;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: 4px;
}
```

#### Focus Trap (Modals/Dialogs)

```typescript
// All dialogs must trap focus
<Dialog onOpenChange={setOpen}>
  <DialogContent>
    {/* Focus trapped within */}
    <DialogHeader>...</DialogHeader>
    <DialogFooter>
      <Button onClick={handleCancel}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 4.4 Color Contrast Requirements

All text must meet WCAG 2.1 AA standards:

| Text Type | Minimum Ratio | Notes |
|-----------|---------------|-------|
| Normal text (< 18px) | 4.5:1 | Body text, labels |
| Large text (>= 18px bold) | 3:1 | Headings |
| UI components | 3:1 | Icons, borders |
| Decorative | N/A | Non-essential visuals |

**Status Badge Contrast Verification:**

| Badge | Background | Text | Ratio |
|-------|------------|------|-------|
| Draft (outline) | White | #6B7280 | 5.6:1 |
| Sent (outline) | White | #3B82F6 | 4.5:1 |
| Accepted (outline) | White | #22C55E | 3.2:1 (use darker green) |
| Paid (solid) | #22C55E | White | 3.1:1 (use darker green) |
| Overdue (solid) | #EF4444 | White | 4.6:1 |

**Recommended adjustments for green badges:**
- Use `#16A34A` (green-600) instead of `#22C55E` (green-500) for better contrast

### 4.5 Screen Reader Considerations

#### Announce Dynamic Updates

```typescript
// Use aria-live for dynamic content
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {searchResults.length} results found
</div>

// Loading states
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? <Skeleton /> : <Content />}
</div>
```

#### Descriptive Labels

```typescript
// Icon-only buttons MUST have labels
<Button variant="ghost" size="icon" aria-label="Download PDF">
  <Download className="h-4 w-4" aria-hidden="true" />
</Button>

// Empty states
<div role="status" aria-label="No quotes found">
  <EmptyState
    title="No quotes yet"
    description="Create your first quote to get started"
    action={{ label: "Create Quote", onClick: handleCreate }}
  />
</div>
```

---

## 5. Animation Specifications

### 5.1 Sidebar Collapse Animation

```css
/* Sidebar width transition */
[data-sidebar="sidebar"] {
  transition: width 200ms ease-in-out;
}

/* Content margin transition */
[data-sidebar="content"] {
  transition: margin-left 200ms ease-in-out;
}

/* Label fade in expanded mode */
[data-sidebar="expanded"] .sidebar-label {
  animation: fade-in 150ms ease-out 100ms both;
}

/* Label hide in collapsed mode */
[data-sidebar="collapsed"] .sidebar-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
}
```

### 5.2 Submenu Expand Animation

```typescript
// Using Radix Collapsible
const submenuAnimation = {
  open: {
    height: 'var(--radix-collapsible-content-height)',
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};
```

```css
/* Chevron rotation */
.chevron-icon {
  transition: transform 200ms ease-in-out;
}

[data-state="open"] .chevron-icon {
  transform: rotate(180deg);
}

/* Submenu slide */
@keyframes submenu-expand {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
    opacity: 1;
  }
}

@keyframes submenu-collapse {
  from {
    height: var(--radix-collapsible-content-height);
    opacity: 1;
  }
  to {
    height: 0;
    opacity: 0;
  }
}

[data-state="open"] > .submenu-content {
  animation: submenu-expand 200ms ease-out;
}

[data-state="closed"] > .submenu-content {
  animation: submenu-collapse 200ms ease-out;
}
```

### 5.3 Chart Transitions

#### Radial Progress Chart

```css
/* Initial state */
.radial-progress-track {
  stroke: hsl(var(--muted));
  stroke-width: 12;
  fill: none;
}

.radial-progress-value {
  stroke: hsl(var(--primary));
  stroke-width: 12;
  fill: none;
  stroke-linecap: round;
  stroke-dasharray: 283; /* 2 * PI * r (r=45) */
  stroke-dashoffset: 283;
  transform-origin: center;
  transform: rotate(-90deg);
  transition: stroke-dashoffset 1s ease-out;
}

/* Animated state (value = 68%) */
.radial-progress-value[data-value="68"] {
  stroke-dashoffset: 90.56; /* 283 * (1 - 0.68) */
}
```

#### Area Chart

```typescript
// Recharts config for smooth animations
<AreaChart data={data}>
  <Area
    type="monotone"
    dataKey="projected"
    stroke="hsl(var(--chart-projected))"
    fill="url(#projectedGradient)"
    animationDuration={1000}
    animationEasing="ease-out"
  />
  <Area
    type="monotone"
    dataKey="actual"
    stroke="hsl(var(--chart-actual))"
    fill="url(#actualGradient)"
    animationDuration={1000}
    animationEasing="ease-out"
    animationBegin={200}
  />
</AreaChart>
```

#### Bar Chart

```typescript
// Horizontal bar chart animation
<BarChart layout="vertical" data={data}>
  <Bar
    dataKey="amount"
    radius={[0, 4, 4, 0]}
    animationDuration={800}
    animationEasing="ease-out"
  >
    {data.map((entry, index) => (
      <Cell key={index} fill={getBarColor(entry.bucket)} />
    ))}
  </Bar>
</BarChart>
```

### 5.4 Table Row Animations

```css
/* Row hover transition */
.table-row {
  transition: background-color 150ms ease;
}

.table-row:hover {
  background-color: hsl(var(--muted) / 0.5);
}

/* Selection transition */
.table-row[data-selected="true"] {
  background-color: hsl(var(--muted));
}

/* New row entrance */
@keyframes row-enter {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.table-row--new {
  animation: row-enter 200ms ease-out;
}
```

### 5.5 Preview Tab Transitions

```css
/* Tab content fade */
[data-state="active"].tab-content {
  animation: tab-fade-in 200ms ease-out;
}

@keyframes tab-fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Preview update shimmer */
@keyframes preview-update {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.preview-updating {
  background: linear-gradient(
    90deg,
    transparent 0%,
    hsl(var(--primary) / 0.1) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: preview-update 1.5s ease infinite;
}
```

### 5.6 Motion Preferences

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .radial-progress-value {
    transition: none;
  }
}
```

---

## 6. Implementation Guidelines

### 6.1 Component File Structure

```
apps/web/components/
+-- ui/
|   +-- badge.tsx              # Extended with status variants
|   +-- data-table.tsx         # NEW: Generic data table
|   +-- data-table-toolbar.tsx # NEW: Table toolbar
|   +-- data-table-pagination.tsx # NEW: Table pagination
|   +-- status-badge.tsx       # NEW: Status-specific badge
|   +-- (existing shadcn components)
+-- layout/
|   +-- app-sidebar.tsx        # ENHANCED: With nested nav
|   +-- sidebar-nav.tsx        # NEW: Navigation items
|   +-- sidebar-user.tsx       # NEW: User profile section
|   +-- workspace-switcher.tsx # NEW: Workspace selector
|   +-- breadcrumb-nav.tsx     # NEW: Dynamic breadcrumb
+-- charts/
|   +-- radial-progress-chart.tsx  # NEW
|   +-- dual-area-chart.tsx        # NEW
|   +-- horizontal-bar-chart.tsx   # NEW (AR aging)
|   +-- vertical-bar-chart.tsx     # EXISTING (enhanced)
|   +-- donut-chart.tsx            # NEW (revenue by category)
+-- analytics/
|   +-- analytics-section.tsx      # NEW: Collapsible section
|   +-- sales-pipeline.tsx         # NEW
|   +-- financial-health.tsx       # NEW
|   +-- client-insights.tsx        # NEW
|   +-- service-performance.tsx    # NEW
+-- quotes/
|   +-- preview-tabs.tsx           # NEW
|   +-- payment-page-preview.tsx   # NEW
|   +-- email-preview.tsx          # NEW
|   +-- pdf-preview.tsx            # NEW
```

### 6.2 Token Usage Checklist

When implementing components, use tokens consistently:

| Use Case | Token/Class |
|----------|-------------|
| Page background | `bg-background` |
| Card background | `bg-card` |
| Primary text | `text-foreground` |
| Muted text | `text-muted-foreground` |
| Primary button | `bg-primary text-primary-foreground` |
| Border | `border-border` |
| Focus ring | `ring-ring` |
| Status colors | `hsl(var(--status-{status}))` |
| Chart colors | `hsl(var(--chart-{n}))` |

### 6.3 Testing Checklist

For each component, verify:

- [ ] Renders correctly in light mode
- [ ] Renders correctly in dark mode
- [ ] Meets color contrast requirements
- [ ] Keyboard navigable
- [ ] Screen reader accessible (test with VoiceOver/NVDA)
- [ ] Responsive at all breakpoints
- [ ] Animations respect reduced motion preference
- [ ] Focus indicators visible
- [ ] ARIA attributes present and correct
- [ ] Tooltip displays for icon-only elements

### 6.4 Performance Considerations

1. **Code Splitting:** Analytics charts should be dynamically imported
   ```typescript
   const RadialProgressChart = dynamic(
     () => import('@/components/charts/radial-progress-chart'),
     { loading: () => <Skeleton className="h-40 w-40 rounded-full" /> }
   );
   ```

2. **Memoization:** Table rows and chart data should be memoized
   ```typescript
   const memoizedRows = useMemo(() => processRows(data), [data]);
   ```

3. **Debouncing:** Search input must debounce by 300ms
   ```typescript
   const debouncedSearch = useDebouncedCallback(handleSearch, 300);
   ```

4. **Skeleton Loading:** All async content should show skeletons
   ```typescript
   {isLoading ? (
     <Skeleton className="h-[200px] w-full rounded-lg" />
   ) : (
     <Chart data={data} />
   )}
   ```

---

## Appendix A: Color Palette Quick Reference

### Status Colors (HSL)

| Status | HSL | Hex |
|--------|-----|-----|
| Draft | 220 9% 46% | #6B7280 |
| Sent | 217 91% 60% | #3B82F6 |
| Accepted | 142 71% 45% | #22C55E |
| Expired | 0 84% 60% | #EF4444 |
| Pending | 38 92% 50% | #F59E0B |
| Paid | 142 71% 45% | #22C55E |
| Overdue | 0 84% 60% | #EF4444 |
| Partial | 217 91% 60% | #3B82F6 |

### Chart Colors (HSL)

| Use Case | HSL | Hex |
|----------|-----|-----|
| AR 0-30 days | 217 91% 60% | #3B82F6 |
| AR 31-60 days | 25 95% 53% | #FB923C |
| AR 60+ days | 0 91% 71% | #F87171 |
| Projected | 270 67% 85% | #C4B5FD |
| Actual | 263 70% 50% | #7C3AED |

---

## Appendix B: Icon Reference

All icons from `lucide-react`:

| Component | Icon | Usage |
|-----------|------|-------|
| Dashboard | `LayoutDashboard` | Nav item |
| Analytics | `BarChart3` | Nav item |
| Clients | `Users` | Nav item |
| Projects | `FolderKanban` | Nav item (collapsible) |
| Quotes | `FileText` | Submenu item |
| Invoices | `Receipt` | Submenu item |
| Contracts | `FileCheck` | Submenu item |
| Settings | `Settings` | Nav item |
| Collapse sidebar | `PanelLeftClose` | Toggle button |
| Expand sidebar | `PanelLeftOpen` | Toggle button |
| Chevron down | `ChevronDown` | Submenu indicator |
| Search | `Search` | Table toolbar |
| Download | `Download` | Row action |
| View | `Eye` | Row action |
| Edit | `Pencil` | Dropdown item |
| Duplicate | `Copy` | Dropdown item |
| Delete | `Trash2` | Dropdown item (destructive) |
| More | `MoreHorizontal` | Row action dropdown |
| Trend up | `TrendingUp` | Analytics |
| Trend down | `TrendingDown` | Analytics |
| Check | `CheckCircle` | Success status |
| Warning | `AlertTriangle` | Warning status |
| Clock | `Clock` | Pending/expired status |
| Send | `Send` | Sent status |

---

*Document generated by UI/UX Design Agent*
*Version 1.0 - 2026-02-13*
