# Acceptance Criteria

This document provides testable acceptance criteria for QA verification.

---

## AC-001: Application Shell - Sidebar Navigation

### AC-001.1: Sidebar Structure
**Given** a logged-in user on any dashboard page
**When** viewing the sidebar
**Then** the following items should be visible in order:
- Dashboard (with grid icon)
- Analytics (with clock/chart icon)
- Clients (with users icon)
- Projects (with folder icon, expandable)
  - Quotes (sub-item)
  - Invoices (sub-item)
  - Contracts (sub-item)
- Settings (with gear icon)

### AC-001.2: Sidebar Collapse
**Given** a logged-in user with sidebar expanded
**When** clicking the collapse toggle button
**Then**
- Sidebar width should animate from 256px to 64px
- Nav item labels should hide
- Only icons should remain visible
- Logo should collapse to icon-only

### AC-001.3: Sidebar Expand
**Given** a logged-in user with sidebar collapsed
**When** clicking the expand toggle button
**Then**
- Sidebar width should animate from 64px to 256px
- Nav item labels should appear
- Full logo and workspace name should show

### AC-001.4: Collapsed Tooltips
**Given** a logged-in user with sidebar collapsed
**When** hovering over any nav icon
**Then** a tooltip should appear with the item label

### AC-001.5: Project Submenu Expansion
**Given** a logged-in user with sidebar expanded
**When** clicking on "Projects" nav item
**Then**
- Submenu should expand/collapse with animation
- Chevron icon should rotate to indicate state
- Sub-items (Quotes, Invoices, Contracts) should be visible when expanded

### AC-001.6: Active State Highlight
**Given** a user navigates to any page
**When** the page loads
**Then**
- The corresponding nav item should have active styling (highlighted background)
- If a sub-item, parent should be expanded and both highlighted

### AC-001.7: User Profile Display
**Given** a logged-in user
**When** viewing the sidebar bottom section
**Then**
- User avatar (or initials circle) should be visible
- User name should be visible (expanded mode)
- User email should be visible (expanded mode)
- Dropdown chevron should be present

---

## AC-002: Data Tables

### AC-002.1: Table Columns - Quotes
**Given** a user on the Quotes list page
**When** the table loads
**Then** columns should display: Checkbox, Quote ID, Status, Client (with avatar), Total, Expiry Date, Actions

### AC-002.2: Table Columns - Invoices
**Given** a user on the Invoices list page
**When** the table loads
**Then** columns should display: Checkbox, Invoice ID, Status, Client (with avatar), Amount, Issued Date, Actions

### AC-002.3: Status Badges - Quotes
**Given** quotes with different statuses exist
**When** viewing the quotes table
**Then**
- Draft: Gray outline badge
- Sent: Blue outline badge
- Accepted: Green outline badge
- Expired: Red outline badge (if applicable)

### AC-002.4: Status Badges - Invoices
**Given** invoices with different statuses exist
**When** viewing the invoices table
**Then**
- Pending: Yellow/amber outline badge
- Paid: Green solid badge
- Overdue: Red solid badge

### AC-002.5: Search Functionality
**Given** a user on any list page
**When** typing in the search input
**Then**
- Results should filter after 300ms debounce
- Matching rows should display
- "No results" message if no matches
- Search should match: ID, client name, client email

### AC-002.6: Status Filter
**Given** a user on any list page
**When** selecting a status from the filter dropdown
**Then**
- Only rows matching that status should display
- "All" option should show all rows
- Pagination should reset to page 1

### AC-002.7: Pagination Controls
**Given** more items than the page size
**When** viewing the table
**Then**
- "Showing X to Y of Z entries" text should be accurate
- Previous/Next buttons should work
- Page numbers should be clickable
- Current page should be highlighted

### AC-002.8: Page Size Selector
**Given** a user on any list page
**When** changing the "Show X" dropdown value
**Then**
- Table should display the selected number of rows
- Options should include: 10, 25, 50, 100

### AC-002.9: Row Actions
**Given** a user viewing a table row
**When** clicking action icons
**Then**
- Download icon: Should download PDF
- View icon: Should navigate to detail page
- More (...) icon: Should show dropdown with Edit, Duplicate, Delete

---

## AC-003: Quote-to-Invoice Conversion

### AC-003.1: Convert Button Visibility
**Given** a quote with ACCEPTED status
**When** viewing the quote details page
**Then** a "Convert to Invoice" button should be visible

### AC-003.2: Convert Button Hidden for Non-Accepted
**Given** a quote with DRAFT, SENT, or EXPIRED status
**When** viewing the quote details page
**Then** the "Convert to Invoice" button should NOT be visible

### AC-003.3: Conversion Dialog
**Given** a user clicks "Convert to Invoice"
**When** the dialog opens
**Then**
- Quote number should be displayed
- Client name should be displayed
- Amount should be displayed
- Invoice date field should default to today
- Due date field should default to +30 days
- Checkboxes for "Copy line items" and "Send immediately"

### AC-003.4: Invoice Creation
**Given** a user confirms the conversion dialog
**When** clicking "Create Invoice"
**Then**
- New invoice should be created
- Invoice should have same client, project, line items
- Invoice should be linked to source quote
- User should be redirected to invoice detail page

### AC-003.5: Linked Invoice Display on Quote
**Given** a quote has been converted to an invoice
**When** viewing the quote details
**Then**
- A "Linked Invoice" section should be visible
- Invoice number should be shown (clickable link)
- Invoice status badge should be displayed
- Clicking should navigate to invoice

