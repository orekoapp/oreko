# QuoteCraft Bug Fixes Tracker

**Source:** Fixes.pdf (February 2026 User Testing)
**Status:** To Be Fixed

---

## Critical (P0) - Block Release

### BUG-001: New Invoice Page 404
- **URL:** https://quote-software-gamma.vercel.app/invoices/new
- **Expected:** Invoice creation form
- **Actual:** "Page not found" error
- **Fix:** Create `/app/(dashboard)/invoices/new/page.tsx`

### BUG-002: Save/Send Buttons Non-functional
- **Location:** Quote editor toolbar
- **Expected:** Network request to save/send quote
- **Actual:** No network request sent, no action occurs
- **Evidence:** Network tab shows no fetch on click
- **Fix:** Connect button onClick handlers to API endpoints

### BUG-003: Data Not Persistent
- **Location:** Quote editor
- **Expected:** Data saved on refresh
- **Actual:** Data vanishes on page reload
- **Fix:** Implement localStorage autosave with debounce
```typescript
// Suggested implementation
const AUTOSAVE_KEY = 'quotecraft_draft_quote'

useEffect(() => {
  const saved = localStorage.getItem(AUTOSAVE_KEY)
  if (saved) setQuoteData(JSON.parse(saved))
}, [])

useEffect(() => {
  const timeout = setTimeout(() => {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(quoteData))
  }, 1000)
  return () => clearTimeout(timeout)
}, [quoteData])
```

### BUG-004: Premade Quotes 404
- **URL:** https://quote-software-gamma.vercel.app/quotes/1
- **Expected:** View existing quote
- **Actual:** "Page not found" error
- **Fix:** Check dynamic route `[id]` and database query

### BUG-005: Broken Block Types
- **Location:** Quote builder canvas
- **Affected:** Service Group, Columns, Table blocks
- **Expected:** Block renders properly
- **Actual:** "Unknown block type: columns" error box
- **Fix:** Implement missing block renderers in block registry

---

## High (P1) - Fix This Sprint

### BUG-006: Padding Issues (Quotes List)
- **Location:** `/quotes` page
- **Issue:** Content touches edges, inconsistent spacing
- **Fix:** Apply consistent container padding
```css
/* Standardize across all list pages */
.page-container {
  @apply p-6 lg:p-8;
}
```

### BUG-007: Back Button on Error Page
- **Location:** 404 error page
- **Expected:** "Go Back" returns to previous page
- **Actual:** Button does nothing
- **Fix:**
```tsx
// Change from
<Button onClick={() => router.push('/')}>Go Back</Button>

// To
<Button onClick={() => router.back()}>Go Back</Button>
```

### BUG-008: Notification Button
- **Location:** Header
- **Expected:** Opens notifications panel
- **Actual:** No action on click
- **Fix:** Implement `NotificationsPopover` component

### BUG-009: Client Validation Error Message
- **Location:** `/clients/new`
- **Issue:** Address required but no error shown
- **Expected:** "Address is required" error message
- **Actual:** Silent failure - client not created
- **Fix:** Add Zod validation + error display
```typescript
const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    // ...
  })
})
```

### BUG-010: Help Page Broken
- **URL:** https://quote-software-gamma.vercel.app/help
- **Expected:** Help/documentation page
- **Actual:** 404 error
- **Fix:** Create `/app/(dashboard)/help/page.tsx` or redirect to docs

---

## Medium (P2) - Next Sprint

### BUG-011: Theme Dropdown → Toggle
- **Location:** Header
- **Current:** Dropdown menu to select theme
- **Requested:** Single-click toggle button
- **Fix:** Replace `DropdownMenu` with `ThemeToggle` component

### BUG-012: Client Page Scroll Break
- **URL:** https://quote-software-gamma.vercel.app/clients/new
- **Issue:** UI breaks when scrolling
- **Fix:** Check CSS `overflow` and `position: sticky` elements

### BUG-013: Branding Settings UI Broken
- **Location:** Settings → Branding
- **Issue:** Modal appears with broken layout
- **Related:** Invite Team Member dialog overlapping
- **Fix:** Review dialog/modal z-index and positioning

### BUG-014: Color Picker → Presets
- **Location:** Settings → Branding → Colors
- **Current:** Individual color pickers
- **Requested:** Pre-built theme presets (6 options)
- **Fix:** Replace with `BrandingPresets` component (see UI_COMPONENT_RECOMMENDATIONS.md)

---

## Feature Requests (From Testing)

### FEAT-001: Editor Redesign (Bloom-style)
- **Current:** Visual block builder (design-focused)
- **Requested:** Form-based split view (data-entry focused)
- **Details:** See UI_COMPONENT_RECOMMENDATIONS.md Section 4

### FEAT-002: Always-Visible Preview
- **Current:** Toggle between Edit/Preview modes
- **Requested:** Split view with preview always visible
- **Includes:** Preview format tabs (Payment Page | Email | PDF)

### FEAT-003: Client Selection on Quote Create
- **Current:** Jumps directly to editor
- **Requested:** Ask for client FIRST, then enter editor

### FEAT-004: Templates Import in Items Section
- **Current:** Separate Rate Cards panel
- **Requested:** "Templates" dropdown integrated in Items section

### FEAT-005: Keep Editor Inside App Shell
- **Current:** Unknown (Bloom uses popup)
- **Requested:** Editor should be within app shell, not popup

---

## Future Architecture Considerations

### ARCH-001: Projects Entity
- Add Project model between Client and Quote/Invoice
- Client → Projects → Quotes/Invoices/Contracts

### ARCH-002: Dynamic Workflows
- Don't hardcode step counts
- Support configurable workflow steps
- Example: Client Data → Package → Payment Plan → Date → Contract → Payment

### ARCH-003: Module Selection
- Allow users to enable/disable modules
- Reduce overwhelm for simple use cases
- Settings: Choose Quotes, Invoices, Clients, Projects, Contracts

### ARCH-004: Contracts Module
- Future feature - keep in mind for schema design
- Linked to Projects like Quotes/Invoices

---

## Testing Checklist

After fixes, verify:

- [ ] `/invoices/new` loads correctly
- [ ] Save button creates/updates quote
- [ ] Send button sends quote to client
- [ ] Page refresh preserves draft data
- [ ] `/quotes/1` loads existing quote
- [ ] Service Group block works
- [ ] Columns block works
- [ ] Table block works
- [ ] List pages have consistent padding
- [ ] Error page "Go Back" works
- [ ] Notification button shows popover
- [ ] Client form shows validation errors
- [ ] `/help` page loads
- [ ] Theme toggle works (single click)
- [ ] Client form scroll doesn't break
- [ ] Branding presets work

---

*Last Updated: February 2026*
