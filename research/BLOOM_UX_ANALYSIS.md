# Bloom Invoice Creation Flow Analysis & Oreko Suggestions

**Date:** February 2026
**Analyst:** UI/UX Research
**Objective:** Study Bloom's invoice creation flow and compare with actual Oreko implementation
**Method:** Hands-on testing of both Bloom (app.bloom.io) and Oreko (oreko-gamma.vercel.app)

---

## 1. Executive Summary

This document analyzes Bloom's invoice creation workflow and compares it with Oreko's **actual implementation** (not just specs). Both applications were tested hands-on to provide accurate comparisons.

**Key Finding:** Oreko has already implemented several patterns similar to Bloom (client selection before editor, rate card integration) while maintaining its visual block builder advantage. The main gap is the lack of split-view preview - Oreko uses toggle-based preview rather than always-visible preview.

---

## 2. Bloom Invoice Creation Flow Analysis

### 2.1 Flow Overview

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│  Click "New     │ -> │  Select Project      │ -> │  Invoice Editor     │
│  Invoice"       │    │  (New or Existing)   │    │  (Split View)       │
└─────────────────┘    └──────────────────────┘    └─────────────────────┘
```

### 2.2 Step 1: Project Selection Dialog

**What Bloom Does:**
- Modal dialog appears immediately after clicking "New Invoice"
- Two options: "New project" or "Existing project"
- Existing project shows searchable dropdown with contact info
- Pre-fills recipient from project contact

**Pros:**
- Forces organization (every invoice belongs to a project)
- Auto-fills client info, reducing data entry
- Clean, focused decision point

**Cons:**
- Extra step for quick one-off invoices
- Rigid project structure may not suit all workflows

### 2.3 Step 2: Invoice Editor (Split-View)

**Layout:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Invoice Details (Left)          │  Live Preview (Right)         │
├──────────────────────────────────┼───────────────────────────────┤
│  - Customer (pre-filled)         │  ┌───────────────────────┐    │
│  - Due Date (date picker)        │  │  [Brand Logo]         │    │
│  - Invoice Number (auto)         │  │  Invoice #0004        │    │
│  - Tax Rate (dropdown)           │  │                       │    │
│  - Add Enhancements              │  │  [Line Items...]      │    │
├──────────────────────────────────┤  │                       │    │
│  Items Section                   │  │  Total: ₹0.00         │    │
│  - Templates button              │  │                       │    │
│  - Add items (with dropdown)     │  │  "Thank you for..."   │    │
├──────────────────────────────────┤  └───────────────────────┘    │
│  Payment Settings                │                               │
├──────────────────────────────────┤  [Payment Page]               │
│  Memo Section                    │  [Email Preview]              │
│  "Thank you for your business!"  │  [Invoice PDF]                │
├──────────────────────────────────┤                               │
│  [Create] [Save Draft]           │                               │
└──────────────────────────────────┴───────────────────────────────┘
```

### 2.4 Line Item Templates (Key Feature)

**Bloom's Pre-built Service Categories:**
- New item (custom)
- Project Fee
- Web Design & Development
- Virtual Assistant Services
- Travel Fees
- Studio/Office Space Rental
- Studio Time
- Software Development
- Social Media Management
- SEO
- Consulting/Coaching Session
- Production Time
- Processing Fee
- Photography
- Marketing Consulting
- Hourly rate
- Graphic Design
- Editing & Proofreading
- Content Writing

**Implementation:**
- Dropdown menu appears when clicking "Add items"
- Search box at top for filtering
- One-click adds item with default description
- Rate and quantity editable after adding

### 2.5 Preview Options

Bloom provides three preview modes:
1. **Payment Page** - What client sees when paying
2. **Email Preview** - Email notification preview
3. **Invoice PDF** - Generated PDF document

### 2.6 Additional Observations

| Feature | Bloom Implementation |
|---------|---------------------|
| **Dark Theme** | Full dark mode UI |
| **Auto-numbering** | Sequential invoice numbers |
| **Tax Defaults** | Dropdown with "18% - Default" + "Set Custom Rate" |
| **Memo** | Pre-filled "Thank you for your business!" |
| **Draft Support** | "Save Draft" alongside "Create" |
| **Workflow Integration** | Projects have stages (Booking → Fulfillment → Followup) |
| **In-App Messaging** | Chat with client within project view |
| **Activity Log** | Timeline of all project activities |

---

## 3. Actual Oreko UI Analysis (Hands-On Testing)

