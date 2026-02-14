# Phase 2 Effort Estimation

**Generated:** 2026-02-13
**Estimator:** Project Estimator Agent
**Methodology:** Three-Point Estimation with Reuse Credits

---

## Executive Summary

| Metric | Hours |
|--------|-------|
| **TOTAL ESTIMATED HOURS** | **156-196 hrs** |
| Base Estimate (no reuse) | 260 hrs |
| Reuse Credit Applied | -104 hrs (-40%) |
| Net Base Estimate | 156 hrs |
| Risk Buffer (25%) | 40 hrs |
| **RECOMMENDED QUOTE** | **196 hrs** |

### Confidence Intervals

| Percentile | Hours | Timeline (1 FTE) |
|------------|-------|------------------|
| **P50 (Likely)** | 175 hrs | 4.5 weeks |
| **P80 (Conservative)** | 196 hrs | 5 weeks |
| **P95 (Pessimistic)** | 230 hrs | 6 weeks |

### Key Assumptions
- Single senior full-stack developer (WordPress/Next.js proficient)
- Existing Phase 1 codebase fully functional and tested
- No scope changes after estimation
- Client provides timely feedback (48-hour turnaround)

---

## Work Breakdown Structure (WBS)

### Summary by Phase

| Phase | Base Hrs | Reuse Factor | Adjusted Hrs | % of Total |
|-------|----------|--------------|--------------|------------|
| Foundation & Data Model | 40 | 0.85 | 34 | 22% |
| Navigation & Shell | 36 | 0.48 | 17 | 11% |
| UI Components | 40 | 0.53 | 21 | 13% |
| Analytics Reports | 72 | 0.63 | 45 | 29% |
| Builder Enhancements | 32 | 0.50 | 16 | 10% |
| Non-Functional | 24 | 0.50 | 12 | 8% |
| Integration & Testing | 16 | 1.00 | 16 | 10% |
| **TOTAL** | **260** | **0.62** | **161** | **100%** |

---

## Detailed Task Breakdown

### Legend

| Column | Description |
|--------|-------------|
| WBS ID | Work breakdown structure identifier |
| Task | Task name and description |
| Gap Class | REUSABLE / EXTEND / PARTIAL / NEW |
| Base (hrs) | Estimate if built from scratch |
| Reuse Factor | Multiplier based on gap analysis (0.1-1.0) |
| Adjusted (hrs) | Base x Reuse Factor |
| Deps | Dependencies (WBS IDs) |

---

## Phase 1: Foundation & Data Model

### WBS-100: Project Entity Implementation

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-101 | Create Project Prisma model with relations | NEW | 4 | 1.0 | 4 | - |
| WBS-102 | Database migration with backward compatibility | NEW | 4 | 1.0 | 4 | WBS-101 |
| WBS-103 | Project CRUD server actions | NEW | 8 | 1.0 | 8 | WBS-102 |
| WBS-104 | Update Quote model with nullable projectId | EXTEND | 2 | 0.5 | 1 | WBS-102 |
| WBS-105 | Update Invoice model with nullable projectId | EXTEND | 2 | 0.5 | 1 | WBS-102 |
| WBS-106 | Update ContractInstance model with nullable projectId | EXTEND | 2 | 0.5 | 1 | WBS-102 |
| WBS-107 | Project list component | PARTIAL | 6 | 0.8 | 5 | WBS-103 |
| WBS-108 | Project detail view | PARTIAL | 6 | 0.8 | 5 | WBS-103 |
| WBS-109 | Project selector in quote/invoice forms | EXTEND | 4 | 0.5 | 2 | WBS-103 |
| WBS-110 | Unit tests for Project CRUD | NEW | 2 | 1.0 | 2 | WBS-103 |
| **Subtotal** | | | **40** | **0.83** | **33** | |

**Notes:**
- Migration is non-breaking (nullable projectId)
- Existing quotes/invoices continue to work without projects
- UI allows "No Project" selection

---

## Phase 2: Navigation & Shell

### WBS-200: Sidebar Restructure

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-201 | Refactor NavItem type for nested children | EXTEND | 2 | 0.5 | 1 | - |
| WBS-202 | Implement SidebarMenuSub for Projects submenu | EXTEND | 4 | 0.5 | 2 | WBS-201 |
| WBS-203 | Add collapsible submenu with chevron animation | EXTEND | 3 | 0.5 | 1.5 | WBS-202 |
| WBS-204 | Update navigation items to new hierarchy | EXTEND | 2 | 0.5 | 1 | WBS-202 |
| **Subtotal** | | | **11** | **0.50** | **5.5** | |

