# UI Component References

This document provides detailed specifications for recreating the premium Shadcn Studio components referenced in the brief.

---

## 1. Application Shell (Layout)

### Reference
- **Source**: Shadcn Studio Application Shell 10
- **URL**: https://shadcnstudio.com/blocks/dashboard-and-application/application-shell#application-shell-10
- **Note**: Premium block - must be recreated from scratch

### Component Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] Quote Craft     [⬍]  │  [☰] Dashboard > Projects Invoices   [🔧] │
│        Enterprise            │                                           │
├─────────────────────────────┼───────────────────────────────────────────┤
│ Platform                     │                                           │
│ ┌─────────────────────────┐ │  Page Title                               │
│ │ 📊 Dashboard            │ │                                           │
│ └─────────────────────────┘ │  ┌─────────────────────────────────────┐  │
│   ⏱  Analytics              │  │  Content Area                       │  │
│   👥 Clients                 │  │                                     │  │
│   📁 Projects          [⌄]  │  │                                     │  │
│       Quotes                 │  │                                     │  │
│       Invoices    ← active   │  │                                     │  │
│       Contracts              │  │                                     │  │
│   ⚙️  Settings               │  │                                     │  │
│                              │  └─────────────────────────────────────┘  │
│                              │                                           │
│                              │                                           │
│                              │                                           │
│ ┌─────────────────────────┐ │                                           │
│ │ 🟣 John Doe        [⬍]  │ │                                           │
│ │   john@oreko.com   │ │                                           │
│ └─────────────────────────┘ │                                           │
└─────────────────────────────┴───────────────────────────────────────────┘
```

### Collapsed Mode (Icon Only)

```
┌────────┬────────────────────────────────────────────────────────────────┐
│ [Logo] │  [☰] Dashboard > Projects Invoices                       [🔧] │
├────────┼────────────────────────────────────────────────────────────────┤
│  📊    │                                                                │
│  ⏱     │  Content Area                                                  │
│  👥    │                                                                │
│  📁    │                                                                │
│  ⚙️    │                                                                │
│        │                                                                │
│        │                                                                │
│  🟣    │                                                                │
└────────┴────────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### Sidebar Component Props
```typescript
interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  activeItem: string;
  items: NavItem[];
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  workspace: {
    name: string;
    tier: string;
  };
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavItem[];
  badge?: string | number;
}
```

#### CSS Specifications
- Sidebar width (expanded): `256px` (16rem)
- Sidebar width (collapsed): `64px` (4rem)
- Background: `hsl(var(--background))` with subtle border
- Active item: `bg-primary/10` with `text-primary`
- Hover state: `bg-muted`
- Transition: `width 200ms ease-in-out`

---

## 2. Data Table Component

### Reference
- **Source**: Shadcn Studio Datatable 5
- **URL**: https://shadcnstudio.com/blocks/datatable/datatable-component#datatable-5
- **Note**: Premium block - must be recreated from scratch

### Component Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Show [10 ⌄] [+ New Quote]  [🔍 Search quotes...]  [All ⌄]        [⚙️]  │
├─────────────────────────────────────────────────────────────────────────┤
│ ☐  Quote ID    Status      Client                    Total   Expiry    │
├─────────────────────────────────────────────────────────────────────────┤
│ ☐  #QT-101    [Draft]     🟣 StartUp Inc           $4,500  2023-11-01  │
│                            founder@startup.com              [⬇][👁][⋯] │
├─────────────────────────────────────────────────────────────────────────┤
│ ☐  #QT-102    [Sent]      🟣 Enterprise Corp      $15,000  2023-11-15  │
│                            procurement@corp.com             [⬇][👁][⋯] │
├─────────────────────────────────────────────────────────────────────────┤
│ ☐  #QT-103    [Accepted]  🟣 Local Biz             $2,200  2023-10-30  │
│                            owner@localbiz.com               [⬇][👁][⋯] │
├─────────────────────────────────────────────────────────────────────────┤
│ Showing 1 to 3 of 3 entries              [< Previous] [1] [Next >]     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Column Configurations

#### Quotes Table
| Column | Width | Sortable | Content |
|--------|-------|----------|---------|
| Checkbox | 40px | No | Selection checkbox |
| Quote ID | 100px | Yes | `#QT-XXX` format |
| Status | 100px | Yes | Badge component |
| Client | flex | Yes | Avatar + Name + Email |
| Total | 100px | Yes | Currency formatted |
| Expiry Date | 120px | Yes | ISO date |
| Actions | 100px | No | Download, View, More |

