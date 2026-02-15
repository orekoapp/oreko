# UI Bridge Execution Plan

**Created:** February 15, 2026
**Reference:** `UI_BRIEF_COMPARISON_REPORT.md`
**Target Compliance:** 95%+

---

## Overview

This execution plan addresses the gaps identified in the UI Brief Comparison Report. The plan is organized into phases with specific tasks, file locations, acceptance criteria, and dependencies.

### Current State: 65% Compliance
### Target State: 95% Compliance

---

## Phase 1: Data Tables Implementation (P0 - Critical)

**Priority:** CRITICAL
**Estimated Complexity:** High
**Dependencies:** None

### 1.1 Create Reusable DataTable Component

**Objective:** Build a professional data table component matching Shadcn Studio Datatable 5 specification.

#### Files to Create/Modify:

```
apps/web/components/ui/data-table/
├── data-table.tsx              # Main table component
├── data-table-pagination.tsx   # Pagination controls
├── data-table-toolbar.tsx      # Toolbar with search, filters, actions
├── data-table-column-header.tsx # Sortable column headers
├── data-table-row-actions.tsx  # Row action menu (view, edit, delete)
├── data-table-faceted-filter.tsx # Status/category filters
└── index.ts                    # Exports
```

#### Component Specifications:

```typescript
// data-table.tsx
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterColumn?: string;
  filterOptions?: { label: string; value: string; icon?: React.ComponentType }[];
  pageSize?: number;
  pageSizeOptions?: number[];
  showRowSelection?: boolean;
  onRowClick?: (row: TData) => void;
  createButton?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}
```

#### Visual Layout (per brief):

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Show [10 ▼]  [+ New Item]  [🔍 Search...]  [Status ▼]  [⚙ Columns]     │
├─────────────────────────────────────────────────────────────────────────┤
│ ☐  ID        Status      Client                    Amount   Date    ⋯  │
├─────────────────────────────────────────────────────────────────────────┤
│ ☐  #001      [Badge]     🟣 Name                   $X,XXX   Date   [⋯] │
│                          email@example.com                              │
├─────────────────────────────────────────────────────────────────────────┤
│ Showing 1 to 10 of 50 entries           [< Prev] [1] [2] [3] [Next >]  │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Acceptance Criteria:
- [ ] Checkbox column for row selection
- [ ] "Show [10/25/50/100]" page size dropdown
- [ ] Search input with placeholder text
- [ ] Status filter dropdown
- [ ] Column visibility toggle
- [ ] Sortable column headers (click to sort)
- [ ] Row actions menu (view, edit, delete, more)
- [ ] Pagination with "Showing X to Y of Z entries"
- [ ] Previous/Next buttons with page numbers
- [ ] Responsive design (horizontal scroll on mobile)

---

### 1.2 Invoices List - Data Table Implementation

**Objective:** Replace card list with data table for invoices.

#### Files to Modify:

```
apps/web/app/(dashboard)/invoices/page.tsx
apps/web/components/invoices/invoices-table.tsx (new)
apps/web/components/invoices/invoices-columns.tsx (new)
```

#### Column Definition:

| Column | Key | Width | Sortable | Content |
|--------|-----|-------|----------|---------|
| Checkbox | select | 40px | No | Selection checkbox |
| Invoice ID | invoiceNumber | 120px | Yes | `#INV-XXXX` format |
| Status | status | 100px | Yes | Status badge |
| Client | client | flex | Yes | Avatar + Name + Email (2 lines) |
| Amount | total | 120px | Yes | Currency formatted |
| Issued Date | issueDate | 120px | Yes | Formatted date |
| Actions | actions | 80px | No | Dropdown: View, Edit, Delete, Download |

#### Sample Implementation:

```typescript
// invoices-columns.tsx
export const columns: ColumnDef<Invoice>[] = [
  {
    id: "select",
    header: ({ table }) => <Checkbox ... />,
    cell: ({ row }) => <Checkbox ... />,
  },
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice ID" />,
    cell: ({ row }) => <span className="font-mono">#{row.getValue("invoiceNumber")}</span>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <InvoiceStatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "client",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Client" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(row.original.client.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{row.original.client.name}</p>
          <p className="text-sm text-muted-foreground">{row.original.client.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => formatCurrency(row.getValue("total")),
  },
  {
    accessorKey: "issueDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Issued Date" />,
    cell: ({ row }) => formatDate(row.getValue("issueDate")),
  },
  {
    id: "actions",
    cell: ({ row }) => <InvoiceRowActions invoice={row.original} />,
  },
];
```

