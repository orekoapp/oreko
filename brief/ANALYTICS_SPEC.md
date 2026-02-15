# Analytics Dashboard Specifications

This document provides detailed specifications for the four analytics report categories.

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Analytics                                            [Date Range ⌄]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌── SALES PIPELINE ──────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  ┌─────────────────────┐  ┌─────────────────────────────────────┐  ││
│  │  │ Quote Conversion    │  │ Quotes by Status                    │  ││
│  │  │ Rate                │  │ Current status distribution         │  ││
│  │  │    ╭───────╮       │  │                                     │  ││
│  │  │   │  68%   │       │  │  ▓▓▓▓  ▓▓▓▓▓▓  ▓▓▓  ▓▓▓▓▓▓▓▓▓     │  ││
│  │  │    ╰───────╯       │  │  Draft  Sent   Exp   Accepted       │  ││
│  │  │ ↗ Trending up 5.2% │  │                                     │  ││
│  │  │   Last 6 months    │  │  35 quotes accepted this month ↗   │  ││
│  │  └─────────────────────┘  └─────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌── FINANCIAL HEALTH ────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  ┌─────────────────────────┐  ┌─────────────────────────────────┐  ││
│  │  │ Revenue Forecast        │  │ Accounts Receivable Aging       │  ││
│  │  │ Actual vs Projected     │  │ Outstanding invoices by age     │  ││
│  │  │                         │  │                                 │  ││
│  │  │     ╱╲    ╱╲           │  │  0-30  ████████████████████     │  ││
│  │  │    ╱  ╲__╱  ╲__        │  │  31-60 ████████                 │  ││
│  │  │   ╱              ╲     │  │  60+   ███                      │  ││
│  │  │  Jan Feb Mar Apr May   │  │                                 │  ││
│  │  │  ■ Projected ■ Actual  │  │  $1,200 overdue by 60+ days ↘  │  ││
│  │  └─────────────────────────┘  └─────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌── CLIENT INSIGHTS ─────────────────────────────────────────────────┐│
│  │  ... (similar layout)                                               ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌── SERVICE PERFORMANCE ─────────────────────────────────────────────┐│
│  │  ... (similar layout)                                               ││
│  └─────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Report 1: Sales Pipeline & Conversion

### Purpose
Track the efficiency of winning business (the "Quote" phase).

### Metrics

| Metric | Formula | Display |
|--------|---------|---------|
| Quote Conversion Rate | `(Accepted / Sent) × 100` | Radial progress chart |
| Quotes by Status | Count per status | Stacked bar or grouped bars |
| Average Deal Value | `SUM(Accepted Total) / COUNT(Accepted)` | KPI card |
| Trend | Month-over-month change | Arrow + percentage |

### Components

#### 1.1 Quote Conversion Rate Card
```typescript
interface ConversionRateProps {
  rate: number;           // 0-100
  trend: number;          // Positive or negative %
  trendDirection: 'up' | 'down';
  period: string;         // "Last 6 months"
}
```

**Visual Specifications:**
- Radial/circular progress chart
- Center: Large percentage (e.g., "68%")
- Below center: "Converted" label
- Footer: Trend arrow + "Trending up/down by X% this month"
- Subtitle: "Total conversion for the last N months"

#### 1.2 Quotes by Status Card
```typescript
interface QuotesByStatusProps {
  data: {
    status: 'draft' | 'sent' | 'expired' | 'accepted';
    count: number;
    color: string;
  }[];
  highlightText: string;  // "35 quotes accepted this month"
}
```

**Visual Specifications:**
- Grouped vertical bars OR stacked area
- X-axis: Status labels
- Y-axis: Count
- Colors: Draft (gray), Sent (blue), Expired (purple), Accepted (green)
- Footer: Highlight stat with trend arrow

---

## Report 2: Financial Health

### Purpose
Cash flow management and accounting (the "Invoice" phase).

### Metrics

| Metric | Formula | Display |
|--------|---------|---------|
| Accounts Receivable Aging | Group by age bucket | Horizontal bar chart |
| Revenue Forecast | Projected vs Actual | Dual area chart |
| Sales Tax Summary | Sum by period | Data table |

### Components

#### 2.1 Revenue Forecast Card
```typescript
interface RevenueForecastProps {
  data: {
    month: string;
    projected: number;  // Value of accepted quotes
    actual: number;     // Value of sent invoices
  }[];
  period: string;       // "January - June 2026"
}
```

**Visual Specifications:**
- Dual-area chart with gradient fills
- Projected: Light purple area (semi-transparent)
- Actual: Darker purple line with subtle fill
- X-axis: Month labels (Jan, Feb, Mar...)
- Y-axis: Currency values
- Legend: Below chart
- Tooltip: Show both values on hover

#### 2.2 Accounts Receivable Aging Card
```typescript
interface ARAgingProps {
  buckets: {
    range: '0-30' | '31-60' | '60+';
    amount: number;
    color: string;
  }[];
  criticalAmount: number;  // Amount overdue 60+ days
}
```

