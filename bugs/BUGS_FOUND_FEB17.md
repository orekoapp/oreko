# Bug Report - Production Testing (Feb 17, 2026)

**Tested by:** Automated human-tester mindset session
**Environment:** https://oreko-gamma.vercel.app
**User:** Demo User (demo@oreko.demo) in Demo Workspace
**Theme tested:** Dark mode + Light mode
**Screenshots:** Saved in `bugs/` directory

---

## CRITICAL BUGS

### BUG-01: Logout Button Does Not Work (CRITICAL)
- **Page:** All pages (User profile dropdown > Log out)
- **Steps:** Click user avatar in sidebar > Click "Log out"
- **Expected:** User is logged out and redirected to login page
- **Actual:** Page briefly reloads but user remains logged in as Demo User. Also tried navigating to `/api/auth/signout` directly - same result. Even clearing browser cookies via JS doesn't help - the app auto-re-authenticates.
- **Impact:** Users cannot log out. In demo mode, it's impossible to test with different user accounts. This also means if someone gains access to a session, the legitimate user cannot revoke it by logging out.
- **Screenshot:** N/A (no visual change occurs)

### BUG-02: Analytics Revenue 100x Mismatch Between Dashboard and Analytics Page
- **Page:** Dashboard vs Analytics (`/analytics`)
- **Steps:** Compare revenue figures between Dashboard and Analytics page
- **Expected:** Revenue figures should be consistent across pages
- **Actual:**
  - Dashboard shows: Total Revenue **$45.00**, Outstanding **$54.00**, Overdue **$85.00**
  - Analytics summary cards show: Total Revenue **$4,500.00**, Outstanding **$5,400.00**, Overdue **$8,500.00**
  - Analytics Financial Health detail shows: Outstanding **$54.00**, Overdue **$85.00**
  - The Analytics SUMMARY CARDS are exactly **100x** the Dashboard/detail values
- **Root Cause:** Likely amounts stored in cents but Analytics summary cards displaying cents as dollars (not dividing by 100)
- **Screenshot:** `bugs/07-analytics.png`, `bugs/08-analytics-financial-health.png`, `bugs/09-dashboard-light.png`

### BUG-03: Quote Detail Shows 0 Line Items But Non-Zero Total
- **Page:** Quote detail (`/quotes/{id}`) - tested with Q-0001
- **Steps:** Navigate to any quote detail page
- **Expected:** Line Items count should match the actual number of line items, and total should reflect those items
- **Actual:** "Line Items: 0" displayed in sidebar, but Total shows **$17,700.00**. The "Services" section in the main content area is completely empty despite the total being non-zero.
- **Impact:** Users cannot see or edit quote line items. The quote appears broken.
- **Screenshot:** `bugs/03-quote-detail.png`

---

## HIGH SEVERITY BUGS

### BUG-04: All Clients Show as "individual" Type - Companies Not Detected
- **Page:** Clients list (`/clients`)
- **Steps:** View the clients table
- **Expected:** Clients with company names (Global Retail Co., TechStart Inc., etc.) should show as "company" type
- **Actual:** ALL 6 clients show type as "individual" even when they clearly have company names. The "Companies" stat card shows **0** despite multiple clients having company fields.
- **Impact:** Client type categorization is broken. Filtering by company type would return 0 results.
- **Screenshot:** `bugs/05-clients-list.png`

### BUG-05: Client Name Duplicated in Table Display
- **Page:** Clients list (`/clients`), Projects list (`/projects`)
- **Steps:** View the clients or projects table - look at the Client column
- **Expected:** Client cell should show company name + contact person name (two different values)
- **Actual:** When company name equals the client record name, it shows the same name twice:
  - "TechStart Inc. / TechStart Inc."
  - "Global Retail Co. / Global Retail Co."
  - "Creative Agency LLC / Creative Agency LLC"
  - But "Chen Ventures / Marcus Chen" and "Johnson Consulting / Sarah Johnson" display correctly (because company and person names differ)
- **Root Cause:** The display logic shows both `company` and `name` fields, but for some records both fields contain the company name instead of having the person's name in the `name` field.
- **Screenshot:** `bugs/05-clients-list.png`

### BUG-06: Analytics "+Infinity%" Display for Percentage Change
- **Page:** Analytics (`/analytics`)
- **Steps:** View the Total Quotes card
- **Expected:** Should show a numeric percentage change (e.g., "+100%" or "N/A" if no previous data)
- **Actual:** Shows **"+Infinity% vs last month"** - this is a division by zero when previous period had 0 quotes
- **Impact:** Unprofessional display, confusing to users
- **Screenshot:** `bugs/07-analytics.png`

