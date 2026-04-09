# Oreko - Manual Test Cases

**Version:** 1.0.0
**Created:** January 30, 2026
**Based on:** USER_FLOWS.md, PRODUCT_SPEC.md

---

## Table of Contents

1. [Authentication Tests](#1-authentication-tests)
2. [Onboarding Tests](#2-onboarding-tests)
3. [Quote Management Tests](#3-quote-management-tests)
4. [Quote Builder Tests](#4-quote-builder-tests)
5. [Client Portal Tests](#5-client-portal-tests)
6. [Invoice Tests](#6-invoice-tests)
7. [Payment Tests](#7-payment-tests)
8. [Client Management Tests](#8-client-management-tests)
9. [Rate Card Tests](#9-rate-card-tests)
10. [Settings Tests](#10-settings-tests)
11. [Dashboard Tests](#11-dashboard-tests)
12. [Responsive/Mobile Tests](#12-responsivemobile-tests)
13. [Accessibility Tests](#13-accessibility-tests)
14. [Performance Tests](#14-performance-tests)
15. [Security Tests](#15-security-tests)

---

## Test Case Format

Each test case follows this format:
- **TC-XXX**: Test Case ID
- **Title**: Brief description
- **Priority**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **Preconditions**: Required state before test
- **Steps**: Numbered execution steps
- **Expected Result**: What should happen
- **Actual Result**: (To be filled during testing)
- **Status**: Pass/Fail/Blocked

---

## 1. Authentication Tests

### TC-AUTH-001: User Registration with Valid Data
**Priority:** P0

**Preconditions:**
- User is not logged in
- Email is not already registered

**Steps:**
1. Navigate to `/register`
2. Enter valid email: `testuser@example.com`
3. Enter valid password: `SecurePass123!`
4. Enter business name: `Test Business`
5. Click "Create Account"

**Expected Result:**
- Account is created successfully
- User is redirected to dashboard
- Verification email is sent
- Success message is displayed

---

### TC-AUTH-002: User Registration with Invalid Email
**Priority:** P0

**Preconditions:**
- User is on registration page

**Steps:**
1. Enter invalid email: `notanemail`
2. Enter valid password: `SecurePass123!`
3. Click "Create Account"

**Expected Result:**
- Form shows validation error: "Please enter a valid email"
- Account is not created
- User remains on registration page

---

### TC-AUTH-003: User Registration with Weak Password
**Priority:** P0

**Preconditions:**
- User is on registration page

**Steps:**
1. Enter valid email: `testuser@example.com`
2. Enter weak password: `123`
3. Click "Create Account"

**Expected Result:**
- Form shows validation error: "Password must be at least 8 characters"
- Account is not created

---

### TC-AUTH-004: User Registration with Existing Email
**Priority:** P0

**Preconditions:**
- Account with `existing@example.com` already exists

**Steps:**
1. Navigate to `/register`
2. Enter email: `existing@example.com`
3. Enter valid password: `SecurePass123!`
4. Click "Create Account"

**Expected Result:**
- Error message: "An account with this email already exists"
- Account is not created
- Link to login page is shown

---

### TC-AUTH-005: User Login with Valid Credentials
**Priority:** P0

**Preconditions:**
- User account exists with email: `testuser@example.com`
- Password: `SecurePass123!`

**Steps:**
1. Navigate to `/login`
2. Enter email: `testuser@example.com`
3. Enter password: `SecurePass123!`
4. Click "Sign In"

**Expected Result:**
- User is logged in successfully
- User is redirected to dashboard
- User's name/email visible in header

---

### TC-AUTH-006: User Login with Invalid Credentials
**Priority:** P0

**Preconditions:**
- User is on login page

**Steps:**
1. Enter email: `testuser@example.com`
2. Enter wrong password: `WrongPassword123!`
3. Click "Sign In"

**Expected Result:**
- Error message: "Invalid email or password"
- User is not logged in
- User remains on login page

---

### TC-AUTH-007: Password Reset Request
**Priority:** P1

**Preconditions:**
- User account exists with email: `testuser@example.com`

**Steps:**
1. Navigate to `/login`
2. Click "Forgot Password?"
3. Enter email: `testuser@example.com`
4. Click "Send Reset Link"

**Expected Result:**
- Success message: "If an account exists, you'll receive a reset email"
- Reset email is sent with valid token

---

### TC-AUTH-008: Password Reset Completion
**Priority:** P1

**Preconditions:**
- User has received valid reset token

**Steps:**
1. Click reset link in email
2. Enter new password: `NewSecurePass456!`
3. Confirm password: `NewSecurePass456!`
4. Click "Reset Password"

**Expected Result:**
- Password is updated
- Success message is shown
- User is redirected to login
- User can log in with new password

---

### TC-AUTH-009: User Logout
**Priority:** P0

**Preconditions:**
- User is logged in

**Steps:**
1. Click user menu in header
2. Click "Logout"

**Expected Result:**
- User is logged out
- User is redirected to login page
- Session is destroyed

---

### TC-AUTH-010: OAuth Login with Google
**Priority:** P1

**Preconditions:**
- User has Google account
- OAuth is configured

**Steps:**
1. Navigate to `/login`
2. Click "Continue with Google"
3. Select Google account
4. Authorize application

**Expected Result:**
- User is logged in or account is created
- User is redirected to dashboard

---

## 2. Onboarding Tests

### TC-ONBOARD-001: Complete Onboarding Flow
**Priority:** P0

**Preconditions:**
- New user account just created
- First login

**Steps:**
1. User logs in for first time
2. Complete Step 1: Enter business name
3. Skip Step 2: Branding (optional)
4. Skip Step 3: Payment setup (optional)
5. Complete Step 4: Select modules (Quotes, Invoices)
6. Complete Step 5: Select template
7. Click "Complete Setup"

**Expected Result:**
- Onboarding marked as complete
- User redirected to dashboard
- Selected modules visible in navigation
- Skipped items show "Complete setup" reminder

---

### TC-ONBOARD-002: Skip Onboarding Steps
**Priority:** P1

**Preconditions:**
- User is in onboarding flow

**Steps:**
1. On Step 2 (Branding), click "Skip for now"
2. On Step 3 (Payment), click "Skip for now"
3. Complete required steps
4. Finish onboarding

**Expected Result:**
- Skipped steps are saved as incomplete
- User can access dashboard
- Settings show incomplete items
- No errors occur

---

### TC-ONBOARD-003: Resume Incomplete Onboarding
**Priority:** P1

**Preconditions:**
- User started onboarding but didn't complete
- User logs out

**Steps:**
1. Log back in
2. Observe redirect behavior

**Expected Result:**
- User is redirected to continue onboarding
- Previous progress is preserved

---

## 3. Quote Management Tests

### TC-QUOTE-001: View Empty Quotes List
**Priority:** P0

**Preconditions:**
- User is logged in
- No quotes exist for workspace

**Steps:**
1. Navigate to Quotes from sidebar
2. Observe page content

**Expected Result:**
- Empty state illustration shown
- Message: "No quotes yet"
- CTA button: "+ Create Your First Quote"

---

### TC-QUOTE-002: View Quotes List with Data
**Priority:** P0

**Preconditions:**
- User has 5+ quotes in various statuses

**Steps:**
1. Navigate to Quotes from sidebar
2. Observe table content

**Expected Result:**
- Table displays all quotes
- Columns: Quote #, Client, Amount, Status, Date
- Status badges show correct colors
- Pagination appears if > 10 quotes

---

### TC-QUOTE-003: Search Quotes
**Priority:** P1

**Preconditions:**
- User has multiple quotes

**Steps:**
1. Navigate to Quotes list
2. Enter search term in search box: "Acme"
3. Observe results

**Expected Result:**
- List filters to show only matching quotes
- Matches against client name, quote number, project name
- Search is debounced (300ms)

---

### TC-QUOTE-004: Filter Quotes by Status
**Priority:** P1

**Preconditions:**
- User has quotes in various statuses

**Steps:**
1. Navigate to Quotes list
2. Click Status filter dropdown
3. Select "Sent"

**Expected Result:**
- List shows only quotes with "Sent" status
- Other quotes are hidden
- Filter selection is visible

---

### TC-QUOTE-005: Sort Quotes by Column
**Priority:** P2

**Preconditions:**
- User has multiple quotes

**Steps:**
1. Navigate to Quotes list
2. Click "Amount" column header
3. Click again to reverse sort

**Expected Result:**
- Quotes sorted by amount ascending
- Second click sorts descending
- Sort indicator visible on column

---

### TC-QUOTE-006: Delete Quote (Soft Delete)
**Priority:** P1

**Preconditions:**
- User has a draft quote

**Steps:**
1. Navigate to Quotes list
2. Click actions menu (...) on a draft quote
3. Click "Delete"
4. Confirm deletion in modal

**Expected Result:**
- Quote is soft deleted
- Quote no longer appears in list
- Success toast shown
- Quote data preserved in database (deletedAt set)

---

### TC-QUOTE-007: Duplicate Quote
**Priority:** P1

**Preconditions:**
- User has an existing quote

**Steps:**
1. Navigate to Quotes list
2. Click actions menu on a quote
3. Click "Duplicate"

**Expected Result:**
- New quote created with copied data
- New quote number assigned
- User redirected to quote builder
- Original quote unchanged

---

## 4. Quote Builder Tests

### TC-BUILDER-001: Create New Quote
**Priority:** P0

**Preconditions:**
- User is logged in

**Steps:**
1. Click "+ New Quote" from quotes list
2. Observe quote builder loads

**Expected Result:**
- Three-panel builder layout appears
- Default template applied
- Quote number auto-generated
- Issue date set to today
- Expiry date set to 14 days from now

---

### TC-BUILDER-002: Select Client
**Priority:** P0

**Preconditions:**
- User is in quote builder
- At least one client exists

**Steps:**
1. Click client selector in properties panel
2. Search for existing client
3. Select client

**Expected Result:**
- Client name appears in selector
- Client details shown in document preview
- Auto-save triggers

---

### TC-BUILDER-003: Create New Client from Quote Builder
**Priority:** P1

**Preconditions:**
- User is in quote builder

**Steps:**
1. Click client selector
2. Click "+ Create New Client"
3. Fill in client details (name, email)
4. Click "Create"

**Expected Result:**
- New client created
- Client automatically selected for quote
- Modal closes

---

### TC-BUILDER-004: Add Header Block
**Priority:** P0

**Preconditions:**
- User is in quote builder

**Steps:**
1. Find Header block in left panel
2. Drag Header block to document canvas
3. Drop on canvas

**Expected Result:**
- Header block added to document
- Block appears with default content
- Block can be selected for editing

---

### TC-BUILDER-005: Add Line Item Block
**Priority:** P0

**Preconditions:**
- User is in quote builder

**Steps:**
1. Drag Line Items block to canvas
2. Click on block to edit
3. Enter item name: "Website Design"
4. Enter description: "Complete website redesign"
5. Enter rate: 2500
6. Set quantity: 1

**Expected Result:**
- Line item displays correctly
- Amount calculated: $2,500.00
- Total updates automatically

---

### TC-BUILDER-006: Add Multiple Line Items
**Priority:** P0

**Preconditions:**
- User has one line item on canvas

**Steps:**
1. Click "+ Add Line Item" within the block
2. Enter second item details
3. Enter third item details

**Expected Result:**
- Multiple line items appear
- Each has correct calculations
- Subtotal reflects all items

---

### TC-BUILDER-007: Drag and Drop Reorder Blocks
**Priority:** P0

**Preconditions:**
- User has multiple blocks on canvas

**Steps:**
1. Click and hold drag handle on a block
2. Drag block to new position
3. Release

**Expected Result:**
- Block moves to new position
- Other blocks reflow
- Visual feedback during drag
- Auto-save triggers after drop

---

### TC-BUILDER-008: Delete Block
**Priority:** P0

**Preconditions:**
- User has blocks on canvas

**Steps:**
1. Hover over a block
2. Click X (delete) button
3. Confirm deletion (if block has content)

**Expected Result:**
- Block removed from canvas
- Other blocks reflow
- Totals recalculated if line item removed

---

### TC-BUILDER-009: Edit Block Properties
**Priority:** P0

**Preconditions:**
- User has blocks on canvas

**Steps:**
1. Click on a text block
2. Edit text content inline
3. Click outside block

**Expected Result:**
- Changes are saved
- Auto-save triggers
- Preview updates immediately

---

### TC-BUILDER-010: Configure Deposit Settings
**Priority:** P0

**Preconditions:**
- User is in quote builder

**Steps:**
1. Scroll to Payment Settings in properties panel
2. Enable "Require Deposit"
3. Enter deposit percentage: 30

**Expected Result:**
- Deposit amount calculated from total
- Deposit shows in document preview
- Payment schedule reflects deposit

---

### TC-BUILDER-011: Add Rate Card Item to Quote
**Priority:** P1

**Preconditions:**
- Rate card items exist
- User is in quote builder

**Steps:**
1. Find rate card item in left panel
2. Drag to canvas
3. Select pricing tier (if multiple)

**Expected Result:**
- Rate card item added as line item
- Pre-filled with rate card data
- Price can be overridden

---

### TC-BUILDER-012: Preview Quote
**Priority:** P0

**Preconditions:**
- User has built a quote with content

**Steps:**
1. Click "Preview" button in toolbar
2. Observe preview modal

**Expected Result:**
- Preview shows exact client view
- Branding applied
- All content visible
- Close button returns to editor

---

### TC-BUILDER-013: Auto-Save Functionality
**Priority:** P0

**Preconditions:**
- User is in quote builder

**Steps:**
1. Make changes to quote
2. Wait 2 seconds
3. Check save status indicator

**Expected Result:**
- "Saving..." appears during save
- "Saved" appears after complete
- Changes persisted to database

---

### TC-BUILDER-014: Save Quote as Draft
**Priority:** P0

**Preconditions:**
- User is building a quote

**Steps:**
1. Click "Save" button
2. Observe response

**Expected Result:**
- Quote saved with "Draft" status
- Success toast shown
- Can continue editing

---

### TC-BUILDER-015: Set Quote Expiration Date
**Priority:** P1

**Preconditions:**
- User is in quote builder

**Steps:**
1. Find expiration date field in properties panel
2. Click date picker
3. Select date 30 days from now

**Expected Result:**
- Expiration date updated
- Shows in document preview
- Auto-save triggers

---

### TC-BUILDER-016: Undo/Redo Actions
**Priority:** P1

**Preconditions:**
- User has made changes in quote builder

**Steps:**
1. Delete a block
2. Press Cmd/Ctrl + Z
3. Press Cmd/Ctrl + Shift + Z

**Expected Result:**
- Undo restores deleted block
- Redo removes it again
- Multiple undo levels work

---

## 5. Client Portal Tests

### TC-PORTAL-001: View Quote via Public Link
**Priority:** P0

**Preconditions:**
- Quote exists with status "Sent"
- Valid access token

**Steps:**
1. Open quote link: `/q/{accessToken}`
2. Observe page content

**Expected Result:**
- Quote displays correctly
- Business branding visible
- All quote details shown
- Accept/Decline buttons visible

---

### TC-PORTAL-002: View Quote - Invalid Token
**Priority:** P0

**Preconditions:**
- None

**Steps:**
1. Navigate to `/q/invalid-token-123`

**Expected Result:**
- Error page displayed
- Message: "Quote not found or has expired"
- No sensitive data exposed

---

### TC-PORTAL-003: View Quote - Expired Quote
**Priority:** P1

**Preconditions:**
- Quote exists with expiration date in past

**Steps:**
1. Open valid quote link for expired quote

**Expected Result:**
- Quote displays
- Clear "This quote has expired" message
- Accept button disabled or hidden
- Contact info shown

---

### TC-PORTAL-004: Accept Quote with Signature
**Priority:** P0

**Preconditions:**
- Valid quote link
- Quote requires e-signature

**Steps:**
1. Open quote link
2. Click "Accept Quote"
3. Draw signature on canvas
4. Click "Accept & Sign"

**Expected Result:**
- Signature captured
- Quote status updated to "Accepted"
- Confirmation page shown
- Confirmation emails sent

---

### TC-PORTAL-005: Accept Quote with Typed Signature
**Priority:** P1

**Preconditions:**
- Valid quote link

**Steps:**
1. Open quote link
2. Click "Accept Quote"
3. Click "Type instead"
4. Type name: "John Smith"
5. Click "Accept & Sign"

**Expected Result:**
- Signature rendered in script font
- Quote accepted successfully
- Same flow as drawn signature

---

### TC-PORTAL-006: Accept Quote with Contract
**Priority:** P0

**Preconditions:**
- Quote has contract attached

**Steps:**
1. Open quote link
2. View contract (scroll through)
3. Check "I agree to terms" checkbox
4. Complete signature
5. Accept quote

**Expected Result:**
- Must view contract before accepting
- Checkbox required
- Both quote and contract signed
- Combined PDF generated

---

### TC-PORTAL-007: Accept Quote with Deposit Payment
**Priority:** P0

**Preconditions:**
- Quote requires 30% deposit
- Stripe configured

**Steps:**
1. Accept quote with signature
2. Payment form appears
3. Enter card details
4. Click "Pay $XXX"

**Expected Result:**
- Payment processed
- Quote accepted only after payment success
- Receipt sent to client
- Invoice created with deposit applied

---

### TC-PORTAL-008: Decline Quote
**Priority:** P0

**Preconditions:**
- Valid quote link

**Steps:**
1. Open quote link
2. Click "Decline"
3. Select reason: "Price too high"
4. Add optional comment
5. Submit

**Expected Result:**
- Quote status updated to "Declined"
- Reason stored in database
- Business owner notified
- Confirmation shown to client

---

### TC-PORTAL-009: Download Quote PDF
**Priority:** P1

**Preconditions:**
- Valid quote link

**Steps:**
1. Open quote link
2. Click "Download PDF"

**Expected Result:**
- PDF generated with all quote content
- PDF downloads to device
- Branding applied to PDF

---

### TC-PORTAL-010: Ask Question on Quote
**Priority:** P2

**Preconditions:**
- Valid quote link

**Steps:**
1. Open quote link
2. Click "Ask a Question"
3. Enter question text
4. Submit

**Expected Result:**
- Question recorded
- Business owner notified
- Client sees confirmation

---

### TC-PORTAL-011: Mobile Quote View
**Priority:** P0

**Preconditions:**
- Valid quote link
- Mobile device or mobile viewport

**Steps:**
1. Open quote link on mobile
2. Review all content
3. Complete acceptance flow

**Expected Result:**
- Layout responsive
- All content readable
- Signature pad works on touch
- Payment form usable

---

## 6. Invoice Tests

### TC-INVOICE-001: Create Invoice from Scratch
**Priority:** P0

**Preconditions:**
- User is logged in
- Invoices module enabled

**Steps:**
1. Navigate to Invoices
2. Click "+ New Invoice"
3. Select client
4. Add line items
5. Set due date
6. Click "Save"

**Expected Result:**
- Invoice created with "Draft" status
- Invoice number auto-generated
- Due date calculated from payment terms

---

### TC-INVOICE-002: Convert Quote to Invoice
**Priority:** P0

**Preconditions:**
- Quote exists with "Accepted" status

**Steps:**
1. Navigate to accepted quote
2. Click "Convert to Invoice"
3. Confirm conversion

**Expected Result:**
- Invoice created with quote data
- Line items copied
- Quote linked to invoice
- Quote status updated to "Converted"

---

### TC-INVOICE-003: Send Invoice to Client
**Priority:** P0

**Preconditions:**
- Invoice exists in "Draft" status

**Steps:**
1. Open invoice builder
2. Click "Send"
3. Review send modal
4. Click "Send Invoice"

**Expected Result:**
- Invoice status updated to "Sent"
- Email sent to client
- Payment link included
- Success toast shown

---

### TC-INVOICE-004: View Invoice as Client
**Priority:** P0

**Preconditions:**
- Invoice sent to client
- Valid access token

**Steps:**
1. Open invoice link: `/i/{accessToken}`

**Expected Result:**
- Invoice displays correctly
- Amount due shown prominently
- Pay button visible
- Payment history (if any) shown

---

### TC-INVOICE-005: Record Manual Payment
**Priority:** P0

**Preconditions:**
- Invoice exists with outstanding balance

**Steps:**
1. Open invoice detail page
2. Click "Record Payment"
3. Enter amount: $500
4. Select method: "Check"
5. Enter reference: "Check #1234"
6. Submit

**Expected Result:**
- Payment recorded
- Invoice balance updated
- Status updates (to Partial or Paid)
- Payment history shows new entry

---

### TC-INVOICE-006: View Overdue Invoices
**Priority:** P1

**Preconditions:**
- Invoices exist with due date in past
- Not fully paid

**Steps:**
1. Navigate to Invoices list
2. Filter by "Overdue"

**Expected Result:**
- Only overdue invoices shown
- Red badge indicates overdue status
- Days overdue displayed

---

### TC-INVOICE-007: Invoice PDF Generation
**Priority:** P1

**Preconditions:**
- Invoice exists

**Steps:**
1. Open invoice detail
2. Click "Download PDF"

**Expected Result:**
- PDF generated correctly
- All invoice data included
- Branding applied
- Payment instructions included

---

## 7. Payment Tests

### TC-PAYMENT-001: Pay Invoice with Credit Card
**Priority:** P0

**Preconditions:**
- Invoice sent to client
- Stripe connected
- Test mode enabled

**Steps:**
1. Open invoice payment link
2. Click "Pay Now"
3. Select credit card
4. Enter test card: 4242 4242 4242 4242
5. Enter expiry: 12/28
6. Enter CVV: 123
7. Click "Pay"

**Expected Result:**
- Payment processed successfully
- Invoice status updated to "Paid"
- Receipt sent to client
- Business owner notified

---

### TC-PAYMENT-002: Pay Invoice with ACH
**Priority:** P1

**Preconditions:**
- Invoice sent, ACH enabled

**Steps:**
1. Open invoice payment link
2. Select ACH bank transfer
3. Enter bank details (test account)
4. Submit payment

**Expected Result:**
- ACH payment initiated
- Status shows "Processing"
- Updates when payment clears

---

### TC-PAYMENT-003: Partial Payment
**Priority:** P1

**Preconditions:**
- Invoice with partial payment enabled
- Amount due: $1,000

**Steps:**
1. Open invoice payment link
2. Select "Partial amount"
3. Enter $500
4. Complete payment

**Expected Result:**
- $500 payment recorded
- Invoice shows $500 remaining
- Status: "Partial"
- Can pay remaining later

---

### TC-PAYMENT-004: Payment Failure - Declined Card
**Priority:** P0

**Preconditions:**
- Invoice sent

**Steps:**
1. Open invoice payment link
2. Enter declined test card: 4000 0000 0000 0002
3. Attempt payment

**Expected Result:**
- Payment fails
- Error message: "Card declined"
- User can try different card
- No payment recorded

---

### TC-PAYMENT-005: Payment Webhook Processing
**Priority:** P0

**Preconditions:**
- Payment initiated

**Steps:**
1. Process payment via Stripe
2. Stripe sends webhook
3. Observe system response

**Expected Result:**
- Webhook received and validated
- Payment record created
- Invoice status updated
- Notifications sent

---

### TC-PAYMENT-006: Deposit Payment During Quote Acceptance
**Priority:** P0

**Preconditions:**
- Quote requires deposit
- Client accepts quote

**Steps:**
1. Accept quote with signature
2. Complete deposit payment

**Expected Result:**
- Payment processed
- Quote marked accepted
- Invoice created with deposit applied
- Remaining balance calculated

---

### TC-PAYMENT-007: Payment Reminder Email
**Priority:** P1

**Preconditions:**
- Invoice due in 3 days
- Reminders enabled

**Steps:**
1. Wait for reminder schedule
2. Check client email

**Expected Result:**
- Reminder email sent
- Payment link included
- Correct amount shown
- Professional formatting

---

## 8. Client Management Tests

### TC-CLIENT-001: View Clients List
**Priority:** P0

**Preconditions:**
- User has clients

**Steps:**
1. Navigate to Clients from sidebar

**Expected Result:**
- Client list displays
- Shows name, company, email, total billed
- Search and filter available

---

### TC-CLIENT-002: Create New Client
**Priority:** P0

**Preconditions:**
- User is on clients page

**Steps:**
1. Click "+ New Client"
2. Enter name: "John Smith"
3. Enter company: "Acme Corp"
4. Enter email: "john@acme.com"
5. Enter phone: "(555) 123-4567"
6. Click "Create"

**Expected Result:**
- Client created successfully
- Appears in clients list
- Success toast shown

---

### TC-CLIENT-003: View Client Profile
**Priority:** P0

**Preconditions:**
- Client exists with quotes/invoices

**Steps:**
1. Click on client in list
2. Review profile page

**Expected Result:**
- Contact info displayed
- Stats (Total Billed, Outstanding)
- Tabs for Quotes, Invoices, Payments, Activity
- All related data shown

---

### TC-CLIENT-004: Edit Client
**Priority:** P1

**Preconditions:**
- Client exists

**Steps:**
1. Open client profile
2. Click "Edit"
3. Change phone number
4. Save

**Expected Result:**
- Changes saved
- Profile updated
- Success toast shown

---

### TC-CLIENT-005: Create Quote from Client Profile
**Priority:** P1

**Preconditions:**
- Client exists

**Steps:**
1. Open client profile
2. Click "+ New Quote for Client"

**Expected Result:**
- Quote builder opens
- Client pre-selected
- Ready to build quote

---

### TC-CLIENT-006: Search Clients
**Priority:** P1

**Preconditions:**
- Multiple clients exist

**Steps:**
1. Enter search term: "Acme"
2. Observe results

**Expected Result:**
- List filters to matching clients
- Searches name, email, company

---

## 9. Rate Card Tests

### TC-RATE-001: View Rate Cards
**Priority:** P1

**Preconditions:**
- Rate cards module enabled

**Steps:**
1. Navigate to Rate Cards from sidebar

**Expected Result:**
- Rate cards page displays
- Items grouped by category
- Can expand/collapse categories

---

### TC-RATE-002: Create Rate Card Item
**Priority:** P1

**Preconditions:**
- On rate cards page

**Steps:**
1. Click "+ Add Item"
2. Enter name: "Website Design"
3. Enter description
4. Select category: "Web Services"
5. Select unit type: "Per Project"
6. Enter price: $2,500
7. Save

**Expected Result:**
- Item created
- Appears in correct category
- Available in quote builder

---

### TC-RATE-003: Create Rate Card with Multiple Tiers
**Priority:** P1

**Preconditions:**
- On rate cards page

**Steps:**
1. Create new rate card item
2. Add tier "Standard": $2,500
3. Add tier "Rush (+50%)": $3,750
4. Save

**Expected Result:**
- Item created with multiple tiers
- Both tiers available when adding to quote

---

### TC-RATE-004: Edit Rate Card Item
**Priority:** P2

**Preconditions:**
- Rate card item exists

**Steps:**
1. Click on rate card item
2. Edit price
3. Save

**Expected Result:**
- Changes saved
- Existing quotes not affected
- New quotes use new price

---

### TC-RATE-005: Use Rate Card in Quote
**Priority:** P1

**Preconditions:**
- Rate card items exist
- In quote builder

**Steps:**
1. Find rate card in left panel
2. Drag to canvas or click to add
3. Select tier if prompted

**Expected Result:**
- Item added as line item
- Pre-filled with rate card data
- Can modify price if needed

---

## 10. Settings Tests

### TC-SETTINGS-001: Update Business Profile
**Priority:** P0

**Preconditions:**
- User logged in

**Steps:**
1. Navigate to Settings > Business Profile
2. Update business name
3. Update address
4. Save changes

**Expected Result:**
- Settings saved
- Changes reflected in documents
- Success toast shown

---

### TC-SETTINGS-002: Connect Stripe Account
**Priority:** P0

**Preconditions:**
- Stripe not connected

**Steps:**
1. Navigate to Settings > Payments
2. Click "Connect Stripe"
3. Complete Stripe OAuth flow
4. Authorize connection

**Expected Result:**
- Stripe account connected
- Status shows "Connected"
- Can accept payments

---

### TC-SETTINGS-003: Upload Logo
**Priority:** P1

**Preconditions:**
- User on branding settings

**Steps:**
1. Navigate to Settings > Branding
2. Click "Upload New" for logo
3. Select PNG file (valid size)
4. Save

**Expected Result:**
- Logo uploaded successfully
- Preview shows new logo
- Logo appears on documents

---

### TC-SETTINGS-004: Change Brand Colors
**Priority:** P1

**Preconditions:**
- On branding settings

**Steps:**
1. Click primary color picker
2. Select new color
3. Observe preview
4. Save

**Expected Result:**
- Color updated
- Preview reflects change
- Client-facing pages use new color

---

### TC-SETTINGS-005: Enable/Disable Modules
**Priority:** P1

**Preconditions:**
- On module settings

**Steps:**
1. Toggle Contracts module OFF
2. Confirm
3. Check navigation

**Expected Result:**
- Contracts hidden from navigation
- Data preserved
- Can re-enable later

---

### TC-SETTINGS-006: Configure Payment Terms
**Priority:** P1

**Preconditions:**
- On payments settings

**Steps:**
1. Change default payment terms to "Net 30"
2. Save

**Expected Result:**
- Default applied to new invoices
- Existing invoices unchanged

---

## 11. Dashboard Tests

### TC-DASH-001: View Dashboard Metrics
**Priority:** P0

**Preconditions:**
- User has quotes, invoices, payments

**Steps:**
1. Navigate to Dashboard

**Expected Result:**
- Metrics cards display:
  - Outstanding Invoices total
  - Pending Quotes count
  - Revenue this month
- Recent activity feed shows events
- Upcoming payments listed

---

### TC-DASH-002: Dashboard Stat Card Click
**Priority:** P1

**Preconditions:**
- On dashboard with data

**Steps:**
1. Click "Outstanding Invoices" card

**Expected Result:**
- Navigate to Invoices
- Filtered to show unpaid/overdue

---

### TC-DASH-003: Recent Activity Click
**Priority:** P1

**Preconditions:**
- Activity feed has items

**Steps:**
1. Click on activity item (e.g., "Quote viewed")

**Expected Result:**
- Navigate to relevant quote detail page

---

### TC-DASH-004: Dashboard Quick Actions
**Priority:** P1

**Preconditions:**
- On dashboard

**Steps:**
1. Click "+ Create Quote" quick action

**Expected Result:**
- Navigate to new quote builder

---

## 12. Responsive/Mobile Tests

### TC-MOBILE-001: Dashboard on Mobile
**Priority:** P1

**Preconditions:**
- Mobile device or viewport < 640px

**Steps:**
1. View dashboard on mobile
2. Check all elements

**Expected Result:**
- Layout adapts to single column
- All content accessible
- Navigation via hamburger menu

---

### TC-MOBILE-002: Quote Builder on Mobile
**Priority:** P1

**Preconditions:**
- Mobile viewport

**Steps:**
1. Open quote builder on mobile
2. Attempt to edit

**Expected Result:**
- Panels collapse/toggle
- Canvas scrollable
- Touch interactions work
- Can build basic quote

---

### TC-MOBILE-003: Client Portal on Mobile
**Priority:** P0

**Preconditions:**
- Mobile device

**Steps:**
1. Open quote/invoice on mobile
2. Complete acceptance/payment

**Expected Result:**
- Layout mobile-optimized
- All content readable
- Signature canvas works
- Payment form usable

---

### TC-MOBILE-004: Navigation on Tablet
**Priority:** P2

**Preconditions:**
- Tablet viewport (768px-1024px)

**Steps:**
1. Navigate application on tablet

**Expected Result:**
- Sidebar collapses to icons
- Content area adjusts
- All features accessible

---

## 13. Accessibility Tests

### TC-A11Y-001: Keyboard Navigation
**Priority:** P1

**Preconditions:**
- Keyboard only (no mouse)

**Steps:**
1. Tab through entire application
2. Check all interactive elements

**Expected Result:**
- All elements reachable via Tab
- Focus visible at all times
- Logical tab order
- Can activate with Enter/Space

---

### TC-A11Y-002: Screen Reader Compatibility
**Priority:** P1

**Preconditions:**
- Screen reader enabled

**Steps:**
1. Navigate application with screen reader
2. Check announcements

**Expected Result:**
- All content read correctly
- Form fields labeled
- Buttons announced properly
- Dynamic content announced

---

### TC-A11Y-003: Color Contrast
**Priority:** P1

**Preconditions:**
- Contrast checker tool

**Steps:**
1. Check text contrast ratios
2. Check button contrast
3. Check form field contrast

**Expected Result:**
- Normal text: 4.5:1 or higher
- Large text: 3:1 or higher
- UI components: 3:1 or higher

---

### TC-A11Y-004: Focus Indicators
**Priority:** P1

**Preconditions:**
- Keyboard navigation

**Steps:**
1. Tab through interactive elements
2. Check focus visibility

**Expected Result:**
- All elements show clear focus ring
- Focus never hidden
- Focus visible against all backgrounds

---

### TC-A11Y-005: Reduced Motion
**Priority:** P2

**Preconditions:**
- System prefers-reduced-motion enabled

**Steps:**
1. Navigate application
2. Check animations

**Expected Result:**
- Animations disabled or minimal
- Essential motion only
- No flashing content

---

## 14. Performance Tests

### TC-PERF-001: Page Load Time - Dashboard
**Priority:** P1

**Preconditions:**
- Production-like environment
- Moderate data (100 quotes, 50 invoices)

**Steps:**
1. Clear browser cache
2. Navigate to Dashboard
3. Measure LCP

**Expected Result:**
- LCP < 2.5 seconds
- FCP < 1.5 seconds
- TTI < 4 seconds

---

### TC-PERF-002: Page Load Time - Quote Builder
**Priority:** P1

**Preconditions:**
- Same as above

**Steps:**
1. Navigate to quote builder
2. Measure load time

**Expected Result:**
- Page interactive < 3 seconds
- Editor responsive immediately

---

### TC-PERF-003: Client Portal Load Time
**Priority:** P0

**Preconditions:**
- 4G network simulation

**Steps:**
1. Open client quote link
2. Measure load time

**Expected Result:**
- Page loads < 3 seconds
- Critical content visible first
- Payment form interactive quickly

---

### TC-PERF-004: PDF Generation Time
**Priority:** P1

**Preconditions:**
- Quote with 10+ line items

**Steps:**
1. Generate PDF
2. Measure time

**Expected Result:**
- PDF generated < 5 seconds
- User sees progress indicator

---

### TC-PERF-005: Large Data Handling
**Priority:** P2

**Preconditions:**
- Workspace with 1000+ quotes

**Steps:**
1. Navigate to quotes list
2. Search and filter
3. Check pagination

**Expected Result:**
- List loads with pagination
- Search responds < 500ms
- No memory issues

---

## 15. Security Tests

### TC-SEC-001: Authentication Required
**Priority:** P0

**Preconditions:**
- User not logged in

**Steps:**
1. Attempt to access `/dashboard`
2. Attempt to access `/quotes`
3. Attempt to access API routes directly

**Expected Result:**
- All protected routes redirect to login
- API returns 401 Unauthorized
- No data exposed

---

### TC-SEC-002: CSRF Protection
**Priority:** P0

**Preconditions:**
- User logged in

**Steps:**
1. Attempt form submission without CSRF token
2. Attempt API mutation without token

**Expected Result:**
- Request rejected
- 403 Forbidden returned
- Attack prevented

---

### TC-SEC-003: Rate Limiting
**Priority:** P1

**Preconditions:**
- API endpoint exists

**Steps:**
1. Send 150 requests in 1 minute to same endpoint

**Expected Result:**
- After 100 requests, rate limit applies
- 429 Too Many Requests returned
- Retry-After header included

---

### TC-SEC-004: Access Token Security
**Priority:** P0

**Preconditions:**
- Quote with access token

**Steps:**
1. Modify token slightly
2. Attempt to access quote

**Expected Result:**
- Invalid token rejected
- 404 or 401 returned
- No quote data exposed

---

### TC-SEC-005: Session Management
**Priority:** P0

**Preconditions:**
- User logged in

**Steps:**
1. Check session cookie
2. Verify HttpOnly flag
3. Verify Secure flag
4. Check expiration

**Expected Result:**
- Cookie is HttpOnly
- Cookie is Secure (production)
- Reasonable expiration (24 hours)

---

### TC-SEC-006: Input Validation - XSS Prevention
**Priority:** P0

**Preconditions:**
- User can input text

**Steps:**
1. Enter `<script>alert('xss')</script>` in quote title
2. View quote
3. View client portal

**Expected Result:**
- Script is escaped/sanitized
- No script execution
- Text displayed safely

---

### TC-SEC-007: SQL Injection Prevention
**Priority:** P0

**Preconditions:**
- Search or filter functionality

**Steps:**
1. Enter `'; DROP TABLE quotes; --` in search
2. Submit

**Expected Result:**
- Query parameterized
- No SQL injection possible
- Normal search behavior (no results)

---

### TC-SEC-008: Workspace Data Isolation
**Priority:** P0

**Preconditions:**
- Two workspaces with different users

**Steps:**
1. Log in as User A
2. Attempt to access User B's quote by ID

**Expected Result:**
- Access denied
- 404 returned (not 403 for security)
- No data leakage

---

### TC-SEC-009: File Upload Security
**Priority:** P1

**Preconditions:**
- Logo upload functionality

**Steps:**
1. Attempt to upload `.exe` file
2. Attempt to upload oversized file (>5MB)
3. Attempt to upload with malicious filename

**Expected Result:**
- Non-image files rejected
- Size limit enforced
- Filename sanitized

---

### TC-SEC-010: Payment Security
**Priority:** P0

**Preconditions:**
- Payment flow

**Steps:**
1. Verify Stripe handles card data
2. Check no card data in logs
3. Verify webhook signature validation

**Expected Result:**
- No card data stored in our system
- Sensitive data not logged
- Invalid webhooks rejected

---

## Test Execution Summary Template

| Module | Total Tests | Passed | Failed | Blocked | Not Run |
|--------|-------------|--------|--------|---------|---------|
| Authentication | 10 | | | | |
| Onboarding | 3 | | | | |
| Quote Management | 7 | | | | |
| Quote Builder | 16 | | | | |
| Client Portal | 11 | | | | |
| Invoice | 7 | | | | |
| Payment | 7 | | | | |
| Client Management | 6 | | | | |
| Rate Card | 5 | | | | |
| Settings | 6 | | | | |
| Dashboard | 4 | | | | |
| Responsive | 4 | | | | |
| Accessibility | 5 | | | | |
| Performance | 5 | | | | |
| Security | 10 | | | | |
| **TOTAL** | **96** | | | | |

---

*This Manual Test Cases document covers critical user flows and system requirements. Execute all P0 tests before each release. P1 tests should be run for feature releases.*
