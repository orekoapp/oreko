# Phase 2 Manual Test Cases

**Version:** 1.0
**Date:** 2026-02-13
**Status:** Ready for QA Execution
**Coverage Level:** Comprehensive (Regression)

---

## Document Metadata

| Attribute | Value |
|-----------|-------|
| **Document ID** | TC-P2-001 |
| **Project** | QuoteCraft - Phase 2 |
| **Based On** | PHASE2_SPECIFICATION.md, PHASE2_UI_DESIGN.md, PHASE2_ARCHITECTURE.md, REQ_SPEC_VALIDATION.md |
| **Test Categories** | Functional, Security, Performance, Accessibility, Edge Cases |

---

## Test Summary

| Category | Count | Coverage |
|----------|-------|----------|
| Functional Tests (TC-P2-FR) | 58 | 100% FR coverage |
| Security Tests (TC-P2-SEC) | 16 | Input validation, authorization |
| Performance Tests (TC-P2-PERF) | 12 | Core Web Vitals, API response |
| Accessibility Tests (TC-P2-A11Y) | 14 | WCAG 2.1 AA |
| Edge Case Tests (TC-P2-EC) | 24 | Boundary conditions, error states |
| **TOTAL** | **124** | |

---

## Prerequisites

### Environment Setup

1. **Development Environment**
   - Node.js 18+ installed
   - PostgreSQL 15+ running
   - Redis 7+ running (for queue operations)
   - pnpm 8+ installed

2. **Database State**
   - Clean database with migrations applied
   - Seed data loaded: `pnpm db:seed`
   - At least 1 workspace, 3 clients, 5 quotes (various statuses), 5 invoices (various statuses)

3. **Test Accounts**
   - Admin user: `admin@quotecraft.test` / `TestPassword123!`
   - Standard user: `user@quotecraft.test` / `TestPassword123!`
   - Guest access (unauthenticated)

4. **Browser Requirements**
   - Chrome (latest), Firefox (latest), Safari (latest)
   - Mobile viewport testing: 375px (iPhone), 768px (iPad), 1280px (Desktop)

---

## Test Case Naming Convention

```
TC-P2-{CATEGORY}-{NUMBER}

Categories:
- FR    = Functional Requirement
- SEC   = Security
- PERF  = Performance
- A11Y  = Accessibility
- EC    = Edge Case
```

---

## 1. Navigation & Sidebar Tests

### TC-P2-FR-001: Hierarchical Sidebar Navigation Display

**Related FR:** FR-P2-001
**Priority:** P0
**Preconditions:**
- User is logged in
- Dashboard is loaded

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe sidebar navigation | Sidebar displays in hierarchical order: Dashboard, Analytics, Clients, Projects (with chevron), Settings |
| 2 | Verify Projects menu item | Projects item shows collapsible chevron icon pointing right |
| 3 | Verify icon display | Each nav item displays appropriate icon (LayoutDashboard, BarChart3, Users, FolderKanban, Settings) |

**Pass Criteria:**
- All navigation items visible in correct order
- Projects shows expandable indicator

---

### TC-P2-FR-002: Projects Submenu Expand/Collapse

**Related FR:** FR-P2-001
**Priority:** P0
**Preconditions:**
- User is logged in
- Sidebar is in expanded mode

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Projects" menu item | Submenu expands with animation, chevron rotates to point down |
| 2 | Verify submenu items | Quotes, Invoices, Contracts sub-items are visible |
| 3 | Click "Projects" menu item again | Submenu collapses with animation, chevron rotates to point right |
| 4 | Verify animation timing | Expand/collapse animation completes within 200ms |

**Pass Criteria:**
- Submenu toggles correctly
- Animation is smooth
- Chevron indicates state correctly

---

### TC-P2-FR-003: Active Navigation State Highlighting

**Related FR:** FR-P2-001 (AC-001.6)
**Priority:** P0
**Preconditions:**
- User is logged in
- Sidebar visible

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /dashboard | Dashboard nav item has highlighted background |
| 2 | Navigate to /quotes | Quotes sub-item AND Projects parent both have highlighted states |
| 3 | Navigate to /invoices | Invoices sub-item AND Projects parent both have highlighted states |
| 4 | Navigate to /analytics | Analytics nav item has highlighted background |

**Pass Criteria:**
- Active item clearly distinguishable
- Parent highlighting when child is active

---

### TC-P2-FR-004: Sidebar Collapse to Icon Mode

**Related FR:** FR-P2-002 (AC-001.2)
**Priority:** P0
**Preconditions:**
- User is logged in
- Sidebar is expanded (256px)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click sidebar collapse toggle button | Sidebar animates from 256px to 64px width |
| 2 | Observe navigation items | Labels are hidden, only icons visible |
| 3 | Observe logo | Logo transitions to icon-only display |
| 4 | Verify animation | Transition completes smoothly within 200ms |

**Pass Criteria:**
- Width transition is smooth
- All labels hidden
- Icons remain visible and clickable

---

### TC-P2-FR-005: Sidebar Expand from Icon Mode

**Related FR:** FR-P2-002 (AC-001.3)
**Priority:** P0
**Preconditions:**
- User is logged in
- Sidebar is collapsed (64px)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click sidebar expand toggle button | Sidebar animates from 64px to 256px width |
| 2 | Observe navigation items | Labels fade in and become visible |
| 3 | Observe logo | Full logo with text appears |
| 4 | Verify submenu state | Previously expanded submenu remains expanded |

**Pass Criteria:**
- Width transition is smooth
- All labels visible
- Submenu state preserved

---

### TC-P2-FR-006: Tooltip Display in Collapsed Mode

**Related FR:** FR-P2-002 (AC-001.4)
**Priority:** P0
**Preconditions:**
- User is logged in
- Sidebar is collapsed (64px)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Hover over Dashboard icon | Tooltip appears showing "Dashboard" |
| 2 | Hover over Analytics icon | Tooltip appears showing "Analytics" |
| 3 | Hover over Projects icon | Tooltip appears showing "Projects" |
| 4 | Move mouse away | Tooltip disappears |

**Pass Criteria:**
- Tooltips appear for all nav items
- Correct labels displayed
- Tooltips positioned correctly (not cut off)

---

### TC-P2-FR-007: Submenu Flyout in Collapsed Mode

**Related FR:** FR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in
- Sidebar is collapsed (64px)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Hover over Projects icon | Flyout menu appears showing Quotes, Invoices, Contracts |
| 2 | Click "Quotes" in flyout | Navigate to /quotes page |
| 3 | Move mouse away from flyout | Flyout closes |

**Pass Criteria:**
- Flyout displays submenu items
- Navigation from flyout works
- Flyout closes appropriately

---

### TC-P2-FR-008: User Profile Section Display

**Related FR:** FR-P2-003 (AC-001.7)
**Priority:** P1
**Preconditions:**
- User is logged in
- Sidebar is expanded

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe sidebar footer | User avatar (or initials) visible |
| 2 | Verify user information | Full name displayed |
| 3 | Verify email | User email displayed below name |
| 4 | Verify dropdown | Dropdown chevron visible |

**Pass Criteria:**
- All user information displayed correctly
- Avatar uses initials if no image

---

### TC-P2-FR-009: User Profile Dropdown Menu

**Related FR:** FR-P2-003
**Priority:** P1
**Preconditions:**
- User is logged in
- Sidebar is expanded

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click user profile section | Dropdown menu opens |
| 2 | Verify menu items | "Profile Settings" and "Log Out" options visible |
| 3 | Click "Log Out" | User is logged out and redirected to login page |

**Pass Criteria:**
- Dropdown opens/closes correctly
- Menu items functional

---

### TC-P2-FR-010: Workspace Switcher Display

**Related FR:** FR-P2-004
**Priority:** P1
**Preconditions:**
- User is logged in
- User has access to multiple workspaces

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe sidebar header | "Quote Craft" branding visible |
| 2 | Verify workspace name | Current workspace name displayed |
| 3 | Verify tier badge | Tier indicator (Free/Pro/Enterprise) displayed |
| 4 | Click workspace area | Dropdown shows available workspaces |

**Pass Criteria:**
- Branding and workspace info visible
- Tier indicator correctly reflects plan

---

### TC-P2-FR-011: Workspace Switching

**Related FR:** FR-P2-004
**Priority:** P1
**Preconditions:**
- User is logged in
- User has access to 2+ workspaces

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click workspace dropdown | List of available workspaces displayed |
| 2 | Select different workspace | Context switches to new workspace |
| 3 | Verify page content | Data refreshes to show new workspace data |
| 4 | Verify sidebar | Workspace name updates in header |

**Pass Criteria:**
- Workspace switch completes
- All data reflects new workspace

---

## 2. Project Entity Tests

### TC-P2-FR-012: Create New Project

**Related FR:** FR-P2-005
**Priority:** P0
**Preconditions:**
- User is logged in
- At least 1 client exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Projects page | Projects list displayed |
| 2 | Click "New Project" button | Project creation form opens |
| 3 | Select client from dropdown | Client selected |
| 4 | Enter project name: "Website Redesign" | Name field populated |
| 5 | Enter description: "Complete website overhaul" | Description field populated |
| 6 | Click "Create Project" | Project created, redirected to project detail |