### BUG-07: Quote Detail - Download PDF Button Does Nothing
- **Page:** Quote detail page
- **Steps:** Open any quote > Click "Download PDF" button
- **Expected:** PDF should download, or at minimum a toast/error message should appear
- **Actual:** Absolutely nothing happens - no download, no toast notification, no loading indicator, no error message. The button appears clickable but produces zero feedback.
- **Impact:** Users cannot export quotes as PDFs - a core business feature
- **Screenshot:** `bugs/03-quote-detail.png`

### BUG-08: Client Revenue Shows $0.00 for Clients with Paid Invoices
- **Page:** Clients list (`/clients`)
- **Steps:** View the Revenue column
- **Expected:** Revenue should reflect total paid invoices for each client
- **Actual:** Most clients show **$0.00** revenue. Only TechStart Inc. shows $45.00 (matching its paid invoice). Clients like Global Retail Co. who have invoices show $0.00 because their invoices are unpaid/overdue. However, "Revenue" column label is misleading - it should perhaps say "Paid Revenue" or the column should show total invoiced amount.
- **Screenshot:** `bugs/05-clients-list.png`

---

## MEDIUM SEVERITY BUGS

### BUG-09: Quote Detail Currency Format Inconsistent
- **Page:** Quote detail page
- **Steps:** Compare currency formatting between preview area and sidebar
- **Expected:** Consistent currency formatting across the page
- **Actual:** Preview area shows **"$17700.00"** (no thousand separator comma), while sidebar shows **"$17,700.00"** (with comma). Two different formatters are being used on the same page.
- **Screenshot:** `bugs/03-quote-detail.png`

### BUG-10: Analytics Page Title Has Duplicate "Oreko"
- **Page:** Analytics (`/analytics`)
- **Steps:** Check the browser tab title
- **Expected:** "Analytics | Oreko"
- **Actual:** "Analytics | Oreko **| Oreko**" - the app name is duplicated in the title
- **Impact:** Minor but unprofessional, indicates template/layout metadata issue

### BUG-11: Dashboard "View All" Analytics Link Goes to Wrong URL
- **Page:** Dashboard (`/dashboard`)
- **Steps:** Click "View All" next to the Analytics section heading
- **Expected:** Should navigate to `/analytics`
- **Actual:** Navigates to `/dashboard/analytics` which may not exist as a valid route
- **Impact:** Users clicking "View All" may get a 404 or unexpected page

### BUG-12: Invoice Detail - Amount Column Truncated
- **Page:** Invoice detail page (tested with INV-0001)
- **Steps:** View the line items table
- **Expected:** Amount values should be fully visible
- **Actual:** The Amount column gets clipped/truncated on narrower viewports - e.g., "$4,5..." is visible instead of the full amount
- **Impact:** Users cannot see full invoice amounts without resizing
- **Screenshot:** `bugs/04-invoice-detail.png`

### BUG-13: Dashboard Revenue Shows Suspiciously Low Values
- **Page:** Dashboard (`/dashboard`)
- **Steps:** View Total Revenue card and Recent Quotes amounts
- **Expected:** Professional service quotes/invoices should have reasonable amounts (thousands of dollars)
- **Actual:**
  - Total Revenue: **$45.00** (only 1 paid invoice)
  - Quote amounts: Website Redesign $177.00, E-commerce Platform $354.00, Brand Identity $70.00, Mobile App UI $120.00
  - These are unrealistically low for professional design/development services
- **Root Cause:** Amounts appear to be stored in cents but displayed as dollars (e.g., $17,700 cents = $177.00 displayed). Or the seed data has incorrect amounts.
- **Screenshot:** `bugs/09-dashboard-light.png`

### BUG-14: Recent Activity Section Only Shows 1 Entry
- **Page:** Dashboard (`/dashboard`)
- **Steps:** Scroll to "Recent Activity" section at bottom
- **Expected:** Should show multiple recent activities (quote created, invoice sent, payment received, etc.)
- **Actual:** Only shows **1 entry** - "INV-0005 Chen Ventures $36.00 yesterday". Despite having 5 quotes, 5 invoices, and 3 contracts, only 1 activity item appears.
- **Impact:** The activity feed appears broken or the activity logging is not capturing events
- **Screenshot:** `bugs/09-dashboard-light.png`