#### Acceptance Criteria:
- [ ] Data table replaces current card list
- [ ] All columns match brief specification
- [ ] Client shows avatar + name + email
- [ ] Row actions: View, Edit, Delete, Download PDF
- [ ] Pagination working correctly
- [ ] Search filters invoices
- [ ] Status filter dropdown works
- [ ] Sortable by all specified columns

---

### 1.3 Quotes List - Data Table Implementation

**Objective:** Replace card list with data table for quotes.

#### Files to Modify:

```
apps/web/app/(dashboard)/quotes/page.tsx
apps/web/components/quotes/quotes-table.tsx (new)
apps/web/components/quotes/quotes-columns.tsx (new)
```

#### Column Definition:

| Column | Key | Width | Sortable | Content |
|--------|-----|-------|----------|---------|
| Checkbox | select | 40px | No | Selection checkbox |
| Quote ID | quoteNumber | 120px | Yes | `#QT-XXX` or `Q-XXXX` format |
| Status | status | 100px | Yes | Status badge (outline style) |
| Client | client | flex | Yes | Avatar + Name + Email |
| Total | total | 120px | Yes | Currency formatted |
| Expiry Date | expirationDate | 120px | Yes | Formatted date |
| Actions | actions | 80px | No | Dropdown: View, Edit, Delete, Download |

#### Acceptance Criteria:
- [ ] Data table replaces current card list
- [ ] Quote status badges use **outline style** (not solid)
- [ ] Expiry Date column (not Issued Date)
- [ ] Download action for PDF export
- [ ] Convert to Invoice action in menu

---

### 1.4 Clients List - Data Table Implementation

**Objective:** Implement data table for clients list.

#### Files to Modify:

```
apps/web/app/(dashboard)/clients/page.tsx
apps/web/components/clients/clients-table.tsx (new)
apps/web/components/clients/clients-columns.tsx (new)
```

#### Column Definition:

| Column | Key | Width | Sortable | Content |
|--------|-----|-------|----------|---------|
| Checkbox | select | 40px | No | Selection checkbox |
| Client | name | flex | Yes | Avatar + Name + Company |
| Email | email | 200px | Yes | Email address |
| Phone | phone | 150px | No | Phone number |
| Total Revenue | totalRevenue | 120px | Yes | Lifetime value |
| Actions | actions | 80px | No | View, Edit, Delete |

---

### 1.5 Contracts List - Data Table Implementation

**Objective:** Implement data table for contracts list.

#### Files to Modify:

```
apps/web/app/(dashboard)/contracts/page.tsx
apps/web/components/contracts/contracts-table.tsx (new)
apps/web/components/contracts/contracts-columns.tsx (new)
```

#### Column Definition:

| Column | Key | Width | Sortable | Content |
|--------|-----|-------|----------|---------|
| Checkbox | select | 40px | No | Selection checkbox |
| Contract | name | flex | Yes | Contract name |
| Client | client | 200px | Yes | Client name |
| Status | status | 100px | Yes | Draft/Sent/Signed |
| Created | createdAt | 120px | Yes | Date |
| Actions | actions | 80px | No | View, Edit, Delete, Send |

---

## Phase 2: Analytics Dashboard Enhancement (P1)

**Priority:** HIGH
**Estimated Complexity:** Medium
**Dependencies:** None

### 2.1 Revenue Forecast Chart

**Objective:** Add dual area chart showing Projected (Quotes) vs Actual Revenue.

#### Files to Create/Modify:

```
apps/web/components/analytics/revenue-forecast-chart.tsx (new)
apps/web/app/(dashboard)/analytics/page.tsx (modify)
apps/web/lib/analytics/actions.ts (modify - add data fetching)
```

#### Chart Specification:

