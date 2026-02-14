# QuoteCraft Phase 2 Architecture Design

## Document Information

| Attribute | Value |
|-----------|-------|
| **Version** | 1.0 |
| **Date** | 2026-02-13 |
| **Author** | Architecture Reviewer Agent |
| **Based On** | ARCHITECTURE.md, PHASE2_SPECIFICATION.md, DATA_MODEL.md, GAP_ANALYSIS.md |
| **Status** | Draft for Review |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Data Model Extensions](#2-data-model-extensions)
3. [API Contracts](#3-api-contracts)
4. [Component Architecture](#4-component-architecture)
5. [State Management](#5-state-management)
6. [Sequence Diagrams](#6-sequence-diagrams)
7. [Migration Strategy](#7-migration-strategy)
8. [Performance Considerations](#8-performance-considerations)

---

## 1. Executive Summary

### 1.1 Phase 2 Scope Overview

Phase 2 introduces significant architectural enhancements to QuoteCraft:

| Category | Key Changes |
|----------|-------------|
| **Data Model** | Project entity, enhanced entity hierarchy |
| **Navigation** | Hierarchical sidebar, workspace switcher, user profile |
| **UI Components** | DataTable with TanStack Table, enhanced badges |
| **Analytics** | 4 new report sections with dedicated endpoints |
| **Workflow** | Quote-to-Invoice conversion visualization |

### 1.2 Architecture Diagram - Phase 2 Extensions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PHASE 2 ARCHITECTURE EXTENSIONS                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                │
│  │  Enhanced      │  │   Analytics    │  │   DataTable    │                │
│  │  Sidebar       │  │   Dashboard    │  │   Component    │                │
│  │  - Nested Nav  │  │   - 4 Reports  │  │   - TanStack   │                │
│  │  - User Prof   │  │   - Date Range │  │   - Sorting    │                │
│  │  - Workspace   │  │   - Charts     │  │   - Filtering  │                │
│  └────────────────┘  └────────────────┘  └────────────────┘                │
│           │                  │                   │                          │
│           └──────────────────┼───────────────────┘                          │
│                              │                                               │
│                    ┌─────────┴─────────┐                                    │
│                    │  Context Providers │                                    │
│                    │  - Sidebar State   │                                    │
│                    │  - Analytics Range │                                    │
│                    │  - Workspace       │                                    │
│                    └─────────┬─────────┘                                    │
│                              │                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                         APPLICATION LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      New Server Actions (Phase 2)                      │ │
│  │                                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │  │   Project   │  │   Client    │  │   Service   │  │   Analytics  │  │ │
│  │  │   CRUD      │  │   Insights  │  │   Analytics │  │   Date Range │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      New API Routes (Phase 2)                          │ │
│  │                                                                        │ │
│  │  POST /api/projects              GET /api/analytics/client-ltv        │ │
│  │  GET  /api/projects              GET /api/analytics/top-services      │ │
│  │  GET  /api/projects/:id          GET /api/analytics/revenue-by-category│ │
│  │  PUT  /api/projects/:id                                                │ │
│  │  DELETE /api/projects/:id                                              │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                            DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      Extended Prisma Schema                            │ │
│  │                                                                        │ │
│  │  ┌─────────────┐                                                       │ │
│  │  │   Project   │ ←─── NEW ENTITY                                      │ │
│  │  │  - id       │                                                       │ │
│  │  │  - clientId │────────────────────┐                                 │ │
│  │  │  - name     │                    │                                 │ │
│  │  │  - isActive │                    ▼                                 │ │
│  │  └─────────────┘              ┌─────────────┐                         │ │
│  │        │                      │   Client    │                         │ │
│  │        │                      │  (existing) │                         │ │
│  │        ├──────────────────────┴─────────────┘                         │ │
│  │        │                                                               │ │
│  │        ▼ projectId (nullable)                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │ │
│  │  │    Quote    │  │   Invoice   │  │  Contract   │                   │ │
│  │  │  + projectId│  │  + projectId│  │  + projectId│                   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Model Extensions

### 2.1 Entity Relationship Diagram (Extended)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PHASE 2 ENTITY RELATIONSHIPS                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    Workspace    │ 1    N  │     Client      │ 1    N  │    Project      │
│                 │─────────│                 │─────────│     (NEW)       │
│ id              │         │ id              │         │ id              │
│ name            │         │ workspaceId  ◄──┘         │ clientId     ◄──┘
│ slug            │         │ name            │         │ name            │
│ ownerId         │         │ email           │         │ description     │
│ settings        │         │ company         │         │ isActive        │
└────────┬────────┘         └─────────────────┘         └────────┬────────┘
         │                                                        │
         │                                                        │
         │ 1                                                      │ 1
         │                                                        │
         ▼ N                                                      ▼ N
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      Quote      │ 1    1  │     Invoice     │         │ContractInstance │
│                 │─────────│                 │         │                 │
│ id              │ quoteId │ id              │         │ id              │
│ workspaceId     │         │ workspaceId     │         │ workspaceId     │
│ clientId        │         │ clientId        │         │ clientId        │
│ projectId (NEW) │◄────────│ projectId (NEW) │         │ projectId (NEW) │
│ quoteNumber     │         │ invoiceNumber   │         │ status          │
│ status          │         │ status          │         │ signatureData   │
│ total           │         │ total           │         └─────────────────┘
└─────────────────┘         │ amountPaid      │
                            │ amountDue       │
                            └─────────────────┘
```

### 2.2 Project Model Definition

```typescript
// packages/database/prisma/schema.prisma

model Project {
  id          String    @id @default(uuid())
  workspaceId String    @map("workspace_id")
  clientId    String    @map("client_id")
  name        String    @db.VarChar(255)
  description String?   @db.Text
  isActive    Boolean   @default(true) @map("is_active")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  // Relations
  workspace         Workspace          @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  client            Client             @relation(fields: [clientId], references: [id])
  quotes            Quote[]
  invoices          Invoice[]
  contractInstances ContractInstance[]

  // Indexes
  @@index([workspaceId])
  @@index([clientId])
  @@index([workspaceId, isActive])
  @@index([workspaceId, clientId])
  @@index([createdAt(sort: Desc)])
  @@map("projects")
}
```

### 2.3 Quote Model Extension

```typescript
// Add to existing Quote model

model Quote {
  // ... existing fields ...

  // NEW: Optional project association
  projectId String? @map("project_id")

  // ... existing relations ...

  // NEW: Project relation
  project Project? @relation(fields: [projectId], references: [id])

  // NEW: Additional indexes for analytics
  @@index([projectId])
  @@index([status, createdAt])
  @@index([clientId, status])
  @@index([workspaceId, status, createdAt])
}
```

### 2.4 Invoice Model Extension

```typescript
// Add to existing Invoice model

model Invoice {
  // ... existing fields ...

  // NEW: Optional project association
  projectId String? @map("project_id")

  // ... existing relations ...

  // NEW: Project relation
  project Project? @relation(fields: [projectId], references: [id])

  // NEW: Additional indexes for analytics
  @@index([projectId])
  @@index([status, dueDate])
  @@index([clientId, paidAt])
  @@index([workspaceId, status, dueDate])
  @@index([issuedAt])
}
```

### 2.5 ContractInstance Model Extension

```typescript
// Add to existing ContractInstance model

model ContractInstance {
  // ... existing fields ...

  // NEW: Optional project association
  projectId String? @map("project_id")

  // NEW: Project relation
  project Project? @relation(fields: [projectId], references: [id])

  // NEW: Index
  @@index([projectId])
}
```

### 2.6 Client Model Extension

```typescript
// Add relation to existing Client model

model Client {
  // ... existing fields ...

  // NEW: Projects relation
  projects Project[]
}
```

### 2.7 Workspace Model Extension

```typescript
// Add relation to existing Workspace model

model Workspace {
  // ... existing fields ...

  // NEW: Projects relation
  projects Project[]
}
```

### 2.8 Analytics Query Indexes

```typescript
// Add to QuoteLineItem for top services query
model QuoteLineItem {
  // ... existing fields ...

  @@index([name])
}

// Add to InvoiceLineItem for top services query
model InvoiceLineItem {
  // ... existing fields ...

  @@index([name])
}
```

---

## 3. API Contracts

### 3.1 Project CRUD Endpoints

#### POST /api/projects - Create Project

```typescript
// Request
interface CreateProjectRequest {
  name: string;
  description?: string;
  clientId: string;
  isActive?: boolean;
}

// Response
interface CreateProjectResponse {
  success: boolean;
  project?: {
    id: string;
    name: string;
    description: string | null;
    clientId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    client: {
      id: string;
      name: string;
      company: string | null;
    };
  };
  error?: string;
}
```

#### GET /api/projects - List Projects

```typescript
// Query Parameters
interface ListProjectsQuery {
  clientId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Response
interface ListProjectsResponse {
  success: boolean;
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    clientId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    client: {
      id: string;
      name: string;
      company: string | null;
    };
    _count: {
      quotes: number;
      invoices: number;
      contractInstances: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### GET /api/projects/:id - Get Project Details

```typescript
// Response
interface GetProjectResponse {
  success: boolean;
  project?: {
    id: string;
    name: string;
    description: string | null;
    clientId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    client: {
      id: string;
      name: string;
      company: string | null;
      email: string;
    };
    quotes: Array<{
      id: string;
      quoteNumber: string;
      status: string;
      total: number;
      createdAt: string;
    }>;
    invoices: Array<{
      id: string;
      invoiceNumber: string;
      status: string;
      total: number;
      amountPaid: number;
      amountDue: number;
      dueDate: string;
    }>;
    contractInstances: Array<{
      id: string;
      status: string;
      signedAt: string | null;
    }>;
    totals: {
      quotesValue: number;
      invoicesValue: number;
      paidAmount: number;
      outstandingAmount: number;
    };
  };
  error?: string;
}
```

#### PUT /api/projects/:id - Update Project

```typescript
// Request
interface UpdateProjectRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

// Response
interface UpdateProjectResponse {
  success: boolean;
  project?: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    updatedAt: string;
  };
  error?: string;
}
```

#### DELETE /api/projects/:id - Delete Project (Soft Delete)

```typescript
// Response
interface DeleteProjectResponse {
  success: boolean;
  error?: string;
}
```

### 3.2 Analytics Endpoints

#### GET /api/analytics/client-ltv - Client Lifetime Value

```typescript
// Query Parameters
interface ClientLTVQuery {
  dateFrom?: string;  // ISO date
  dateTo?: string;    // ISO date
  limit?: number;     // default: 10
}

// Response
interface ClientLTVResponse {
  success: boolean;
  data: Array<{
    clientId: string;
    clientName: string;
    clientCompany: string | null;
    clientEmail: string;
    avatarUrl: string | null;

    // LTV Metrics
    lifetimeValue: number;
    totalInvoices: number;
    totalPaidInvoices: number;
    firstInvoiceDate: string;
    lastInvoiceDate: string;

    // Payment Behavior
    averageDaysToPay: number;
    onTimePaymentRate: number;  // percentage

    // Engagement
    totalQuotes: number;
    acceptedQuotes: number;
    quoteAcceptanceRate: number;  // percentage
  }>;
  summary: {
    totalClients: number;
    averageLTV: number;
    topClientLTV: number;
    medianLTV: number;
  };
}
```

#### GET /api/analytics/top-services - Top Services/Products

```typescript
// Query Parameters
interface TopServicesQuery {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;      // default: 10
  source?: 'quotes' | 'invoices' | 'all';  // default: 'all'
}

// Response
interface TopServicesResponse {
  success: boolean;
  data: Array<{
    name: string;
    usageCount: number;
    totalRevenue: number;
    averageRate: number;
    categoryId: string | null;
    categoryName: string | null;

    // Breakdown
    quoteUsageCount: number;
    invoiceUsageCount: number;
  }>;
  summary: {
    totalServices: number;
    totalRevenue: number;
  };
}
```

#### GET /api/analytics/revenue-by-category - Revenue by Category

```typescript
// Query Parameters
interface RevenueByCategoryQuery {
  dateFrom?: string;
  dateTo?: string;
}

// Response
interface RevenueByCategoryResponse {
  success: boolean;
  data: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string | null;

    // Revenue metrics
    totalRevenue: number;
    revenuePercentage: number;

    // Volume metrics
    itemCount: number;
    averageItemValue: number;

    // Trend
    previousPeriodRevenue: number;
    revenueChange: number;
    revenueChangePercentage: number;
  }>;
  summary: {
    totalRevenue: number;
    categoryCount: number;
    uncategorizedRevenue: number;
  };
}
```

### 3.3 Server Actions Types

```typescript
// apps/web/lib/projects/types.ts

export interface Project {
  id: string;
  workspaceId: string;
  clientId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ProjectWithRelations extends Project {
  client: {
    id: string;
    name: string;
    company: string | null;
    email: string;
  };
  _count: {
    quotes: number;
    invoices: number;
    contractInstances: number;
  };
}

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  clientName: string;
  clientCompany: string | null;
  isActive: boolean;
  quoteCount: number;
  invoiceCount: number;
  contractCount: number;
  totalValue: number;
  createdAt: string;
}

export interface CreateProjectData {
  clientId: string;
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  isActive?: boolean;
}
```

### 3.4 Analytics Server Actions Types

```typescript
// apps/web/lib/analytics/types.ts

export interface AnalyticsDateRange {
  from: Date;
  to: Date;
}

export interface ClientLTVData {
  clientId: string;
  clientName: string;
  clientCompany: string | null;
  clientEmail: string;
  avatarUrl: string | null;
  lifetimeValue: number;
  totalInvoices: number;
  averageDaysToPay: number;
  firstInvoiceDate: Date;
  lastInvoiceDate: Date;
}

export interface TopServiceData {
  name: string;
  usageCount: number;
  totalRevenue: number;
  averageRate: number;
  categoryName: string | null;
}

export interface RevenueByCategoryData {
  categoryId: string | null;
  categoryName: string;
  categoryColor: string | null;
  totalRevenue: number;
  revenuePercentage: number;
  itemCount: number;
}

export interface SalesPipelineData {
  conversionRate: number;
  conversionRateTrend: number;  // change from previous period
  averageDealValue: number;
  quotesByStatus: {
    draft: number;
    sent: number;
    accepted: number;
    expired: number;
    declined: number;
  };
  totalQuoteValue: number;
  acceptedQuoteValue: number;
}

export interface FinancialHealthData {
  accountsReceivable: {
    current: number;
    days0to30: number;
    days31to60: number;
    days61Plus: number;
    total: number;
  };
  revenueForecast: Array<{
    date: string;
    actual?: number;
    projected?: number;
    lowerBound?: number;
    upperBound?: number;
  }>;
  taxSummary: Array<{
    period: string;
    taxCollected: number;
    invoiceCount: number;
  }>;
}
```

---

## 4. Component Architecture

### 4.1 Component Hierarchy Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PHASE 2 COMPONENT HIERARCHY                            │
└─────────────────────────────────────────────────────────────────────────────┘

app/
├── (dashboard)/
│   ├── layout.tsx
│   │   └── DashboardLayout
│   │       ├── SidebarProvider (existing)
│   │       ├── AppSidebar (EXTENDED)
│   │       │   ├── SidebarHeader
│   │       │   │   └── WorkspaceSwitcher (NEW)
│   │       │   ├── SidebarContent
│   │       │   │   ├── QuickAction
│   │       │   │   ├── MainNavigation (EXTENDED)
│   │       │   │   │   ├── NavItem: Dashboard
│   │       │   │   │   ├── NavItem: Analytics (NEW)
│   │       │   │   │   ├── NavItem: Clients
│   │       │   │   │   └── NavItemCollapsible: Projects (NEW)
│   │       │   │   │       ├── SubNavItem: Quotes
│   │       │   │   │       ├── SubNavItem: Invoices
│   │       │   │   │       └── SubNavItem: Contracts
│   │       │   │   ├── ResourcesNavigation
│   │       │   │   └── SettingsNavigation
│   │       │   └── SidebarFooter
│   │       │       └── UserProfileSection (NEW)
│   │       ├── AppHeader
│   │       │   ├── SidebarTrigger (existing)
│   │       │   └── Breadcrumb (NEW)
│   │       └── MainContent
│   │
│   ├── analytics/
│   │   └── page.tsx
│   │       └── AnalyticsPage (NEW)
│   │           ├── AnalyticsHeader
│   │           │   └── DateRangePicker (NEW)
│   │           ├── SalesPipelineSection (NEW)
│   │           │   ├── ConversionRateCard
│   │           │   │   └── RadialProgressChart (NEW)
│   │           │   ├── AverageDealValueCard
│   │           │   └── QuotesByStatusChart
│   │           ├── FinancialHealthSection (NEW)
│   │           │   ├── ARAgingChart
│   │           │   ├── RevenueForecastChart
│   │           │   │   └── DualAreaChart (NEW)
│   │           │   └── TaxSummaryTable
│   │           ├── ClientInsightsSection (NEW)
│   │           │   ├── TopClientsChart
│   │           │   └── ClientLTVLeaderboard (NEW)
│   │           └── ServicePerformanceSection (NEW)
│   │               ├── TopServicesChart
│   │               └── RevenueByCategoryChart
│   │
│   ├── projects/
│   │   ├── page.tsx
│   │   │   └── ProjectListPage (NEW)
│   │   │       ├── PageHeader
│   │   │       ├── ProjectFilters
│   │   │       └── DataTable<Project> (NEW)
│   │   ├── new/
│   │   │   └── page.tsx
│   │   │       └── CreateProjectPage (NEW)
│   │   └── [id]/
│   │       └── page.tsx
│   │           └── ProjectDetailPage (NEW)
│   │
│   ├── quotes/
│   │   └── page.tsx
│   │       └── QuotesListPage
│   │           └── DataTable<Quote> (ENHANCED)
│   │
│   └── invoices/
│       └── page.tsx
│           └── InvoicesListPage
│               └── DataTable<Invoice> (ENHANCED)

components/
├── dashboard/
│   ├── app-sidebar.tsx (EXTENDED)
│   ├── workspace-switcher.tsx (NEW)
│   ├── user-profile-section.tsx (NEW)
│   ├── nav-item-collapsible.tsx (NEW)
│   └── breadcrumb-nav.tsx (NEW)
│
├── analytics/
│   ├── analytics-header.tsx (NEW)
│   ├── date-range-picker.tsx (NEW)
│   ├── sales-pipeline-section.tsx (NEW)
│   ├── financial-health-section.tsx (NEW)
│   ├── client-insights-section.tsx (NEW)
│   ├── service-performance-section.tsx (NEW)
│   └── charts/
│       ├── radial-progress-chart.tsx (NEW)
│       ├── dual-area-chart.tsx (NEW)
│       └── client-ltv-leaderboard.tsx (NEW)
│
├── data-table/
│   ├── data-table.tsx (NEW)
│   ├── data-table-column-header.tsx (NEW)
│   ├── data-table-pagination.tsx (NEW)
│   ├── data-table-toolbar.tsx (NEW)
│   ├── data-table-row-actions.tsx (NEW)
│   └── data-table-faceted-filter.tsx (NEW)
│
├── projects/
│   ├── project-list.tsx (NEW)
│   ├── project-form.tsx (NEW)
│   ├── project-detail.tsx (NEW)
│   ├── project-selector.tsx (NEW)
│   └── project-card.tsx (NEW)
│
└── ui/
    └── badge.tsx (EXTENDED - new status variants)
```

### 4.2 DataTable Component Architecture

```typescript
// components/data-table/data-table.tsx

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface DataTableProps<TData, TValue> {
  // Core props
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // Search/Filter
  filterKey?: keyof TData;
  filterPlaceholder?: string;
  statusColumn?: keyof TData;
  statusOptions?: { value: string; label: string; icon?: React.ComponentType }[];

  // Selection
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;

  // Pagination
  pageSizes?: number[];  // default: [10, 25, 50, 100]
  defaultPageSize?: number;

  // Actions
  onRowClick?: (row: TData) => void;
  rowActions?: (row: TData) => React.ReactNode;
  bulkActions?: (selectedRows: TData[]) => React.ReactNode;

  // Loading/Empty states
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  filterPlaceholder = 'Search...',
  statusColumn,
  statusOptions,
  enableRowSelection = false,
  onRowSelectionChange,
  pageSizes = [10, 25, 50, 100],
  defaultPageSize = 10,
  onRowClick,
  rowActions,
  bulkActions,
  isLoading,
  emptyState,
}: DataTableProps<TData, TValue>) {
  // State
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // ... render implementation
}
```

### 4.3 Enhanced Sidebar Architecture

```typescript
// components/dashboard/app-sidebar.tsx (Extended)

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number | null;
  isNew?: boolean;
  children?: NavItem[];  // NEW: Support for nested navigation
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    isNew: true,  // Mark as new feature
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    title: 'Projects',
    icon: FolderKanban,
    children: [
      { title: 'Quotes', href: '/quotes', icon: FileText },
      { title: 'Invoices', href: '/invoices', icon: Receipt },
      { title: 'Contracts', href: '/templates', icon: FileStack },
    ],
  },
];
```

### 4.4 Analytics Report Components

```typescript
// components/analytics/sales-pipeline-section.tsx

interface SalesPipelineSectionProps {
  dateRange: DateRange;
}

export function SalesPipelineSection({ dateRange }: SalesPipelineSectionProps) {
  const { data, isLoading } = useSalesPipelineData(dateRange);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Sales Pipeline</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Conversion Rate - Radial Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <RadialProgressChart
              value={data?.conversionRate ?? 0}
              trend={data?.conversionRateTrend}
              label="Quotes Accepted"
            />
          </CardContent>
        </Card>

        {/* Average Deal Value */}
        <Card>
          <CardHeader>
            <CardTitle>Average Deal Value</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricCard
              value={data?.averageDealValue ?? 0}
              format="currency"
              trend={data?.averageDealValueTrend}
            />
          </CardContent>
        </Card>

        {/* Quotes by Status */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Quotes by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <QuoteStatusBarChart data={data?.quotesByStatus} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
```

### 4.5 Badge Component Extension

```typescript
// components/ui/badge.tsx (Extended variants)

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Existing variants
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        warning: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
        info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",

        // NEW: Quote status variants
        "quote-draft": "border-gray-300 text-gray-600 bg-transparent",
        "quote-sent": "border-blue-400 text-blue-600 bg-transparent",
        "quote-accepted": "border-green-400 text-green-600 bg-transparent",
        "quote-expired": "border-red-400 text-red-600 bg-transparent",
        "quote-declined": "border-orange-400 text-orange-600 bg-transparent",

        // NEW: Invoice status variants
        "invoice-draft": "border-gray-300 text-gray-600 bg-transparent",
        "invoice-pending": "border-amber-400 text-amber-600 bg-transparent",
        "invoice-paid": "border-transparent bg-green-500 text-white",
        "invoice-overdue": "border-transparent bg-red-500 text-white",
        "invoice-partial": "border-blue-400 text-blue-600 bg-transparent",
        "invoice-voided": "border-gray-400 text-gray-600 bg-gray-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Utility function for status-to-variant mapping
export function getStatusBadgeVariant(
  entityType: 'quote' | 'invoice',
  status: string
): VariantProps<typeof badgeVariants>['variant'] {
  const variantMap: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
    // Quote statuses
    'quote-draft': 'quote-draft',
    'quote-sent': 'quote-sent',
    'quote-viewed': 'quote-sent',
    'quote-accepted': 'quote-accepted',
    'quote-expired': 'quote-expired',
    'quote-declined': 'quote-declined',

    // Invoice statuses
    'invoice-draft': 'invoice-draft',
    'invoice-sent': 'invoice-pending',
    'invoice-viewed': 'invoice-pending',
    'invoice-pending': 'invoice-pending',
    'invoice-paid': 'invoice-paid',
    'invoice-overdue': 'invoice-overdue',
    'invoice-partial': 'invoice-partial',
    'invoice-voided': 'invoice-voided',
  };

  return variantMap[`${entityType}-${status}`] || 'default';
}
```

---

## 5. State Management

### 5.1 Analytics Date Range Context

```typescript
// contexts/analytics-date-range-context.tsx

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { subDays, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

export type DateRangePreset =
  | 'this-week'
  | 'this-month'
  | 'this-quarter'
  | 'this-year'
  | 'last-7-days'
  | 'last-30-days'
  | 'last-90-days'
  | 'custom';

interface DateRange {
  from: Date;
  to: Date;
}

interface AnalyticsDateRangeContextValue {
  dateRange: DateRange;
  preset: DateRangePreset;
  setPreset: (preset: DateRangePreset) => void;
  setCustomRange: (from: Date, to: Date) => void;
  isLoading: boolean;
}

const AnalyticsDateRangeContext = createContext<AnalyticsDateRangeContextValue | null>(null);

const STORAGE_KEY = 'quotecraft-analytics-date-range';

export function AnalyticsDateRangeProvider({ children }: { children: React.ReactNode }) {
  const [preset, setPresetState] = useState<DateRangePreset>('last-30-days');
  const [customRange, setCustomRangeState] = useState<DateRange | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load persisted preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { preset: storedPreset, customRange: storedCustom } = JSON.parse(stored);
        setPresetState(storedPreset);
        if (storedCustom) {
          setCustomRangeState({
            from: new Date(storedCustom.from),
            to: new Date(storedCustom.to),
          });
        }
      } catch (e) {
        // Ignore invalid stored data
      }
    }
  }, []);

  // Persist preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      preset,
      customRange: customRange ? {
        from: customRange.from.toISOString(),
        to: customRange.to.toISOString(),
      } : null,
    }));
  }, [preset, customRange]);

  const getDateRangeForPreset = useCallback((p: DateRangePreset): DateRange => {
    const now = new Date();

    switch (p) {
      case 'this-week':
        return { from: startOfWeek(now), to: endOfWeek(now) };
      case 'this-month':
        return { from: startOfMonth(now), to: endOfMonth(now) };
      case 'this-quarter':
        return { from: startOfQuarter(now), to: endOfQuarter(now) };
      case 'this-year':
        return { from: startOfYear(now), to: endOfYear(now) };
      case 'last-7-days':
        return { from: subDays(now, 7), to: now };
      case 'last-30-days':
        return { from: subDays(now, 30), to: now };
      case 'last-90-days':
        return { from: subDays(now, 90), to: now };
      case 'custom':
        return customRange || { from: subDays(now, 30), to: now };
      default:
        return { from: subDays(now, 30), to: now };
    }
  }, [customRange]);

  const dateRange = getDateRangeForPreset(preset);

  const setPreset = useCallback((newPreset: DateRangePreset) => {
    setIsLoading(true);
    setPresetState(newPreset);
    // Loading state will be cleared by analytics components after fetch
    setTimeout(() => setIsLoading(false), 100);
  }, []);

  const setCustomRange = useCallback((from: Date, to: Date) => {
    setIsLoading(true);
    setCustomRangeState({ from, to });
    setPresetState('custom');
    setTimeout(() => setIsLoading(false), 100);
  }, []);

  return (
    <AnalyticsDateRangeContext.Provider value={{
      dateRange,
      preset,
      setPreset,
      setCustomRange,
      isLoading,
    }}>
      {children}
    </AnalyticsDateRangeContext.Provider>
  );
}