### AC-003.6: Already Converted Prevention
**Given** a quote already has a linked invoice
**When** viewing the quote
**Then** the "Convert to Invoice" button should be disabled or hidden

---

## AC-004: Analytics Dashboard

### AC-004.1: Sales Pipeline - Conversion Rate
**Given** a user on the Analytics page
**When** viewing the Sales Pipeline section
**Then**
- Quote conversion rate should display as percentage
- Radial/circular chart should visualize the rate
- Trend indicator should show up/down arrow with percentage

### AC-004.2: Sales Pipeline - Quotes by Status
**Given** quotes exist in various statuses
**When** viewing the Quotes by Status chart
**Then**
- Bar chart should show counts for: Draft, Sent, Expired, Accepted
- Each bar should have distinct color
- Tooltip should show exact count on hover

### AC-004.3: Financial Health - AR Aging
**Given** unpaid invoices exist
**When** viewing the AR Aging chart
**Then**
- Horizontal bars for: 0-30 Days, 31-60 Days, 60+ Days
- Bars color-coded: Blue, Orange, Red
- Dollar amounts shown
- Warning indicator for 60+ days amount

### AC-004.4: Financial Health - Revenue Forecast
**Given** quotes and invoices exist
**When** viewing the Revenue Forecast chart
**Then**
- Dual-area chart with Projected (quotes) and Actual (invoices)
- X-axis shows months
- Y-axis shows currency values
- Legend distinguishes the two series

### AC-004.5: Client Insights - Top Clients
**Given** paid invoices exist for multiple clients
**When** viewing Top Clients by Revenue
**Then**
- Horizontal bar chart showing top 5 clients
- Sorted descending by revenue
- Client names on Y-axis
- Revenue on X-axis

### AC-004.6: Client Insights - LTV Leaderboard
**Given** clients have payment history
**When** viewing Client Lifetime Value
**Then**
- List showing top clients
- Each row: Avatar, Name, Email, LTV amount
- Sorted by LTV descending

### AC-004.7: Service Performance - Top Services
**Given** line items exist on quotes/invoices
**When** viewing Top Selling Services
**Then**
- Bar chart showing most frequently quoted items
- Item names on X-axis
- Count on Y-axis

### AC-004.8: Service Performance - Revenue by Category
**Given** services have categories assigned
**When** viewing Revenue by Category
**Then**
- Donut/pie chart showing distribution
- Legend below showing category names
- Percentage and amount shown

### AC-004.9: Date Range Filter
**Given** a user on Analytics page
**When** changing the date range dropdown
**Then**
- All charts should update to reflect new date range
- Loading states should show during data fetch
- Selected range should persist

---

## AC-005: Visual Quote Builder

### AC-005.1: Split Pane Layout
**Given** a user opens New Quote or Edit Quote
**When** the builder loads
**Then**
- Form editor should occupy ~60% left side
- Live preview should occupy ~40% right side
- Divider should be visible between panes

### AC-005.2: Logo Upload
**Given** a user in the quote builder
**When** clicking the logo upload area
**Then**
- File picker should open
- Only PNG/JPG allowed
- Max 2MB enforced
- Preview should update immediately after upload

### AC-005.3: Customer Selection
**Given** a user in the quote builder
**When** typing in the Customer field
**Then**
- Dropdown should show matching clients
- Selecting a client populates email automatically
- Can create new client inline

### AC-005.4: Line Items
**Given** a user adding line items
**When** entering rate and quantity
**Then**
- Amount should auto-calculate (Rate × Quantity)
- Total should update in preview
- "+ Add Items" should add new row

### AC-005.5: Live Preview Updates
**Given** a user editing any field
**When** the value changes
**Then** the preview pane should update in real-time (within 200ms)

### AC-005.6: Preview Tabs
**Given** a user viewing the preview
**When** clicking different tabs
**Then**
- "Payment Page" shows client-facing view
- "Email Preview" shows email template
- "Invoice PDF" shows downloadable format

### AC-005.7: Save Draft
**Given** a user with unsaved changes
**When** clicking "Save Draft"
**Then**
- Quote should save with DRAFT status
- Success toast notification
- Form should remain open for further edits

### AC-005.8: Send Quote
**Given** a user with a valid quote
**When** clicking "Send Quote"
**Then**
- Confirmation dialog should appear
- After confirmation, status changes to SENT
- Email is sent to client
- Success notification shown

---

## AC-006: Responsive Behavior

### AC-006.1: Desktop (1280px+)
**Given** viewport width >= 1280px
**When** viewing the application
**Then**
- Full sidebar visible (expanded by default)
- Content area uses remaining width

### AC-006.2: Tablet (768px - 1279px)
**Given** viewport width 768px to 1279px
**When** viewing the application
**Then**
- Sidebar collapsed by default (icons only)
- Can be expanded via toggle

### AC-006.3: Mobile (< 768px)
**Given** viewport width < 768px
**When** viewing the application
**Then**
- Sidebar hidden by default
- Hamburger menu to open as overlay
- Full-width content area

---

## AC-007: Performance

### AC-007.1: Page Load
**Given** any dashboard page
**When** measuring LCP
**Then** should be < 2.5 seconds

### AC-007.2: Interaction Response
**Given** any interactive element
**When** measuring FID
**Then** should be < 100ms

### AC-007.3: Layout Stability
**Given** any page during load
**When** measuring CLS
**Then** should be < 0.1

### AC-007.4: API Response
**Given** any API endpoint
**When** measuring response time
**Then** 95th percentile should be < 500ms