### WBS-210: User Profile Section

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-211 | Add user avatar to SidebarFooter | EXTEND | 2 | 0.5 | 1 | - |
| WBS-212 | Display name/email (hide in collapsed mode) | EXTEND | 1 | 0.5 | 0.5 | WBS-211 |
| WBS-213 | Dropdown menu for profile/logout actions | EXTEND | 2 | 0.5 | 1 | WBS-211 |
| WBS-214 | Wire to NextAuth session data | REUSABLE | 1 | 0.1 | 0.1 | WBS-213 |
| **Subtotal** | | | **6** | **0.43** | **2.6** | |

### WBS-220: Workspace Switcher

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-221 | Fetch current workspace from session | EXTEND | 2 | 0.5 | 1 | - |
| WBS-222 | Add tier badge component (Enterprise/Pro/Free) | EXTEND | 2 | 0.5 | 1 | - |
| WBS-223 | Workspace dropdown for switching | EXTEND | 3 | 0.5 | 1.5 | WBS-221 |
| WBS-224 | Create workspace context provider | EXTEND | 3 | 0.5 | 1.5 | WBS-221 |
| **Subtotal** | | | **10** | **0.50** | **5** | |

### WBS-230: Application Shell Enhancements

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-231 | Add breadcrumb to dashboard layout header | EXTEND | 2 | 0.5 | 1 | - |
| WBS-232 | Wire breadcrumb to current route path | EXTEND | 2 | 0.5 | 1 | WBS-231 |
| WBS-233 | Add sidebar collapse toggle to header | REUSABLE | 1 | 0.1 | 0.1 | - |
| WBS-234 | Mobile responsive adjustments | REUSABLE | 4 | 0.1 | 0.4 | WBS-202 |
| **Subtotal** | | | **9** | **0.28** | **2.5** | |

**Phase 2 Total: 36 hrs base -> 15.6 hrs adjusted**

---

## Phase 3: UI Components

### WBS-300: DataTable Component

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-301 | Install and configure TanStack Table | EXTEND | 2 | 0.5 | 1 | - |
| WBS-302 | Create generic DataTable wrapper component | EXTEND | 6 | 0.5 | 3 | WBS-301 |
| WBS-303 | Add column sorting with sort indicators | EXTEND | 3 | 0.5 | 1.5 | WBS-302 |
| WBS-304 | Add row selection with checkbox column | EXTEND | 3 | 0.5 | 1.5 | WBS-302 |
| WBS-305 | Add search input with debounce | EXTEND | 2 | 0.5 | 1 | WBS-302 |
| WBS-306 | Add status filter dropdown | EXTEND | 2 | 0.5 | 1 | WBS-302 |
| WBS-307 | Add "Show X entries" dropdown | EXTEND | 1 | 0.5 | 0.5 | WBS-302 |
| WBS-308 | Integrate with pagination component | REUSABLE | 2 | 0.1 | 0.2 | WBS-302 |
| WBS-309 | Row actions (view, edit, delete, more) | EXTEND | 3 | 0.5 | 1.5 | WBS-302 |
| WBS-310 | Apply to Quotes list view | EXTEND | 2 | 0.5 | 1 | WBS-302 |
| WBS-311 | Apply to Invoices list view | EXTEND | 2 | 0.5 | 1 | WBS-302 |
| **Subtotal** | | | **28** | **0.49** | **13.2** | |

### WBS-320: Status Badge Variants

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-321 | Add quote status variants to badge.tsx | EXTEND | 2 | 0.5 | 1 | - |
| WBS-322 | Add invoice status variants to badge.tsx | EXTEND | 2 | 0.5 | 1 | - |
| WBS-323 | Create getStatusBadgeVariant() utility | EXTEND | 1 | 0.5 | 0.5 | WBS-321 |
| WBS-324 | Add semantic CSS custom properties | EXTEND | 1 | 0.5 | 0.5 | - |
| **Subtotal** | | | **6** | **0.50** | **3** | |