### BUG-15: Contract Template Variable Count Appears Wrong
- **Page:** Templates (`/templates`)
- **Steps:** View the template list
- **Expected:** Variable count should show the number of template variables (e.g., {{client_name}}, {{date}})
- **Actual:** Shows very high counts: **787 variables**, **273 variables**, **445 variables**. These numbers seem more like character counts or word counts rather than actual template variable counts.
- **Impact:** Misleading information for users managing templates

### BUG-16: Notification Bell Has Red Dot But No Way to View/Clear
- **Page:** All pages (top navigation bar)
- **Steps:** Observe the notification bell icon
- **Expected:** Clicking the notification bell should show a notification dropdown/panel
- **Actual:** The bell has a persistent red dot indicator suggesting unread notifications, but clicking it may not show anything or the notification panel may be non-functional. (The indicator persisted across all page loads)
- **Impact:** Users see there are notifications but cannot access them

---

## LOW SEVERITY / COSMETIC BUGS

### BUG-17: Conversion Funnel Shows Inconsistent Numbers
- **Page:** Dashboard (`/dashboard`)
- **Steps:** View the Conversion Funnel chart
- **Expected:** Numbers should flow logically: Created >= Sent >= Viewed >= Accepted >= Invoiced >= Paid
- **Actual:** Shows: Created(5) > Sent(4) > Viewed(3) > Accepted(1) > **Invoiced(5)** > Paid(1)
  - "Invoiced: 5" is **higher** than "Accepted: 1" which makes no logical sense. You cannot invoice more quotes than were accepted.
- **Impact:** Misleading funnel visualization, indicates the data source for funnel stages is incorrect

### BUG-18: Dashboard Payment Aging Shows $139.00 Outstanding But Cards Show $54.00
- **Page:** Dashboard (`/dashboard`)
- **Steps:** Compare "Outstanding" card ($54.00) with "Payment Aging Total Outstanding" ($139.00)
- **Expected:** These should be the same value
- **Actual:** Outstanding card shows **$54.00** but Payment Aging chart shows **Total Outstanding: $139.00**
- **Root Cause:** Payment Aging may include draft invoices or calculate differently from the summary card

### BUG-19: Search (Cmd+K) Functionality Unknown
- **Page:** All pages
- **Steps:** The Search button with Cmd+K shortcut is visible in the header
- **Expected:** Clicking or pressing Cmd+K should open a search dialog
- **Actual:** Not tested fully, but the search appears to be a global feature that should be verified for functionality

### BUG-20: "Untitled Quote" in Recent Quotes List
- **Page:** Dashboard (`/dashboard`)
- **Steps:** View Recent Quotes section
- **Expected:** All quotes should have meaningful titles
- **Actual:** First quote shows as **"Untitled Quote"** with $0.00 and "declined" status. This is likely a test/draft quote that should have been cleaned up or should display a better default name.
- **Impact:** Unprofessional appearance in the demo

---

## DATA ISOLATION / MULTI-TENANT BUGS (UNABLE TO FULLY TEST)

### BUG-21: Cannot Test Data Isolation - Logout Broken
- **Page:** Login/Logout flow
- **Steps:** Attempted to log out and log in as test@oreko.dev
- **Expected:** Should be able to log out and test with different user accounts
- **Actual:** Logout does not work (see BUG-01). The demo mode appears to auto-authenticate the demo user, making it impossible to:
  1. Test with other user accounts (test@oreko.dev, owner@oreko.dev)
  2. Verify data isolation between workspaces
  3. Test the login page functionality
  4. Test "forgot password" flow
  5. Test account switching
- **Impact:** Critical testing gap - cannot verify multi-tenant data isolation

---

## SUMMARY

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 5 |
| Medium | 7 |
| Low/Cosmetic | 4 |
| Untestable | 1 |
| **Total** | **20** |

### Top Priority Fixes:
1. **BUG-01:** Fix logout functionality (critical security concern)
2. **BUG-02:** Fix 100x revenue multiplier in Analytics summary cards
3. **BUG-03:** Fix quote line items not loading on detail page
4. **BUG-04:** Fix client type detection (company vs individual)
5. **BUG-06:** Handle division by zero in percentage change calculations
6. **BUG-07:** Fix PDF download or show proper error message
7. **BUG-17:** Fix conversion funnel data logic
