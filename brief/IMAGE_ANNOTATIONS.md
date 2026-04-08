# Image Annotations

This document provides detailed descriptions of each screenshot in the brief for context and reference.

---

## Screenshot 1: Sidebar Navigation (Expanded)
**File**: `Screenshot 2026-02-10 at 8.35.10 PM.png`

### Description
Shows the application sidebar in its fully expanded state.

### Key Elements
1. **Header Area**
   - Logo: Purple square icon with command symbol
   - App name: "Quote Craft"
   - Tier indicator: "Enterprise"
   - Dropdown chevron for workspace switching

2. **Navigation Section**
   - Section label: "Platform"
   - Dashboard item (active state, highlighted with purple background)
   - Analytics item (clock icon)
   - Clients item (users icon)
   - Projects item (folder icon) - expanded with chevron
     - Quotes (sub-item, indented)
     - Invoices (sub-item, indented)
     - Contracts (sub-item, indented)
   - Settings item (sliders icon)

3. **User Profile Section**
   - Avatar: Circular image with purple overlay
   - Name: "John Doe"
   - Email: "john@oreko.com"
   - Dropdown chevron

### Design Notes
- Sidebar width: ~256px
- Background: White/light gray
- Active item: Light purple/blue background
- Text: Dark gray for labels
- Icons: Outlined style

---

## Screenshot 2: Invoice List (Expanded Sidebar)
**File**: `Screenshot 2026-02-10 at 8.38.09 PM.png`

### Description
Shows the Invoices list view with the full application shell including expanded sidebar.

### Key Elements
1. **Header Bar**
   - Sidebar toggle button (hamburger icon)
   - Breadcrumb: "Dashboard > Projects Invoices"
   - Theme toggle (top right)

2. **Page Title**
   - "Invoices" heading

3. **Table Controls**
   - "Show" dropdown (value: 10)
   - "Create Invoice" button (purple, primary)
   - Search input: "Search invoices..."
   - Status filter dropdown: "All"
   - Settings/filter icon

4. **Data Table**
   - Columns: Checkbox, Invoice ID, Status, Client, Amount, Issued Date, Actions
   - Sample data:
     - #INV-001 | Paid (green) | TechFlow | $1,200 | 2023-10-15
     - #INV-002 | Pending (amber outline) | Designify | $3,500 | 2023-10-20
     - #INV-003 | Overdue (red) | EduLearn | $900 | 2023-10-01
     - #INV-004 | Paid (green) | HealthPlus | $5,000 | 2023-10-10

5. **Pagination**
   - "Showing 1 to 4 of 4 entries"
   - Previous/Next buttons
   - Page number (1) highlighted

### Design Notes
- Status badges: Paid=green solid, Pending=outlined, Overdue=red solid
- Client column shows avatar + name + email
- Action icons: Delete, View, More menu

---

## Screenshot 3: Invoice List (Collapsed Sidebar)
**File**: `Screenshot 2026-02-10 at 8.38.21 PM.png`

### Description
Shows the same Invoices list view but with the sidebar in collapsed/icon-only mode.

### Key Elements
1. **Collapsed Sidebar**
   - Width: ~64px
   - Logo icon only (no text)
   - Navigation icons only:
     - Grid icon (Dashboard)
     - Clock icon (Analytics)
     - Users icon (Clients)
     - Folder icon (Projects)
     - Sliders icon (Settings)
   - User avatar at bottom (no name/email visible)

2. **Content Area**
   - Same as expanded view
   - More horizontal space for content

### Design Notes
- Demonstrates responsive collapse behavior
- Icons should have tooltips on hover (not visible in static image)
- Content area expands to fill available space

---

## Screenshot 4: Quote List Data Table
**File**: `Screenshot 2026-02-10 at 8.38.45 PM.png`

### Description
Shows the Quotes data table component in isolation (cropped view without sidebar).

### Key Elements
1. **Table Controls**
   - "Show" dropdown (value: 10)
   - "New Quote" button (purple, primary)
   - Search input: "Search quotes..."
   - Status filter dropdown: "All"
   - Settings icon

2. **Data Table**
   - Columns: Checkbox, Quote ID, Status, Client, Total, Expiry Date, Actions
   - Sample data:
     - #QT-101 | Draft (gray outline) | StartUp Inc | $4,500 | 2023-11-01
     - #QT-102 | Sent (blue outline) | Enterprise Corp | $15,000 | 2023-11-15
     - #QT-103 | Accepted (green outline) | Local Biz | $2,200 | 2023-10-30

3. **Pagination**
   - "Showing 1 to 3 of 3 entries"

### Design Notes
- Quote status badges use outline style (not solid)
- Different from invoice badges (invoices use solid for Paid/Overdue)
- Expiry Date column (vs Issued Date for invoices)

---

## Screenshot 5: Financial Health Analytics
**File**: `Screenshot 2026-02-10 at 8.39.09 PM.png`

### Description
Shows the Financial Health analytics section with two chart cards.

### Key Elements
1. **Section Header**
   - "FINANCIAL HEALTH" label (uppercase, muted color)