export function useAnalyticsDateRange() {
  const context = useContext(AnalyticsDateRangeContext);
  if (!context) {
    throw new Error('useAnalyticsDateRange must be used within AnalyticsDateRangeProvider');
  }
  return context;
}
```

### 5.2 Sidebar Collapse State Persistence

```typescript
// hooks/use-sidebar-state.ts

import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_STORAGE_KEY = 'quotecraft-sidebar-state';

interface SidebarPersistedState {
  isCollapsed: boolean;
  expandedGroups: string[];
}

export function useSidebarPersistedState() {
  const [state, setState] = useState<SidebarPersistedState>({
    isCollapsed: false,
    expandedGroups: ['projects'],  // Default expanded
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored) {
      try {
        setState(JSON.parse(stored));
      } catch (e) {
        // Ignore invalid stored data
      }
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const toggleCollapsed = useCallback(() => {
    setState(prev => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setState(prev => ({
      ...prev,
      expandedGroups: prev.expandedGroups.includes(groupId)
        ? prev.expandedGroups.filter(id => id !== groupId)
        : [...prev.expandedGroups, groupId],
    }));
  }, []);

  const isGroupExpanded = useCallback((groupId: string) => {
    return state.expandedGroups.includes(groupId);
  }, [state.expandedGroups]);

  return {
    isCollapsed: state.isCollapsed,
    toggleCollapsed,
    toggleGroup,
    isGroupExpanded,
  };
}
```

### 5.3 Workspace Context Extension

```typescript
// contexts/workspace-context.tsx

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  tier: 'free' | 'pro' | 'enterprise';
  logoUrl: string | null;
}

interface WorkspaceContextValue {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  switchWorkspace: (workspaceId: string) => Promise<void>;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch workspaces on mount
  useEffect(() => {
    async function fetchWorkspaces() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/workspaces');
        const data = await response.json();
        setWorkspaces(data.workspaces);

        // Set current workspace
        const activeId = session.activeWorkspaceId;
        const active = data.workspaces.find((w: Workspace) => w.id === activeId);
        setCurrentWorkspace(active || data.workspaces[0] || null);
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkspaces();
  }, [session?.user?.id, session?.activeWorkspaceId]);

  const switchWorkspace = useCallback(async (workspaceId: string) => {
    setIsLoading(true);
    try {
      // Update session with new active workspace
      await update({ activeWorkspaceId: workspaceId });

      const newWorkspace = workspaces.find(w => w.id === workspaceId);
      setCurrentWorkspace(newWorkspace || null);
    } catch (error) {
      console.error('Failed to switch workspace:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [workspaces, update]);

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspace,
      workspaces,
      switchWorkspace,
      isLoading,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}
```

---

## 6. Sequence Diagrams

### 6.1 Quote-to-Invoice Conversion Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      QUOTE TO INVOICE CONVERSION SEQUENCE                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────┐     ┌────────────────┐     ┌─────────────┐     ┌──────────┐     ┌────────────┐
│  User  │     │  QuoteDetail   │     │ ConvertModal│     │ Server   │     │  Database  │
│        │     │  Component     │     │  Component  │     │ Action   │     │            │
└───┬────┘     └───────┬────────┘     └──────┬──────┘     └────┬─────┘     └─────┬──────┘
    │                  │                      │                 │                  │
    │ 1. View Quote    │                      │                 │                  │
    │ (status=accepted)│                      │                 │                  │
    │─────────────────>│                      │                 │                  │
    │                  │                      │                 │                  │
    │                  │ 2. Render "Convert   │                 │                  │
    │                  │    to Invoice" btn   │                 │                  │
    │                  │ (visible only for    │                 │                  │
    │                  │  accepted quotes)    │                 │                  │
    │                  │                      │                 │                  │
    │ 3. Click Convert │                      │                 │                  │
    │─────────────────>│                      │                 │                  │
    │                  │                      │                 │                  │
    │                  │ 4. Open Modal        │                 │                  │
    │                  │────────────────────>│                 │                  │
    │                  │                      │                 │                  │
    │                  │                      │ 5. Display      │                  │
    │                  │                      │    - Quote #    │                  │
    │                  │                      │    - Client     │                  │
    │                  │                      │    - Amount     │                  │
    │                  │                      │    - Due Date   │                  │
    │                  │                      │    - Options    │                  │
    │<─────────────────────────────────────────│                 │                  │
    │                  │                      │                 │                  │
    │ 6. Confirm       │                      │                 │                  │
    │    (set due date,│                      │                 │                  │
    │     copy items)  │                      │                 │                  │
    │─────────────────────────────────────────>│                 │                  │
    │                  │                      │                 │                  │
    │                  │                      │ 7. Call         │                  │
    │                  │                      │    convertQuote │                  │
    │                  │                      │    ToInvoice()  │                  │
    │                  │                      │────────────────>│                  │
    │                  │                      │                 │                  │
    │                  │                      │                 │ 8. Begin         │
    │                  │                      │                 │    Transaction   │
    │                  │                      │                 │─────────────────>│
    │                  │                      │                 │                  │
    │                  │                      │                 │ 9. Create Invoice│
    │                  │                      │                 │    (copy items,  │
    │                  │                      │                 │     link quoteId)│
    │                  │                      │                 │─────────────────>│
    │                  │                      │                 │                  │
    │                  │                      │                 │ 10. Update Quote │
    │                  │                      │                 │     status       │
    │                  │                      │                 │     =converted   │
    │                  │                      │                 │─────────────────>│
    │                  │                      │                 │                  │
    │                  │                      │                 │ 11. Create Event │
    │                  │                      │                 │     Log          │
    │                  │                      │                 │─────────────────>│
    │                  │                      │                 │                  │
    │                  │                      │                 │ 12. Commit       │
    │                  │                      │                 │<─────────────────│
    │                  │                      │                 │                  │
    │                  │                      │ 13. Return      │                  │
    │                  │                      │     invoice     │                  │
    │                  │                      │<────────────────│                  │
    │                  │                      │                 │                  │
    │                  │ 14. Close Modal     │                  │                  │
    │                  │<────────────────────│                  │                  │
    │                  │                      │                 │                  │
    │ 15. Redirect to  │                      │                 │                  │
    │     Invoice      │                      │                 │                  │
    │     Detail Page  │                      │                 │                  │
    │<─────────────────│                      │                 │                  │
    │                  │                      │                 │                  │
```

### 6.2 Project Hierarchy Navigation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PROJECT HIERARCHY NAVIGATION SEQUENCE                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────┐     ┌─────────────┐     ┌────────────┐     ┌───────────┐     ┌──────────┐
│  User  │     │  Sidebar    │     │ ProjectList│     │ Server    │     │ Database │
│        │     │  Component  │     │ Page       │     │ Actions   │     │          │
└───┬────┘     └──────┬──────┘     └─────┬──────┘     └─────┬─────┘     └────┬─────┘
    │                 │                   │                  │                │
    │ 1. Click        │                   │                  │                │
    │    "Projects"   │                   │                  │                │
    │    in sidebar   │                   │                  │                │
    │────────────────>│                   │                  │                │
    │                 │                   │                  │                │
    │                 │ 2. Expand         │                  │                │
    │                 │    submenu        │                  │                │
    │                 │    (animate       │                  │                │
    │                 │     chevron)      │                  │                │
    │                 │                   │                  │                │
    │<────────────────│                   │                  │                │
    │                 │                   │                  │                │
    │ 3. Shows:       │                   │                  │                │
    │    - Quotes     │                   │                  │                │
    │    - Invoices   │                   │                  │                │
    │    - Contracts  │                   │                  │                │
    │                 │                   │                  │                │
    │ 4. Click        │                   │                  │                │
    │    "Quotes"     │                   │                  │                │
    │────────────────>│                   │                  │                │
    │                 │                   │                  │                │
    │                 │ 5. Navigate to    │                  │                │
    │                 │    /quotes        │                  │                │
    │                 │──────────────────>│                  │                │
    │                 │                   │                  │                │
    │                 │                   │ 6. getQuotes()   │                │
    │                 │                   │─────────────────>│                │
    │                 │                   │                  │                │
    │                 │                   │                  │ 7. Query with  │
    │                 │                   │                  │    Project     │
    │                 │                   │                  │    relations   │
    │                 │                   │                  │───────────────>│
    │                 │                   │                  │                │
    │                 │                   │                  │<───────────────│
    │                 │                   │                  │                │
    │                 │                   │<─────────────────│                │
    │                 │                   │                  │                │
    │ 8. Display      │ 9. Highlight     │                  │                │
    │    Quotes       │    "Quotes" AND   │                  │                │
    │    DataTable    │    "Projects"     │                  │                │
    │<────────────────│<───────────────────                  │                │
    │                 │                   │                  │                │
    │ 10. Filter by   │                   │                  │                │
    │     Project     │                   │                  │                │
    │────────────────────────────────────>│                  │                │
    │                 │                   │                  │                │
    │                 │                   │ 11. getQuotes    │                │
    │                 │                   │     (projectId)  │                │
    │                 │                   │─────────────────>│                │
    │                 │                   │                  │                │
    │                 │                   │<─────────────────│                │
    │                 │                   │                  │                │
    │ 12. Updated     │                   │                  │                │
    │     table with  │                   │                  │                │
    │     filtered    │                   │                  │                │
    │     quotes      │                   │                  │                │
    │<────────────────────────────────────│                  │                │
    │                 │                   │                  │                │
```

### 6.3 Analytics Dashboard Data Loading Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ANALYTICS DASHBOARD LOADING SEQUENCE                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────┐    ┌───────────────┐    ┌──────────────────────────────────────────────────┐
│  User  │    │ DateRange     │    │              Analytics Sections                   │
│        │    │ Context       │    │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
└───┬────┘    └───────┬───────┘    │ │  Sales   │ │Financial │ │ Client   │ │Service ││
    │                 │            │ │ Pipeline │ │ Health   │ │ Insights │ │ Perf   ││
    │                 │            │ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘│
    │                 │            └──────┼───────────┼────────────┼───────────┼──────┘
    │ Navigate to     │                   │           │            │           │
    │ /analytics      │                   │           │            │           │
    │────────────────>│                   │           │            │           │
    │                 │                   │           │            │           │
    │                 │ 1. Init context   │           │            │           │
    │                 │    (load saved    │           │            │           │
    │                 │     preference)   │           │            │           │
    │                 │                   │           │            │           │
    │                 │ 2. Provide dateRange (e.g., last 30 days)  │           │
    │                 │──────────────────>│──────────>│───────────>│──────────>│
    │                 │                   │           │            │           │
    │                 │                   │ 3. PARALLEL DATA FETCHING           │
    │                 │                   │           │            │           │
    │                 │                   │ fetch     │ fetch      │ fetch     │ fetch
    │                 │                   │ sales     │ financial  │ client    │ service
    │                 │                   │ data      │ data       │ data      │ data
    │                 │                   │───────────│────────────│───────────│───────>
    │                 │                   │           │            │           │
    │                 │                   │ Loading Skeletons Displayed        │
    │<────────────────│<──────────────────│<──────────│<───────────│<──────────│
    │                 │                   │           │            │           │
    │                 │                   │<──────────│<───────────│<──────────│<──────
    │                 │                   │           │            │           │
    │                 │                   │ 4. Data received (async, may vary) │
    │                 │                   │           │            │           │
    │ Charts render   │                   │           │            │           │
    │ progressively   │                   │           │            │           │
    │<────────────────│<──────────────────│<──────────│<───────────│<──────────│
    │                 │                   │           │            │           │
    │ Change date     │                   │           │            │           │
    │ range to        │                   │           │            │           │
    │ "This Quarter"  │                   │           │            │           │
    │────────────────>│                   │           │            │           │
    │                 │                   │           │            │           │
    │                 │ 5. Update context │           │            │           │
    │                 │    (persist       │           │            │           │
    │                 │     preference)   │           │            │           │
    │                 │                   │           │            │           │
    │                 │ 6. Broadcast new dateRange    │            │           │
    │                 │──────────────────>│──────────>│───────────>│──────────>│
    │                 │                   │           │            │           │
    │                 │                   │ 7. RE-FETCH WITH NEW RANGE          │
    │                 │                   │───────────│────────────│───────────│───────>
    │                 │                   │           │            │           │
    │ Loading states  │                   │           │            │           │
    │<────────────────│<──────────────────│<──────────│<───────────│<──────────│
    │                 │                   │           │            │           │
    │                 │                   │<──────────│<───────────│<──────────│<──────
    │                 │                   │           │            │           │
    │ Updated charts  │                   │           │            │           │
    │<────────────────│<──────────────────│<──────────│<───────────│<──────────│
    │                 │                   │           │            │           │
```

---

## 7. Migration Strategy

### 7.1 Database Migration Plan

```sql
-- Migration 001: Add Project table
-- File: packages/database/prisma/migrations/YYYYMMDDHHMMSS_add_project_entity/migration.sql

-- Create Project table
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX "projects_workspace_id_idx" ON "projects"("workspace_id");
CREATE INDEX "projects_client_id_idx" ON "projects"("client_id");
CREATE INDEX "projects_workspace_id_is_active_idx" ON "projects"("workspace_id", "is_active");
CREATE INDEX "projects_workspace_id_client_id_idx" ON "projects"("workspace_id", "client_id");
CREATE INDEX "projects_created_at_idx" ON "projects"("created_at" DESC);

-- Add foreign keys
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_fkey"
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

```sql
-- Migration 002: Add projectId to Quote, Invoice, ContractInstance
-- File: packages/database/prisma/migrations/YYYYMMDDHHMMSS_add_project_id_to_entities/migration.sql

-- Add nullable projectId to quotes
ALTER TABLE "quotes" ADD COLUMN "project_id" TEXT;
CREATE INDEX "quotes_project_id_idx" ON "quotes"("project_id");
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add nullable projectId to invoices
ALTER TABLE "invoices" ADD COLUMN "project_id" TEXT;
CREATE INDEX "invoices_project_id_idx" ON "invoices"("project_id");
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add nullable projectId to contract_instances
ALTER TABLE "contract_instances" ADD COLUMN "project_id" TEXT;
CREATE INDEX "contract_instances_project_id_idx" ON "contract_instances"("project_id");
ALTER TABLE "contract_instances" ADD CONSTRAINT "contract_instances_project_id_fkey"
    FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

```sql
-- Migration 003: Add analytics query indexes
-- File: packages/database/prisma/migrations/YYYYMMDDHHMMSS_add_analytics_indexes/migration.sql

-- Quote analytics indexes
CREATE INDEX "quotes_status_created_at_idx" ON "quotes"("status", "created_at");
CREATE INDEX "quotes_client_id_status_idx" ON "quotes"("client_id", "status");
CREATE INDEX "quotes_workspace_id_status_created_at_idx" ON "quotes"("workspace_id", "status", "created_at");

-- Invoice analytics indexes
CREATE INDEX "invoices_status_due_date_idx" ON "invoices"("status", "due_date");
CREATE INDEX "invoices_client_id_paid_at_idx" ON "invoices"("client_id", "paid_at");
CREATE INDEX "invoices_workspace_id_status_due_date_idx" ON "invoices"("workspace_id", "status", "due_date");
CREATE INDEX "invoices_issue_date_idx" ON "invoices"("issue_date");

-- Line item indexes for top services query
CREATE INDEX "quote_line_items_name_idx" ON "quote_line_items"("name");
CREATE INDEX "invoice_line_items_name_idx" ON "invoice_line_items"("name");
```

### 7.2 Data Migration Strategy

The migration follows a non-breaking approach:

1. **Phase 1: Schema Extension** (Non-breaking)
   - Add Project table
   - Add nullable `projectId` to Quote, Invoice, ContractInstance
   - Existing data remains unchanged (projectId = null)

2. **Phase 2: Application Update**
   - Deploy new server actions and components
   - UI shows "No Project" for existing documents
   - Users can optionally associate documents with projects

3. **Phase 3: Optional Data Backfill** (Future, if needed)
   - Only if business requirements demand it
   - Would create default projects per client
   - Update existing documents to reference default projects

### 7.3 Backward Compatibility Guarantees

```typescript
// All existing queries must continue to work
// Example: getQuotes action with optional projectId filter

export async function getQuotes(filters?: {
  status?: QuoteStatus;
  clientId?: string;
  projectId?: string | null;  // NEW: optional project filter
  search?: string;
}): Promise<QuoteListItem[]> {
  const { userId, workspace } = await getActiveWorkspace();

  const where: Prisma.QuoteWhereInput = {
    workspaceId: workspace.id,
    deletedAt: null,
    // Existing filters
    ...(filters?.status && { status: filters.status }),
    ...(filters?.clientId && { clientId: filters.clientId }),

    // NEW: Project filter (null = no project, undefined = all)
    ...(filters?.projectId !== undefined && {
      projectId: filters.projectId
    }),

    ...(filters?.search && {
      OR: [
        { quoteNumber: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { client: { name: { contains: filters.search, mode: 'insensitive' } } },
      ],
    }),
  };

  // ... rest of implementation
}
```

---

## 8. Performance Considerations

### 8.1 Analytics Query Optimization

```typescript
// Optimized analytics queries with proper indexing

// Client LTV Query - Uses indexes on client_id and paid_at
export async function getClientLTV(
  workspaceId: string,
  dateRange?: { from: Date; to: Date },
  limit: number = 10
): Promise<ClientLTVData[]> {
  // Use raw query for complex aggregation
  const clients = await prisma.$queryRaw<ClientLTVData[]>`
    SELECT
      c.id as "clientId",
      c.name as "clientName",
      c.company as "clientCompany",
      c.email as "clientEmail",

      -- LTV calculation
      COALESCE(SUM(i.amount_paid), 0) as "lifetimeValue",
      COUNT(DISTINCT i.id) as "totalInvoices",

      -- First and last invoice dates
      MIN(i.created_at) as "firstInvoiceDate",
      MAX(i.created_at) as "lastInvoiceDate",

      -- Average days to pay (only for paid invoices)
      AVG(
        CASE WHEN i.paid_at IS NOT NULL
        THEN EXTRACT(DAY FROM i.paid_at - i.issue_date)
        END
      ) as "averageDaysToPay"

    FROM clients c
    LEFT JOIN invoices i ON i.client_id = c.id
      AND i.status = 'paid'
      AND i.deleted_at IS NULL
      ${dateRange ? Prisma.sql`AND i.paid_at >= ${dateRange.from} AND i.paid_at <= ${dateRange.to}` : Prisma.empty}
    WHERE c.workspace_id = ${workspaceId}
      AND c.deleted_at IS NULL
    GROUP BY c.id
    HAVING COALESCE(SUM(i.amount_paid), 0) > 0
    ORDER BY "lifetimeValue" DESC
    LIMIT ${limit}
  `;

  return clients;
}

// Top Services Query - Uses index on name column
export async function getTopServices(
  workspaceId: string,
  dateRange?: { from: Date; to: Date },
  limit: number = 10
): Promise<TopServiceData[]> {
  const services = await prisma.$queryRaw<TopServiceData[]>`
    WITH combined_items AS (
      SELECT
        name,
        amount,
        rate,
        rc.name as category_name
      FROM quote_line_items qli
      JOIN quotes q ON q.id = qli.quote_id
      LEFT JOIN rate_cards r ON r.id = qli.rate_card_id
      LEFT JOIN rate_card_categories rc ON rc.id = r.category_id
      WHERE q.workspace_id = ${workspaceId}
        AND q.deleted_at IS NULL
        ${dateRange ? Prisma.sql`AND q.created_at >= ${dateRange.from} AND q.created_at <= ${dateRange.to}` : Prisma.empty}

      UNION ALL

      SELECT
        name,
        amount,
        rate,
        rc.name as category_name
      FROM invoice_line_items ili
      JOIN invoices i ON i.id = ili.invoice_id
      LEFT JOIN rate_cards r ON r.id = ili.rate_card_id
      LEFT JOIN rate_card_categories rc ON rc.id = r.category_id
      WHERE i.workspace_id = ${workspaceId}
        AND i.deleted_at IS NULL
        AND i.status = 'paid'
        ${dateRange ? Prisma.sql`AND i.paid_at >= ${dateRange.from} AND i.paid_at <= ${dateRange.to}` : Prisma.empty}
    )
    SELECT
      name,
      COUNT(*) as "usageCount",
      SUM(amount) as "totalRevenue",
      AVG(rate) as "averageRate",
      category_name as "categoryName"
    FROM combined_items
    GROUP BY name, category_name
    ORDER BY "usageCount" DESC
    LIMIT ${limit}
  `;

  return services;
}
```

### 8.2 DataTable Performance

```typescript
// Server-side pagination for large datasets
interface DataTableServerProps<TData> {
  endpoint: string;
  columns: ColumnDef<TData>[];
  defaultPageSize?: number;
}

export function DataTableServer<TData>({
  endpoint,
  columns,
  defaultPageSize = 25,
}: DataTableServerProps<TData>) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);

  // Server-side data fetching with SWR
  const { data, isLoading, error } = useSWR(
    [endpoint, pagination, sorting, filters],
    async ([url, page, sort, filter]) => {
      const params = new URLSearchParams({
        page: String(page.pageIndex + 1),
        limit: String(page.pageSize),
        ...(sort[0] && { sortBy: sort[0].id, sortOrder: sort[0].desc ? 'desc' : 'asc' }),
        ...(filter.length && { filters: JSON.stringify(filter) }),
      });

      const response = await fetch(`${url}?${params}`);
      return response.json();
    },
    {
      keepPreviousData: true,
    }
  );

  // ... render implementation
}
```

### 8.3 Code Splitting for Analytics

```typescript
// app/(dashboard)/analytics/page.tsx

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { AnalyticsHeader } from '@/components/analytics/analytics-header';
import { AnalyticsSkeleton } from '@/components/analytics/analytics-skeleton';

// Lazy load heavy analytics sections
const SalesPipelineSection = dynamic(
  () => import('@/components/analytics/sales-pipeline-section'),
  { loading: () => <AnalyticsSkeleton variant="sales" /> }
);

const FinancialHealthSection = dynamic(
  () => import('@/components/analytics/financial-health-section'),
  { loading: () => <AnalyticsSkeleton variant="financial" /> }
);

const ClientInsightsSection = dynamic(
  () => import('@/components/analytics/client-insights-section'),
  { loading: () => <AnalyticsSkeleton variant="clients" /> }
);

const ServicePerformanceSection = dynamic(
  () => import('@/components/analytics/service-performance-section'),
  { loading: () => <AnalyticsSkeleton variant="services" /> }
);

export default function AnalyticsPage() {
  return (
    <AnalyticsDateRangeProvider>
      <div className="space-y-8">
        <AnalyticsHeader />

        <Suspense fallback={<AnalyticsSkeleton variant="sales" />}>
          <SalesPipelineSection />
        </Suspense>

        <Suspense fallback={<AnalyticsSkeleton variant="financial" />}>
          <FinancialHealthSection />
        </Suspense>

        <Suspense fallback={<AnalyticsSkeleton variant="clients" />}>
          <ClientInsightsSection />
        </Suspense>

        <Suspense fallback={<AnalyticsSkeleton variant="services" />}>
          <ServicePerformanceSection />
        </Suspense>
      </div>
    </AnalyticsDateRangeProvider>
  );
}
```

### 8.4 Performance Targets

| Metric | Target | Implementation Strategy |
|--------|--------|------------------------|
| LCP (Analytics Page) | < 2.5s | Code splitting, lazy loading charts |
| FID | < 100ms | React Server Components where possible |
| CLS | < 0.1 | Skeleton loading states with fixed dimensions |
| DataTable initial load | < 500ms | Server-side pagination, limit to 25 rows |
| Chart render | < 300ms | Canvas-based rendering (Recharts), data pre-processing |
| Analytics query (95th %ile) | < 1s | Optimized indexes, raw SQL for complex aggregations |

---

## Appendix A: File Structure

```
apps/web/
├── app/
│   └── (dashboard)/
│       ├── analytics/
│       │   └── page.tsx
│       └── projects/
│           ├── page.tsx
│           ├── new/
│           │   └── page.tsx
│           └── [id]/
│               └── page.tsx
├── components/
│   ├── analytics/
│   │   ├── analytics-header.tsx
│   │   ├── date-range-picker.tsx
│   │   ├── sales-pipeline-section.tsx
│   │   ├── financial-health-section.tsx
│   │   ├── client-insights-section.tsx
│   │   ├── service-performance-section.tsx
│   │   ├── analytics-skeleton.tsx
│   │   └── charts/
│   │       ├── radial-progress-chart.tsx
│   │       ├── dual-area-chart.tsx
│   │       └── client-ltv-leaderboard.tsx
│   ├── dashboard/
│   │   ├── app-sidebar.tsx (EXTENDED)
│   │   ├── workspace-switcher.tsx (NEW)
│   │   ├── user-profile-section.tsx (NEW)
│   │   ├── nav-item-collapsible.tsx (NEW)
│   │   └── breadcrumb-nav.tsx (NEW)
│   ├── data-table/
│   │   ├── data-table.tsx
│   │   ├── data-table-column-header.tsx
│   │   ├── data-table-pagination.tsx
│   │   ├── data-table-toolbar.tsx
│   │   ├── data-table-row-actions.tsx
│   │   └── data-table-faceted-filter.tsx
│   └── projects/
│       ├── project-list.tsx
│       ├── project-form.tsx
│       ├── project-detail.tsx
│       ├── project-selector.tsx
│       └── project-card.tsx
├── contexts/
│   ├── analytics-date-range-context.tsx (NEW)
│   └── workspace-context.tsx (EXTENDED)
├── hooks/
│   └── use-sidebar-state.ts (NEW)
└── lib/
    ├── analytics/
    │   ├── types.ts (NEW)
    │   └── actions.ts (NEW)
    └── projects/
        ├── types.ts (NEW)
        └── actions.ts (NEW)

packages/database/prisma/
├── schema.prisma (EXTENDED)
└── migrations/
    ├── YYYYMMDDHHMMSS_add_project_entity/
    ├── YYYYMMDDHHMMSS_add_project_id_to_entities/
    └── YYYYMMDDHHMMSS_add_analytics_indexes/
```

---

## Appendix B: Dependencies

### New NPM Packages

| Package | Version | Purpose |
|---------|---------|---------|
| @tanstack/react-table | ^8.x | DataTable sorting, filtering, pagination |

### Existing Packages (Already Installed)

| Package | Purpose |
|---------|---------|
| recharts | Charts (radial, area, bar) |
| @radix-ui/react-collapsible | Sidebar submenu collapse |
| date-fns | Date range calculations |
| zod | API validation schemas |

---

*Document generated by Architecture Reviewer Agent*
*Version 1.0 - 2026-02-13*