**Visual Specifications:**
- Horizontal bar chart
- Y-axis: Age buckets (0-30 Days, 31-60 Days, 60+ Days)
- X-axis: Dollar amounts
- Colors: 0-30 (blue/purple), 31-60 (orange), 60+ (red)
- Footer: Warning indicator for 60+ amount

#### 2.3 Sales Tax Summary (Optional Table)
```typescript
interface TaxSummaryProps {
  data: {
    period: string;
    taxCollected: number;
    taxType: string;  // "GST", "VAT", etc.
  }[];
  dateRange: { start: Date; end: Date };
}
```

---

## Report 3: Client Insights

### Purpose
Identify high-value vs. high-maintenance clients.

### Metrics

| Metric | Formula | Display |
|--------|---------|---------|
| Revenue per Client | Sum of paid invoices | Horizontal bar chart |
| Client Lifetime Value | Total revenue since first invoice | Leaderboard list |
| Average Days to Pay | `AVG(paid_at - issued_at)` | KPI per client |

### Components

#### 3.1 Top Clients by Revenue Card
```typescript
interface TopClientsRevenueProps {
  clients: {
    name: string;
    revenue: number;
    color: string;
  }[];
  period: string;  // "Year to Date"
}
```

**Visual Specifications:**
- Horizontal bar chart
- Sorted descending by revenue
- Y-axis: Client names
- X-axis: Revenue amounts
- Color: Gradient or distinct colors per client
- Tooltip: Exact revenue on hover

#### 3.2 Client Lifetime Value Card
```typescript
interface ClientLTVProps {
  clients: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    initials: string;
    ltv: number;
    color: string;  // Avatar background color
  }[];
}
```

**Visual Specifications:**
- Leaderboard-style list
- Each row: Avatar circle + Name + Email + LTV amount
- Avatar: Colored circle with initials if no image
- LTV: Right-aligned, formatted with "+" prefix (e.g., "+$45,000")
- Top 4-5 clients shown

---

## Report 4: Service Performance

### Purpose
Inventory and service optimization.

### Metrics

| Metric | Formula | Display |
|--------|---------|---------|
| Top Services/Products | Count of quoted items | Vertical bar chart |
| Revenue by Category | Sum by category | Donut/pie chart |

### Components

#### 4.1 Top Selling Services Card
```typescript
interface TopServicesProps {
  services: {
    name: string;
    count: number;
    color: string;
  }[];
  subtitle: string;  // "Most popular items"
}
```

**Visual Specifications:**
- Vertical bar chart
- X-axis: Service names
- Y-axis: Count (number of times quoted)
- Colors: Distinct color per bar (blue, purple, orange, green)
- Tooltip: Count and total revenue

#### 4.2 Revenue by Category Card
```typescript
interface RevenueByCategoryProps {
  categories: {
    name: string;
    revenue: number;
    percentage: number;
    color: string;
  }[];
  subtitle: string;  // "Service Profitability"
}
```

**Visual Specifications:**
- Donut chart (pie with inner cutout)
- Segments: One per category
- Legend: Below chart, horizontal layout
- Colors: Design (blue), Development (purple), Marketing (gray), Consulting (yellow)
- Tooltip: Category name + revenue + percentage

---

## Date Range Filtering

### Global Filter Component
```typescript
interface DateRangeFilterProps {
  presets: {
    label: string;
    value: string;
    range: { start: Date; end: Date };
  }[];
  customRange?: boolean;
  onChange: (range: { start: Date; end: Date }) => void;
}
```

### Preset Options
- Last 7 days
- Last 30 days
- Last 3 months
- Last 6 months
- Year to date
- Last year
- Custom range

---

## API Endpoints

### GET /api/analytics/sales-pipeline
```typescript
interface SalesPipelineResponse {
  conversionRate: {
    current: number;
    previous: number;
    trend: number;
  };
  quotesByStatus: {
    draft: number;
    sent: number;
    expired: number;
    accepted: number;
  };
  averageDealValue: number;
  acceptedThisMonth: number;
}
```

### GET /api/analytics/financial-health
```typescript
interface FinancialHealthResponse {
  revenueForecast: {
    month: string;
    projected: number;
    actual: number;
  }[];
  arAging: {
    bucket: string;
    amount: number;
  }[];
  taxSummary: {
    period: string;
    amount: number;
  }[];
}
```

### GET /api/analytics/client-insights
```typescript
interface ClientInsightsResponse {
  topClientsByRevenue: {
    id: string;
    name: string;
    revenue: number;
  }[];
  clientLTV: {
    id: string;
    name: string;
    email: string;
    ltv: number;
  }[];
  avgDaysToPay: {
    clientId: string;
    avgDays: number;
  }[];
}
```

### GET /api/analytics/service-performance
```typescript
interface ServicePerformanceResponse {
  topServices: {
    name: string;
    count: number;
    revenue: number;
  }[];
  revenueByCategory: {
    category: string;
    revenue: number;
    percentage: number;
  }[];
}
```