**Tested URL:** https://oreko-gamma.vercel.app/login
**Login Method:** Demo login (no sign-up required)

### 3.1 Quote Creation Flow

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│  Click "New     │ -> │  Select Client       │ -> │  Visual Builder     │
│  Quote"         │    │  (Modal Dialog)      │    │  (Multi-Panel)      │
└─────────────────┘    └──────────────────────┘    └─────────────────────┘
```

**Client Selection Step:**
- Modal appears immediately after clicking "New Quote"
- Shows list of existing clients with search
- "Continue to Builder" button after selection
- Similar to Bloom's project selection (good pattern)

### 3.2 Visual Builder Layout (Four-Panel)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  [Toolbar: Back | Panel Toggles | Undo/Redo | Title | Zoom | Edit/Preview |   │
│            Save | Export | Send]                                               │
├──────────┬────────────────┬────────────────────────────────┬──────────────────┤
│          │                │                                │                  │
│  NAV     │  BLOCKS        │  CANVAS                        │  PROPERTIES      │
│          │                │                                │                  │
│ Dashboard│  CONTENT       │  ┌─────────────────────────┐   │  Select a block  │
│ Quotes   │  • Header      │  │ Untitled Quote          │   │  to edit         │
│ Invoices │  • Text        │  │ Quote #DRAFT            │   │                  │
│ Clients  │  • Image       │  │ Issue Date: 2/6/2026    │   │  When selected:  │
│ Rate     │                │  │                         │   │  - Text field    │
│  Cards   │  SERVICES      │  │ Project Proposal        │   │  - Heading Level │
│ Templates│  • Service Item│  │                         │   │  - Alignment     │
│ Settings │  • Service Grp │  │ Thank you for...        │   │                  │
│          │                │  │                         │   │                  │
│          │  LAYOUT        │  │ Services                │   │                  │
│          │  • Divider     │  │                         │   │                  │
│          │  • Spacer      │  └─────────────────────────┘   │                  │
│          │  • Columns     │                                │                  │
│          │  • Table       │                                │                  │
│          │                │                                │                  │
│          │  INTERACTIVE   │                                │                  │
│          │  • Signature   │                                │                  │
└──────────┴────────────────┴────────────────────────────────┴──────────────────┘
```

### 3.3 Rate Cards Panel (Toggleable)

Clicking "Show rate cards" reveals an integrated panel:

```
┌─────────────────────────────────────┐
│  Rate Cards                         │
│  Click or drag to add               │
├─────────────────────────────────────┤
│  🔍 Search...                       │
├─────────────────────────────────────┤
│  ▼ Design Services                  │
│    ├─ Brand Identity      $125/hr   │
│    ├─ Logo Design Package $2,500    │
│    │                      Fixed     │
│    ├─ UI/UX Design        $150/hr   │
│    └─ Web Development     $175/hr   │
└─────────────────────────────────────┘
```

**Key Features:**
- Search functionality
- Categorized services with collapsible groups
- Shows pricing type (hourly vs. fixed)
- "Click or drag to add" interaction
- Better than Bloom's simple dropdown

### 3.4 Edit/Preview Toggle

- **Single button toggle** between Edit and Preview modes
- Edit mode: Shows block controls, selection handles, editable fields
- Preview mode: Clean document view without edit controls
- **NOT split-view** like Bloom - one mode at a time

### 3.5 Toolbar Features

| Element | Functionality |
|---------|--------------|
| Back button | Return to quotes list |
| Panel toggles | Hide/show Blocks, Rate Cards, Properties panels |
| Undo/Redo | Standard edit history |
| Document title | "Untitled Quote (unsaved)" - editable |
| Zoom | 100% with +/- controls |
| Edit/Preview | Toggle between editing and preview |
| Save | Save draft |
| Export | Export options (likely PDF) |
| Send | Send to client |

### 3.6 Block Types Available

| Category | Blocks | Purpose |
|----------|--------|---------|
| **Content** | Header, Text, Image | Document structure |
| **Services** | Service Item, Service Group | Line items with pricing |
| **Layout** | Divider, Spacer, Columns, Table | Visual organization |
| **Interactive** | Signature | E-signature capture |

### 3.7 Properties Panel

When a block is selected, shows context-sensitive settings:

**Header Block:**
- Text input field
- Heading Level dropdown (H1 Large, H2, H3...)
- Alignment buttons (Left, Center, Right)

### 3.8 What Oreko Does Well