**Test Data:**
- Client: First available client
- Name: "Website Redesign"
- Description: "Complete website overhaul"

**Pass Criteria:**
- Project created successfully
- All fields saved correctly
- Appears in project list

---

### TC-P2-FR-013: List Projects

**Related FR:** FR-P2-005
**Priority:** P0
**Preconditions:**
- User is logged in
- At least 3 projects exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Projects page | Projects list displayed in DataTable |
| 2 | Verify columns | Name, Client, Status (Active), Quotes count, Invoices count visible |
| 3 | Verify data | All workspace projects listed |
| 4 | Click on a project row | Navigated to project detail page |

**Pass Criteria:**
- All projects displayed
- Correct counts for linked documents

---

### TC-P2-FR-014: View Project Details

**Related FR:** FR-P2-005
**Priority:** P0
**Preconditions:**
- User is logged in
- Project with linked quotes and invoices exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project detail page | Project details displayed |
| 2 | Verify project info | Name, description, client info visible |
| 3 | Verify linked documents | List of quotes shows quote number, status, total |
| 4 | Verify linked invoices | List of invoices shows invoice number, status, amount |
| 5 | Click on linked quote | Navigated to quote detail |

**Pass Criteria:**
- All project information displayed
- Linked documents accessible

---

### TC-P2-FR-015: Update Project

**Related FR:** FR-P2-005
**Priority:** P0
**Preconditions:**
- User is logged in
- Project exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project detail | Project displayed |
| 2 | Click "Edit" button | Edit form opens with current values |
| 3 | Change name to "Updated Project Name" | Name field updated |
| 4 | Click "Save" | Changes saved, success toast displayed |
| 5 | Verify update | Name shows "Updated Project Name" |

**Pass Criteria:**
- Changes persisted
- Updated timestamp changes

---

### TC-P2-FR-016: Deactivate Project

**Related FR:** FR-P2-005
**Priority:** P1
**Preconditions:**
- User is logged in
- Active project exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to project detail | Project displayed |
| 2 | Click "Deactivate" button | Confirmation dialog appears |
| 3 | Confirm deactivation | Project status changes to inactive |
| 4 | Navigate to projects list | Project shows as inactive or filtered out |

**Pass Criteria:**
- Project deactivated (not deleted)
- Status indicator reflects change

---

### TC-P2-FR-017: Associate Quote with Project

