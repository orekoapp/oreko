# Requirements Specification

## 1. Information Architecture & Navigation

### REQ-NAV-001: Sidebar Structure
The application sidebar must contain the following navigation hierarchy:

```
Platform
├── Dashboard (Overview)
├── Analytics (Detailed Reports)
├── Clients (List & Detail views)
├── Projects (Parent container)
│   ├── Quotes (sub-item)
│   ├── Invoices (sub-item)
│   └── Contracts (sub-item)
└── Settings (User & App config)
```

### REQ-NAV-002: Sidebar Collapse Behavior
- Sidebar must support expanded mode (full labels visible)
- Sidebar must support collapsed mode (icons only)
- Collapse toggle button required in header area
- Collapsed mode shows tooltips on hover for each nav item

### REQ-NAV-003: User Profile Section
- User avatar displayed at bottom of sidebar
- User name and email visible in expanded mode
- Dropdown menu for profile/logout in collapsed mode

### REQ-NAV-004: Workspace Switcher
- Top of sidebar shows current workspace/organization
- "Quote Craft" branding with "Enterprise" tier indicator
- Dropdown for workspace switching (future multi-tenant support)

---

## 2. Data Model Requirements

### REQ-DATA-001: Entity Hierarchy
```
Client (1) ──────────> (N) Project
Project (1) ─────────> (N) Quote
Project (1) ─────────> (N) Invoice
Project (1) ─────────> (N) Contract
Quote (1) ───────────> (0..1) Invoice (conversion link)
```

### REQ-DATA-002: Quote Status Tracking
Quotes must track the following statuses:
| Status | Description |
|--------|-------------|
| `DRAFT` | Quote created but not sent |
| `SENT` | Quote sent to client |
| `EXPIRED` | Quote past expiry date without acceptance |
| `ACCEPTED` | Client accepted the quote |

### REQ-DATA-003: Invoice Status Tracking
Invoices must track the following payment statuses:
| Status | Description |
|--------|-------------|
| `PENDING` | Invoice sent, awaiting payment |
| `PAID` | Payment received in full |
| `OVERDUE` | Past due date without payment |
| `PARTIAL` | Partial payment received |

### REQ-DATA-004: Quote-Invoice Linkage
- When a Quote is converted to Invoice, maintain bidirectional link
- Quote view must show linked Invoice status
- Invoice view must show source Quote reference

---

## 3. UI Component Requirements

### REQ-UI-001: Application Shell
- **Reference**: Shadcn Studio Application Shell 10
- Full-height sidebar with fixed positioning
- Main content area with breadcrumb navigation
- Responsive: sidebar collapses on mobile

### REQ-UI-002: Data Tables
- **Reference**: Shadcn Studio Datatable 5
- Features required:
  - Column headers with sorting
  - Row selection (checkbox)
  - Search/filter input
  - Status filter dropdown
  - Pagination controls
  - Row actions (view, edit, delete, more)
  - "Show X entries" dropdown

### REQ-UI-003: Status Badges
| Entity | Status | Color |
|--------|--------|-------|
| Quote | Draft | Gray outline |
| Quote | Sent | Blue outline |
| Quote | Accepted | Green outline |
| Quote | Expired | Red outline |
| Invoice | Pending | Yellow/amber outline |
| Invoice | Paid | Green solid |
| Invoice | Overdue | Red solid |

### REQ-UI-004: Charts & Visualizations
- **Reference**: Shadcn Charts (Area charts)
- Style: Minimalist with gradients
- Required: Tooltips on hover
- Required: Responsive sizing
- Color palette: Primary blue, secondary violet, accent amber

---

## 4. Analytics Requirements

### REQ-ANALYTICS-001: Sales Pipeline Report
**Purpose**: Track quote conversion efficiency

| Metric | Calculation |
|--------|-------------|
| Quote Conversion Rate | `(Accepted Quotes / Total Sent Quotes) * 100` |
| Average Deal Value | `Total Value of Accepted Quotes / Count of Accepted Quotes` |

**Visualizations**:
- Radial progress chart for conversion rate
- Bar chart for quotes by status (Draft, Sent, Expired, Accepted)
- Trend indicator (up/down arrow with percentage)

### REQ-ANALYTICS-002: Financial Health Report
**Purpose**: Cash flow management

| Metric | Description |
|--------|-------------|
| Accounts Receivable Aging | Group unpaid invoices by age: 0-30, 31-60, 60+ days |
| Revenue Forecast | Compare potential (accepted quotes) vs actual (sent invoices) |
| Sales Tax Summary | Total tax collected within date range |

**Visualizations**:
- Horizontal bar chart for AR aging (color-coded by severity)
- Dual-area chart for revenue forecast (projected vs actual)
- Data table for tax summary

### REQ-ANALYTICS-003: Client Insights Report
**Purpose**: Identify high-value clients

| Metric | Calculation |
|--------|-------------|
| Revenue per Client | Sum of paid invoices per client |
| Client Lifetime Value | Total revenue since first invoice |
| Average Days to Pay | `AVG(Payment Date - Invoice Sent Date)` per client |

**Visualizations**:
- Horizontal bar chart for top clients by revenue
- Leaderboard list for client LTV with avatars

### REQ-ANALYTICS-004: Service Performance Report
**Purpose**: Inventory and service optimization

| Metric | Description |
|--------|-------------|
| Top Services/Products | Most frequently quoted line items |
| Revenue by Category | Group services by category for profitability analysis |

**Visualizations**:
- Bar chart for top services
- Pie/donut chart for revenue by category

---

## 5. Workflow Requirements

### REQ-FLOW-001: Quote-to-Invoice Conversion
1. User creates Quote within a Project
2. User sends Quote to Client (Status: `SENT`)
3. Client accepts Quote (Status: `ACCEPTED`)
4. User clicks "Convert to Invoice" button
5. System generates Invoice linked to Quote and Project
6. Quote view shows: "Linked Invoice: [Status]"

### REQ-FLOW-002: Visual Builder
- Split-pane layout: Form (left) + Preview (right)
- Preview tabs: Payment Page | Email Preview | Invoice PDF
- Logo upload support (PNG, JPG up to 2MB)
- Line items with: Item name, Rate, Quantity, Amount
- Real-time preview updates
- Templates dropdown for quick line item insertion

---

## 6. Non-Functional Requirements

### REQ-NFR-001: Performance
- Page load (LCP): < 2.5s
- Interaction response (FID): < 100ms
- Layout stability (CLS): < 0.1
- API response time: < 500ms (95th percentile)

### REQ-NFR-002: Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios met

### REQ-NFR-003: Responsiveness
- Desktop: Full sidebar + content
- Tablet: Collapsible sidebar
- Mobile: Bottom navigation or hamburger menu