1. ✅ **Client selection before editor** - Similar to Bloom's project pattern
2. ✅ **Rate Cards integration** - Better organized than Bloom's templates
3. ✅ **Visual block builder** - More flexible than Bloom's form-based approach
4. ✅ **Drag-and-drop** - Full control over document layout
5. ✅ **Signature block** - Built-in e-signature support
6. ✅ **Panel flexibility** - Hide/show panels as needed
7. ✅ **Search in rate cards** - Quick access to services

### 3.9 Gaps Compared to Bloom

1. ❌ **No always-visible preview** - Must toggle between edit/preview
2. ❌ **No preview format options** - Can't see Email/PDF/Portal views
3. ❌ **No "Recently Used" rate cards** - Would speed up repeat work
4. ⚠️ **Rate card click interaction unclear** - "Click or drag" but click didn't add item in testing

---

## 4. Updated Comparison: Bloom vs. Oreko (Actual)

### 4.1 Architecture Comparison

| Aspect | Bloom | Oreko (Actual) |
|--------|-------|---------------------|
| **Editor Type** | Form-based split view | Visual block builder (multi-panel) |
| **Document Model** | Project-centric | Client-centric (selection required) |
| **Line Items** | Template dropdown | Rate Card panel with categories + search |
| **Preview** | Side panel (always visible) | Toggle-based (Edit/Preview button) |
| **Customization** | Limited styling | Full block-based customization |
| **Flexibility** | Structured form flow | Flexible drag-and-drop blocks |
| **E-Signature** | Available | Built-in Signature block |
| **Rate Card UX** | Flat dropdown list | Categorized panel with search |

### 4.2 Oreko Strengths (Confirmed)

1. **Visual Block Builder** ✅
   - More creative freedom than Bloom's form
   - Drag-and-drop reordering works well
   - Better for complex proposals with custom layouts

2. **Rate Card System** ✅
   - Better organized than Bloom's templates (categories, search)
   - Integrated panel in builder
   - Shows pricing types (hourly/fixed)

3. **Open Source / Self-Hosted** ✅
   - No vendor lock-in
   - Data ownership
   - Customizable

4. **Panel Flexibility** ✅
   - Can show/hide Blocks, Rate Cards, Properties panels
   - Adapts to user preference

### 4.3 Bloom Strengths Oreko Should Adopt

1. **Always-Visible Preview (Split-View)**
   - Bloom: Preview always shown alongside form
   - Oreko: Toggle between Edit/Preview modes
   - **Recommendation:** Add optional split-view mode

2. **Real-Time Preview Updates**
   - Bloom: Changes reflect instantly in preview panel
   - Oreko: Must click Preview button to see result
   - **Recommendation:** Real-time preview in split mode

3. **Preview Format Options**
   - Bloom: Can preview as Payment Page, Email, PDF
   - Oreko: Single preview view
   - **Recommendation:** Add format toggle

4. **Recently Used Rate Cards**
   - Bloom: N/A (flat list)
   - Oreko: Has categories but no "Recent" section
   - **Recommendation:** Add "Recently Used" section at top of Rate Cards panel

---

## 5. Updated Recommendations for Oreko

Based on hands-on testing of both applications, here are prioritized recommendations:

### 5.1 High Priority (Implement Next)

#### 5.1.1 Split-View Preview Mode (NEW)

**Current:** Toggle-based Edit/Preview modes
**Issue:** Users must switch modes to see how document looks
**Suggested:** Add optional split-view mode

```
┌──────────────────────────────────────────────────────────┐
│  [Edit Mode]  [Split Mode]  [Preview Mode]               │
├──────────────────────────────────────────────────────────┤
│  Edit: Current block-based editor                        │
│  Split: Editor on left, live preview on right            │
│  Preview: Full-width preview (current behavior)          │
└──────────────────────────────────────────────────────────┘
```

**Benefit:** Real-time feedback while editing (like Bloom)

#### 5.1.2 Fix Rate Card Click-to-Add (BUG)

**Current:** "Click or drag to add" but clicking didn't add in testing
**Issue:** UX promise not fulfilled
**Suggested:** Ensure single-click adds item to end of Services section

**Benefit:** Reduces friction, fulfills user expectation

#### 5.1.3 Recently Used Rate Cards

**Current:** Categories + search only
**Suggested:** Add "Recently Used" section at top

