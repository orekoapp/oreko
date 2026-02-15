# User Workflows & Flows

This document describes the key user workflows and their step-by-step interactions.

---

## 1. Quote-to-Invoice Conversion Flow

### Overview
The primary business workflow where a quote accepted by a client is converted into an invoice for payment.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        QUOTE-TO-INVOICE WORKFLOW                        │
└─────────────────────────────────────────────────────────────────────────┘

     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
     │  Create  │     │   Send   │     │  Client  │     │ Convert  │
     │  Quote   │────►│  Quote   │────►│ Accepts  │────►│    to    │
     │          │     │          │     │          │     │ Invoice  │
     └──────────┘     └──────────┘     └──────────┘     └──────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
     │  DRAFT   │     │   SENT   │     │ ACCEPTED │     │ INVOICE  │
     │          │     │          │     │          │     │ CREATED  │
     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                              │
                                                              ▼
                                            ┌──────────────────────────┐
                                            │ Quote shows linked       │
                                            │ invoice status badge     │
                                            └──────────────────────────┘
```

### Step-by-Step Process

#### Step 1: Create Quote
**Actor**: User (Business Owner)
**Preconditions**: Project exists, Client assigned

1. User navigates to Projects > Quotes
2. User clicks "New Quote" button
3. System opens Quote Builder
4. User fills in:
   - Customer details (auto-populated from Client)
   - Quote number (auto-generated)
   - Expiry date
   - Tax rate
   - Line items (services/products)
5. User clicks "Save as Draft"
6. System saves quote with status `DRAFT`

**Postconditions**: Quote exists in DRAFT status

#### Step 2: Send Quote
**Actor**: User
**Preconditions**: Quote in DRAFT status

1. User views Quote details
2. User clicks "Send Quote" button
3. System shows confirmation dialog:
   - Preview email
   - Confirm recipient email
4. User confirms send
5. System:
   - Updates status to `SENT`
   - Records `sentAt` timestamp
   - Sends email to client with quote link
6. UI updates to show "Sent" badge

**Postconditions**: Quote status is SENT, Client received email

#### Step 3: Client Accepts
**Actor**: Client (External)
**Preconditions**: Quote in SENT status, Not expired

1. Client receives email with quote link
2. Client clicks link to view quote in Client Portal
3. Client reviews quote details
4. Client clicks "Accept Quote" button
5. Optional: E-signature capture
6. System:
   - Updates status to `ACCEPTED`
   - Records `acceptedAt` timestamp
   - Sends notification to User
7. Client sees confirmation page

**Postconditions**: Quote status is ACCEPTED

#### Step 4: Convert to Invoice
**Actor**: User
**Preconditions**: Quote in ACCEPTED status

1. User views accepted Quote
2. User clicks "Convert to Invoice" button
3. System shows conversion dialog:
   ```
   ┌─────────────────────────────────────────┐
   │  Convert Quote to Invoice               │
   ├─────────────────────────────────────────┤
   │  Quote: #QT-103                         │
   │  Client: Local Biz                      │
   │  Amount: $2,200                         │
   │                                         │
   │  Invoice Date: [Today's Date]           │
   │  Due Date: [+30 days]                   │
   │                                         │
   │  ☐ Copy all line items                  │
   │  ☐ Send invoice immediately             │
   │                                         │
   │      [Cancel]  [Create Invoice]         │
   └─────────────────────────────────────────┘
   ```
4. User confirms settings
5. System:
   - Creates new Invoice with copied data
   - Links Invoice to Quote (`quote.invoiceId`)
   - Sets Invoice status to `PENDING`
6. User is redirected to Invoice view

**Postconditions**: Invoice created and linked to Quote

#### Step 5: Status Visibility
**Requirement**: Quote must display linked Invoice status

```
┌─────────────────────────────────────────────────────────────────┐
│  Quote #QT-103                                        [Accepted]│
├─────────────────────────────────────────────────────────────────┤
│  Client: Local Biz                                              │
│  Total: $2,200                                                  │
│  Accepted: Feb 10, 2026                                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔗 Linked Invoice: #INV-047                    [Pending] │   │
│  │    Click to view invoice                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Quote Builder Workflow

### Overview
Visual builder for creating professional quotes with live preview.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Dashboard > Quote Builder                                        [X]   │
├─────────────────────────────────────────────────────────────────────────┤
│  New Quote                                                              │
├────────────────────────────────┬────────────────────────────────────────┤
│                                │  [Payment Page] [Email] [Invoice PDF]  │
│  FORM EDITOR (60%)             │                                        │
│                                │  LIVE PREVIEW (40%)                    │
│  ┌──────────────────────────┐ │  ┌────────────────────────────────────┐│
│  │ Logo                     │ │  │                                    ││
│  │ [Upload your logo]       │ │  │  Your Business                     ││
│  └──────────────────────────┘ │  │                         $2,200.00  ││
│                                │  │  Due on Mar 15, 2026               ││
│  Quote Details    [Options ⌄] │  │                                    ││
│  ┌──────────────────────────┐ │  │  ────────────────────────────────  ││
│  │ Customer: [____________] │ │  │  Client Name                       ││
│  │ Email:    [____________] │ │  │  client@email.com                  ││
│  │                          │ │  │                                    ││
│  │ Expiry   Quote#    Tax   │ │  │  Quote Details                     ││
│  │ [____]  [QT-104]  [0%]  │ │  │  Quote #QT-104                     ││
│  └──────────────────────────┘ │  │                                    ││
│                                │  │  Service A          $1,500.00     ││
│  Items           [Templates ⌄]│  │  Service B            $700.00     ││
│  ┌──────────────────────────┐ │  │  ────────────────────────────────  ││
│  │ ITEM    RATE   QTY  AMT  │ │  │  Subtotal            $2,200.00    ││
│  │ [____] [____] [__] $____ │ │  │  Tax (0%)               $0.00     ││
│  │ [____] [____] [__] $____ │ │  │  Total               $2,200.00    ││
│  │ [+ Add Items]            │ │  │                                    ││
│  └──────────────────────────┘ │  │  [Accept Quote]                    ││
│                                │  │                                    ││
│  Terms & Conditions            │  │  Valid until Mar 15, 2026          ││
│  [_________________________]   │  └────────────────────────────────────┘│
│                                │                                        │
│  [Save Draft]  [Send Quote]    │                                        │
└────────────────────────────────┴────────────────────────────────────────┘
```

### Interaction Flow

1. **Logo Upload**
   - Click upload area
   - Select PNG/JPG (max 2MB)
   - Preview updates immediately

2. **Customer Selection**
   - Type to search existing clients
   - Select from dropdown OR
   - Create new client inline

3. **Line Items**
   - Click "+ Add Items"
   - Enter item description
   - Enter rate and quantity
   - Amount auto-calculates
   - Drag to reorder items

4. **Templates**
   - Click "Templates" dropdown
   - Select pre-defined item groups
   - Items populate automatically

5. **Preview Tabs**
   - Payment Page: Client-facing view
   - Email: Email template preview
   - Invoice PDF: Downloadable format

6. **Save/Send**
   - "Save Draft": Saves without sending
   - "Send Quote": Opens send dialog

---

## 3. Sidebar Navigation Flow

### Expanded Mode Behavior

```
User clicks nav item
        │
        ▼
┌───────────────────────────┐
│ Is it a parent item?      │
│ (has children)            │
└───────────────────────────┘
        │
   ┌────┴────┐
   │         │
  Yes        No
   │         │
   ▼         ▼
Expand/    Navigate to
collapse    page directly
submenu
```

### Collapsed Mode Behavior

```
User hovers on icon
        │
        ▼
┌───────────────────────────┐
│ Show tooltip with label   │
│ OR flyout submenu         │
└───────────────────────────┘
        │
        ▼
User clicks icon
        │
        ▼
┌───────────────────────────┐
│ Is it a parent item?      │
└───────────────────────────┘
        │
   ┌────┴────┐
   │         │
  Yes        No
   │         │
   ▼         ▼
Show       Navigate to
flyout      page
submenu
```

### Active State Rules

1. **Direct Item**: Highlight the active item
2. **Child Item**: Highlight child AND show parent as expanded
3. **Breadcrumb**: Update to show: `Dashboard > [Parent] > [Child]`

---

## 4. Data Table Interaction Flow

### Search & Filter

```
User types in search
        │
        ▼
┌───────────────────────────┐
│ Debounce 300ms            │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│ Filter data client-side   │
│ OR call API if server     │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│ Update table rows         │
│ Reset to page 1           │
└───────────────────────────┘
```

### Row Actions

| Action | Icon | Behavior |
|--------|------|----------|
| Download | ⬇ | Download PDF |
| View | 👁 | Navigate to detail page |
| More | ⋯ | Show dropdown: Edit, Duplicate, Delete |

### Bulk Selection

```
User checks "select all"
        │
        ▼
┌───────────────────────────┐
│ Select all rows on        │
│ current page              │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│ Show bulk action bar      │
│ [Delete Selected] [Export]│
└───────────────────────────┘
```

---

## 5. Analytics Date Range Flow

```
User clicks date range dropdown
        │
        ▼
┌───────────────────────────┐
│ Show preset options:      │
│ - Last 7 days             │
│ - Last 30 days            │
│ - Last 3 months           │
│ - Last 6 months           │
│ - Year to date            │
│ - Custom range...         │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│ User selects option       │
└───────────────────────────┘
        │
   ┌────┴────┐
   │         │
 Preset    Custom
   │         │
   ▼         ▼
Apply      Show date
range      picker
immediately  dialog
   │         │
   │         ▼
   │    User selects
   │    start/end dates
   │         │
   └────┬────┘
        │
        ▼
┌───────────────────────────┐
│ Refetch all analytics     │
│ data with new date range  │
└───────────────────────────┘
        │
        ▼
┌───────────────────────────┐
│ Update all charts/cards   │
│ with loading states       │
└───────────────────────────┘
```