#### Invoices Table
| Column | Width | Sortable | Content |
|--------|-------|----------|---------|
| Checkbox | 40px | No | Selection checkbox |
| Invoice ID | 100px | Yes | `#INV-XXX` format |
| Status | 100px | Yes | Badge component |
| Client | flex | Yes | Avatar + Name + Email |
| Amount | 100px | Yes | Currency formatted |
| Issued Date | 120px | Yes | ISO date |
| Actions | 100px | No | Delete, View, More |

### Implementation Details

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterKey?: string;
  filterOptions?: { label: string; value: string }[];
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: T) => void;
  createButton?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## 3. Charts & Visualizations

### Reference
- **Source**: Shadcn Charts (Area Charts)
- **URL**: https://www.shadcn-svelte.com/charts/area
- **Library**: Recharts (React version)

### Chart Styles

#### Area Chart (Revenue Forecast)
```typescript
const chartConfig = {
  projected: {
    label: "Projected (Quotes)",
    color: "hsl(var(--chart-1))", // Light purple fill
  },
  actual: {
    label: "Actual Revenue",
    color: "hsl(var(--chart-2))", // Darker purple line
  },
};
```

- Fill: Gradient from `color` at 30% opacity to transparent
- Stroke: Solid 2px line
- Curve: `monotone` for smooth curves
- Grid: Horizontal dashed lines only

#### Bar Chart (Horizontal - AR Aging)
```typescript
const colors = {
  "0-30": "hsl(var(--chart-1))",    // Blue/purple
  "31-60": "hsl(var(--chart-3))",   // Orange/amber
  "60+": "hsl(var(--destructive))", // Red
};
```

- Border radius: `4px` on right side only
- Bar height: `32px`
- Gap between bars: `16px`

#### Radial Chart (Conversion Rate)
- Center text: Large percentage value
- Subtitle: "Converted"
- Track color: `hsl(var(--muted))`
- Progress color: `hsl(var(--primary))`
- Stroke width: `12px`

#### Pie/Donut Chart (Revenue by Category)
- Inner radius: 60% (donut style)
- Segment gap: `2px`
- Legend: Below chart, horizontal layout
- Colors: Cycle through `chart-1` to `chart-5`

---

## 4. Status Badge Variants

### Quote Statuses
```css
/* Draft - Gray outline */
.badge-draft {
  @apply border-gray-300 text-gray-600 bg-transparent;
}

/* Sent - Blue outline */
.badge-sent {
  @apply border-blue-300 text-blue-600 bg-transparent;
}

/* Accepted - Green outline */
.badge-accepted {
  @apply border-green-300 text-green-600 bg-transparent;
}

/* Expired - Red outline (not shown in mockups) */
.badge-expired {
  @apply border-red-300 text-red-600 bg-transparent;
}
```

### Invoice Statuses
```css
/* Pending - Yellow/amber outline */
.badge-pending {
  @apply border-amber-300 text-amber-700 bg-transparent;
}

/* Paid - Green solid */
.badge-paid {
  @apply border-green-500 bg-green-500 text-white;
}

/* Overdue - Red solid */
.badge-overdue {
  @apply border-red-500 bg-red-500 text-white;
}
```

---

## 5. Form Components (Builder)

### Split-Pane Layout
```
┌─────────────────────────────────┬─────────────────────────────────┐
│         Form Editor (60%)       │      Live Preview (40%)         │
│                                 │                                 │
│  Logo Upload                    │  [Payment Page][Email][PDF]     │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │ 📷 Upload your logo     │   │  │  Your Business          │   │
│  │    PNG, JPG up to 2MB   │   │  │            $0.00        │   │
│  └─────────────────────────┘   │  │  Due on Feb 24, 2026    │   │
│                                 │  │                         │   │
│  Invoice Details    [Options⌄] │  │  Client Name            │   │
│  Customer: [_______________]   │  │  client@email.com       │   │
│  Email:    [_______________]   │  │                         │   │
│                                 │  │  Invoice Details        │   │
│  Due Date    Invoice#   Tax    │  │  Invoice #0001          │   │
│  [📅____]   [0001___]  [0%⌄]  │  │                         │   │
│                                 │  │  Subtotal      $0.00   │   │
│  Items            [Templates⌄] │  │  Total         $0.00   │   │
│  ┌─────────────────────────┐   │  │  Paid          $0.00   │   │
│  │ + Add Items             │   │  │  Balance Due   $0.00   │   │
│  └─────────────────────────┘   │  │                         │   │
│                                 │  │  [⬇ Download Invoice]  │   │
│  Payment Settings  [Options⌄]  │  └─────────────────────────┘   │
│  Payment methods set in        │                                 │
│  settings page.                │                                 │
└─────────────────────────────────┴─────────────────────────────────┘
```

### Form Field Specifications
- Input height: `40px`
- Label font: `text-sm font-medium`
- Border radius: `6px`
- Focus ring: `ring-2 ring-primary/20`