### WBS-330: Chart Component Enhancements

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-331 | Create radial progress chart component | PARTIAL | 4 | 0.8 | 3.2 | - |
| WBS-332 | Create dual-area chart for forecasts | EXTEND | 3 | 0.5 | 1.5 | - |
| WBS-333 | Update chart color palette to match specs | REUSABLE | 1 | 0.1 | 0.1 | - |
| **Subtotal** | | | **8** | **0.60** | **4.8** | |

**Phase 3 Total: 42 hrs base -> 21 hrs adjusted**

---

## Phase 4: Analytics Reports

### WBS-400: Sales Pipeline Report

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-401 | Create Sales Pipeline section layout | EXTEND | 3 | 0.5 | 1.5 | - |
| WBS-402 | Radial chart for conversion rate | PARTIAL | 4 | 0.8 | 3.2 | WBS-331 |
| WBS-403 | Bar chart for quotes by status | REUSABLE | 2 | 0.1 | 0.2 | - |
| WBS-404 | Add trend calculation to getConversionFunnelData | EXTEND | 3 | 0.5 | 1.5 | - |
| WBS-405 | Average Deal Value metric card | EXTEND | 2 | 0.5 | 1 | - |
| WBS-406 | Trend indicator component (up/down arrow) | EXTEND | 2 | 0.5 | 1 | - |
| **Subtotal** | | | **16** | **0.53** | **8.4** | |

### WBS-410: Financial Health Report

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-411 | Create Financial Health section layout | EXTEND | 3 | 0.5 | 1.5 | - |
| WBS-412 | AR Aging horizontal bar (color-coded) | REUSABLE | 2 | 0.1 | 0.2 | - |
| WBS-413 | Dual-area chart for revenue forecast | EXTEND | 4 | 0.5 | 2 | WBS-332 |
| WBS-414 | Tax summary aggregation query | PARTIAL | 4 | 0.8 | 3.2 | - |
| WBS-415 | Tax summary table component | EXTEND | 3 | 0.5 | 1.5 | WBS-414 |
| WBS-416 | Period selector (monthly, quarterly, yearly) | EXTEND | 2 | 0.5 | 1 | - |
| **Subtotal** | | | **18** | **0.52** | **9.4** | |

### WBS-420: Client Insights Report

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-421 | Create Client Insights section layout | EXTEND | 3 | 0.5 | 1.5 | - |
| WBS-422 | getTopClientsByRevenue() server action | PARTIAL | 4 | 0.8 | 3.2 | - |
| WBS-423 | getClientLTV() server action | NEW | 4 | 1.0 | 4 | - |
| WBS-424 | getClientPaymentSpeed() server action | NEW | 3 | 1.0 | 3 | - |
| WBS-425 | Horizontal bar chart for top clients | EXTEND | 3 | 0.5 | 1.5 | WBS-422 |
| WBS-426 | Leaderboard component with avatars | PARTIAL | 4 | 0.8 | 3.2 | WBS-423 |
| WBS-427 | Avg days to pay metric display | EXTEND | 2 | 0.5 | 1 | WBS-424 |
| **Subtotal** | | | **23** | **0.76** | **17.4** | |

### WBS-430: Service Performance Report

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-431 | Create Service Performance section layout | EXTEND | 3 | 0.5 | 1.5 | - |
| WBS-432 | getTopServices() server action | PARTIAL | 4 | 0.8 | 3.2 | - |
| WBS-433 | getRevenueByCategory() server action | PARTIAL | 4 | 0.8 | 3.2 | - |
| WBS-434 | Vertical bar chart for top services | EXTEND | 3 | 0.5 | 1.5 | WBS-432 |
| WBS-435 | Donut chart for revenue by category | REUSABLE | 2 | 0.1 | 0.2 | WBS-433 |
| **Subtotal** | | | **16** | **0.60** | **9.6** | |

**Phase 4 Total: 73 hrs base -> 44.8 hrs adjusted**

---

## Phase 5: Builder Enhancements

### WBS-500: Preview Tabs

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-501 | Add Tabs component to builder preview pane | EXTEND | 2 | 0.5 | 1 | - |
| WBS-502 | Payment Page tab (existing QuotePortalView) | REUSABLE | 1 | 0.1 | 0.1 | - |
| WBS-503 | Create QuoteEmailPreview component | PARTIAL | 6 | 0.8 | 4.8 | - |
| WBS-504 | Create QuotePdfPreview component (iframe) | EXTEND | 4 | 0.5 | 2 | - |
| WBS-505 | Tab state management and persistence | EXTEND | 2 | 0.5 | 1 | WBS-501 |
| **Subtotal** | | | **15** | **0.59** | **8.9** | |