```typescript
interface RevenueForecastData {
  month: string; // Jan, Feb, Mar, etc.
  projected: number; // Value from accepted quotes
  actual: number; // Value from paid invoices
}

// Chart config
const chartConfig = {
  projected: {
    label: "Projected (Quotes)",
    color: "hsl(var(--chart-1))", // Light purple
    fillOpacity: 0.3,
  },
  actual: {
    label: "Actual Revenue",
    color: "hsl(var(--chart-2))", // Darker purple
    fillOpacity: 0.1,
  },
};
```

#### Visual Layout (per brief):

```
┌─────────────────────────────────────────────────────────────┐
│ Revenue Forecast                                            │
│ Actual vs Projected based on quotes                         │
│                                                             │
│     ╭──────╮                    ╭──────╮                   │
│    ╱        ╲                  ╱        ╲                  │
│   ╱          ╲    ╭──────╮   ╱          ╲                 │
│  ╱            ╲  ╱        ╲ ╱            ╲                │
│ ╱              ╲╱          ╲              ╲               │
│ ──────────────────────────────────────────────             │
│ Jan    Feb    Mar    Apr    May    Jun                     │
│                                                             │
│ ■ Projected (Quotes)  ■ Actual Revenue                     │
└─────────────────────────────────────────────────────────────┘
```

#### Acceptance Criteria:
- [ ] Dual area chart with gradient fills
- [ ] X-axis: Month labels (Jan-Jun or dynamic)
- [ ] Y-axis: Currency values
- [ ] Legend below chart
- [ ] Smooth monotone curve interpolation
- [ ] Tooltip on hover showing both values

---

### 2.2 Top Clients by Revenue Chart

**Objective:** Add horizontal bar chart showing top clients by revenue.

#### Files to Create/Modify:

```
apps/web/components/analytics/top-clients-chart.tsx (new)
apps/web/lib/analytics/actions.ts (modify)
```

#### Chart Specification:

```typescript
interface TopClientData {
  name: string;
  revenue: number;
  color: string;
}

// Colors per brief
const clientColors = [
  "hsl(var(--chart-1))", // Purple - highest
  "hsl(var(--chart-2))", // Blue
  "hsl(var(--chart-3))", // Cyan
  "hsl(var(--chart-4))", // Orange
  "hsl(var(--chart-5))", // Green - lowest
];
```

#### Visual Layout (per brief):

```
┌─────────────────────────────────────────────────────────────┐
│ Top Clients by Revenue                                      │
│ Year to Date                                                │
│                                                             │
│ Acme Corp    ████████████████████████████████  $45,000     │
│ Globex       ██████████████████████████        $32,000     │
│ Soylent      ████████████████████              $28,000     │
│ Initech      ████████████                      $15,000     │
│ Umbrella     ██████                            $10,000     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Acceptance Criteria:
- [ ] Horizontal bar chart
- [ ] Top 5 clients by revenue
- [ ] Different color per client
- [ ] Revenue value displayed
- [ ] Tooltip with details
- [ ] "Year to Date" subtitle

---

### 2.3 Client Lifetime Value Card

**Objective:** Add list-style card showing top clients with LTV.

#### Files to Create/Modify:

```
apps/web/components/analytics/client-ltv-card.tsx (new)
apps/web/lib/analytics/actions.ts (modify)
```

#### Visual Layout (per brief):

```
┌─────────────────────────────────────────────────────────────┐
│ Client Lifetime Value                                       │
│ Top valuable clients                                        │
│                                                             │
│ ┌──┐                                                        │
│ │AC│  Acme Corp                              +$45,000      │
│ └──┘  acme@example.com                                      │
│                                                             │
│ ┌──┐                                                        │
│ │GL│  Globex Inc                             +$32,000      │
│ └──┘  info@globex.com                                       │
│                                                             │
│ ┌──┐                                                        │
│ │SC│  Soylent Corp                           +$28,000      │
│ └──┘  contact@soylent.com                                   │
│                                                             │
│ ┌──┐                                                        │
│ │IN│  Initech                                +$15,000      │
│ └──┘  support@initech.com                                   │
└─────────────────────────────────────────────────────────────┘
```

#### Component Structure:

```typescript
interface ClientLTVItem {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
  ltv: number;
}