**Related FR:** FR-P2-005
**Priority:** P0
**Preconditions:**
- User is logged in
- Project exists, Client exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to create new quote | Quote builder opens |
| 2 | Select client | Client selected |
| 3 | Select project from project dropdown | Project selected (dropdown shows only client's projects) |
| 4 | Complete quote and save | Quote saved with project association |
| 5 | Navigate to project detail | Quote appears in linked quotes list |

**Pass Criteria:**
- Quote linked to project
- Bidirectional navigation works

---

### TC-P2-FR-018: Create Quote Without Project

**Related FR:** FR-P2-005
**Priority:** P0
**Preconditions:**
- User is logged in
- Client exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to create new quote | Quote builder opens |
| 2 | Select client | Client selected |
| 3 | Leave project as "No Project" or blank | No project selected |
| 4 | Complete quote and save | Quote saved without project association |
| 5 | View quote detail | No project section, or shows "No Project" |

**Pass Criteria:**
- Quote created without project (backward compatibility)
- No validation errors

---

## 3. DataTable Component Tests

### TC-P2-FR-019: Quotes Table Column Display

**Related FR:** FR-P2-010 (AC-002.1)
**Priority:** P0
**Preconditions:**
- User is logged in
- At least 5 quotes exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Verify checkbox column | First column is checkbox for selection |
| 3 | Verify Quote ID column | Displays #QT-XXX format |
| 4 | Verify Status column | Status badge displayed |
| 5 | Verify Client column | Avatar + Name + Email visible |
| 6 | Verify Total column | Currency formatted (e.g., $4,500.00) |
| 7 | Verify Expiry Date column | Date formatted (YYYY-MM-DD) |
| 8 | Verify Actions column | Download, View, More icons visible |

**Pass Criteria:**
- All columns displayed correctly
- Data formatted appropriately

---

### TC-P2-FR-020: Invoices Table Column Display

**Related FR:** FR-P2-010 (AC-002.2)
**Priority:** P0
**Preconditions:**
- User is logged in
- At least 5 invoices exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Invoices page | DataTable displayed |
| 2 | Verify checkbox column | First column is checkbox for selection |
| 3 | Verify Invoice ID column | Displays #INV-XXX format |
| 4 | Verify Status column | Status badge displayed |
| 5 | Verify Client column | Avatar + Name + Email visible |
| 6 | Verify Amount column | Currency formatted |
| 7 | Verify Issued Date column | Date formatted (YYYY-MM-DD) |
| 8 | Verify Actions column | Download, View, More icons visible |

**Pass Criteria:**
- All columns displayed correctly
- Data formatted appropriately

---

### TC-P2-FR-021: Table Sorting by Column

**Related FR:** FR-P2-010
**Priority:** P0
**Preconditions:**
- User is logged in
- At least 5 quotes exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Click "Total" column header | Rows sorted by total ascending, sort indicator shows |
| 3 | Click "Total" column header again | Rows sorted by total descending |
| 4 | Click "Expiry Date" column header | Rows sorted by date ascending |
| 5 | Click "Client" column header | Rows sorted by client name ascending |

**Pass Criteria:**
- Sorting works on all sortable columns
- Sort direction indicator visible

---

### TC-P2-FR-022: Table Search with Debounce

**Related FR:** FR-P2-010 (AC-002.5)
**Priority:** P0
**Preconditions:**
- User is logged in
- At least 5 quotes exist with various client names

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Type "john" in search field | Wait 300ms... |
| 3 | Observe results | Table filters to show only quotes matching "john" in ID, client name, or email |
| 4 | Clear search field | All quotes displayed again |
| 5 | Type quickly "abc123" | Debounce prevents multiple API calls, final filter applied |

**Pass Criteria:**
- Search filters after 300ms debounce
- Matches ID, client name, client email
- Clear restores full list

---

### TC-P2-FR-023: Table Status Filter

**Related FR:** FR-P2-010 (AC-002.6)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quotes exist in various statuses (draft, sent, accepted, expired)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Click status filter dropdown | Options: All, Draft, Sent, Accepted, Expired |
| 3 | Select "Draft" | Table shows only Draft status quotes |
| 4 | Verify pagination | Pagination resets to page 1 |
| 5 | Select "All" | All quotes displayed |

**Pass Criteria:**
- Status filter shows only matching rows
- Pagination resets on filter change

---

### TC-P2-FR-024: Table Pagination Controls

**Related FR:** FR-P2-010 (AC-002.7)
**Priority:** P0
**Preconditions:**
- User is logged in
- At least 30 quotes exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page with default page size 10 | First 10 quotes displayed |
| 2 | Observe pagination info | Shows "Showing 1 to 10 of XX" |
| 3 | Click "Next" button | Page 2 displayed, shows "Showing 11 to 20 of XX" |
| 4 | Click page number "3" | Page 3 displayed, page 3 highlighted |
| 5 | Click "Previous" button | Page 2 displayed |

**Pass Criteria:**
- Pagination info accurate
- Navigation buttons work
- Current page highlighted

---

### TC-P2-FR-025: Table Page Size Selector

**Related FR:** FR-P2-010 (AC-002.8)
**Priority:** P0
**Preconditions:**
- User is logged in
- At least 30 quotes exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | Default page size (10) applied |
| 2 | Change page size dropdown to 25 | 25 rows displayed per page |
| 3 | Verify pagination info | Shows "Showing 1 to 25 of XX" |
| 4 | Change page size to 50 | 50 rows displayed per page |

**Pass Criteria:**
- Page size options: 10, 25, 50, 100
- Rows per page updates correctly

---

### TC-P2-FR-026: Table Row Actions - Download

**Related FR:** FR-P2-010 (AC-002.9)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quote exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Click Download icon on a row | PDF download initiates |
| 3 | Verify downloaded file | PDF contains quote data |

**Pass Criteria:**
- Download completes
- File is valid PDF

---

### TC-P2-FR-027: Table Row Actions - View

**Related FR:** FR-P2-010 (AC-002.9)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quote exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Click View (Eye) icon on a row | Navigate to quote detail page |
| 3 | Verify URL | URL is /quotes/{quoteId} |

**Pass Criteria:**
- Navigation to detail page works

---

### TC-P2-FR-028: Table Row Actions - More Dropdown

**Related FR:** FR-P2-010 (AC-002.9)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quote exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Click More (three dots) icon on a row | Dropdown menu opens |
| 3 | Verify menu items | Edit, Duplicate, Delete (destructive styling) visible |
| 4 | Click "Edit" | Navigate to quote edit page |

**Pass Criteria:**
- Dropdown menu displays
- All menu items functional

---

### TC-P2-FR-029: Table Bulk Row Selection

**Related FR:** FR-P2-010
**Priority:** P1
**Preconditions:**
- User is logged in
- At least 5 quotes exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Click checkbox on row 1 | Row 1 selected (highlighted) |
| 3 | Click checkbox on row 3 | Rows 1 and 3 selected |
| 4 | Click "Select All" checkbox in header | All visible rows selected |
| 5 | Observe bulk actions | Bulk action bar appears (if implemented) |

**Pass Criteria:**
- Individual selection works
- Select all selects visible page

---

## 4. Status Badge Tests

### TC-P2-FR-030: Quote Status Badge - Draft

**Related FR:** FR-P2-006, FR-P2-011 (AC-002.3)
**Priority:** P0
**Preconditions:**
- User is logged in
- Draft quote exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Locate draft quote row | Status badge visible |
| 3 | Verify badge style | Gray outline border, gray text, "Draft" label |

**Pass Criteria:**
- Draft badge matches spec: gray outline

---

### TC-P2-FR-031: Quote Status Badge - Sent

**Related FR:** FR-P2-006, FR-P2-011 (AC-002.3)
**Priority:** P0
**Preconditions:**
- User is logged in
- Sent quote exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Locate sent quote row | Status badge visible |
| 3 | Verify badge style | Blue outline border, blue text, "Sent" label |

**Pass Criteria:**
- Sent badge matches spec: blue outline

---

### TC-P2-FR-032: Quote Status Badge - Accepted

**Related FR:** FR-P2-006, FR-P2-011 (AC-002.3)
**Priority:** P0
**Preconditions:**
- User is logged in
- Accepted quote exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Locate accepted quote row | Status badge visible |
| 3 | Verify badge style | Green outline border, green text, "Accepted" label |

**Pass Criteria:**
- Accepted badge matches spec: green outline

---

### TC-P2-FR-033: Quote Status Badge - Expired

**Related FR:** FR-P2-006, FR-P2-011 (AC-002.3)
**Priority:** P0
**Preconditions:**
- User is logged in
- Expired quote exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Locate expired quote row | Status badge visible |
| 3 | Verify badge style | Red outline border, red text, "Expired" label |

**Pass Criteria:**
- Expired badge matches spec: red outline

---

### TC-P2-FR-034: Invoice Status Badge - Pending

**Related FR:** FR-P2-007, FR-P2-011 (AC-002.4)
**Priority:** P0
**Preconditions:**
- User is logged in
- Pending invoice exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Invoices page | DataTable displayed |
| 2 | Locate pending invoice row | Status badge visible |
| 3 | Verify badge style | Amber/yellow outline border, amber text, "Pending" label |

**Pass Criteria:**
- Pending badge matches spec: amber outline

---

### TC-P2-FR-035: Invoice Status Badge - Paid

**Related FR:** FR-P2-007, FR-P2-011 (AC-002.4)
**Priority:** P0
**Preconditions:**
- User is logged in
- Paid invoice exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Invoices page | DataTable displayed |
| 2 | Locate paid invoice row | Status badge visible |
| 3 | Verify badge style | Green solid background, white text, "Paid" label |

**Pass Criteria:**
- Paid badge matches spec: green solid

---

### TC-P2-FR-036: Invoice Status Badge - Overdue

**Related FR:** FR-P2-007, FR-P2-011 (AC-002.4)
**Priority:** P0
**Preconditions:**
- User is logged in
- Overdue invoice exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Invoices page | DataTable displayed |
| 2 | Locate overdue invoice row | Status badge visible |
| 3 | Verify badge style | Red solid background, white text, "Overdue" label |

**Pass Criteria:**
- Overdue badge matches spec: red solid

---

### TC-P2-FR-037: Invoice Status Badge - Partial

**Related FR:** FR-P2-007, FR-P2-011 (AC-002.4)
**Priority:** P0
**Preconditions:**
- User is logged in
- Partially paid invoice exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Invoices page | DataTable displayed |
| 2 | Locate partial payment invoice row | Status badge visible |
| 3 | Verify badge style | Blue outline border, blue text, "Partial" label |

**Pass Criteria:**
- Partial badge matches spec: blue outline

---

## 5. Analytics Dashboard Tests

### TC-P2-FR-038: Analytics Page Access

**Related FR:** FR-P2-013 to FR-P2-016
**Priority:** P0
**Preconditions:**
- User is logged in
- Sufficient data exists for analytics

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Analytics" in sidebar | Navigate to /analytics page |
| 2 | Verify page structure | Four sections visible: Sales Pipeline, Financial Health, Client Insights, Service Performance |
| 3 | Verify date range filter | Date range picker visible in header |

**Pass Criteria:**
- Analytics page loads
- All four sections visible

---

### TC-P2-FR-039: Sales Pipeline - Conversion Rate Chart

**Related FR:** FR-P2-013 (AC-004.1)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quotes with various statuses exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Analytics page | Sales Pipeline section visible |
| 2 | Locate Conversion Rate card | Radial progress chart displayed |
| 3 | Verify percentage display | Percentage (0-100%) shown in center |
| 4 | Verify trend indicator | Up/down arrow with percentage change vs previous period |
| 5 | Hover over chart | Tooltip shows exact value |

**Pass Criteria:**
- Radial chart displays correctly
- Trend indicator accurate

---

### TC-P2-FR-040: Sales Pipeline - Quotes by Status Chart

**Related FR:** FR-P2-013 (AC-004.2)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quotes in various statuses exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Analytics page | Sales Pipeline section visible |
| 2 | Locate Quotes by Status card | Bar chart displayed |
| 3 | Verify bar labels | Draft, Sent, Accepted, Expired categories shown |
| 4 | Verify bar colors | Each status has distinct color matching badge colors |
| 5 | Hover over bar | Tooltip shows exact count |

**Pass Criteria:**
- Bar chart displays all statuses
- Colors match status badge colors

---

### TC-P2-FR-041: Financial Health - AR Aging Chart

**Related FR:** FR-P2-014 (AC-004.3)
**Priority:** P0
**Preconditions:**
- User is logged in
- Unpaid invoices exist in various age buckets

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Analytics page | Financial Health section visible |
| 2 | Locate AR Aging card | Horizontal bar chart displayed |
| 3 | Verify buckets | 0-30 days (blue), 31-60 days (orange), 60+ days (red) |
| 4 | Verify dollar amounts | Each bucket shows dollar value |
| 5 | Verify warning for 60+ | Red warning indicator if significant overdue |

**Pass Criteria:**
- Horizontal bars with color coding
- Dollar amounts accurate

---

### TC-P2-FR-042: Financial Health - Revenue Forecast Chart

**Related FR:** FR-P2-014 (AC-004.4)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quotes and invoices exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Analytics page | Financial Health section visible |
| 2 | Locate Revenue Forecast card | Dual-area chart displayed |
| 3 | Verify series | "Projected" (light purple) and "Actual" (dark purple) series |
| 4 | Verify legend | Legend distinguishes both series |
| 5 | Hover over data point | Tooltip shows date and both values |

**Pass Criteria:**
- Two area series displayed
- Legend clearly identifies each

---

### TC-P2-FR-043: Client Insights - Top Clients Chart

**Related FR:** FR-P2-015 (AC-004.5)
**Priority:** P1
**Preconditions:**
- User is logged in
- Clients with paid invoices exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Analytics page | Client Insights section visible |
| 2 | Locate Top Clients card | Horizontal bar chart displayed |
| 3 | Verify sorting | Clients sorted descending by revenue |
| 4 | Verify limit | Top 5 clients shown |
| 5 | Hover over bar | Tooltip shows exact revenue amount |

**Pass Criteria:**
- Top 5 clients by revenue
- Sorted descending

---

### TC-P2-FR-044: Client Insights - LTV Leaderboard

**Related FR:** FR-P2-015 (AC-004.6)
**Priority:** P1
**Preconditions:**
- User is logged in
- Clients with paid invoices exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Analytics page | Client Insights section visible |
| 2 | Locate LTV Leaderboard card | List displayed |
| 3 | Verify list items | Avatar, name, email, LTV amount for each client |
| 4 | Verify sorting | Sorted descending by LTV |

**Pass Criteria:**
- Leaderboard shows client info
- Sorted by LTV descending

---

### TC-P2-FR-045: Service Performance - Top Services Chart

**Related FR:** FR-P2-016 (AC-004.7)
**Priority:** P1
**Preconditions:**
- User is logged in
- Line items exist in quotes/invoices

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Analytics page | Service Performance section visible |
| 2 | Locate Top Services card | Vertical bar chart displayed |
| 3 | Verify X-axis | Service/product names on X-axis |
| 4 | Verify Y-axis | Frequency count on Y-axis |
| 5 | Hover over bar | Tooltip shows service name and count |

**Pass Criteria:**
- Top services by frequency
- Item names visible

---

### TC-P2-FR-046: Service Performance - Revenue by Category

**Related FR:** FR-P2-016 (AC-004.8)
**Priority:** P1
**Preconditions:**
- User is logged in
- Line items with categories exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Analytics page | Service Performance section visible |
| 2 | Locate Revenue by Category card | Donut/pie chart displayed |
| 3 | Verify legend | Category names in legend |
| 4 | Verify percentages | Percentage shown for each segment |
| 5 | Hover over segment | Tooltip shows category, amount, and percentage |

**Pass Criteria:**
- Donut chart with categories
- Percentages and amounts visible

---

### TC-P2-FR-047: Analytics Date Range Filter

**Related FR:** FR-P2-017 (AC-004.9)
**Priority:** P1
**Preconditions:**
- User is logged in
- Data exists for multiple date ranges

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Analytics page | Default date range applied (Last 30 Days) |
| 2 | Click date range dropdown | Presets shown: This Week, This Month, This Quarter, This Year, Last 7/30/90 Days, Custom |
| 3 | Select "This Month" | All charts show loading state, then update |
| 4 | Verify charts | Data reflects current month only |
| 5 | Navigate away and back | Selected date range persisted |

**Pass Criteria:**
- Date range changes update all charts
- Loading states shown during fetch
- Preference persisted

---

### TC-P2-FR-048: Analytics Custom Date Range

**Related FR:** FR-P2-017
**Priority:** P1
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click date range dropdown | Options displayed |
| 2 | Select "Custom" | Date picker opens |
| 3 | Select start date: Jan 1, 2026 | Start date set |
| 4 | Select end date: Jan 31, 2026 | End date set |
| 5 | Click Apply | Charts update with custom range data |

**Pass Criteria:**
- Custom date range works
- Charts reflect selected dates

---

## 6. Quote-to-Invoice Conversion Tests

### TC-P2-FR-049: Convert Button Visibility - Accepted Quote

**Related FR:** FR-P2-018 (AC-003.1)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quote with ACCEPTED status exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to accepted quote detail | Quote detail page displayed |
| 2 | Verify Convert button | "Convert to Invoice" button is visible and enabled |

**Pass Criteria:**
- Convert button visible only for ACCEPTED quotes

---

### TC-P2-FR-050: Convert Button Hidden - Non-Accepted Quotes

**Related FR:** FR-P2-018 (AC-003.2)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quotes in DRAFT, SENT, EXPIRED status exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to DRAFT quote detail | Quote displayed |
| 2 | Verify Convert button | "Convert to Invoice" button is NOT visible |
| 3 | Navigate to SENT quote detail | Convert button NOT visible |
| 4 | Navigate to EXPIRED quote detail | Convert button NOT visible |

**Pass Criteria:**
- Convert button hidden for DRAFT, SENT, EXPIRED

---

### TC-P2-FR-051: Conversion Dialog Display

**Related FR:** FR-P2-018 (AC-003.3)
**Priority:** P0
**Preconditions:**
- User is logged in
- Accepted quote exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to accepted quote detail | Quote displayed |
| 2 | Click "Convert to Invoice" button | Conversion dialog opens |
| 3 | Verify dialog content | Shows: Quote number, Client name, Amount, Invoice date (default: today), Due date (default: +30 days) |
| 4 | Verify options | Checkboxes: "Copy line items", "Send immediately" |

**Pass Criteria:**
- Dialog shows all required fields
- Defaults are correct

---

### TC-P2-FR-052: Execute Conversion

**Related FR:** FR-P2-018 (AC-003.4)
**Priority:** P0
**Preconditions:**
- User is logged in
- Accepted quote exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open conversion dialog for accepted quote | Dialog displayed |
| 2 | Keep defaults, click "Convert" | Invoice created |
| 3 | Verify redirect | Redirected to new invoice detail page |
| 4 | Verify invoice data | Invoice has same line items, client, amount as quote |
| 5 | Verify linkage | Invoice shows "From Quote: #QT-XXX" |

**Pass Criteria:**
- Invoice created with correct data
- Linked to source quote

---

### TC-P2-FR-053: Quote Shows Linked Invoice

**Related FR:** FR-P2-008, FR-P2-018 (AC-003.5)
**Priority:** P0
**Preconditions:**
- Quote has been converted to invoice

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to converted quote detail | Quote displayed |
| 2 | Verify linked invoice section | "Linked Invoice" section visible |
| 3 | Verify invoice info | Invoice number and status badge displayed |
| 4 | Click invoice link | Navigate to invoice detail |

**Pass Criteria:**
- Bidirectional link visible
- Clickable navigation

---

### TC-P2-FR-054: Already-Converted Quote - Button Disabled

**Related FR:** FR-P2-008, FR-P2-018 (AC-003.6)
**Priority:** P0
**Preconditions:**
- Quote already converted to invoice

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to already-converted quote | Quote displayed |
| 2 | Verify Convert button | Button is either hidden or disabled with "Already Converted" state |

**Pass Criteria:**
- Cannot convert same quote twice

---

## 7. Visual Quote Builder Enhancement Tests

### TC-P2-FR-055: Split-Pane Layout

**Related FR:** FR-P2-019 (AC-005.1)
**Priority:** P0
**Preconditions:**
- User is logged in
- Desktop viewport (1280px+)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to create new quote | Quote builder page displayed |
| 2 | Verify layout | Form editor (~60% left), Live preview (~40% right) |
| 3 | Resize window | Layout adjusts proportionally |

**Pass Criteria:**
- Split-pane layout correct
- Responsive resize

---

### TC-P2-FR-056: Logo Upload - Valid File

**Related FR:** FR-P2-019 (AC-005.2)
**Priority:** P0
**Preconditions:**
- User is logged in
- PNG image file < 2MB available

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to create new quote | Quote builder displayed |
| 2 | Click logo upload area | File picker opens |
| 3 | Select valid PNG file (< 2MB) | File uploaded |
| 4 | Verify preview | Logo appears in live preview immediately |

**Test Data:**
- Valid file: logo.png (100KB)

**Pass Criteria:**
- Upload succeeds
- Preview updates immediately

---

### TC-P2-FR-057: Customer Type-Ahead Search

**Related FR:** FR-P2-019 (AC-005.3)
**Priority:** P0
**Preconditions:**
- User is logged in
- Multiple clients exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to create new quote | Quote builder displayed |
| 2 | Start typing client name in customer field | Dropdown shows matching clients |
| 3 | Select client from dropdown | Client selected |
| 4 | Verify email field | Email auto-populated from client data |

**Pass Criteria:**
- Type-ahead shows matching clients
- Email auto-populates

---

### TC-P2-FR-058: Line Item Auto-Calculation

**Related FR:** FR-P2-019 (AC-005.4)
**Priority:** P0
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to create new quote | Quote builder displayed |
| 2 | Add line item with Name: "Web Design" | Name entered |
| 3 | Enter Rate: 100 | Rate field shows $100.00 |
| 4 | Enter Quantity: 5 | Quantity shows 5 |
| 5 | Verify Amount | Amount auto-calculates to $500.00 |
| 6 | Verify total in preview | Preview shows Total: $500.00 |

**Pass Criteria:**
- Amount = Rate x Quantity
- Total updates in real-time

---

### TC-P2-FR-059: Preview Update Latency

**Related FR:** FR-P2-019 (AC-005.5)
**Priority:** P0
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to create new quote | Quote builder displayed |
| 2 | Type client name | Preview client section updates within 200ms |
| 3 | Change line item amount | Preview total updates within 200ms |
| 4 | Change due date | Preview date updates within 200ms |

**Pass Criteria:**
- Preview updates within 200ms of any field change

---

### TC-P2-FR-060: Preview Tabs - Payment Page

**Related FR:** FR-P2-019 (AC-005.6)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quote data entered

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to create new quote | Quote builder displayed |
| 2 | Click "Payment Page" tab in preview | Payment page view displayed |
| 3 | Verify content | Shows client-facing payment view with business info, amount, line items |

**Pass Criteria:**
- Payment page tab shows client view

---

### TC-P2-FR-061: Preview Tabs - Email Preview

**Related FR:** FR-P2-019 (AC-005.6)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quote data entered

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Email Preview" tab in preview | Email template view displayed |
| 2 | Verify content | Shows email that will be sent to client |

**Pass Criteria:**
- Email preview shows template with quote data

---

### TC-P2-FR-062: Preview Tabs - Invoice PDF

**Related FR:** FR-P2-019 (AC-005.6)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quote data entered

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Invoice PDF" tab in preview | PDF preview displayed |
| 2 | Verify content | Shows downloadable PDF format |

**Pass Criteria:**
- PDF preview renders correctly

---

### TC-P2-FR-063: Save Draft Quote

**Related FR:** FR-P2-019 (AC-005.7)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quote data entered

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter quote data (client, line items) | Data populated |
| 2 | Click "Save Draft" button | Quote saved |
| 3 | Verify toast | Success toast: "Quote saved as draft" |
| 4 | Verify status | Quote status is DRAFT |
| 5 | Navigate to quotes list | Draft quote appears in list |

**Pass Criteria:**
- Quote saved with DRAFT status
- Success feedback shown

---

### TC-P2-FR-064: Send Quote

**Related FR:** FR-P2-019 (AC-005.8)
**Priority:** P0
**Preconditions:**
- User is logged in
- Complete quote data entered (client with email, line items)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter complete quote data | All required fields populated |
| 2 | Click "Send Quote" button | Confirmation dialog appears |
| 3 | Confirm send | Quote sent |
| 4 | Verify status | Quote status changes to SENT |
| 5 | Verify email | Email sent to client (check email logs) |

**Pass Criteria:**
- Quote status updated to SENT
- Email sent to client

---

## 8. Application Shell Tests

### TC-P2-FR-065: Breadcrumb Navigation Display

**Related FR:** FR-P2-009
**Priority:** P0
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /dashboard | Breadcrumb shows: Home > Dashboard |
| 2 | Navigate to /quotes | Breadcrumb shows: Home > Quotes |
| 3 | Navigate to /quotes/[id] | Breadcrumb shows: Home > Quotes > Quote #QT-XXX |
| 4 | Navigate to /analytics | Breadcrumb shows: Home > Analytics |

**Pass Criteria:**
- Breadcrumb shows current route path

---

### TC-P2-FR-066: Breadcrumb Click Navigation

**Related FR:** FR-P2-009
**Priority:** P0
**Preconditions:**
- User is logged in
- On quote detail page

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /quotes/[id] | Breadcrumb: Home > Quotes > Quote #QT-XXX |
| 2 | Click "Quotes" in breadcrumb | Navigate to /quotes list page |
| 3 | Click "Home" in breadcrumb | Navigate to /dashboard |

**Pass Criteria:**
- Breadcrumb items are clickable
- Navigation works correctly

---

### TC-P2-FR-067: Responsive - Desktop Layout

**Related FR:** FR-P2-009 (AC-006.1)
**Priority:** P0
**Preconditions:**
- User is logged in
- Viewport width >= 1280px

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load dashboard on desktop | Full sidebar expanded by default (256px) |
| 2 | Main content | Occupies remaining width |
| 3 | Toggle sidebar | Can collapse/expand |

**Pass Criteria:**
- Desktop layout correct
- Sidebar expanded by default

---

### TC-P2-FR-068: Responsive - Tablet Layout

**Related FR:** FR-P2-009 (AC-006.2)
**Priority:** P0
**Preconditions:**
- User is logged in
- Viewport width 768px - 1279px

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load dashboard on tablet | Sidebar collapsed by default (64px icons only) |
| 2 | Main content | Occupies remaining width |
| 3 | Click expand toggle | Sidebar expands to full width |
| 4 | Click collapse toggle | Sidebar collapses back |

**Pass Criteria:**
- Tablet layout correct
- Sidebar collapsed by default, can expand

---

### TC-P2-FR-069: Responsive - Mobile Layout

**Related FR:** FR-P2-009 (AC-006.3)
**Priority:** P0
**Preconditions:**
- User is logged in
- Viewport width < 768px

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load dashboard on mobile | Sidebar hidden, hamburger menu visible |
| 2 | Main content | Full-width content |
| 3 | Click hamburger menu | Sidebar opens as overlay |
| 4 | Click outside or close button | Sidebar closes |

**Pass Criteria:**
- Mobile layout correct
- Sidebar as overlay

---

## 9. Security Tests

### TC-P2-SEC-001: Analytics Endpoint Authentication

**Related FR:** NFR-P2-001
**Priority:** P0
**Preconditions:**
- No authentication (logged out)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Make GET request to /api/analytics/client-ltv | 401 Unauthorized response |
| 2 | Make GET request to /api/analytics/top-services | 401 Unauthorized response |
| 3 | Make GET request to /api/analytics/revenue-by-category | 401 Unauthorized response |

**Pass Criteria:**
- All analytics endpoints require authentication

---

### TC-P2-SEC-002: Project Endpoint Authentication

**Related FR:** FR-P2-005
**Priority:** P0
**Preconditions:**
- No authentication (logged out)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Make GET request to /api/projects | 401 Unauthorized response |
| 2 | Make POST request to /api/projects | 401 Unauthorized response |
| 3 | Make PUT request to /api/projects/[id] | 401 Unauthorized response |
| 4 | Make DELETE request to /api/projects/[id] | 401 Unauthorized response |

**Pass Criteria:**
- All project endpoints require authentication

---

### TC-P2-SEC-003: Workspace Isolation - Projects

**Related FR:** FR-P2-005
**Priority:** P0
**Preconditions:**
- User A logged in (Workspace A)
- Project exists in Workspace B

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Attempt to access Workspace B project via direct URL | 404 Not Found or 403 Forbidden |
| 2 | Attempt to update Workspace B project via API | 404 Not Found or 403 Forbidden |
| 3 | Verify projects list | Only Workspace A projects visible |

**Pass Criteria:**
- Cross-workspace data access prevented

---

### TC-P2-SEC-004: Workspace Isolation - Analytics

**Related FR:** FR-P2-013 to FR-P2-017
**Priority:** P0
**Preconditions:**
- User logged in to Workspace A
- Data exists in both Workspace A and B

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View analytics | Only Workspace A data displayed |
| 2 | Verify API response | API returns only workspace-scoped data |

**Pass Criteria:**
- Analytics shows only current workspace data

---

### TC-P2-SEC-005: Logo Upload - File Type Validation

**Related FR:** FR-P2-019 (AC-005.2)
**Priority:** P0
**Preconditions:**
- User is logged in
- Invalid file types available (e.g., .exe, .js, .svg)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Attempt to upload .exe file | Upload rejected, error: "Invalid file type. Only PNG and JPG are allowed." |
| 2 | Attempt to upload .js file | Upload rejected |
| 3 | Attempt to upload .svg file | Upload rejected |
| 4 | Verify no file stored | No file saved to server |

**Pass Criteria:**
- Only PNG/JPG accepted
- Clear error message

---

### TC-P2-SEC-006: Logo Upload - File Size Validation

**Related FR:** FR-P2-019 (AC-005.2)
**Priority:** P0
**Preconditions:**
- User is logged in
- PNG file > 2MB available

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Attempt to upload 3MB PNG file | Upload rejected, error: "File size exceeds 2MB limit." |
| 2 | Verify no file stored | No file saved to server |

**Test Data:**
- large-logo.png (3MB)

**Pass Criteria:**
- Files > 2MB rejected
- Clear error message

---

### TC-P2-SEC-007: Search Input Sanitization

**Related FR:** FR-P2-010 (AC-002.5)
**Priority:** P0
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter XSS payload in search: `<script>alert('xss')</script>` | Input sanitized, no script execution |
| 2 | Enter SQL injection: `'; DROP TABLE quotes;--` | Input treated as literal string, no SQL execution |
| 3 | Verify search results | No results found (normal behavior) |

**Pass Criteria:**
- Malicious input sanitized
- No security vulnerabilities

---

### TC-P2-SEC-008: Date Range Filter Validation

**Related FR:** FR-P2-017
**Priority:** P1
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set custom range: end date before start date | Validation error or automatic correction |
| 2 | Set date range > 2 years | Accept or warn about large range |
| 3 | Set future-only date range | Accept (may show no data) |

**Pass Criteria:**
- Invalid date ranges handled gracefully

---

### TC-P2-SEC-009: Line Item Input Validation

**Related FR:** FR-P2-019 (AC-005.4)
**Priority:** P0
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter negative quantity: -5 | Validation error or converted to positive |
| 2 | Enter non-numeric rate: "abc" | Validation error, field shows error state |
| 3 | Enter extremely large number: 999999999999 | Validation error or maximum limit applied |

**Pass Criteria:**
- Invalid inputs rejected
- Clear validation messages

---

### TC-P2-SEC-010: CSRF Protection - Project Creation

**Related FR:** FR-P2-005
**Priority:** P0
**Preconditions:**
- User is logged in
- CSRF token available

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit project creation without CSRF token | Request rejected (403) |
| 2 | Submit project creation with invalid CSRF token | Request rejected (403) |
| 3 | Submit project creation with valid CSRF token | Request succeeds |

**Pass Criteria:**
- CSRF protection enforced

---

### TC-P2-SEC-011: Soft Delete - Project Data Preservation

**Related FR:** FR-P2-005
**Priority:** P1
**Preconditions:**
- User is logged in
- Project exists with linked quotes

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Delete (deactivate) project | Project marked inactive, not physically deleted |
| 2 | Verify linked quotes | Quotes still exist (projectId preserved) |
| 3 | Verify database | Project record exists with deletedAt/isActive=false |

**Pass Criteria:**
- Soft delete preserves data
- Linked documents unaffected

---

### TC-P2-SEC-012: Rate Limiting - Analytics Endpoints

**Related FR:** NFR-P2-001
**Priority:** P1
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Make 100 rapid requests to /api/analytics/client-ltv | Rate limited after threshold (e.g., 60 req/min) |
| 2 | Verify response | 429 Too Many Requests after threshold |
| 3 | Wait cooldown period | Requests succeed again |

**Pass Criteria:**
- Rate limiting prevents abuse

---

### TC-P2-SEC-013: Session Validation - Workspace Switch

**Related FR:** FR-P2-004
**Priority:** P0
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Switch to workspace user does not have access to (via URL manipulation) | Access denied |
| 2 | Verify session | Session remains valid, no corruption |

**Pass Criteria:**
- Cannot access unauthorized workspaces

---

### TC-P2-SEC-014: API Response - No Sensitive Data Exposure

**Related FR:** NFR-P2-001
**Priority:** P0
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Inspect /api/analytics/client-ltv response | No sensitive data (passwords, tokens, internal IDs) exposed |
| 2 | Inspect /api/projects response | No sensitive data exposed |
| 3 | Verify error responses | Error messages don't expose system details |

**Pass Criteria:**
- API responses safe for client consumption

---

### TC-P2-SEC-015: Authorization - Quote Conversion

**Related FR:** FR-P2-018
**Priority:** P0
**Preconditions:**
- User A logged in
- Quote owned by User B (different workspace)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Attempt to convert User B's quote via API | 403 Forbidden or 404 Not Found |

**Pass Criteria:**
- Cannot convert quotes from other workspaces

---

### TC-P2-SEC-016: File Upload - Content Type Verification

**Related FR:** FR-P2-019 (AC-005.2)
**Priority:** P0
**Preconditions:**
- User is logged in
- Renamed file (e.g., malware.exe renamed to malware.png)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Upload renamed file with fake extension | Server validates actual content type, rejects if not PNG/JPG |

**Pass Criteria:**
- Content type verified, not just extension

---

## 10. Performance Tests

### TC-P2-PERF-001: LCP - Analytics Page

**Related FR:** NFR-P2-001 (AC-007.1)
**Priority:** P0
**Preconditions:**
- User is logged in
- Sufficient data exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /analytics with Lighthouse | LCP measured |
| 2 | Verify LCP | LCP < 2.5 seconds |

**Pass Criteria:**
- LCP under 2.5s

---

### TC-P2-PERF-002: FID - Dashboard Interaction

**Related FR:** NFR-P2-001 (AC-007.2)
**Priority:** P0
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load dashboard, click button immediately | FID measured |
| 2 | Verify FID | FID < 100ms |

**Pass Criteria:**
- FID under 100ms

---

### TC-P2-PERF-003: CLS - Page Stability

**Related FR:** NFR-P2-001 (AC-007.3)
**Priority:** P0
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load analytics page, observe for layout shifts | CLS measured |
| 2 | Verify CLS | CLS < 0.1 |

**Pass Criteria:**
- CLS under 0.1

---

### TC-P2-PERF-004: API Response Time - Projects List

**Related FR:** NFR-P2-001 (AC-007.4)
**Priority:** P0
**Preconditions:**
- User is logged in
- 100 projects exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Make GET request to /api/projects | Response time measured |
| 2 | Verify 95th percentile | Response < 500ms |

**Pass Criteria:**
- API response under 500ms (95th percentile)

---

### TC-P2-PERF-005: API Response Time - Analytics Endpoints

**Related FR:** NFR-P2-001 (AC-007.4)
**Priority:** P0
**Preconditions:**
- User is logged in
- Significant data exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Make GET request to /api/analytics/client-ltv | Response < 1s |
| 2 | Make GET request to /api/analytics/top-services | Response < 1s |
| 3 | Make GET request to /api/analytics/revenue-by-category | Response < 1s |

**Pass Criteria:**
- Analytics queries under 1s

---

### TC-P2-PERF-006: Chart Render Time

**Related FR:** NFR-P2-001
**Priority:** P1
**Preconditions:**
- User is logged in
- Analytics page loaded

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Change date range filter | Charts re-render |
| 2 | Measure render time | Each chart renders < 1s |

**Pass Criteria:**
- Chart render under 1s

---

### TC-P2-PERF-007: DataTable Initial Load

**Related FR:** FR-P2-010
**Priority:** P0
**Preconditions:**
- User is logged in
- 100 quotes exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable loads |
| 2 | Measure load time | Table with 25 rows loads < 500ms |

**Pass Criteria:**
- Initial load under 500ms

---

### TC-P2-PERF-008: Search Debounce Effectiveness

**Related FR:** FR-P2-010 (AC-002.5)
**Priority:** P1
**Preconditions:**
- User is logged in
- Network tab open

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type "test" quickly in search field | Monitor network requests |
| 2 | Verify request count | Only 1 API request made (after 300ms debounce) |

**Pass Criteria:**
- Debounce prevents multiple API calls

---

### TC-P2-PERF-009: Sidebar Animation Smoothness

**Related FR:** FR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Toggle sidebar collapse/expand | Animation runs |
| 2 | Verify frame rate | Animation at 60fps (no jank) |
| 3 | Verify timing | Animation completes in ~200ms |

**Pass Criteria:**
- Smooth 60fps animation

---

### TC-P2-PERF-010: Preview Update Latency

**Related FR:** FR-P2-019 (AC-005.5)
**Priority:** P0
**Preconditions:**
- User is logged in
- Quote builder open

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Edit a field in quote form | Preview updates |
| 2 | Measure latency | Update visible < 200ms |

**Pass Criteria:**
- Preview updates under 200ms

---

### TC-P2-PERF-011: Code Splitting - Analytics

**Related FR:** NFR-P2-001
**Priority:** P1
**Preconditions:**
- Fresh browser session

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load dashboard (not analytics) | Analytics JS not loaded |
| 2 | Navigate to analytics | Analytics chunks load on demand |
| 3 | Verify network | Separate chunk files for analytics components |

**Pass Criteria:**
- Analytics code split from main bundle

---

### TC-P2-PERF-012: Skeleton Loading States

**Related FR:** NFR-P2-001
**Priority:** P1
**Preconditions:**
- User is logged in
- Throttled network (slow 3G)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Analytics page | Skeleton loaders visible immediately |
| 2 | Observe page structure | Layout stable during loading |
| 3 | Wait for data | Skeletons replaced with actual content |

**Pass Criteria:**
- Skeleton loaders prevent layout shift

---

## 11. Accessibility Tests

### TC-P2-A11Y-001: Sidebar Keyboard Navigation

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Focus on sidebar | Focus visible on first nav item |
| 2 | Press Tab | Focus moves to next nav item |
| 3 | Press Enter on "Projects" | Submenu expands |
| 4 | Press Arrow Down | Focus moves to first submenu item |
| 5 | Press Arrow Left | Submenu collapses |

**Pass Criteria:**
- Full keyboard navigation support

---

### TC-P2-A11Y-002: Sidebar ARIA Labels

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in
- Screen reader enabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to sidebar | Announced as "Main navigation" |
| 2 | Focus on collapse toggle | Announced as "Toggle sidebar" with aria-expanded state |
| 3 | Focus on Projects (collapsible) | Announced with aria-expanded state |

**Pass Criteria:**
- Proper ARIA labels for all elements

---

### TC-P2-A11Y-003: DataTable Keyboard Navigation

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in
- DataTable visible

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tab to DataTable | Focus enters table |
| 2 | Press Tab | Focus moves through interactive cells (checkbox, sort headers, action buttons) |
| 3 | Press Space on checkbox | Row selected |
| 4 | Press Enter on sort header | Column sorted |

**Pass Criteria:**
- Table fully keyboard accessible

---

### TC-P2-A11Y-004: DataTable ARIA Labels

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in
- Screen reader enabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Focus on table | Announced as "Quotes table" (or similar) |
| 2 | Focus on sort header | Announced with aria-sort direction |
| 3 | Focus on row checkbox | Announced as "Select row" |
| 4 | Focus on select all checkbox | Announced as "Select all rows" |

**Pass Criteria:**
- Table elements properly labeled

---

### TC-P2-A11Y-005: Status Badge Screen Reader

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in
- Screen reader enabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Focus on quote with Draft badge | Screen reader announces "Quote status: Draft" |
| 2 | Focus on invoice with Paid badge | Screen reader announces "Invoice status: Paid" |

**Pass Criteria:**
- Status badges announced correctly

---

### TC-P2-A11Y-006: Chart Accessibility

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in
- Screen reader enabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Focus on radial progress chart | Announced as "Conversion rate: 68%" |
| 2 | Navigate to bar chart | Data table or text alternative available |

**Pass Criteria:**
- Charts have accessible alternatives

---

### TC-P2-A11Y-007: Color Contrast - Status Badges

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- Color contrast tool available

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check Draft badge contrast | Ratio >= 4.5:1 |
| 2 | Check Sent badge contrast | Ratio >= 4.5:1 |
| 3 | Check Accepted badge contrast | Ratio >= 4.5:1 (may need adjustment) |
| 4 | Check Paid badge contrast | Ratio >= 4.5:1 |

**Pass Criteria:**
- All badges meet WCAG AA contrast

---

### TC-P2-A11Y-008: Focus Indicators

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in
- Keyboard navigation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tab through interactive elements | Focus ring visible on all |
| 2 | Verify focus ring style | Consistent 2px ring, visible against backgrounds |

**Pass Criteria:**
- Clear focus indicators on all interactive elements

---

### TC-P2-A11Y-009: Focus Trap in Dialogs

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open quote conversion dialog | Focus moves to dialog |
| 2 | Press Tab repeatedly | Focus cycles within dialog only |
| 3 | Press Escape | Dialog closes, focus returns to trigger |

**Pass Criteria:**
- Focus trapped in dialogs

---

### TC-P2-A11Y-010: Skip to Content Link

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in
- Keyboard navigation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Press Tab on page load | "Skip to content" link appears |
| 2 | Press Enter on skip link | Focus moves to main content area |

**Pass Criteria:**
- Skip link functional

---

### TC-P2-A11Y-011: Reduced Motion Support

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- OS setting: prefers-reduced-motion enabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Toggle sidebar collapse | No animation (instant change) |
| 2 | Expand submenu | No animation (instant change) |
| 3 | View chart animations | No animations |

**Pass Criteria:**
- Animations disabled when user prefers reduced motion

---

### TC-P2-A11Y-012: Icon-Only Button Labels

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in
- Screen reader enabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Focus on Download icon button | Announced as "Download PDF" |
| 2 | Focus on View icon button | Announced as "View details" |
| 3 | Focus on More icon button | Announced as "More actions" |

**Pass Criteria:**
- All icon-only buttons have accessible names

---

### TC-P2-A11Y-013: Form Error Announcements

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in
- Screen reader enabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit quote form with missing required field | Error announced |
| 2 | Focus on field with error | Error message announced |

**Pass Criteria:**
- Form errors announced to screen readers

---

### TC-P2-A11Y-014: Dynamic Content Updates

**Related FR:** NFR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in
- Screen reader enabled

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Filter DataTable | Screen reader announces "X results found" |
| 2 | Save draft | Screen reader announces success toast |

**Pass Criteria:**
- Dynamic updates announced via aria-live

---

## 12. Edge Case Tests

### TC-P2-EC-001: Empty DataTable State

**Related FR:** FR-P2-010
**Priority:** P1
**Preconditions:**
- User is logged in
- No quotes exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | Empty state displayed |
| 2 | Verify message | "No quotes yet" or similar message |
| 3 | Verify action | "Create Quote" button visible |

**Pass Criteria:**
- Friendly empty state with action

---

### TC-P2-EC-002: Search with No Results

**Related FR:** FR-P2-010 (AC-002.5)
**Priority:** P1
**Preconditions:**
- User is logged in
- Quotes exist

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter search term: "zzz_nonexistent_123" | Search executes |
| 2 | Verify results | "No results found" message displayed |
| 3 | Clear search | All quotes displayed |

**Pass Criteria:**
- No results state handled gracefully

---

### TC-P2-EC-003: Rapid Sidebar Toggle

**Related FR:** FR-P2-002
**Priority:** P1
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click sidebar toggle rapidly 10 times | Sidebar responds to final state |
| 2 | Verify no visual glitches | Animation completes smoothly |
| 3 | Verify final state | Sidebar is either collapsed or expanded (not stuck) |

**Pass Criteria:**
- Rapid clicking handled gracefully

---

### TC-P2-EC-004: Submenu State Preservation on Collapse

**Related FR:** FR-P2-001
**Priority:** P1
**Preconditions:**
- User is logged in
- Sidebar expanded
- Projects submenu expanded

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Expand Projects submenu | Submenu visible |
| 2 | Collapse sidebar | Sidebar collapses to icons |
| 3 | Expand sidebar | Projects submenu still expanded |

**Pass Criteria:**
- Submenu state preserved across collapse/expand

---

### TC-P2-EC-005: Deep Link to Submenu Item

**Related FR:** FR-P2-001 (AC-001.6)
**Priority:** P1
**Preconditions:**
- User is logged in
- Projects submenu collapsed

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate directly to /quotes via URL | Quotes page loads |
| 2 | Verify sidebar state | Projects submenu auto-expands |
| 3 | Verify highlighting | Quotes AND Projects both highlighted |

**Pass Criteria:**
- Deep linking auto-expands parent

---

### TC-P2-EC-006: Single Workspace User

**Related FR:** FR-P2-004
**Priority:** P1
**Preconditions:**
- User with only 1 workspace logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View workspace switcher | Current workspace displayed |
| 2 | Click dropdown | Either no dropdown or shows single workspace |
| 3 | Verify UX | No confusing empty state |

**Pass Criteria:**
- Single workspace handled gracefully

---

### TC-P2-EC-007: User Without Avatar

**Related FR:** FR-P2-003
**Priority:** P1
**Preconditions:**
- User without avatar image logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View user profile section | Initials displayed in colored circle |
| 2 | Verify initials | Correct initials (e.g., "JD" for John Doe) |

**Pass Criteria:**
- Initials fallback works

---

### TC-P2-EC-008: Analytics with No Data

**Related FR:** FR-P2-013 to FR-P2-016
**Priority:** P1
**Preconditions:**
- User is logged in
- No quotes or invoices in date range

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Analytics with date range having no data | Empty states for all charts |
| 2 | Verify conversion rate | Shows 0% (not error or NaN) |
| 3 | Verify LTV leaderboard | "No data available" message |

**Pass Criteria:**
- Zero data handled gracefully

---

### TC-P2-EC-009: Division by Zero - Conversion Rate

**Related FR:** FR-P2-013
**Priority:** P1
**Preconditions:**
- User is logged in
- No sent quotes (zero denominator)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View Sales Pipeline | Conversion rate chart displayed |
| 2 | Verify calculation | Shows 0% or "No data" (not error/NaN) |

**Pass Criteria:**
- Division by zero handled

---

### TC-P2-EC-010: Very Long Client Name

**Related FR:** FR-P2-010
**Priority:** P1
**Preconditions:**
- User is logged in
- Client with 100+ character name exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View client in DataTable | Name truncated with ellipsis |
| 2 | Hover over truncated name | Full name visible in tooltip |

**Pass Criteria:**
- Long text truncated gracefully

---

### TC-P2-EC-011: Date Range Change During Load

**Related FR:** FR-P2-017 (AC-004.9)
**Priority:** P1
**Preconditions:**
- User is logged in
- Analytics loading

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select date range | Charts start loading |
| 2 | Quickly select different date range | Previous request cancelled |
| 3 | Verify final data | Shows data for second selection |

**Pass Criteria:**
- Race condition handled correctly

---

### TC-P2-EC-012: Line Item with Zero Quantity

**Related FR:** FR-P2-019 (AC-005.4)
**Priority:** P1
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Add line item with quantity 0 | Amount calculates to $0.00 |
| 2 | Save quote | Quote saved (or validation error) |

**Pass Criteria:**
- Zero quantity handled

---

### TC-P2-EC-013: Last Row Deletion on Page

**Related FR:** FR-P2-010 (AC-002.7)
**Priority:** P1
**Preconditions:**
- User is logged in
- 11 quotes exist (page 2 has 1 quote)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to page 2 | 1 quote displayed |
| 2 | Delete the quote | Quote removed |
| 3 | Verify pagination | Automatically redirects to page 1 |

**Pass Criteria:**
- Pagination adjusts when last item deleted

---

### TC-P2-EC-014: Pagination with Filter Combination

**Related FR:** FR-P2-010 (AC-002.6)
**Priority:** P1
**Preconditions:**
- User is logged in
- 30 quotes exist, 5 are draft status

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to page 3 | Page 3 displayed |
| 2 | Apply status filter: Draft | Filter applied |
| 3 | Verify pagination | Resets to page 1, shows 5 results |

**Pass Criteria:**
- Pagination resets on filter

---

### TC-P2-EC-015: Project Without Any Documents

**Related FR:** FR-P2-005
**Priority:** P1
**Preconditions:**
- User is logged in
- Project with no quotes/invoices exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View project detail | Project info displayed |
| 2 | Verify linked documents sections | "No quotes yet", "No invoices yet" messages |

**Pass Criteria:**
- Empty document sections handled

---

### TC-P2-EC-016: Inactive Project Selection

**Related FR:** FR-P2-005
**Priority:** P1
**Preconditions:**
- User is logged in
- Inactive project exists

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create new quote, select client | Client selected |
| 2 | View project dropdown | Only active projects shown |
| 3 | Verify inactive project | Not visible in dropdown |

**Pass Criteria:**
- Inactive projects filtered from selection

---

### TC-P2-EC-017: Send Quote Without Email

**Related FR:** FR-P2-019 (AC-005.8)
**Priority:** P1
**Preconditions:**
- User is logged in
- Quote with no client email

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create quote without client email | Quote created |
| 2 | Click "Send Quote" | Validation error: "Client email required" |

**Pass Criteria:**
- Email required for sending

---

### TC-P2-EC-018: Maximum Line Items

**Related FR:** FR-P2-019
**Priority:** P1
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Add 100 line items to quote | All items added |
| 2 | Verify preview | Preview handles large list (scrollable) |
| 3 | Save quote | Quote saved successfully |

**Pass Criteria:**
- Large number of line items handled

---

### TC-P2-EC-019: Concurrent Quote Conversion

**Related FR:** FR-P2-018
**Priority:** P1
**Preconditions:**
- User logged in on two browser tabs
- Same accepted quote open in both

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Convert in Tab 1 | Conversion starts |
| 2 | Click Convert in Tab 2 immediately | Second attempt blocked or handled |
| 3 | Verify database | Only one invoice created |

**Pass Criteria:**
- No duplicate invoices from race condition

---

### TC-P2-EC-020: Tooltip at Viewport Edge

**Related FR:** FR-P2-002 (AC-001.4)
**Priority:** P1
**Preconditions:**
- User is logged in
- Sidebar collapsed

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Hover over bottom nav item (Settings) | Tooltip appears |
| 2 | Verify positioning | Tooltip not cut off by viewport edge |

**Pass Criteria:**
- Tooltips reposition to stay visible

---

### TC-P2-EC-021: Stale Data After Conversion

**Related FR:** FR-P2-018
**Priority:** P1
**Preconditions:**
- Quote converted to invoice
- Multiple tabs open

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Convert quote in Tab 1 | Invoice created |
| 2 | View same quote in Tab 2 | Tab 2 still shows "Convert" button |
| 3 | Click Convert in Tab 2 | Error: "Quote already converted" or button state updates |

**Pass Criteria:**
- Stale state handled gracefully

---

### TC-P2-EC-022: Mobile Table Horizontal Scroll

**Related FR:** FR-P2-009 (AC-006.3)
**Priority:** P1
**Preconditions:**
- Mobile viewport (< 768px)
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Quotes page | DataTable displayed |
| 2 | Verify horizontal scroll | Table scrolls horizontally to show all columns |
| 3 | Scroll right | All columns accessible |

**Pass Criteria:**
- Mobile table scrollable

---

### TC-P2-EC-023: Preview Tab Persistence

**Related FR:** FR-P2-019 (AC-005.6)
**Priority:** P1
**Preconditions:**
- User is logged in
- Quote builder open

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select "Email Preview" tab | Email preview displayed |
| 2 | Edit a form field | Preview updates |
| 3 | Verify active tab | "Email Preview" tab remains selected |

**Pass Criteria:**
- Tab selection persists through updates

---

### TC-P2-EC-024: Special Characters in Project Name

**Related FR:** FR-P2-005
**Priority:** P1
**Preconditions:**
- User is logged in

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create project with name: `Test & "Demo" <Project>` | Project created |
| 2 | View project in list | Name displayed correctly (escaped) |
| 3 | View project in dropdown | Name displayed correctly |

**Pass Criteria:**
- Special characters handled without XSS

---

## Traceability Matrix

### FR-P2-xxx to TC-P2-xxx Mapping

| FR ID | FR Title | Test Cases |
|-------|----------|------------|
| FR-P2-001 | Hierarchical Sidebar Navigation | TC-P2-FR-001, TC-P2-FR-002, TC-P2-FR-003, TC-P2-EC-004, TC-P2-EC-005 |
| FR-P2-002 | Sidebar Collapse Behavior | TC-P2-FR-004, TC-P2-FR-005, TC-P2-FR-006, TC-P2-FR-007, TC-P2-EC-003, TC-P2-EC-020 |
| FR-P2-003 | User Profile Section | TC-P2-FR-008, TC-P2-FR-009, TC-P2-EC-007 |
| FR-P2-004 | Workspace Switcher | TC-P2-FR-010, TC-P2-FR-011, TC-P2-EC-006, TC-P2-SEC-013 |
| FR-P2-005 | Project Entity | TC-P2-FR-012 to TC-P2-FR-018, TC-P2-SEC-002, TC-P2-SEC-003, TC-P2-SEC-010, TC-P2-SEC-011, TC-P2-EC-015, TC-P2-EC-016, TC-P2-EC-024 |
| FR-P2-006 | Quote Status Tracking | TC-P2-FR-030 to TC-P2-FR-033 |
| FR-P2-007 | Invoice Status Tracking | TC-P2-FR-034 to TC-P2-FR-037 |
| FR-P2-008 | Quote-Invoice Linkage | TC-P2-FR-053, TC-P2-FR-054 |
| FR-P2-009 | Application Shell | TC-P2-FR-065 to TC-P2-FR-069, TC-P2-EC-022 |
| FR-P2-010 | Enhanced Data Tables | TC-P2-FR-019 to TC-P2-FR-029, TC-P2-SEC-007, TC-P2-EC-001, TC-P2-EC-002, TC-P2-EC-010, TC-P2-EC-013, TC-P2-EC-014 |
| FR-P2-011 | Status Badge Variants | TC-P2-FR-030 to TC-P2-FR-037, TC-P2-A11Y-005, TC-P2-A11Y-007 |
| FR-P2-012 | Charts and Visualizations | TC-P2-FR-039, TC-P2-FR-040, TC-P2-FR-041, TC-P2-FR-042, TC-P2-A11Y-006 |
| FR-P2-013 | Sales Pipeline Report | TC-P2-FR-038, TC-P2-FR-039, TC-P2-FR-040, TC-P2-EC-008, TC-P2-EC-009 |
| FR-P2-014 | Financial Health Report | TC-P2-FR-041, TC-P2-FR-042 |
| FR-P2-015 | Client Insights Report | TC-P2-FR-043, TC-P2-FR-044 |
| FR-P2-016 | Service Performance Report | TC-P2-FR-045, TC-P2-FR-046 |
| FR-P2-017 | Analytics Date Range Filter | TC-P2-FR-047, TC-P2-FR-048, TC-P2-SEC-008, TC-P2-EC-011 |
| FR-P2-018 | Quote-to-Invoice Conversion | TC-P2-FR-049 to TC-P2-FR-054, TC-P2-SEC-015, TC-P2-EC-019, TC-P2-EC-021 |
| FR-P2-019 | Visual Quote Builder | TC-P2-FR-055 to TC-P2-FR-064, TC-P2-SEC-005, TC-P2-SEC-006, TC-P2-SEC-009, TC-P2-SEC-016, TC-P2-EC-012, TC-P2-EC-017, TC-P2-EC-018, TC-P2-EC-023 |
| NFR-P2-001 | Performance | TC-P2-PERF-001 to TC-P2-PERF-012, TC-P2-SEC-001, TC-P2-SEC-012, TC-P2-SEC-014 |
| NFR-P2-002 | Accessibility | TC-P2-A11Y-001 to TC-P2-A11Y-014 |
| NFR-P2-003 | Responsiveness | TC-P2-FR-067 to TC-P2-FR-069, TC-P2-EC-022 |

---

## Test Execution Checklist

### Smoke Test (P0 Critical Path)

Execute these tests first to verify basic functionality:

- [ ] TC-P2-FR-001 - Sidebar navigation display
- [ ] TC-P2-FR-004 - Sidebar collapse
- [ ] TC-P2-FR-012 - Create project
- [ ] TC-P2-FR-019 - Quotes table display
- [ ] TC-P2-FR-030 - Quote status badge
- [ ] TC-P2-FR-038 - Analytics page access
- [ ] TC-P2-FR-049 - Convert button visibility
- [ ] TC-P2-FR-052 - Execute conversion
- [ ] TC-P2-FR-055 - Split-pane layout
- [ ] TC-P2-SEC-001 - Authentication required
- [ ] TC-P2-PERF-001 - LCP check

### Regression Test (Full Suite)

Execute all 124 test cases for comprehensive coverage.

---

---

## Appendix A: E2E Test Automation Coverage

### Phase 2 Automated E2E Tests

The following E2E test files provide automated coverage for Phase 2 requirements:

| Test File | Test Count | FR Coverage | Priority |
|-----------|------------|-------------|----------|
| `e2e/projects.spec.ts` | 13 | FR-P2-005 | P0 |
| `e2e/sidebar-hierarchy.spec.ts` | 15 | FR-P2-001, FR-P2-002 | P0 |
| `e2e/regression/feature-interaction/quote-invoice-flow.spec.ts` | 15 | FR-P2-018 | P0 |
| `e2e/regression/navigation-validator.spec.ts` | 11+ | FR-P2-001 | P0 |
| `e2e/analytics.spec.ts` | 50+ | FR-P2-015, FR-P2-016 | P0/P1 |
| **Total** | **100+** | | |

### E2E Test Execution

```bash
# Run Phase 2 specific tests
npx playwright test e2e/projects.spec.ts e2e/sidebar-hierarchy.spec.ts

# Run with UI mode for debugging
npx playwright test e2e/projects.spec.ts --ui

# Run navigation validator (includes projects)
npx playwright test e2e/regression/navigation-validator.spec.ts

# Run quote-invoice flow tests
npx playwright test e2e/regression/feature-interaction/quote-invoice-flow.spec.ts

# Run full authenticated test suite
npx playwright test --project=authenticated
```

### E2E Test Case Mapping

| Manual Test ID | E2E Test ID | Status |
|----------------|-------------|--------|
| TC-P2-FR-001 | TC-P2-NAV-001 | Automated |
| TC-P2-FR-002 | TC-P2-NAV-002, TC-P2-NAV-003 | Automated |
| TC-P2-FR-003 | TC-P2-NAV-004, TC-P2-NAV-005 | Automated |
| TC-P2-FR-004 | TC-P2-NAV-008 | Automated |
| TC-P2-FR-005 | TC-P2-NAV-010 | Automated |
| TC-P2-FR-006 | TC-P2-NAV-011 | Automated |
| TC-P2-FR-012 | TC-P2-PROJ-005 | Automated |
| TC-P2-FR-013 | TC-P2-PROJ-001 | Automated |
| TC-P2-FR-014 | TC-P2-PROJ-006 | Automated |
| TC-P2-FR-015 | TC-P2-PROJ-007 | Automated |
| TC-P2-FR-017 | TC-P2-PROJ-009 | Automated |
| TC-P2-FR-018 | TC-P2-PROJ-010 | Automated |
| TC-P2-FR-049-054 | TC-FI-004 to TC-FI-007 | Automated |

---

*Document generated by Manual Test Generator*
*Version 1.0 - 2026-02-13*
*E2E Appendix Added - 2026-02-14*