### WBS-510: Logo Upload Integration

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-511 | Add logo upload to builder header section | EXTEND | 3 | 0.5 | 1.5 | - |
| WBS-512 | Integrate with existing file-upload component | REUSABLE | 2 | 0.1 | 0.2 | WBS-511 |
| WBS-513 | Logo preview and removal | EXTEND | 2 | 0.5 | 1 | WBS-511 |
| WBS-514 | Persist logo to quote/workspace settings | EXTEND | 3 | 0.5 | 1.5 | WBS-511 |
| **Subtotal** | | | **10** | **0.42** | **4.2** | |

### WBS-520: Quote-Invoice Link Display

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-521 | Show linked Invoice status on Quote detail | REUSABLE | 2 | 0.1 | 0.2 | - |
| WBS-522 | Show source Quote reference on Invoice detail | REUSABLE | 2 | 0.1 | 0.2 | - |
| WBS-523 | Link navigation between Quote and Invoice | EXTEND | 2 | 0.5 | 1 | WBS-521 |
| **Subtotal** | | | **6** | **0.23** | **1.4** | |

**Phase 5 Total: 31 hrs base -> 14.5 hrs adjusted**

---

## Phase 6: Non-Functional Requirements

### WBS-600: Accessibility

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-601 | Add aria-labels to icon-only buttons | EXTEND | 3 | 0.5 | 1.5 | - |
| WBS-602 | Ensure focus trap in all dialogs | REUSABLE | 2 | 0.1 | 0.2 | - |
| WBS-603 | Keyboard shortcuts documentation | NEW | 2 | 1.0 | 2 | - |
| WBS-604 | Color contrast audit and fixes | EXTEND | 4 | 0.5 | 2 | - |
| **Subtotal** | | | **11** | **0.52** | **5.7** | |

### WBS-610: Performance

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-611 | Performance audit with Lighthouse | REUSABLE | 2 | 0.1 | 0.2 | - |
| WBS-612 | Optimize analytics queries (indexing) | EXTEND | 3 | 0.5 | 1.5 | WBS-400 |
| WBS-613 | Add loading skeletons for new sections | REUSABLE | 2 | 0.1 | 0.2 | - |
| WBS-614 | Code splitting for analytics page | EXTEND | 2 | 0.5 | 1 | - |
| **Subtotal** | | | **9** | **0.32** | **2.9** | |

### WBS-620: Responsive Design

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-621 | DataTable horizontal scroll on mobile | EXTEND | 2 | 0.5 | 1 | WBS-302 |
| WBS-622 | Analytics cards responsive grid | REUSABLE | 1 | 0.1 | 0.1 | - |
| WBS-623 | Cross-browser testing | EXTEND | 3 | 0.5 | 1.5 | - |
| **Subtotal** | | | **6** | **0.43** | **2.6** | |

**Phase 6 Total: 26 hrs base -> 11.2 hrs adjusted**

---

## Phase 7: Integration & Testing

### WBS-700: Integration Testing

| WBS ID | Task | Gap Class | Base | Reuse | Adjusted | Deps |
|--------|------|-----------|------|-------|----------|------|
| WBS-701 | E2E tests for Project CRUD flow | NEW | 4 | 1.0 | 4 | WBS-100 |
| WBS-702 | E2E tests for DataTable interactions | NEW | 3 | 1.0 | 3 | WBS-300 |
| WBS-703 | E2E tests for Analytics dashboard | NEW | 3 | 1.0 | 3 | WBS-400 |
| WBS-704 | E2E tests for Quote builder enhancements | NEW | 2 | 1.0 | 2 | WBS-500 |
| WBS-705 | Regression testing for existing flows | NEW | 4 | 1.0 | 4 | ALL |
| **Subtotal** | | | **16** | **1.00** | **16** | |

**Phase 7 Total: 16 hrs base -> 16 hrs adjusted (no reuse for new tests)**

---

## Critical Path Analysis