// Avatar colors should match bar chart colors
```

#### Acceptance Criteria:
- [ ] List of top 4-5 clients
- [ ] Avatar with initials and colored background
- [ ] Client name and email
- [ ] LTV value with "+" prefix in green
- [ ] Colors match Top Clients chart

---

### 2.4 Update Analytics Page Layout

**Objective:** Reorganize analytics page to include new charts.

#### Files to Modify:

```
apps/web/app/(dashboard)/analytics/page.tsx
```

#### Section Layout:

```
┌─────────────────────────────────────────────────────────────────────┐
│ Analytics                                                           │
│ Track your business performance                                     │
│ [Last 30 days ▼] [Jan 16, 2026 - Feb 15, 2026]                    │
├─────────────────────────────────────────────────────────────────────┤
│ [Total Revenue] [Total Quotes] [Conversion Rate] [Outstanding]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ FINANCIAL HEALTH (section header)                                   │
│ ┌─────────────────────────┐  ┌─────────────────────────┐          │
│ │ Revenue Forecast        │  │ Accounts Receivable     │          │
│ │ [Dual Area Chart]       │  │ Aging [Horizontal Bars] │          │
│ └─────────────────────────┘  └─────────────────────────┘          │
│                                                                     │
│ CLIENT INSIGHTS (section header)                                    │
│ ┌─────────────────────────┐  ┌─────────────────────────┐          │
│ │ Top Clients by Revenue  │  │ Client Lifetime Value   │          │
│ │ [Horizontal Bar Chart]  │  │ [Avatar List]           │          │
│ └─────────────────────────┘  └─────────────────────────┘          │
│                                                                     │
│ (Keep existing Sales Pipeline, Cash Flow, etc. below)               │
└─────────────────────────────────────────────────────────────────────┘
```

#### Acceptance Criteria:
- [ ] "FINANCIAL HEALTH" section header (uppercase, muted)
- [ ] Revenue Forecast + AR Aging side by side
- [ ] "CLIENT INSIGHTS" section header (uppercase, muted)
- [ ] Top Clients + Client LTV side by side
- [ ] Existing charts preserved below

---

## Phase 3: Invoice/Quote Builder Enhancement (P1)

**Priority:** HIGH
**Estimated Complexity:** Medium
**Dependencies:** None

### 3.1 Logo Upload Section

**Objective:** Add logo upload section to invoice/quote builder.

#### Files to Modify:

```
apps/web/app/(dashboard)/invoices/new/page.tsx
apps/web/app/(dashboard)/quotes/new/page.tsx
apps/web/components/invoices/invoice-form.tsx (or equivalent)
apps/web/components/shared/logo-upload.tsx (new)
```

#### Component Specification:

```typescript
interface LogoUploadProps {
  value?: string; // Current logo URL
  onChange: (url: string | null) => void;
  maxSize?: number; // Default 2MB
  acceptedTypes?: string[]; // Default ['image/png', 'image/jpeg']
}
```

#### Visual Layout (per brief):

```
┌─────────────────────────────────────────────────────────────┐
│ Logo                                                        │
│ ┌─────────────────────────────────────────────────────────┐│
│ │                                                         ││
│ │     📷  Upload your logo                               ││
│ │         PNG, JPG up to 2MB                             ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

#### Implementation Details:

```typescript
// logo-upload.tsx
export function LogoUpload({ value, onChange, maxSize = 2 * 1024 * 1024 }: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleUpload = async (file: File) => {
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 2MB.");
      return;
    }

    // Upload to storage and get URL
    const url = await uploadLogo(file);
    onChange(url);
    setPreview(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Logo</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Logo" className="max-h-20 mx-auto" />
              <Button variant="ghost" size="sm" onClick={handleRemove}>
                Remove
              </Button>
            </div>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium">Upload your logo</p>
              <p className="text-sm text-muted-foreground">PNG, JPG up to 2MB</p>
            </>
          )}
        </div>
        <input type="file" ref={inputRef} className="hidden" onChange={...} />
      </CardContent>
    </Card>
  );
}
```