```
┌─────────────────────────────────────┐
│  Rate Cards                         │
├─────────────────────────────────────┤
│  🕐 Recently Used                   │
│    ├─ UI/UX Design        $150/hr   │
│    └─ Logo Design Package $2,500    │
├─────────────────────────────────────┤
│  ▼ Design Services                  │
│    ...                              │
└─────────────────────────────────────┘
```

**Benefit:** Speed up repeat work

#### 5.1.4 Preview Format Toggle

**Current:** Single preview view
**Suggested:** Add format selector when in Preview mode

```
PREVIEW AS:
[Client Portal] [Email] [PDF Download]
```

**Benefit:** See exactly what client receives

### 5.2 Medium Priority (Post-MVP)

#### 5.2.1 Optional Project/Lead Association

Don't make projects mandatory (unlike Bloom), but allow optional linking:

```
┌─────────────────────────────────────────┐
│  Project (Optional)                     │
│  [Select or create project...]        v │
└─────────────────────────────────────────┘
```

**Benefits:**
- Organizes related quotes/invoices
- Enables activity timeline
- Prepares for future CRM features

#### 5.2.2 Activity Timeline

For quotes/invoices linked to projects:

```
ACTIVITY
─────────────────────────────────
Feb 6  Quote created
Feb 7  Quote sent to client
Feb 8  Client viewed quote
Feb 10 Quote accepted
Feb 10 Invoice generated
Feb 15 Payment received ($810)
```

#### 5.2.3 Dark Mode Toggle

Oreko has theme toggle in header (observed during testing). Ensure:
- System preference detection
- Persists across sessions
- Apply to both app UI and document preview

### 5.3 Low Priority (v1.2+)

#### 5.3.1 Workflow Templates

Pre-built workflow stages for different business types:

**Photography:**
Booking → Shoot → Editing → Delivery → Payment

**Web Development:**
Discovery → Design → Development → Testing → Launch → Support

#### 5.3.2 In-Context Client Messaging

Allow users to message clients within the quote/invoice context:
- Message history attached to document
- Email integration
- Notes for internal use

---

## 6. UX Pattern Observations

### 6.1 Creation Flow Analysis

**Oreko Actual Flow (Good!):**
```
Dashboard → Click "New Quote" → Client Selection Modal → Visual Builder
```

**Suggested Optimized Flow:**
```
Dashboard → Click "New Quote" → Quick Setup Modal → Pre-filled Editor
```

**Quick Setup Modal:**
```
┌──────────────────────────────────────────────────────┐
│  Create New Quote                                     │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Client *                                            │
│  [Search or create client...]                      v │
│                                                       │
│  Template (Optional)                                 │
│  [Blank]  [Last Used]  [From Rate Card]              │
│                                                       │
│  ─────────────────────────────────────────────────── │
│                                                       │
│  [ ] Copy line items from: [Select previous quote v] │
│                                                       │
│                        [Cancel]  [Create Quote]      │
└──────────────────────────────────────────────────────┘
```

### 6.2 Tax Configuration UX

Bloom's approach is clean - Oreko should adopt similar:

```
Tax Rate
┌──────────────────────────────────────┐
│  18% - Default                     v │
├──────────────────────────────────────┤
│  18% - Default                       │
│  GST (18%)                           │
│  No Tax (0%)                         │
│  ─────────────────────────────       │
│  Set Custom Rate...                  │
└──────────────────────────────────────┘
```

### 6.3 Draft vs Published States

Oreko shows "(unsaved)" / "Quote #DRAFT" - could be clearer:

```
DRAFT STATE:                    READY TO SEND:
┌─────────────────────┐        ┌─────────────────────┐
│  Quote #1005        │        │  Quote #1005        │
│  [DRAFT]            │   vs   │  [READY]            │
│  ───────────────    │        │  ───────────────    │
│  [Save] [Preview]   │        │  [Save] [Send →]    │
└─────────────────────┘        └─────────────────────┘
```

### 6.4 Empty State (Observed)

Oreko pre-fills template content, which is good. For completely empty quotes, consider:

```
┌──────────────────────────────────────────────────────┐
│                                                       │
│             [Icon: clipboard with sparkles]           │
│                                                       │
│             Add your first line item                  │
│                                                       │
│    Drag a block from the left panel or click below   │
│                                                       │
│  [+ Add Custom Item]  [+ Add from Rate Card]         │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 7. Technical Implementation Notes

### 7.1 Recently Used Rate Cards

```typescript
// Suggested API for quick-add dropdown
interface QuickAddItem {
  id: string;
  name: string;
  description?: string;
  defaultRate: number;
  category: string;
  lastUsed?: Date;
}