```
CRITICAL PATH (longest dependency chain):
=======================================

WBS-101 (Project model)
    |
    v
WBS-102 (Migration) -----> WBS-103 (CRUD actions)
    |                           |
    v                           v
WBS-107 (List)              WBS-109 (Selector)
    |                           |
    v                           v
WBS-108 (Detail)            WBS-310/311 (DataTable apply)
    |                           |
    +---------------------------+
                |
                v
          WBS-400+ (Analytics)
                |
                v
          WBS-700+ (Testing)

Total Critical Path Duration: ~80 hrs
Estimated Calendar Time: 2.5-3 weeks (single developer)
```

### Parallelizable Work Streams

| Stream | Tasks | Hours | Can Start |
|--------|-------|-------|-----------|
| **Stream A: Data Model** | WBS-100 | 33 hrs | Day 1 |
| **Stream B: Navigation** | WBS-200, WBS-210, WBS-220, WBS-230 | 15.6 hrs | Day 1 |
| **Stream C: UI Components** | WBS-300, WBS-320, WBS-330 | 21 hrs | Day 1 |
| **Stream D: Analytics** | WBS-400, WBS-410, WBS-420, WBS-430 | 44.8 hrs | After WBS-330 |
| **Stream E: Builder** | WBS-500, WBS-510, WBS-520 | 14.5 hrs | After WBS-320 |
| **Stream F: NFR** | WBS-600, WBS-610, WBS-620 | 11.2 hrs | After WBS-400 |
| **Stream G: Testing** | WBS-700 | 16 hrs | After all features |

**With 2 developers:** Streams A+B+C in parallel (Week 1-2), then D+E in parallel (Week 2-3), F+G (Week 3-4)

---

## Risk Assessment

### High-Impact Risks

| Risk | Probability | Impact | Mitigation | Buffer |
|------|-------------|--------|------------|--------|
| **R1:** Project entity migration breaks existing flows | Medium | High | Nullable foreign keys, comprehensive regression tests | +8 hrs |
| **R2:** TanStack Table learning curve | Low | Medium | Use existing Shadcn patterns, allocate spike time | +4 hrs |
| **R3:** Analytics query performance with large datasets | Medium | Medium | Add database indexes, implement pagination | +6 hrs |
| **R4:** Chart library compatibility | Low | Low | Existing Recharts proven, minimal changes | +2 hrs |

### Medium-Impact Risks

| Risk | Probability | Impact | Mitigation | Buffer |
|------|-------------|--------|------------|--------|
| **R5:** Scope creep from stakeholder feedback | Medium | Medium | Document scope clearly, change control process | +8 hrs |
| **R6:** NextAuth session changes | Low | Medium | Minimal session access changes | +2 hrs |
| **R7:** Browser compatibility issues | Low | Medium | Cross-browser testing in NFR phase | +4 hrs |

### Total Risk Buffer Calculation

| Category | Hours |
|----------|-------|
| High-Impact Risks | 20 hrs |
| Medium-Impact Risks | 14 hrs |
| Unknown Unknowns (10%) | 16 hrs |
| **Total Risk Buffer** | **~40 hrs (25%)** |

---

## Resource Allocation

### Option 1: Solo Developer (Recommended for this scope)

| Resource | Allocation | Duration |
|----------|------------|----------|
| Senior Full-Stack Developer | 100% | 5 weeks |

**Pros:** Single point of accountability, no coordination overhead
**Cons:** No parallel streams, longer calendar time

### Option 2: Team Approach

| Resource | Allocation | Focus Area | Hours |
|----------|------------|------------|-------|
| Lead Developer | 60% | Data model, Analytics, Integration | 95 hrs |
| Frontend Developer | 40% | Navigation, UI Components, Builder | 65 hrs |
| QA Engineer | 20% | Testing, Accessibility | 36 hrs |

**Pros:** Faster calendar time (3-4 weeks), specialized skills
**Cons:** Coordination overhead, knowledge silos

### Recommended Approach

**Option 1 (Solo Developer)** is recommended for Phase 2 because:
1. Scope is well-defined with 40% reuse credit
2. Dependencies between tasks favor sequential execution
3. Codebase familiarity reduces ramp-up time
4. Team coordination overhead would offset parallelization gains

---

## Timeline Estimate

### Single Developer Timeline

| Week | Focus | Deliverables | Hours |
|------|-------|--------------|-------|
| **Week 1** | Foundation | Project entity, migration, CRUD, navigation refactor | 40 hrs |
| **Week 2** | UI Components | DataTable, badges, charts, user profile | 36 hrs |
| **Week 3** | Analytics P1 | Sales Pipeline, Financial Health reports | 28 hrs |
| **Week 4** | Analytics P2 + Builder | Client Insights, Service Performance, preview tabs | 32 hrs |
| **Week 5** | Polish | NFR, testing, bug fixes, documentation | 24 hrs |

