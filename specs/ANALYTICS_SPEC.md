# Oreko Analytics Dashboard Specification

**Version:** 1.0.0
**Status:** Development Ready
**Last Updated:** February 2026
**Document Owner:** Engineering Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Feature Overview](#2-feature-overview)
3. [User Stories](#3-user-stories)
4. [Functional Requirements](#4-functional-requirements)
5. [UI/UX Specifications](#5-uiux-specifications)
6. [Data Requirements](#6-data-requirements)
7. [Technical Specifications](#7-technical-specifications)
8. [Acceptance Criteria](#8-acceptance-criteria)
9. [Test Scenarios](#9-test-scenarios)

---

## 1. Executive Summary

### Purpose

Add a comprehensive analytics dashboard to Oreko that provides business owners with actionable insights into their quoting, invoicing, and payment performance. The analytics suite bridges the gap between the original spec design (analysis.png) and the current implementation.

### Goals

| Goal | Metric | Target |
|------|--------|--------|
| Business Visibility | Users viewing analytics weekly | > 70% |
| Decision Support | Time to identify payment issues | < 30 seconds |
| Data-Driven Actions | Actions taken from analytics | > 2 per user/week |

### Scope

**In Scope:**
- Revenue trend charts (line/area)
- Quote/Invoice status distribution (donut charts)
- Conversion funnel visualization
- Payment aging analysis
- Client geographic distribution (bar chart)
- Monthly comparison charts
- Simple revenue forecasting
- Date range filtering
- CSV export functionality
- Drill-down modals

**Out of Scope:**
- Real-time updates (server-side refresh only)
- Geographic map visualization (using bar charts instead)
- AI-powered insights
- Custom report builder

---

## 2. Feature Overview

### 2.1 Dashboard Analytics Section

The main dashboard (`/dashboard`) will include an analytics section with key visualizations:

| Component | Type | Data Source | Priority |
|-----------|------|-------------|----------|
| Revenue Trend | Area Chart | `revenueData` | P0 |
| Quote Status | Donut Chart | `quoteStatusCounts` | P0 |
| Invoice Status | Donut Chart | `invoiceStatusCounts` | P0 |
| Conversion Funnel | Horizontal Bar | New action | P1 |
| Payment Aging | Stacked Bar | New action | P1 |

### 2.2 Full Analytics Page

A dedicated analytics page (`/dashboard/analytics`) with:

| Tab | Contents |
|-----|----------|
| Overview | All key charts in grid layout |
| Revenue | Revenue trend, forecast, monthly comparison |
| Quotes | Quote status, conversion funnel, top clients |
| Invoices | Invoice status, payment aging, overdue list |
| Clients | Geographic distribution, client value ranking |

### 2.3 Analytics Controls

| Control | Description |
|---------|-------------|
| Date Range Picker | Filter all charts by date range |
| Period Presets | 7d, 30d, 90d, 12m, YTD, All Time |
| Export Menu | CSV download for each section |
| Refresh Button | Manual data refresh |

---

## 3. User Stories

### 3.1 Business Overview

**US-A01: View Revenue Trends**
> As a business owner, I want to see my revenue over time, so that I can understand my business trajectory.

**Acceptance Criteria:**
- [ ] Revenue chart displays on dashboard
- [ ] Chart shows revenue by day/week/month based on selected period
- [ ] Hovering shows tooltip with exact amount and date
- [ ] Can switch between 7d, 30d, 90d, 12m views
- [ ] Chart handles zero revenue periods gracefully

**US-A02: View Quote Pipeline**
> As a business owner, I want to see the status distribution of my quotes, so that I can understand my sales pipeline.

**Acceptance Criteria:**
- [ ] Donut chart shows quote distribution by status
- [ ] Colors match status semantics (green=accepted, red=declined)
- [ ] Clicking a segment opens drill-down with quote list
- [ ] Empty state shows meaningful message
- [ ] Percentages and counts are displayed

**US-A03: View Invoice Status**
> As a business owner, I want to see my invoice status breakdown, so that I can identify payment collection issues.

**Acceptance Criteria:**
- [ ] Donut chart shows invoice distribution by status
- [ ] Overdue invoices are highlighted (red)
- [ ] Total outstanding amount is prominently displayed
- [ ] Clicking segment filters to invoice list

### 3.2 Conversion Analysis

**US-A04: View Conversion Funnel**
> As a business owner, I want to see my quote-to-payment conversion funnel, so that I can identify where I'm losing deals.

**Acceptance Criteria:**
- [ ] Funnel shows: Created → Sent → Viewed → Accepted → Invoiced → Paid
- [ ] Conversion percentages between each stage
- [ ] Drop-off points are highlighted
- [ ] Can filter by date range
- [ ] Clicking a stage shows relevant items

**US-A05: Track Payment Aging**
> As a business owner, I want to see payment aging analysis, so that I can prioritize collection efforts.

**Acceptance Criteria:**
- [ ] Bar chart shows: Current, 1-30, 31-60, 61-90, 90+ days
- [ ] Amounts in dollars for each bucket
- [ ] Color gradient from green (current) to red (90+)
- [ ] Total outstanding prominently displayed
- [ ] Clicking bucket shows relevant invoices

### 3.3 Client Analysis

**US-A06: View Client Distribution**
> As a business owner, I want to see where my clients are located, so that I can identify geographic opportunities.

**Acceptance Criteria:**
- [ ] Horizontal bar chart shows top 10 regions
- [ ] Regions sorted by client count or revenue
- [ ] Toggle between count/revenue view
- [ ] Shows percentage of total
- [ ] "Other" category for remaining regions

### 3.4 Trend Analysis

**US-A07: Compare Monthly Performance**
> As a business owner, I want to compare my monthly performance, so that I can identify seasonality and growth.

**Acceptance Criteria:**
- [ ] Grouped bar chart shows last 12 months
- [ ] Can toggle metrics: Revenue, Quotes, Invoices
- [ ] Optional YoY comparison overlay
- [ ] Growth percentage indicators
- [ ] Handles months with no data

**US-A08: View Revenue Forecast**
> As a business owner, I want to see projected revenue, so that I can plan for the future.

**Acceptance Criteria:**
- [ ] Line chart shows actual + projected revenue
- [ ] Projection uses simple linear regression
- [ ] Confidence interval shown as shaded area
- [ ] Clear visual distinction (dashed line for forecast)
- [ ] Disclaimer about projection accuracy

### 3.5 Analytics Controls

**US-A09: Filter by Date Range**
> As a business owner, I want to filter analytics by date range, so that I can analyze specific periods.

**Acceptance Criteria:**
- [ ] Date range picker with calendar
- [ ] Presets: 7d, 30d, 90d, 12m, YTD, All Time, Custom
- [ ] All charts update when date range changes
- [ ] Selected range persists in URL
- [ ] Can clear filter to show all time

**US-A10: Export Analytics Data**
> As a business owner, I want to export my analytics data, so that I can use it in spreadsheets or reports.

**Acceptance Criteria:**
- [ ] Export button available on analytics page
- [ ] CSV format with all metrics
- [ ] Filename includes date range
- [ ] Download starts immediately
- [ ] Success/error notification shown

**US-A11: Drill Down into Data**
> As a business owner, I want to drill down into chart data, so that I can see the underlying details.

**Acceptance Criteria:**
- [ ] Clicking chart elements opens modal
- [ ] Modal shows data table with relevant items
- [ ] Table is sortable and searchable
- [ ] Can navigate to individual items from table
- [ ] Modal can be closed with X or Escape

---

## 4. Functional Requirements

### 4.1 Revenue Trend Chart

| ID | Requirement |
|----|-------------|
| FR-R01 | Display revenue as area/line chart |
| FR-R02 | Support period selection: 7d, 30d, 90d, 12m |
| FR-R03 | Show daily granularity for 7d/30d, weekly for 90d, monthly for 12m |
| FR-R04 | Display tooltip on hover with date and amount |
| FR-R05 | Format amounts as currency ($X,XXX.XX) |
| FR-R06 | Show total revenue for selected period |
| FR-R07 | Handle empty data with appropriate message |
| FR-R08 | Animate chart on load |

### 4.2 Status Distribution Charts

| ID | Requirement |
|----|-------------|
| FR-S01 | Display quote status as donut chart |
| FR-S02 | Display invoice status as donut chart |
| FR-S03 | Color-code by status semantics |
| FR-S04 | Show legend with status labels and counts |
| FR-S05 | Display percentage in chart center |
| FR-S06 | Enable click-to-filter functionality |
| FR-S07 | Handle single-status data gracefully |

### 4.3 Conversion Funnel

| ID | Requirement |
|----|-------------|
| FR-F01 | Display horizontal funnel visualization |
| FR-F02 | Show stages: Created → Sent → Viewed → Accepted → Invoiced → Paid |
| FR-F03 | Calculate conversion rate between each stage |
| FR-F04 | Highlight largest drop-off point |
| FR-F05 | Support date range filtering |
| FR-F06 | Show absolute numbers and percentages |

### 4.4 Payment Aging

| ID | Requirement |
|----|-------------|
| FR-A01 | Display stacked/grouped bar chart |
| FR-A02 | Buckets: Current, 1-30, 31-60, 61-90, 90+ days |
| FR-A03 | Color gradient green → red |
| FR-A04 | Show amount in each bucket |
| FR-A05 | Calculate total outstanding |
| FR-A06 | Enable drill-down to invoice list |

### 4.5 Client Distribution

| ID | Requirement |
|----|-------------|
| FR-C01 | Display horizontal bar chart |
| FR-C02 | Show top 10 regions by default |
| FR-C03 | Parse client addresses for region extraction |
| FR-C04 | Support toggle: client count vs revenue |
| FR-C05 | Show "Other" category for remaining |
| FR-C06 | Handle missing address data |

### 4.6 Monthly Comparison

| ID | Requirement |
|----|-------------|
| FR-M01 | Display grouped bar chart for 12 months |
| FR-M02 | Support metric toggle: Revenue, Quotes, Invoices |
| FR-M03 | Optional YoY comparison |
| FR-M04 | Show growth indicators (+/-%) |
| FR-M05 | Label months clearly (Jan, Feb, etc.) |

### 4.7 Forecasting

| ID | Requirement |
|----|-------------|
| FR-P01 | Display line chart with actual + forecast |
| FR-P02 | Use last 6 months for regression |
| FR-P03 | Project 3 months forward |
| FR-P04 | Show confidence interval (±15%) |
| FR-P05 | Visual distinction for projected data |
| FR-P06 | Display forecast disclaimer |

### 4.8 Date Filtering

| ID | Requirement |
|----|-------------|
| FR-D01 | Provide date range picker component |
| FR-D02 | Include presets: 7d, 30d, 90d, 12m, YTD, All, Custom |
| FR-D03 | Persist selection in URL query params |
| FR-D04 | Update all charts on selection change |
| FR-D05 | Show selected range in header |
| FR-D06 | Allow clearing to default (30d) |

### 4.9 Export

| ID | Requirement |
|----|-------------|
| FR-E01 | Provide CSV export option |
| FR-E02 | Include all metrics in export |
| FR-E03 | Apply current date filter to export |
| FR-E04 | Generate filename with date range |
| FR-E05 | Show download progress/completion |

### 4.10 Drill-Down

| ID | Requirement |
|----|-------------|
| FR-DD01 | Open modal on chart element click |
| FR-DD02 | Display relevant data in table format |
| FR-DD03 | Support sorting by columns |
| FR-DD04 | Support search within results |
| FR-DD05 | Link to individual item pages |
| FR-DD06 | Show count of results |

---

## 5. UI/UX Specifications

### 5.1 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                           [Date Filter] [Export]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Revenue │ │ Outstand│ │ Quotes  │ │ Invoice │ │ Clients │ │
│ │ $XX,XXX │ │ $X,XXX  │ │   XX    │ │   XX    │ │   XX    │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Revenue Trend                                    [7d▾]      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │          ╱╲    ╱╲                                        │ │
│ │    ╱────╱  ╲──╱  ╲───────────                           │ │
│ │  ──                                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────┬───────────────────────┤
│ Quote Status        │ Invoice Status │ Conversion Funnel    │
│ ┌─────────────────┐ │ ┌─────────────┐│ ┌──────────────────┐ │
│ │    ╭─────╮      │ │ │   ╭─────╮   ││ │ Created    ████  │ │
│ │   ╱       ╲     │ │ │  ╱       ╲  ││ │ Sent       ███   │ │
│ │  │  75%   │     │ │ │ │  60%   │  ││ │ Accepted   ██    │ │
│ │   ╲       ╱     │ │ │  ╲       ╱  ││ │ Paid       █     │ │
│ │    ╰─────╯      │ │ │   ╰─────╯   ││ └──────────────────┘ │
│ └─────────────────┘ │ └─────────────┘│                      │
├─────────────────────┴────────────────┴──────────────────────┤
│ Recent Quotes              │ Recent Activity                │
│ ┌────────────────────────┐ │ ┌────────────────────────────┐ │
│ │ • Quote #001 - $1,500  │ │ │ ● Invoice paid - $2,000    │ │
│ │ • Quote #002 - $3,200  │ │ │ ○ Quote viewed - #003      │ │
│ │ • Quote #003 - $800    │ │ │ ● Client created           │ │
│ └────────────────────────┘ │ └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Full Analytics Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Analytics                           [Date Filter] [Export]   │
├─────────────────────────────────────────────────────────────┤
│ [Overview] [Revenue] [Quotes] [Invoices] [Clients]          │
├─────────────────────────────────────────────────────────────┤
│ Overview Tab:                                                │
│ ┌───────────────────────────┬───────────────────────────┐   │
│ │ Revenue Trend (full width)│                           │   │
│ │                           │                           │   │
│ └───────────────────────────┴───────────────────────────┘   │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│ │ Quote       │ Invoice     │ Conversion  │ Payment     │   │
│ │ Status      │ Status      │ Funnel      │ Aging       │   │
│ └─────────────┴─────────────┴─────────────┴─────────────┘   │
│ ┌───────────────────────────┬───────────────────────────┐   │
│ │ Monthly Comparison        │ Client Distribution       │   │
│ └───────────────────────────┴───────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Chart Color Palette

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary (Revenue) | Blue | #3B82F6 |
| Success (Paid/Accepted) | Green | #22C55E |
| Warning (Pending/Partial) | Amber | #F59E0B |
| Danger (Overdue/Declined) | Red | #EF4444 |
| Neutral (Draft) | Gray | #6B7280 |
| Secondary (Invoices) | Violet | #8B5CF6 |
| Tertiary (Clients) | Teal | #14B8A6 |

### 5.4 Component Specifications

#### Chart Card Component

```
┌─────────────────────────────────────────┐
│ Title                      [⋮] [↗]     │
│ Subtitle text                           │
├─────────────────────────────────────────┤
│                                         │
│           [Chart Content]               │
│                                         │
├─────────────────────────────────────────┤
│ ○ Legend Item 1  ○ Legend Item 2       │
└─────────────────────────────────────────┘
```

- Width: Flexible (grid-based)
- Min Height: 300px
- Padding: 24px
- Border Radius: 8px
- Shadow: shadow-sm
- Background: card (white/dark)

#### Date Filter Component

```
┌────────────────────────────────────────────────┐
│ [7d] [30d] [90d] [12m] [YTD] [📅 Custom]      │
└────────────────────────────────────────────────┘
```

- Buttons: Toggle group style
- Custom: Opens date range picker
- Active state: Primary color background

#### Drill-Down Modal

```
┌─────────────────────────────────────────────────────┐
│ Quote Status: Accepted (15 items)            [X]   │
├─────────────────────────────────────────────────────┤
│ [🔍 Search...]                                      │
├─────────────────────────────────────────────────────┤
│ Title          │ Client        │ Amount  │ Date    │
│ ───────────────┼───────────────┼─────────┼──────── │
│ Website Design │ Acme Corp     │ $5,000  │ Jan 15  │
│ Logo Package   │ StartupXYZ    │ $2,500  │ Jan 12  │
│ ...            │               │         │         │
├─────────────────────────────────────────────────────┤
│                           [< Prev] Page 1/3 [Next >]│
└─────────────────────────────────────────────────────┘
```

- Max Width: 800px
- Max Height: 80vh
- Scrollable content area
- Sortable columns
- Pagination: 10 items per page

---

## 6. Data Requirements

### 6.1 Existing Data (No Changes Needed)

| Data | Source | Notes |
|------|--------|-------|
| Revenue over time | `getRevenueData()` | Already implemented |
| Quote status counts | `getQuoteStatusCounts()` | Already implemented |
| Invoice status counts | `getInvoiceStatusCounts()` | Already implemented |
| Dashboard stats | `getDashboardStats()` | Already implemented |

### 6.2 New Data Actions Required

#### getConversionFunnelData

```typescript
interface ConversionFunnelData {
  quotesCreated: number;
  quotesSent: number;
  quotesViewed: number;
  quotesAccepted: number;
  invoicesCreated: number;
  invoicesPaid: number;
}

// Query logic:
// - quotesCreated: COUNT quotes WHERE createdAt in range
// - quotesSent: COUNT quotes WHERE sentAt in range
// - quotesViewed: COUNT quotes WHERE viewedAt in range
// - quotesAccepted: COUNT quotes WHERE status='accepted' AND acceptedAt in range
// - invoicesCreated: COUNT invoices WHERE createdAt in range
// - invoicesPaid: COUNT invoices WHERE status='paid' AND paidAt in range
```

#### getPaymentAgingData

```typescript
interface PaymentAgingData {
  current: number;      // dueDate > today
  days1to30: number;    // dueDate between today-30 and today
  days31to60: number;   // dueDate between today-60 and today-30
  days61to90: number;   // dueDate between today-90 and today-60
  days90plus: number;   // dueDate < today-90
  totalOutstanding: number;
}

// Query logic:
// - SUM(total - amountPaid) for unpaid invoices grouped by age bucket
```

#### getClientDistributionData

```typescript
interface ClientDistributionData {
  region: string;
  clientCount: number;
  totalRevenue: number;
}

// Query logic:
// - Parse client.address JSON for state/country
// - GROUP BY region, COUNT clients, SUM invoice totals
// - ORDER BY clientCount DESC LIMIT 10
```

#### getMonthlyComparisonData

```typescript
interface MonthlyComparisonData {
  month: string;
  revenue: number;
  quoteCount: number;
  invoiceCount: number;
}

// Query logic:
// - GROUP BY MONTH(createdAt) for last 12 months
// - SUM revenue, COUNT quotes, COUNT invoices per month
```

#### getRevenueForecast

```typescript
interface ForecastDataPoint {
  date: string;
  actual?: number;
  forecast?: number;
  isProjection: boolean;
}

// Query logic:
// - Get last 6 months of revenue data
// - Apply linear regression
// - Project 3 months forward with confidence interval
```

---

## 7. Technical Specifications

### 7.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Charts | Recharts 2.15.0 (already installed) |
| UI Components | Shadcn UI + Tailwind CSS |
| Data Fetching | Server Actions |
| State Management | URL params + React state |
| Date Handling | date-fns |
| Export | Client-side CSV generation |

### 7.2 File Structure

```
apps/web/
├── app/(dashboard)/dashboard/
│   ├── page.tsx                    # UPDATE
│   └── analytics/
│       └── page.tsx                # NEW
├── components/dashboard/
│   ├── charts/                     # NEW
│   │   ├── index.ts
│   │   ├── chart-card.tsx
│   │   ├── chart-tooltip.tsx
│   │   ├── chart-skeleton.tsx
│   │   ├── empty-chart.tsx
│   │   ├── revenue-chart.tsx
│   │   ├── quote-status-chart.tsx
│   │   ├── invoice-status-chart.tsx
│   │   ├── conversion-funnel.tsx
│   │   ├── payment-aging-chart.tsx
│   │   ├── client-distribution-chart.tsx
│   │   ├── monthly-comparison-chart.tsx
│   │   └── forecast-chart.tsx
│   └── analytics/                  # NEW
│       ├── index.ts
│       ├── date-filter.tsx
│       ├── export-menu.tsx
│       ├── analytics-header.tsx
│       └── drill-down-modal.tsx
├── lib/dashboard/
│   ├── actions.ts                  # UPDATE
│   ├── types.ts                    # UPDATE (done)
│   └── chart-utils.ts              # NEW
└── hooks/
    └── use-analytics-filter.ts     # NEW
```

### 7.3 Performance Requirements

| Metric | Target |
|--------|--------|
| Initial chart load | < 500ms |
| Date filter response | < 300ms |
| Export generation | < 2s for 12 months |
| Chart animations | 60fps |

### 7.4 Accessibility Requirements

- All charts have proper ARIA labels
- Color contrast meets WCAG 2.1 AA
- Keyboard navigation for all interactive elements
- Screen reader announces chart data
- Focus indicators visible
- Tooltips accessible via keyboard

---

## 8. Acceptance Criteria

### 8.1 Dashboard Analytics Section

- [ ] Revenue chart displays below stats cards
- [ ] Chart shows last 30 days by default
- [ ] Period selector allows switching views
- [ ] Tooltips show on hover
- [ ] Loading skeleton during data fetch
- [ ] Empty state when no data
- [ ] Responsive on mobile (stacks vertically)

### 8.2 Full Analytics Page

- [ ] Page accessible at `/dashboard/analytics`
- [ ] Tab navigation between sections
- [ ] All charts render correctly
- [ ] Date filter affects all charts
- [ ] Export button downloads CSV
- [ ] Page title in browser tab

### 8.3 Individual Charts

**Revenue Chart:**
- [ ] Area chart with gradient fill
- [ ] X-axis shows dates
- [ ] Y-axis shows amounts (formatted)
- [ ] Period selector works
- [ ] Total displayed in header

**Quote Status Chart:**
- [ ] Donut chart renders
- [ ] All statuses color-coded
- [ ] Legend shows counts
- [ ] Click triggers drill-down
- [ ] Center shows total/percentage

**Invoice Status Chart:**
- [ ] Same as quote status chart
- [ ] Overdue highlighted in red

**Conversion Funnel:**
- [ ] Horizontal bar funnel
- [ ] All 6 stages shown
- [ ] Percentages calculated
- [ ] Drop-off highlighted

**Payment Aging:**
- [ ] 5 buckets displayed
- [ ] Color gradient applied
- [ ] Amounts shown
- [ ] Click triggers drill-down

**Client Distribution:**
- [ ] Top 10 regions shown
- [ ] Sorted by count
- [ ] Percentages displayed
- [ ] "Other" category included

**Monthly Comparison:**
- [ ] 12 months displayed
- [ ] Metric toggle works
- [ ] Growth indicators shown

**Forecast:**
- [ ] Actual line solid
- [ ] Forecast line dashed
- [ ] Confidence interval shaded
- [ ] Disclaimer shown

### 8.4 Controls

**Date Filter:**
- [ ] Presets work correctly
- [ ] Custom range picker opens
- [ ] Selection persists in URL
- [ ] All charts update

**Export:**
- [ ] CSV downloads successfully
- [ ] All data included
- [ ] Filename has date range
- [ ] Works with filters applied

**Drill-Down:**
- [ ] Modal opens on click
- [ ] Table shows correct data
- [ ] Search filters results
- [ ] Sorting works
- [ ] Links navigate correctly
- [ ] Modal closes properly

---

## 9. Test Scenarios

### 9.1 E2E Test Cases

#### Dashboard Analytics

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-D01 | Navigate to dashboard | Analytics section visible |
| E2E-D02 | View revenue chart | Chart renders with data |
| E2E-D03 | Hover on chart point | Tooltip displays |
| E2E-D04 | Change period to 7d | Chart updates |
| E2E-D05 | View with no data | Empty state shown |

#### Full Analytics Page

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-A01 | Navigate to /dashboard/analytics | Page loads successfully |
| E2E-A02 | Click each tab | Tab content changes |
| E2E-A03 | Apply 7-day filter | All charts show 7-day data |
| E2E-A04 | Click export CSV | File downloads |
| E2E-A05 | Click chart element | Drill-down modal opens |

#### Revenue Chart

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-R01 | Load with revenue data | Area chart displays |
| E2E-R02 | Hover on data point | Tooltip shows date + amount |
| E2E-R03 | Select 90d period | Chart shows 90-day range |
| E2E-R04 | Load with zero revenue | Flat line at zero |

#### Status Charts

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-S01 | Load quote status chart | Donut chart displays |
| E2E-S02 | Click "Accepted" segment | Drill-down shows accepted quotes |
| E2E-S03 | All quotes same status | Single-color donut |
| E2E-S04 | No quotes | Empty state message |

#### Conversion Funnel

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-F01 | Load funnel | All 6 stages visible |
| E2E-F02 | Verify percentages | Calculated correctly |
| E2E-F03 | Click stage | Shows relevant items |
| E2E-F04 | No data | Empty funnel state |

#### Payment Aging

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-PA01 | Load with overdue invoices | Red bars visible |
| E2E-PA02 | All invoices current | Only green bar |
| E2E-PA03 | Click 90+ bucket | Shows very overdue invoices |
| E2E-PA04 | No outstanding | "All paid" message |

#### Client Distribution

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-CD01 | Load with varied clients | Top 10 regions shown |
| E2E-CD02 | Toggle to revenue view | Bars reorder |
| E2E-CD03 | Single region | One bar displayed |
| E2E-CD04 | No address data | "Unknown" category |

#### Monthly Comparison

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-MC01 | Load chart | 12 months visible |
| E2E-MC02 | Toggle to Quotes | Bars show quote counts |
| E2E-MC03 | Month with no data | Bar at zero |

#### Forecast

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-FC01 | Load forecast | Actual + projected lines |
| E2E-FC02 | Verify projection style | Dashed line |
| E2E-FC03 | Insufficient data | Warning message |

#### Date Filter

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-DF01 | Select 7d preset | URL updates, charts refresh |
| E2E-DF02 | Select custom range | Date picker opens |
| E2E-DF03 | Navigate away and back | Filter persists |
| E2E-DF04 | Clear filter | Returns to default |

#### Export

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-EX01 | Click export CSV | File downloads |
| E2E-EX02 | Export with filter | Filtered data only |
| E2E-EX03 | Verify CSV content | All metrics included |

#### Drill-Down

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| E2E-DD01 | Click chart element | Modal opens |
| E2E-DD02 | Search in modal | Results filter |
| E2E-DD03 | Sort by column | Order changes |
| E2E-DD04 | Click item link | Navigates to detail page |
| E2E-DD05 | Press Escape | Modal closes |

### 9.2 Accessibility Tests

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| A11Y-01 | Navigate charts with keyboard | Focus indicators visible |
| A11Y-02 | Screen reader on chart | Data announced |
| A11Y-03 | Color contrast check | Passes WCAG AA |
| A11Y-04 | Tab through controls | Logical order |

### 9.3 Responsive Tests

| ID | Scenario | Expected Result |
|----|----------|-----------------|
| RES-01 | View on mobile (375px) | Charts stack vertically |
| RES-02 | View on tablet (768px) | 2-column layout |
| RES-03 | View on desktop (1280px) | Full grid layout |

---

## Appendix A: API Response Schemas

### Revenue Data Response

```json
{
  "data": [
    { "date": "2026-01-01", "revenue": 5000, "invoiceCount": 3 },
    { "date": "2026-01-02", "revenue": 2500, "invoiceCount": 1 }
  ],
  "total": 7500,
  "period": "7d"
}
```

### Conversion Funnel Response

```json
{
  "quotesCreated": 100,
  "quotesSent": 85,
  "quotesViewed": 70,
  "quotesAccepted": 45,
  "invoicesCreated": 40,
  "invoicesPaid": 35,
  "conversionRates": {
    "sentRate": 85,
    "viewedRate": 82.4,
    "acceptedRate": 64.3,
    "invoicedRate": 88.9,
    "paidRate": 87.5
  }
}
```

### Payment Aging Response

```json
{
  "current": 15000,
  "days1to30": 8000,
  "days31to60": 3500,
  "days61to90": 1200,
  "days90plus": 500,
  "totalOutstanding": 28200
}
```

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| Conversion Rate | Percentage of quotes that become paid invoices |
| Payment Aging | Categorization of outstanding invoices by days overdue |
| Drill-Down | Ability to click chart element to see underlying data |
| Funnel | Visualization showing progression through stages |
| YoY | Year-over-Year comparison |
| YTD | Year-to-Date period |
