# QuoteCraft - User Flows Document

**Version:** 1.0.0
**Created:** January 30, 2026
**Based on:** PRODUCT_SPEC.md, UI_UX_SPEC.md

---

## Table of Contents

1. [Authentication Flows](#1-authentication-flows)
2. [Onboarding Flow](#2-onboarding-flow)
3. [Quote Flows](#3-quote-flows)
4. [Invoice Flows](#4-invoice-flows)
5. [Client Portal Flows](#5-client-portal-flows)
6. [Payment Flows](#6-payment-flows)
7. [Client Management Flows](#7-client-management-flows)
8. [Rate Card Flows](#8-rate-card-flows)
9. [Settings Flows](#9-settings-flows)
10. [Dashboard Flows](#10-dashboard-flows)

---

## 1. Authentication Flows

### 1.1 User Registration Flow

```
[Landing Page]
     |
     v
[Click "Get Started Free" / "Sign Up"]
     |
     v
[Registration Form]
     |-- Email (required)
     |-- Password (required, min 8 chars)
     |-- Business Name (optional)
     |
     v
[Submit Registration]
     |
     +--[Validation Error?]---> [Show Error Message] --> [Return to Form]
     |
     v
[Create Account in DB]
     |
     v
[Send Verification Email]
     |
     v
[Redirect to Dashboard]
     |
     v
[Show "Check your email" banner]
     |
     v
[User clicks verification link]
     |
     v
[Mark email verified]
     |
     v
[Show success toast: "Email verified!"]
```

**Alternate: OAuth Registration (Google)**

```
[Click "Continue with Google"]
     |
     v
[Redirect to Google OAuth]
     |
     v
[User authorizes access]
     |
     v
[Google redirects back with token]
     |
     v
[Create/link account]
     |
     v
[Redirect to Dashboard / Onboarding]
```

### 1.2 User Login Flow

```
[Login Page]
     |
     v
[Enter Email & Password]
     |
     v
[Submit Login]
     |
     +--[Invalid Credentials?]---> [Show "Invalid email or password"] --> [Return to Form]
     |
     +--[Account Locked?]---> [Show "Account locked" message]
     |
     v
[Create Session]
     |
     v
[Check onboarding status]
     |
     +--[Not completed?]---> [Redirect to Onboarding]
     |
     v
[Redirect to Dashboard]
```

### 1.3 Password Reset Flow

```
[Login Page]
     |
     v
[Click "Forgot Password?"]
     |
     v
[Forgot Password Page]
     |
     v
[Enter Email]
     |
     v
[Submit]
     |
     v
[Check if email exists]
     |-- [Always show success message for security]
     |
     v
[If exists: Send reset email with token]
     |
     v
[User clicks reset link]
     |
     v
[Validate token (not expired, not used)]
     |
     +--[Invalid Token?]---> [Show "Link expired" page] --> [Link to request new]
     |
     v
[Reset Password Page]
     |
     v
[Enter New Password (x2)]
     |
     v
[Submit]
     |
     +--[Validation Error?]---> [Show errors] --> [Return to Form]
     |
     v
[Update password in DB]
     |
     v
[Invalidate reset token]
     |
     v
[Invalidate all existing sessions]
     |
     v
[Show success message]
     |
     v
[Redirect to Login]
```

---

## 2. Onboarding Flow

### 2.1 First-Time User Onboarding

```
[Complete Registration/Login]
     |
     v
[Check: First visit?]
     |
     +--[No]---> [Dashboard]
     |
     v
[Onboarding Welcome Screen]
     |-- "Welcome to QuoteCraft!"
     |-- Brief value proposition
     |-- "Let's get started" button
     |
     v
[Step 1: Business Basics] (Required)
     |-- Business Name (pre-filled if provided at signup)
     |-- Business Email
     |-- Industry (optional dropdown)
     |
     v
[Step 2: Branding] (Optional - "Skip for now")
     |-- Logo upload
     |-- Primary brand color picker
     |
     v
[Step 3: Payment Setup] (Optional - "Skip for now")
     |-- Stripe Connect integration
     |-- "Connect Stripe Account" button
     |
     v
[Step 4: Module Selection] (Required)
     |-- Quotes (always enabled, cannot disable)
     |-- Invoices (default enabled)
     |-- Contracts (optional)
     |-- Rate Cards (optional)
     |
     v
[Step 5: Choose Template] (Required)
     |-- Display 3 professional quote templates
     |-- User selects preferred style
     |
     v
[Setup Complete!]
     |-- Celebration animation
     |-- "Create Your First Quote" CTA
     |-- "Explore Dashboard" secondary link
     |
     v
[Redirect to Dashboard or Quote Builder]
```

### 2.2 Skip Onboarding Path

```
[Any Optional Step]
     |
     v
[Click "Skip for now"]
     |
     v
[Save current progress]
     |
     v
[Continue to next step / Complete]
     |
     v
[Show reminder in Dashboard: "Complete your setup"]
```

---

## 3. Quote Flows

### 3.1 View Quotes List

```
[Dashboard / Sidebar Navigation]
     |
     v
[Click "Quotes" in navigation]
     |
     v
[Load Quotes List Page]
     |
     v
[Fetch quotes for workspace]
     |
     +--[No quotes?]---> [Show Empty State]
     |                        |
     |                        v
     |                   [+ Create Your First Quote]
     |
     v
[Display Quotes Table]
     |-- Quote # | Client | Amount | Status | Date | Actions
     |
     v
[User can:]
     |-- Search quotes
     |-- Filter by status (Draft, Sent, Accepted, Expired, Declined)
     |-- Sort by columns
     |-- Paginate (if > 10 quotes)
     |-- Click row to view details
     |-- Click "..." for actions menu
```

### 3.2 Create New Quote

```
[Quotes List Page]
     |
     v
[Click "+ New Quote"]
     |
     v
[Quote Builder Page]
     |
     v
[Initialize new quote in store]
     |-- Generate quote number
     |-- Set default dates (issue: today, expiry: +14 days)
     |-- Load default template
     |
     v
[Three-Panel Layout]
     |
     |-- LEFT PANEL: Blocks & Rate Cards
     |      |-- Draggable block types
     |      |-- Rate card items (if enabled)
     |
     |-- CENTER: Document Canvas
     |      |-- WYSIWYG visual builder
     |      |-- Drag-and-drop blocks
     |      |-- Click to edit content
     |
     |-- RIGHT PANEL: Properties & Settings
     |      |-- Client selector
     |      |-- Quote settings (dates, deposit, terms)
     |      |-- Style settings
     |
     v
[Auto-save triggers on changes (debounced 2s)]
     |
     v
[User builds quote by:]
     |-- Dragging blocks from left panel
     |-- Editing block content inline
     |-- Adjusting properties in right panel
     |
     v
[Ready to send?]
     |
     +--[No client selected]---> [Prompt to select/create client]
     |
     v
[Click "Preview"]
     |
     v
[Preview Modal - Client View]
     |-- Shows exactly what client will see
     |-- Close to return to editor
     |
     v
[Click "Send"]
     |
     v
[Send Quote Flow (3.4)]
```

### 3.3 Edit Existing Quote

```
[Quotes List Page]
     |
     v
[Click on quote row OR click "Edit" in actions]
     |
     v
[Check quote status]
     |
     +--[Status: Accepted/Declined?]---> [Show read-only view]
     |                                        |
     |                                        v
     |                                   [Option: Duplicate]
     |
     v
[Load Quote Builder]
     |
     v
[Fetch quote data from DB]
     |
     v
[Populate editor with existing data]
     |
     v
[User edits quote...]
     |
     v
[Auto-save triggers on changes]
     |
     v
[Status: If quote was "Sent", show warning]
     |-- "This quote has been sent. Editing will notify the client."
```

### 3.4 Send Quote to Client

```
[Quote Builder - Click "Send"]
     |
     v
[Validation Check]
     |
     +--[Missing client?]---> [Error: "Please select a client"]
     +--[Missing line items?]---> [Error: "Add at least one item"]
     +--[Invalid amounts?]---> [Error: "Check line item amounts"]
     |
     v
[Send Quote Modal]
     |-- To: client@email.com (editable)
     |-- Subject: Quote #1005 from [Business] (customizable)
     |-- Message: Default template (customizable)
     |-- Include: [x] Attachment PDF (optional)
     |
     v
[Click "Send Quote"]
     |
     v
[Update quote status to "Sent"]
     |
     v
[Generate PDF (background job)]
     |
     v
[Send email with quote link]
     |
     v
[Create activity log entry]
     |
     v
[Show success toast: "Quote sent to client@email.com"]
     |
     v
[Redirect to Quote Detail Page]
```

### 3.5 Quote Detail View (Internal)

```
[Quote List - Click on quote]
     |
     v
[Quote Detail Page]
     |
     v
[Display Quote Information]
     |-- Header: Quote #, Client, Status badge
     |-- Timeline: Created, Sent, Viewed, Accepted/Declined
     |-- Quote preview (read-only visual)
     |-- Activity log
     |
     v
[Available Actions based on status:]
     |
     |-- [Draft]:
     |      |-- Edit
     |      |-- Preview
     |      |-- Send
     |      |-- Delete
     |
     |-- [Sent]:
     |      |-- Copy Link
     |      |-- Resend
     |      |-- View Activity
     |      |-- Edit (with warning)
     |
     |-- [Viewed]:
     |      |-- (Same as Sent)
     |      |-- Send Reminder
     |
     |-- [Accepted]:
     |      |-- Convert to Invoice
     |      |-- View Signature
     |      |-- Download PDF
     |      |-- View Contract (if attached)
     |
     |-- [Declined]:
     |      |-- View Decline Reason
     |      |-- Duplicate (to create new)
     |
     |-- [Expired]:
     |      |-- Duplicate
     |      |-- Extend Expiration
```

### 3.6 Convert Quote to Invoice

```
[Quote Detail Page (Status: Accepted)]
     |
     v
[Click "Convert to Invoice"]
     |
     v
[Confirmation Modal]
     |-- "Create invoice from Quote #1005?"
     |-- "All line items will be copied to the invoice."
     |-- [Cancel] [Create Invoice]
     |
     v
[Click "Create Invoice"]
     |
     v
[Create invoice with quote data]
     |-- Copy line items
     |-- Link to original quote
     |-- Set invoice number
     |-- Calculate due date based on payment terms
     |
     v
[Update quote status to "Converted"]
     |
     v
[Show success toast]
     |
     v
[Redirect to Invoice Builder]
```

---

## 4. Invoice Flows

### 4.1 View Invoices List

```
[Dashboard / Sidebar Navigation]
     |
     v
[Click "Invoices" in navigation]
     |
     v
[Load Invoices List Page]
     |
     v
[Fetch invoices for workspace]
     |
     +--[No invoices?]---> [Show Empty State]
     |                          |
     |                          v
     |                     [+ Create Invoice]
     |
     v
[Display Invoices Table]
     |-- Invoice # | Client | Amount | Status | Due Date | Actions
     |
     v
[Visual indicators:]
     |-- Overdue: Red badge, sorted first by default
     |-- Partial payment: Show amount remaining
     |
     v
[User can:]
     |-- Search invoices
     |-- Filter by status (Draft, Sent, Viewed, Paid, Overdue, Partial)
     |-- Sort by columns
     |-- Paginate
     |-- Click row to view details
```

### 4.2 Create Invoice (From Scratch)

```
[Invoices List Page]
     |
     v
[Click "+ New Invoice"]
     |
     v
[Invoice Builder Page]
     |
     v
[Initialize new invoice]
     |-- Generate invoice number
     |-- Set issue date (today)
     |-- Set due date (based on default payment terms)
     |
     v
[Similar to Quote Builder]
     |-- Select/create client
     |-- Add line items
     |-- Configure payment settings
     |     |-- Payment schedule (one-time, milestones, recurring)
     |     |-- Deposit settings
     |     |-- Payment methods enabled
     |
     v
[Save as Draft OR Send]
```

### 4.3 Invoice Status Workflow

```
[Draft]
     |
     +--[Send Invoice]--> [Sent]
     |                         |
     |                         +--[Client views]--> [Viewed]
     |                         |                        |
     |                         |                        +--[Full payment]--> [Paid]
     |                         |                        |
     |                         |                        +--[Partial payment]--> [Partial]
     |                         |                        |                           |
     |                         |                        |                           +--[Remaining paid]--> [Paid]
     |                         |                        |
     |                         |                        +--[Past due date]--> [Overdue]
     |                         |                                                  |
     |                         +--[Past due date]--> [Overdue]                   +--[Payment]--> [Paid]
     |
     +--[Delete]--> [Deleted]
```

### 4.4 Send Invoice to Client

```
[Invoice Builder - Click "Send"]
     |
     v
[Validation Check]
     |
     +--[Missing client?]---> [Error: "Please select a client"]
     +--[Missing line items?]---> [Error: "Add at least one item"]
     +--[No payment method enabled?]---> [Error: "Enable at least one payment method"]
     |
     v
[Send Invoice Modal]
     |-- To: client@email.com
     |-- Subject: Invoice #INV-2026-0001 from [Business]
     |-- Message: Customizable
     |-- Attach PDF: [x]
     |
     v
[Send]
     |
     v
[Update status to "Sent"]
     |
     v
[Generate PDF]
     |
     v
[Send email with payment link]
     |
     v
[Schedule automated reminders (if enabled)]
     |
     v
[Success toast + Redirect to Invoice Detail]
```

### 4.5 Record Manual Payment

```
[Invoice Detail Page]
     |
     v
[Click "Record Payment"]
     |
     v
[Record Payment Modal]
     |-- Amount: $____ (defaults to remaining balance)
     |-- Date: [Date picker]
     |-- Method: [Cash | Check | Bank Transfer | Other]
     |-- Reference/Note: ____
     |
     v
[Submit]
     |
     v
[Create payment record]
     |
     v
[Update invoice amounts]
     |-- Total Paid: + amount
     |-- Remaining: - amount
     |
     v
[If fully paid: Update status to "Paid"]
     |
     v
[If partially paid: Update status to "Partial"]
     |
     v
[Send receipt to client (optional)]
     |
     v
[Success toast]
```

---

## 5. Client Portal Flows

### 5.1 Client Views Quote

```
[Client receives email with quote link]
     |
     v
[Client clicks link: /q/{accessToken}]
     |
     v
[Validate access token]
     |
     +--[Invalid/Expired Token?]---> [Error Page: "Quote not found"]
     |
     v
[Log "viewed" event]
     |
     v
[Update quote status to "Viewed" (if was "Sent")]
     |
     v
[Render Quote View Page]
     |-- Business branding (logo, colors)
     |-- Quote details (client info, dates)
     |-- Line items with descriptions
     |-- Totals (subtotal, tax, total)
     |-- Payment schedule (if deposits/milestones)
     |-- Expiration date warning (if near)
     |-- Contract (if attached) - must view before accepting
     |
     v
[Client Options:]
     |-- [Download PDF] --> Generate and download
     |-- [Ask a Question] --> Opens comment/question form
     |-- [Accept Quote] --> Acceptance Flow (5.2)
     |-- [Decline Quote] --> Decline Flow (5.3)
```

### 5.2 Client Accepts Quote

```
[Quote View Page - Click "Accept Quote"]
     |
     v
[Check: Contract attached?]
     |
     +--[Yes]---> [Display Contract]
     |                  |
     |                  v
     |            [Client must scroll/view]
     |                  |
     |                  v
     |            [Checkbox: "I have read and agree to the terms"]
     |                  |
     |                  +--[Not checked]---> [Accept button disabled]
     |                  |
     |                  v
     |            [Continue to signature]
     |
     v
[E-Signature Section]
     |
     +--[Draw Signature]
     |      |
     |      v
     |  [Canvas for drawing]
     |      |
     |      v
     |  [Clear] [Accept & Sign]
     |
     +--[Type Signature]
            |
            v
        [Text input]
            |
            v
        [Preview in script font]
            |
            v
        [Accept & Sign]
     |
     v
[Check: Deposit required?]
     |
     +--[Yes]---> [Payment Flow (6.1)]
     |
     v
[Capture signature data]
     |-- Signature image (data URL)
     |-- Timestamp
     |-- IP address
     |-- User agent
     |
     v
[Update quote status to "Accepted"]
     |
     v
[Create signed PDF]
     |
     v
[Trigger auto-invoice creation (if enabled)]
     |
     v
[Send confirmation emails]
     |-- To client: "Quote accepted" + signed PDF
     |-- To business owner: "Quote accepted" notification
     |
     v
[Show Confirmation Page]
     |-- "Thank you for accepting this quote!"
     |-- Next steps information
     |-- Download signed PDF link
```

### 5.3 Client Declines Quote

```
[Quote View Page - Click "Decline"]
     |
     v
[Decline Modal]
     |-- "Are you sure you want to decline this quote?"
     |-- Reason (optional textarea):
     |     |-- Price too high
     |     |-- Timeline doesn't work
     |     |-- Going with another provider
     |     |-- Project cancelled
     |     |-- Other (free text)
     |
     v
[Submit Decline]
     |
     v
[Update quote status to "Declined"]
     |
     v
[Store decline reason]
     |
     v
[Send notification to business owner]
     |-- Email: "Quote #1005 was declined"
     |-- Include reason if provided
     |
     v
[Show Confirmation to Client]
     |-- "Thank you for your response."
     |-- Contact info for questions
```

### 5.4 Client Views Invoice

```
[Client receives email with invoice link]
     |
     v
[Client clicks link: /i/{accessToken}]
     |
     v
[Validate access token]
     |
     +--[Invalid?]---> [Error Page]
     |
     v
[Log "viewed" event]
     |
     v
[Render Invoice View Page]
     |-- Business branding
     |-- Invoice details
     |-- Amount due (remaining balance)
     |-- Due date (highlighted if overdue)
     |-- Payment history (if partial payments)
     |-- Link to original quote (if converted)
     |
     v
[Client Options:]
     |-- [Download PDF]
     |-- [Pay Now] --> Payment Flow (6.1)
     |-- [View Quote] (if linked)
```

---

## 6. Payment Flows

### 6.1 Client Makes Payment (Online)

```
[Invoice View Page - Click "Pay Now"]
     |
     v
[Payment Section]
     |
     v
[Select Amount]
     |-- (*) Full amount: $X,XXX.XX
     |-- ( ) Partial amount: $[____] (if enabled)
     |
     v
[Select Payment Method]
     |
     +--[Credit/Debit Card]
     |      |
     |      v
     |  [Card Details Form]
     |      |-- Card number
     |      |-- Expiry (MM/YY)
     |      |-- CVV
     |      |-- [x] Save card for future payments (optional)
     |      |
     |      v
     |  [Processing fee displayed: 2.9% + $0.30]
     |
     +--[ACH Bank Transfer]
            |
            v
        [Bank Details Form]
            |-- Account number
            |-- Routing number
            |
            v
        [Processing fee displayed: 0.8% (max $5)]
     |
     v
[Click "Pay $X,XXX.XX"]
     |
     v
[Show loading state]
     |
     v
[Create Stripe PaymentIntent]
     |
     v
[Process payment with Stripe]
     |
     +--[Payment Failed]
     |      |
     |      v
     |  [Show error message]
     |      |-- Card declined
     |      |-- Insufficient funds
     |      |-- Invalid card
     |      |
     |      v
     |  [Return to payment form]
     |
     v
[Payment Successful]
     |
     v
[Create payment record in DB]
     |
     v
[Update invoice status]
     |
     v
[Generate receipt]
     |
     v
[Send confirmation emails]
     |-- To client: Payment receipt
     |-- To business: Payment notification
     |
     v
[Show Success Page]
     |-- "Payment successful!"
     |-- Receipt number
     |-- Download receipt PDF
```

### 6.2 Stripe Webhook Processing

```
[Stripe sends webhook: payment_intent.succeeded]
     |
     v
[Webhook endpoint: /api/webhooks/stripe]
     |
     v
[Verify webhook signature]
     |
     +--[Invalid signature]---> [Return 400]
     |
     v
[Parse event data]
     |
     v
[Find invoice by metadata]
     |
     v
[Create payment record]
     |-- Amount
     |-- Payment method
     |-- Stripe payment ID
     |-- Fee amount
     |
     v
[Update invoice amounts]
     |
     v
[Update invoice status]
     |
     v
[Send notifications]
     |
     v
[Return 200 OK]
```

### 6.3 Deposit Payment Flow

```
[Quote Acceptance with Deposit Required]
     |
     v
[After signature captured]
     |
     v
[Deposit Payment Section]
     |-- "Deposit Required: $XXX (30%)"
     |-- "Pay deposit to confirm acceptance"
     |
     v
[Payment Form (same as 6.1)]
     |
     v
[Process payment]
     |
     +--[Failed]---> [Quote status remains "Sent"]
     |                     |
     |                     v
     |               [Client can retry or cancel]
     |
     v
[Payment successful]
     |
     v
[Create deposit payment record]
     |-- Type: "Deposit"
     |-- Link to quote
     |
     v
[Update quote status to "Accepted"]
     |
     v
[Create invoice with deposit applied]
     |-- Total: $X,XXX
     |-- Deposit paid: $XXX
     |-- Remaining: $X,XXX
     |
     v
[Send confirmations]
```

### 6.4 Payment Reminder Flow

```
[Scheduled job runs daily]
     |
     v
[Query invoices with reminders enabled]
     |
     v
[For each invoice, check reminder schedule:]
     |
     +--[3 days before due date]---> [Send "Coming due" reminder]
     |
     +--[Due date]---> [Send "Due today" reminder]
     |
     +--[3 days overdue]---> [Send "Overdue" reminder]
     |
     +--[7 days overdue]---> [Send "Follow-up" reminder]
     |
     +--[14 days overdue]---> [Send "Final notice" reminder]
     |
     v
[For each reminder to send:]
     |
     v
[Check: Already sent this reminder?]
     |
     +--[Yes]---> [Skip]
     |
     v
[Check: Invoice still unpaid?]
     |
     +--[No (paid)]---> [Skip]
     |
     v
[Send reminder email]
     |
     v
[Log reminder sent]
     |
     v
[Update last reminder date]
```

---

## 7. Client Management Flows

### 7.1 View Clients List

```
[Sidebar Navigation]
     |
     v
[Click "Clients"]
     |
     v
[Load Clients List Page]
     |
     v
[Fetch clients for workspace]
     |
     +--[No clients?]---> [Show Empty State]
     |                         |
     |                         v
     |                    [+ Add Your First Client]
     |
     v
[Display Clients Table]
     |-- Name | Company | Email | Total Billed | Last Activity | Actions
     |
     v
[User can:]
     |-- Search by name, email, company
     |-- Filter (Active, Inactive, Has Outstanding)
     |-- Sort by columns
     |-- Click row to view profile
```

### 7.2 Create New Client

```
[Clients List - Click "+ New Client"]
     |
     v
[Create Client Modal/Page]
     |
     v
[Client Form]
     |-- Name* (required)
     |-- Company
     |-- Email* (required)
     |-- Phone
     |-- Address (multi-line)
     |-- Notes
     |
     v
[Submit]
     |
     +--[Validation Error]---> [Show errors] --> [Return to form]
     |
     +--[Email already exists?]---> [Warning: "Client with this email exists"]
     |                                    |
     |                                    v
     |                              [Option: Merge / Create Anyway]
     |
     v
[Create client in DB]
     |
     v
[Success toast]
     |
     v
[Redirect to Client Profile OR close modal]
```

### 7.3 View Client Profile

```
[Clients List - Click on client row]
     |
     v
[Client Profile Page]
     |
     v
[Display Client Information]
     |
     +-- Contact Info Section
     |      |-- Name, Company, Email, Phone, Address
     |      |-- [Edit] button
     |
     +-- Stats Cards
     |      |-- Total Billed
     |      |-- Outstanding Balance
     |      |-- Last Payment Date
     |
     +-- Tabs:
           |
           +-- [Quotes Tab]
           |      |-- List of all quotes for this client
           |      |-- Status badges
           |      |-- [+ New Quote for Client]
           |
           +-- [Invoices Tab]
           |      |-- List of all invoices for this client
           |      |-- Status badges
           |      |-- [+ New Invoice for Client]
           |
           +-- [Payments Tab]
           |      |-- Payment history
           |      |-- Dates, amounts, methods
           |
           +-- [Activity Tab]
                  |-- Timeline of all activity
                  |-- Quote sent, viewed, accepted
                  |-- Invoice sent, paid
                  |-- Communications
```

### 7.4 Quick Create Quote/Invoice for Client

```
[Client Profile Page]
     |
     v
[Click "+ New Quote for Client"]
     |
     v
[Open Quote Builder]
     |
     v
[Client pre-selected]
     |
     v
[Continue normal quote flow]
```

---

## 8. Rate Card Flows

### 8.1 View Rate Cards

```
[Sidebar Navigation]
     |
     v
[Click "Rate Cards"]
     |
     v
[Load Rate Cards Page]
     |
     v
[Fetch rate cards for workspace]
     |
     +--[No rate cards?]---> [Show Empty State with examples]
     |                              |
     |                              v
     |                         [+ Create Rate Card Item]
     |
     v
[Display Rate Cards grouped by category]
     |
     +-- [Web Design] (Category)
     |      |-- Website Redesign - $2,500 / project
     |      |-- Landing Page - $500 / page
     |      |-- UI/UX Audit - $150 / hour
     |
     +-- [Branding] (Category)
     |      |-- Logo Design - $1,500 / project
     |      |-- Brand Guidelines - $2,000 / project
     |
     v
[User can:]
     |-- Search rate card items
     |-- Filter by category
     |-- Drag to reorder within categories
     |-- Click item to edit
```

### 8.2 Create Rate Card Item

```
[Rate Cards Page - Click "+ Add Item"]
     |
     v
[Rate Card Item Form]
     |
     v
[Form Fields]
     |-- Item Name* (required)
     |-- Description (rich text)
     |-- Category* (select or create new)
     |-- Unit Type:
     |      |-- Hourly
     |      |-- Daily
     |      |-- Weekly
     |      |-- Monthly
     |      |-- Per Project
     |      |-- Per Item
     |
     v
[Pricing Tiers Section]
     |-- Default Tier:
     |      |-- Price: $____
     |-- [+ Add Tier] (optional)
     |      |-- Tier Name: "Rush" / "Premium" / Custom
     |      |-- Tier Price: $____
     |      |-- Tier Description: ____
     |
     v
[Save]
     |
     v
[Create rate card item in DB]
     |
     v
[Success toast]
     |
     v
[Item appears in list]
```

### 8.3 Use Rate Card in Quote Builder

```
[Quote Builder - Left Panel]
     |
     v
[Rate Cards Section]
     |
     v
[Browse or Search rate card items]
     |
     v
[User action: Drag item to canvas OR Click to add]
     |
     v
[Select Pricing Tier Modal] (if multiple tiers)
     |-- Standard: $2,500
     |-- Rush (+50%): $3,750
     |-- Select tier...
     |
     v
[Add as line item to quote]
     |-- Pre-filled: Name, Description, Price
     |-- User can modify values for this quote
     |
     v
[Line item added to document canvas]
```

---

## 9. Settings Flows

### 9.1 Business Profile Settings

```
[Settings - Business Profile]
     |
     v
[Display Current Settings]
     |-- Business Name
     |-- Email
     |-- Phone
     |-- Address
     |-- Website
     |
     v
[Edit Fields]
     |
     v
[Save Changes]
     |
     v
[Validate]
     |
     +--[Errors]---> [Show validation messages]
     |
     v
[Update in DB]
     |
     v
[Success toast: "Settings saved"]
```

### 9.2 Stripe Connect Setup

```
[Settings - Payments]
     |
     v
[Check Stripe connection status]
     |
     +--[Not Connected]
     |      |
     |      v
     |  [Display: "Connect your Stripe account to accept payments"]
     |      |
     |      v
     |  [Click "Connect Stripe"]
     |      |
     |      v
     |  [Redirect to Stripe Connect OAuth]
     |      |
     |      v
     |  [User authorizes on Stripe]
     |      |
     |      v
     |  [Stripe redirects back with auth code]
     |      |
     |      v
     |  [Exchange code for access token]
     |      |
     |      v
     |  [Store Stripe account ID]
     |      |
     |      v
     |  [Show success: "Stripe connected!"]
     |
     +--[Connected]
            |
            v
        [Display: "Connected to Stripe"]
            |-- Account ID: acct_xxxx
            |-- Status: Active
            |-- [View Stripe Dashboard]
            |-- [Disconnect] (with confirmation)
```

### 9.3 Branding Settings

```
[Settings - Branding]
     |
     v
[Logo Section]
     |-- Current logo preview
     |-- [Upload New] --> File picker (PNG, JPG, SVG, max 5MB)
     |-- [Remove]
     |
     v
[Colors Section]
     |-- Primary Color: [Color Picker] [#3B82F6]
     |-- Accent Color: [Color Picker] [#22C55E]
     |
     v
[Preview Section]
     |-- Live preview of client-facing page with branding applied
     |
     v
[Save Changes]
     |
     v
[Upload logo to storage (if changed)]
     |
     v
[Update settings in DB]
     |
     v
[Success toast]
```

### 9.4 Module Settings

```
[Settings - Modules]
     |
     v
[Display Available Modules]
     |
     +-- Quotes [Always ON - cannot disable]
     |
     +-- Invoices [Toggle: ON/OFF]
     |      |-- When disabled: Hide from navigation
     |      |-- Data preserved (not deleted)
     |
     +-- Contracts [Toggle: ON/OFF]
     |
     +-- Rate Cards [Toggle: ON/OFF]
     |
     v
[Toggle a module]
     |
     v
[Confirmation if disabling]
     |-- "Disable Invoices module?"
     |-- "Your invoice data will be preserved."
     |
     v
[Update module settings]
     |
     v
[Refresh navigation to show/hide module]
```

---

## 10. Dashboard Flows

### 10.1 View Dashboard

```
[Login OR Sidebar - Click Dashboard]
     |
     v
[Load Dashboard Page]
     |
     v
[Fetch Dashboard Data (parallel)]
     |-- Outstanding invoices total
     |-- Pending quotes count & total
     |-- Revenue this month
     |-- Recent activity
     |-- Upcoming payments
     |
     v
[Display Dashboard]
     |
     +-- Greeting Section
     |      |-- "Good morning, Claire"
     |      |-- Date
     |      |-- [+ New Quote] CTA
     |
     +-- Stats Cards Row
     |      |-- Outstanding Invoices: $X,XXX
     |      |-- Pending Quotes: X ($X,XXX)
     |      |-- Revenue This Month: $X,XXX (+X%)
     |
     +-- Two-Column Layout
     |      |
     |      +-- Recent Activity Feed
     |      |      |-- Quote #1005 was viewed - 2h ago
     |      |      |-- Invoice #2001 was paid - 5h ago
     |      |      |-- Quote #1003 expires tomorrow
     |      |      |-- [View All Activity]
     |      |
     |      +-- Quick Actions
     |             |-- [+ Create Quote]
     |             |-- [+ Create Invoice]
     |             |-- [-> Send Reminders] (if overdue invoices)
     |
     +-- Upcoming Payments Table
            |-- Invoice # | Client | Amount | Due Date
            |-- Sorted by due date
            |-- Overdue items highlighted in red
```

### 10.2 Dashboard Click-Through Actions

```
[Dashboard - Click on Stat Card]
     |
     +--[Outstanding Invoices]---> [Invoices List filtered by "Unpaid + Overdue"]
     |
     +--[Pending Quotes]---> [Quotes List filtered by "Sent"]
     |
     +--[Revenue This Month]---> [Payments List for current month]

[Dashboard - Click on Activity Item]
     |
     +--[Quote viewed]---> [Quote Detail Page]
     |
     +--[Invoice paid]---> [Invoice Detail Page]
     |
     +--[Quote expires]---> [Quote Detail Page]

[Dashboard - Click on Upcoming Payment]
     |
     v
[Invoice Detail Page]
```

---

## Appendix: Error Handling Patterns

### Global Error Handling

```
[Any API Error]
     |
     v
[Check Error Type]
     |
     +--[401 Unauthorized]---> [Redirect to Login]
     |
     +--[403 Forbidden]---> [Show "Access Denied" message]
     |
     +--[404 Not Found]---> [Show "Not Found" page]
     |
     +--[422 Validation Error]---> [Show field-level errors]
     |
     +--[429 Rate Limited]---> [Show "Too many requests" toast]
     |
     +--[500 Server Error]---> [Show "Something went wrong" toast]
                                    |
                                    v
                              [Log to error tracking (Sentry)]
                                    |
                                    v
                              [Offer "Try Again" button]
```

### Form Submission Pattern

```
[User submits form]
     |
     v
[Disable submit button]
     |
     v
[Show loading indicator]
     |
     v
[Client-side validation]
     |
     +--[Invalid]---> [Show errors] --> [Re-enable button]
     |
     v
[Submit to server]
     |
     +--[Server validation error]---> [Show errors] --> [Re-enable button]
     |
     +--[Network error]---> [Show "Connection error" toast] --> [Re-enable button]
     |
     v
[Success]
     |
     v
[Show success feedback]
     |
     v
[Navigate to next step / Close modal]
```

---

*This User Flows document serves as a comprehensive reference for all user interactions in QuoteCraft. Implementation should follow these flows to ensure consistent user experience.*