**Total Calendar Time:** 5 weeks (accounting for 25% buffer)

### Milestone Schedule

| Milestone | Date (Day #) | Deliverables |
|-----------|--------------|--------------|
| **M1: Data Model Complete** | Day 8 | Project entity, migration, basic CRUD |
| **M2: Navigation Complete** | Day 12 | Sidebar, user profile, workspace switcher |
| **M3: UI Components Complete** | Day 18 | DataTable, badges, enhanced charts |
| **M4: Analytics Complete** | Day 25 | All 4 analytics sections |
| **M5: Builder Complete** | Day 28 | Preview tabs, logo upload, link display |
| **M6: Ready for Review** | Day 32 | NFR compliance, E2E tests passing |
| **M7: Final Delivery** | Day 35 | Bug fixes, documentation complete |

---

## Dependencies Matrix

### External Dependencies

| Dependency | Required By | Risk Level | Owner |
|------------|-------------|------------|-------|
| Database access for migration | WBS-102 | Low | DevOps |
| Staging environment | WBS-700+ | Low | DevOps |
| Design review approval | WBS-320, WBS-400+ | Medium | Product |
| Access to analytics test data | WBS-400+ | Medium | QA |

### Internal Dependencies (Task Order)

```
WBS-101 -> WBS-102 -> WBS-103 -> WBS-107, WBS-108, WBS-109
                  |
                  +-> WBS-104, WBS-105, WBS-106

WBS-201 -> WBS-202 -> WBS-203 -> WBS-204

WBS-301 -> WBS-302 -> WBS-303..WBS-311

WBS-331 -> WBS-402
WBS-332 -> WBS-413

WBS-422 -> WBS-425
WBS-423 -> WBS-426
WBS-424 -> WBS-427

WBS-432 -> WBS-434
WBS-433 -> WBS-435

ALL -> WBS-700+ (Testing)
```

---

## Assumptions & Constraints

### Assumptions

1. **Codebase Stability:** Phase 1 code is stable and all existing tests pass
2. **Database Access:** Developer has direct access to development database
3. **No Breaking Changes:** Prisma schema changes are additive only
4. **Design Assets:** Any required icons/graphics are provided or available
5. **Stakeholder Availability:** Product owner available for questions within 48 hours
6. **No Infrastructure Changes:** No new services or infrastructure required

### Constraints

1. **Backward Compatibility:** Existing quote/invoice workflows must continue to work
2. **Performance:** New analytics queries must meet <500ms target
3. **Browser Support:** Must work in Chrome, Firefox, Safari, Edge (latest versions)
4. **Accessibility:** Must maintain WCAG 2.1 AA compliance

---

## Estimation Confidence

### Confidence by Phase

| Phase | Confidence | Reason |
|-------|------------|--------|
| Foundation & Data Model | 80% | Well-understood scope, existing patterns |
| Navigation & Shell | 90% | Shadcn UI provides clear patterns |
| UI Components | 85% | TanStack Table is well-documented |
| Analytics Reports | 70% | Complex queries, potential performance issues |
| Builder Enhancements | 85% | Extends existing infrastructure |
| Non-Functional | 75% | Audit results unknown |
| Integration & Testing | 80% | Standard E2E patterns |

### Overall Confidence: 80%

**Recommendation:** Use P80 estimate (196 hours) for planning and quoting purposes.

---

## Summary

| Metric | Value |
|--------|-------|
| **Base Estimate (no reuse)** | 260 hours |
| **Reuse Credit** | -104 hours (-40%) |
| **Adjusted Base** | 156 hours |
| **Risk Buffer (25%)** | 40 hours |
| **Recommended Quote** | **196 hours** |
| **Calendar Time (1 FTE)** | 5 weeks |
| **Overall Confidence** | 80% |

### Next Steps

1. Review estimate with stakeholders
2. Confirm resource availability
3. Finalize timeline and milestones
4. Begin Phase 1 (Foundation & Data Model)

---

*Report generated by Project Estimator Agent*
*Methodology: Three-Point Estimation with Gap Analysis Reuse Credits*
*Last updated: 2026-02-13*