2. **Revenue Forecast Card**
   - Title: "Revenue Forecast"
   - Subtitle: "Actual vs Projected based on quotes"
   - Chart: Dual-area chart
     - X-axis: Jan, Feb, Mar, Apr, May, Jun
     - Light purple area: Projected (Quotes)
     - Darker purple line: Actual Revenue
   - Legend: "Projected (Quotes)" and "Actual Revenue"

3. **Accounts Receivable Aging Card**
   - Title: "Accounts Receivable Aging"
   - Subtitle: "Outstanding invoices by age"
   - Chart: Horizontal bar chart
     - 0-30 Days: Blue/purple bar (longest)
     - 31-60 Days: Orange bar (medium)
     - 60+ Days: Red bar (shortest)
   - Warning text: "$1,200 overdue by 60+ days" (red, with down arrow)

### Design Notes
- Cards have rounded corners and subtle shadow
- Charts use gradient fills
- Color progression: Blue → Orange → Red indicates severity

---

## Screenshot 6: Client Insights Analytics
**File**: `Screenshot 2026-02-10 at 8.40.00 PM.png`

### Description
Shows the Client Insights analytics section with revenue and LTV displays.

### Key Elements
1. **Section Header**
   - "CLIENT INSIGHTS" label (uppercase, muted color)

2. **Top Clients by Revenue Card**
   - Title: "Top Clients by Revenue"
   - Subtitle: "Year to Date"
   - Chart: Horizontal bar chart
     - Acme Corp: Purple/blue bar (longest)
     - Globex: Purple bar
     - Soylent: Cyan/teal bar
     - Initech: Orange bar
     - Umbrella: Green bar (shortest)
   - Tooltip visible: "Revenue ($)15,000" on Initech bar
   - Legend: "Revenue ($)15,000"

3. **Client Lifetime Value Card**
   - Title: "Client Lifetime Value"
   - Subtitle: "Top valuable clients"
   - List format (not chart):
     - AC (purple circle) | Acme Corp | acme@example.com | +$45,000
     - GL (blue circle) | Globex Inc | info@globex.com | +$32,000
     - SC (cyan circle) | Soylent Corp | contact@soylent.com | +$28,000
     - IN (yellow circle) | Initech | support@initech.com | +$15,000

### Design Notes
- Avatar circles use initials with colored backgrounds
- LTV amounts shown with "+" prefix
- Colors match corresponding bars in revenue chart

---

## Screenshot 7: Invoice Builder (Full View)
**File**: `Screenshot 2026-02-10 at 9.18.06 PM.png`

### Description
Shows the Invoice Builder with split-pane layout (form left, preview right).

### Key Elements
1. **Header**
   - Breadcrumb: "Dashboard > Invoice Builder"
   - Close button (X) for builder overlay

2. **Form Editor (Left Pane)**
   - **Logo Section**
     - Upload placeholder: "Upload your logo"
     - Subtext: "PNG, JPG up to 2MB"

   - **Invoice Details Section**
     - Header: "Invoice Details" with "Options" dropdown
     - Customer field: Text input
     - Email field: email@example.com
     - Due Date: Date picker showing "Feb 24, 2026"
     - Invoice Number: "0001"
     - Tax Rate: Dropdown showing "0% — None"
     - "Add Enhancements" expandable section

   - **Items Section**
     - Header: "Items" with "Templates" dropdown
     - Table: ITEMS | RATE | QTY | AMOUNT
     - "+ Add Items" button

   - **Payment Settings Section**
     - Header: "Payment Settings" with "Options" dropdown
     - Text: "Payment methods are set up in your settings page."

3. **Live Preview (Right Pane)**
   - **Preview Tabs**
     - "Payment Page" (active)
     - "Email Preview"
     - "Invoice PDF"

   - **Preview Content**
     - Header: "Your Business" | "Your Business" label | "$0.00" | "Due on Feb 24, 2026"
     - Client section: "Client Name" | "client@email.com" | "Client Portal" link
     - Invoice Details: "Invoice #0001" | "Hide details" toggle
     - Totals:
       - Subtotal: $0.00
       - Total: $0.00
       - Total Invoice Paid: $0.00
       - Balance Due: $0.00 (bold)
     - Thank you message: "Thank you for your business!"
     - Download button: "Download Invoice"
     - Footer: "Questions? Contact us at support@example.com"

### Design Notes
- Clean split-pane layout
- Preview updates in real-time as form changes
- Tabs allow switching between preview modes
- Professional invoice layout in preview

---

## Color Reference (From Screenshots)

| Element | Color | Hex (Approximate) |
|---------|-------|-------------------|
| Primary (Active/CTA) | Purple/Blue | #6366F1 |
| Paid Badge | Green | #22C55E |
| Pending Badge | Amber | #F59E0B |
| Overdue Badge | Red | #EF4444 |
| Draft Badge | Gray | #6B7280 |
| Sent Badge | Blue | #3B82F6 |
| Accepted Badge | Green | #22C55E |
| Chart - 0-30 Days | Blue/Purple | #818CF8 |
| Chart - 31-60 Days | Orange | #FB923C |
| Chart - 60+ Days | Red | #F87171 |
| Projected Area | Light Purple | #C4B5FD |
| Actual Line | Dark Purple | #7C3AED |