#### Acceptance Criteria:
- [ ] Logo section appears at top of form (before Invoice Details)
- [ ] Drag & drop support
- [ ] Click to upload
- [ ] Preview uploaded image
- [ ] Remove button
- [ ] 2MB file size limit
- [ ] PNG/JPG only
- [ ] Logo appears in preview pane

---

### 3.2 Email Field Addition

**Objective:** Add optional email field to invoice details.

#### Files to Modify:

```
apps/web/app/(dashboard)/invoices/new/page.tsx
apps/web/components/invoices/invoice-form.tsx
```

#### Implementation:

Add email input field below Customer dropdown:

```tsx
<div className="space-y-4">
  <div>
    <Label>Customer</Label>
    <ClientSelector value={clientId} onChange={setClientId} />
  </div>

  {/* New email field */}
  <div>
    <Label>Email (Optional)</Label>
    <Input
      type="email"
      placeholder="email@example.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <p className="text-xs text-muted-foreground mt-1">
      Override client email for this invoice
    </p>
  </div>
</div>
```

#### Acceptance Criteria:
- [ ] Email field below Customer
- [ ] Optional (not required)
- [ ] Placeholder: "email@example.com"
- [ ] Pre-fills from selected client
- [ ] Can be overridden manually

---

## Phase 4: Sidebar/Application Shell Updates (P2)

**Priority:** MEDIUM
**Estimated Complexity:** Low
**Dependencies:** None

### 4.1 Workspace Branding Update

**Objective:** Update sidebar header to show workspace name with tier.

#### Files to Modify:

```
apps/web/components/layout/sidebar.tsx
apps/web/components/layout/workspace-switcher.tsx
```

#### Current vs Target:

| Element | Current | Target |
|---------|---------|--------|
| Line 1 | "My Business" | Workspace name |
| Line 2 | "QuoteCraft" | Tier label (Enterprise/Pro/Free) |

#### Implementation:

```tsx
// workspace-switcher.tsx
<div className="flex items-center gap-3">
  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
    <Command className="h-5 w-5 text-primary-foreground" />
  </div>
  <div className="flex flex-col">
    <span className="font-semibold">{workspace.name || "Quote Craft"}</span>
    <span className="text-xs text-muted-foreground">
      {workspace.tier || "Enterprise"}
    </span>
  </div>
  <ChevronUpDown className="ml-auto h-4 w-4" />
</div>
```

#### Acceptance Criteria:
- [ ] Shows workspace name (or "Quote Craft" default)
- [ ] Shows tier below name
- [ ] Tier options: Enterprise, Pro, Free
- [ ] Chevron for dropdown

---

### 4.2 Section Label Update

**Objective:** Rename "Main" section to "Platform".

#### Files to Modify:

```
apps/web/components/layout/sidebar.tsx
```

#### Change:

```tsx
// Before
<SidebarGroup>
  <SidebarGroupLabel>Main</SidebarGroupLabel>
  ...
</SidebarGroup>

// After
<SidebarGroup>
  <SidebarGroupLabel>Platform</SidebarGroupLabel>
  ...
</SidebarGroup>
```

#### Acceptance Criteria:
- [ ] Section labeled "Platform" (not "Main")

---

## Phase 5: Testing & Verification

**Priority:** HIGH
**Dependencies:** Phases 1-4

### 5.1 Visual Regression Testing

#### Test Cases:

1. **Sidebar Navigation**
   - [ ] Expanded sidebar matches brief Screenshot 1
   - [ ] Collapsed sidebar matches brief Screenshot 3
   - [ ] User profile section displays correctly

2. **Invoices List**
   - [ ] Data table layout matches brief Screenshot 2
   - [ ] All columns present and aligned
   - [ ] Pagination controls visible
   - [ ] Status badges correct colors

3. **Quotes List**
   - [ ] Data table layout matches brief Screenshot 4
   - [ ] Outline-style badges (not solid)
   - [ ] Expiry Date column present

4. **Analytics Dashboard**
   - [ ] Revenue Forecast chart matches brief Screenshot 5
   - [ ] AR Aging chart matches brief Screenshot 5
   - [ ] Top Clients chart matches brief Screenshot 6
   - [ ] Client LTV card matches brief Screenshot 6