// Fetch recent + categorized items
const { recent, byCategory } = useQuickAddItems();
```

### 7.2 Split-View Preview Mode

```typescript
type PreviewMode = 'edit' | 'split' | 'preview';
type PreviewFormat = 'portal' | 'email' | 'pdf';

interface EditorState {
  mode: PreviewMode;
  format: PreviewFormat;
  // ...
}
```

### 7.3 Default Values Configuration

```typescript
// Settings schema addition
interface InvoiceDefaults {
  dueDateDays: number; // e.g., 30
  defaultTaxRate: string; // e.g., "18%"
  defaultMemo: string; // e.g., "Thank you for your business!"
  autoNumberFormat: string; // e.g., "INV-{YYYY}-{####}"
}
```

---

## 8. Summary: What to Adopt vs. What to Keep Unique

### Already Implemented (Oreko) ✅
| Feature | Status |
|---------|--------|
| Visual block builder | ✅ Working well |
| Rate Card panel with categories | ✅ Better than Bloom |
| Client selection before editor | ✅ Similar to Bloom's project selection |
| Theme toggle | ✅ Present in header |
| Panel flexibility | ✅ Hide/show panels |
| Drag-and-drop blocks | ✅ Core functionality |

### Adopt from Bloom (Priority):
| Feature | Adaptation for Oreko | Priority |
|---------|--------------------------|----------|
| Split-view preview | Add as optional mode | High |
| Real-time preview | Auto-update in split mode | High |
| Preview format toggle | Add portal/email/PDF views | High |
| Recently Used section | Add to Rate Cards panel | Medium |
| Fix click-to-add | Debug rate card click | High (Bug) |

### Keep Oreko Unique:
| Feature | Why It Matters |
|---------|---------------|
| Visual block builder | Core differentiator, more flexible than Bloom |
| Rate Card categories + search | Better organized than Bloom's flat dropdown |
| Modular workspace | Users customize panel layout |
| Open source | No vendor lock-in |
| Self-hosted option | Data ownership |

### Don't Adopt:
| Bloom Feature | Why Not |
|--------------|---------|
| Mandatory projects | Oreko's client selection is sufficient |
| Fixed form layout | Would lose visual builder advantage |
| Dark-only theme | Oreko already has theme toggle |

---

## 9. Revised Next Steps

Based on hands-on testing, here's the updated priority:

1. **Immediate (Bug Fix):** Fix Rate Card click-to-add functionality
2. **Sprint 1:** Add "Recently Used" section to Rate Cards panel
3. **Sprint 2:** Implement split-view preview mode
4. **Sprint 3:** Add preview format toggle (Portal/Email/PDF)
5. **Sprint 4:** Real-time preview updates in split mode
6. **Post-MVP:** Optional project/lead association

---

## Appendix A: Bloom Screenshots Reference

Due to dark theme rendering, visual screenshots were not captured clearly. Key UI elements documented via accessibility tree analysis.

**Invoice List Page:**
- Tabs: Quotes | Invoices
- Columns: Contact, Invoice #, Project/Lead, Due, Total, Status
- Actions: New Invoice button, search, filters

**Invoice Editor Dialog:**
- Two-column layout (form | preview)
- Collapsible sections
- Real-time preview updates
- Multiple action buttons (Create, Save Draft, Preview options)

---

## Appendix B: Oreko UI Testing Notes

**Testing URL:** https://oreko-gamma.vercel.app/login
**Login Method:** Demo button (no sign-up required)
**Testing Date:** February 2026

**Dashboard:**
- Stats cards showing quotes, invoices, revenue metrics
- Quick action buttons
- Clean, modern design

**Quote Builder (Multi-Panel):**
- Left sidebar: Main navigation
- Blocks panel: Categorized block types
- Rate Cards panel: Toggleable, with search and categories
- Canvas: Document preview with editable blocks
- Properties panel: Context-sensitive settings
- Toolbar: Edit/Preview toggle, Save, Export, Send

**Key Observations:**
1. Client selection is mandatory before entering builder (good pattern)
2. Rate Cards panel has better organization than Bloom's dropdown
3. Edit/Preview is toggle-based, not split-view
4. Blocks use drag-to-add interaction
5. "Click or drag to add" for rate cards - click didn't work in testing

**Screenshot Captured:**
- Builder interface showing all four panels with rate cards visible

---

*Document prepared for Oreko product team. February 2026.*
*Updated with hands-on testing of both Bloom and Oreko.*