5. **Invoice Builder**
   - [ ] Logo upload section present
   - [ ] Layout matches brief Screenshot 7
   - [ ] Preview pane shows logo

### 5.2 Functional Testing

#### Test Cases:

1. **Data Tables**
   - [ ] Checkbox selection works (single and bulk)
   - [ ] Search filters results correctly
   - [ ] Status filter works
   - [ ] Sorting works on all sortable columns
   - [ ] Pagination navigates correctly
   - [ ] Page size changes work
   - [ ] Row actions trigger correct behaviors

2. **Charts**
   - [ ] Data loads correctly
   - [ ] Tooltips display on hover
   - [ ] Responsive on different screen sizes

3. **Logo Upload**
   - [ ] File upload works
   - [ ] Preview displays
   - [ ] Size limit enforced
   - [ ] Logo appears in invoice preview/PDF

---

## Implementation Order

### Sprint 1: Data Tables (5-7 days)
1. Create DataTable component infrastructure
2. Implement Invoices table
3. Implement Quotes table
4. Implement Clients table
5. Implement Contracts table

### Sprint 2: Analytics (3-4 days)
1. Revenue Forecast chart
2. Top Clients chart
3. Client LTV card
4. Update analytics page layout

### Sprint 3: Builder & Sidebar (2-3 days)
1. Logo upload component
2. Email field addition
3. Sidebar branding updates
4. Section label update

### Sprint 4: Testing & Polish (2-3 days)
1. Visual regression testing
2. Functional testing
3. Bug fixes
4. Performance optimization

---

## File Change Summary

### New Files to Create:

```
apps/web/components/ui/data-table/
├── data-table.tsx
├── data-table-pagination.tsx
├── data-table-toolbar.tsx
├── data-table-column-header.tsx
├── data-table-row-actions.tsx
├── data-table-faceted-filter.tsx
└── index.ts

apps/web/components/invoices/
├── invoices-table.tsx
└── invoices-columns.tsx

apps/web/components/quotes/
├── quotes-table.tsx
└── quotes-columns.tsx

apps/web/components/clients/
├── clients-table.tsx
└── clients-columns.tsx

apps/web/components/contracts/
├── contracts-table.tsx
└── contracts-columns.tsx

apps/web/components/analytics/
├── revenue-forecast-chart.tsx
├── top-clients-chart.tsx
└── client-ltv-card.tsx

apps/web/components/shared/
└── logo-upload.tsx
```

### Files to Modify:

```
apps/web/app/(dashboard)/invoices/page.tsx
apps/web/app/(dashboard)/quotes/page.tsx
apps/web/app/(dashboard)/clients/page.tsx
apps/web/app/(dashboard)/contracts/page.tsx
apps/web/app/(dashboard)/analytics/page.tsx
apps/web/app/(dashboard)/invoices/new/page.tsx
apps/web/app/(dashboard)/quotes/new/page.tsx
apps/web/components/layout/sidebar.tsx
apps/web/components/layout/workspace-switcher.tsx
apps/web/lib/analytics/actions.ts
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| UI Compliance Score | 65% | 95%+ |
| Data Table Implementation | 0/4 | 4/4 |
| Missing Charts Added | 0/3 | 3/3 |
| Logo Upload | No | Yes |
| Sidebar Branding | Partial | Complete |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data table performance with large datasets | Medium | Implement virtual scrolling, server-side pagination |
| Chart library compatibility | Low | Use existing Recharts setup |
| Logo upload storage | Medium | Use existing file storage infrastructure |
| Breaking existing functionality | High | Comprehensive testing, feature flags if needed |

---

## Dependencies

### NPM Packages (likely already installed):
- `@tanstack/react-table` - Data table
- `recharts` - Charts
- `react-dropzone` - File upload (if not using native)

### Internal Dependencies:
- Existing Shadcn UI components
- Existing authentication/session handling
- Existing file upload infrastructure (if any)

---

## Sign-off

- [ ] Design review completed
- [ ] Technical review completed
- [ ] Accessibility review completed
- [ ] Performance review completed
- [ ] Ready for implementation

---

*Document Version: 1.0*
*Last Updated: February 15, 2026*
