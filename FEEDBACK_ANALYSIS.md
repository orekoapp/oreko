# QuoteCraft Feedback Analysis & Fix Approaches

**Date:** 2026-02-04
**Source:** Fixes and Edits PDF
**Status:** Pending Implementation

---

## Summary

The feedback covers 3 main areas:
1. **Frontend Design Changes** - Application shell, theme, charts
2. **Bug Fixes** - 15 identified issues
3. **Architecture Additions** - Future features to consider

---

## 1. FRONTEND DESIGN CHANGES

### 1.1 Application Shell Redesign

**Understanding:**
- Current shell is inconsistent across the application
- Need to implement "Application Shell 10" from shadcnstudio
- Key feature: Collapsible sidebar that's accessible at any point

**Source:** https://shadcnstudio.com/blocks/dashboard-and-application/application-shell

**Approach:**
1. Fetch the Application Shell 10 component code from shadcnstudio
2. Create new `AppShell` component in `apps/web/components/layout/`
3. Replace existing sidebar/layout implementation
4. Ensure collapsible state persists in localStorage
5. Update all dashboard routes to use new shell

**Files to modify:**
- `apps/web/components/layout/` - New shell components
- `apps/web/app/(dashboard)/layout.tsx` - Integrate new shell
- `apps/web/components/ui/sidebar.tsx` - Update/replace

---

### 1.2 Theme CSS Variables Update

**Understanding:**
- New color scheme with indigo/violet primary (`rgb(100 104 240)`)
- Complete light and dark mode variables provided
- Includes sidebar-specific variables
- Custom shadow scale and font definitions

**Approach:**
1. Update `apps/web/app/globals.css` with new CSS variables
2. Update Tailwind config to reference new variables
3. Ensure all components use semantic color tokens

**New Theme Colors (Light Mode):**
```css
--primary: rgb(100 104 240);        /* Indigo */
--background: rgb(248 248 248);     /* Light gray */
--foreground: rgb(29 41 61);        /* Dark blue-gray */
--sidebar: rgb(245 245 245);        /* Muted background */
```

**Files to modify:**
- `apps/web/app/globals.css` - Replace CSS variables
- `tailwind.config.ts` - Update theme mapping

---

### 1.3 Charts Update

**Understanding:**
- Use charts from shadcnstudio for consistency
- Source: https://shadcnstudio.com/blocks/dashboard-and-application/charts-component

**Approach:**
1. Review existing chart implementations in dashboard
2. Replace with shadcnstudio chart components
3. Maintain consistent styling with new theme

---

## 2. BUG FIXES

### Fix #1: Padding Issues on List Views

**Understanding:**
- Quotes list view has incorrect padding
- Invoices list view has same issue
- Likely hardcoded values breaking at different resolutions

**Approach:**
1. Audit padding classes on list containers
2. Replace fixed padding with responsive Tailwind classes
3. Test at multiple viewport sizes

**Files to check:**
- `apps/web/app/(dashboard)/quotes/page.tsx`
- `apps/web/app/(dashboard)/invoices/page.tsx`
- Related list components

---

### Fix #2: Notification Button Non-functional

**Understanding:**
- Bell/notification icon in header doesn't respond to clicks
- No dropdown or action occurs

**Approach:**
1. Implement notification dropdown component
2. Create notifications state/context
3. Add placeholder UI even if backend not ready

**Files to modify:**
- `apps/web/components/layout/header.tsx` or equivalent
- Create `apps/web/components/notifications/` directory

---

### Fix #3: Quote/Invoice Editor Redesign (MAJOR)

**Understanding:**
- Current editor is too design-focused (drag-drop blocks)
- Should feel like data entry, not design tool
- Reference: Bloom's invoice creation flow

**Required Changes:**
1. **Layout:** Form on left, always-visible preview on right
2. **Preview Toggle:** 3 modes - Email Preview, Payment Page, Invoice PDF
3. **No popup:** Everything stays within application shell
4. **Templates:** Import templates directly in Items section
5. **Simplify:** Remove block-based canvas approach for invoices

**Approach:**
1. Create new `InvoiceEditor` component with split-pane layout
2. Left side: Form fields (Customer, Date, Invoice #, Tax Rate, Items)
3. Right side: Live preview with tab toggle (Email/Payment/PDF)
4. Items section: Add "Templates" dropdown to import rate card items
5. Keep existing quote builder for complex proposals, but add simple mode

**Files to create/modify:**
- `apps/web/components/invoices/invoice-editor.tsx` - New editor
- `apps/web/components/invoices/invoice-preview.tsx` - Preview pane
- `apps/web/components/quotes/quote-editor-simple.tsx` - Simple mode
- `apps/web/app/(dashboard)/invoices/new/page.tsx` - Use new editor

---

### Fix #4: No Client Linking in Quote Creation

**Understanding:**
- When creating a quote, there's no option to select/link a client
- Should prompt for client selection or offer to add new client

**Approach:**
1. Add client selector at the start of quote/invoice creation
2. Create `ClientSelector` component with search + "Add New" option
3. Auto-populate client details in the document

**Files to modify:**
- `apps/web/components/quotes/quote-builder.tsx`
- Create `apps/web/components/clients/client-selector.tsx`

---

### Fix #5: Theme Toggle UX

**Understanding:**
- Theme switcher is a dropdown (extra clicks)
- Should be a simple toggle (sun/moon icon)

**Approach:**
1. Replace dropdown with toggle button
2. Use `next-themes` toggle pattern
3. Single click to switch between light/dark

**Files to modify:**
- `apps/web/components/theme-toggle.tsx` or similar

---

### Fix #6: Premade Quotes 404 Error

**Understanding:**
- URL `/quotes/1` shows "Page not found"
- Individual quote view route is broken

**Approach:**
1. Check if dynamic route exists: `apps/web/app/(dashboard)/quotes/[id]/page.tsx`
2. Verify database has seeded quotes
3. Fix routing or create missing page

**Files to check:**
- `apps/web/app/(dashboard)/quotes/[id]/page.tsx`
- Database seeding scripts

---

### Fix #7: Email Server Setup (BLOCKER for Access Control Testing)

**Understanding:**
- Cannot test team invitations/access control without email
- Need SMTP configuration

**Approach:**
1. Set up development email service (Resend, SendGrid, or Mailtrap)
2. Configure SMTP environment variables
3. Implement email sending for invitations

**Files to modify:**
- `.env.example` - Add SMTP variables
- `apps/web/lib/email/` - Email service implementation

---

### Fix #8: Broken UI in Branding Settings

**Understanding:**
- Color picker UI is broken
- Should use preset themes instead of individual color pickers

**Required Changes:**
1. Replace individual color pickers with preset theme cards
2. Each preset shows color scheme preview
3. Font selection via visual cards (Public Sans, Inter, DM Sans, Nunito Sans)
4. Size slider for base font size

**Approach:**
1. Create `ThemePresets` component with 6 preset options
2. Create `FontSelector` component with visual font cards
3. Remove individual ColorPicker components
4. Add live preview of branding changes

**Files to modify:**
- `apps/web/app/(dashboard)/settings/branding/page.tsx`
- Create `apps/web/components/settings/theme-presets.tsx`
- Create `apps/web/components/settings/font-selector.tsx`

---

### Fix #9: Help Page 404

**Understanding:**
- `/help` route returns "Page not found"

**Approach:**
1. Create help page or redirect to documentation
2. If not implementing help center, remove link from navigation

**Files to create:**
- `apps/web/app/(dashboard)/help/page.tsx`

---

### Fix #10: Data Not Persistent (Quote Builder)

**Understanding:**
- Quote data lost on accidental page refresh
- Need auto-save to localStorage

**Approach:**
1. Implement `useLocalStorage` hook for quote state
2. Auto-save draft every few seconds
3. Restore from localStorage on page load
4. Clear localStorage after successful save to database
5. Show "Draft saved" indicator

**Files to modify:**
- `apps/web/components/quotes/quote-builder.tsx`
- Create `apps/web/lib/hooks/use-auto-save.ts`

---

### Fix #11: Save and Send Buttons Non-functional

**Understanding:**
- Buttons exist but no network request is sent
- No backend action occurs

**Approach:**
1. Debug onClick handlers - check if connected
2. Implement server actions for save/send
3. Add loading states and error handling
4. Ensure form validation passes before submission

**Files to check:**
- `apps/web/components/quotes/quote-builder.tsx`
- `apps/web/lib/actions/quotes.ts`

---

### Fix #12: Client Edit Page Breaks on Scroll

**Understanding:**
- `/clients/new` page UI breaks when scrolling
- Likely CSS/overflow issue

**Approach:**
1. Inspect scrolling behavior
2. Fix overflow/position issues
3. Test at multiple viewport heights

**Files to check:**
- `apps/web/app/(dashboard)/clients/new/page.tsx`
- `apps/web/components/clients/client-form.tsx`

---

### Fix #13: Missing Validation Error for Address

**Understanding:**
- Client creation fails silently if address is missing
- No error message displayed to user

**Approach:**
1. Add Zod validation for address fields
2. Display inline error message under address section
3. Show toast notification on validation failure

**Files to modify:**
- `apps/web/lib/validations/client.ts` - Add address validation
- `apps/web/components/clients/client-form.tsx` - Show errors

---

### Fix #14: (Not mentioned in PDF - skip)

---

### Fix #15: Broken Block Types in Quote Builder

**Understanding:**
- These blocks show "Unknown block type" error:
  - Service Group
  - Columns
  - Table

**Approach:**
1. Implement missing block renderers in canvas
2. Create components for each block type
3. Register in block type registry

**Files to create/modify:**
- `apps/web/components/quotes/blocks/service-group-block.tsx`
- `apps/web/components/quotes/blocks/columns-block.tsx`
- `apps/web/components/quotes/blocks/table-block.tsx`
- `apps/web/components/quotes/block-registry.ts`

---

## 3. ARCHITECTURE ADDITIONS (Future Considerations)

### 3.1 Dynamic Workflow/Flow Feature

**Understanding:**
- "Instant Booking Workflow" concept
- Steps: Client Data → Select Package → Payment Plan → Event Date → Sign Contract → Process Payment
- Steps should not be hardcoded - dynamic/configurable

**Architecture Approach:**
1. Create `Workflow` entity in database
2. `WorkflowStep` as child entity with order, type, config
3. Step types: form, selection, date-picker, signature, payment
4. Workflow engine to execute steps dynamically

**Database Schema Additions:**
```prisma
model Workflow {
  id          String         @id @default(cuid())
  name        String
  description String?
  steps       WorkflowStep[]
  createdAt   DateTime       @default(now())
}

model WorkflowStep {
  id         String   @id @default(cuid())
  workflowId String
  workflow   Workflow @relation(fields: [workflowId])
  order      Int
  type       String   // form, selection, date, signature, payment
  config     Json     // step-specific configuration
  required   Boolean  @default(true)
}
```

---

### 3.2 Contracts Feature

**Understanding:**
- Contracts will be added alongside quotes/invoices
- Similar document type with signature requirement

**Architecture Approach:**
1. Create `Contract` model similar to `Quote`
2. Share block system with quotes
3. Add signature field requirement
4. Link to projects/clients

---

### 3.3 Module Selection Screen

**Understanding:**
- As features grow, users may be overwhelmed
- Allow users to enable/disable modules
- Configurable in settings later

**Architecture Approach:**
1. Create `UserModules` or `WorkspaceModules` table
2. Store enabled modules per workspace
3. Conditionally render sidebar items
4. Add onboarding screen for initial selection

---

### 3.4 Project Hierarchy

**Understanding:**
- Current: Clients → Quotes/Invoices
- Desired: Clients → Projects → Quotes/Invoices/Contracts

**Architecture Approach:**
1. Add `Project` model
2. Update relationships:
   - Client hasMany Projects
   - Project hasMany Quotes, Invoices, Contracts
3. Add project selector in document creation
4. Update sidebar to show project context

**Database Schema Addition:**
```prisma
model Project {
  id          String     @id @default(cuid())
  name        String
  description String?
  clientId    String
  client      Client     @relation(fields: [clientId])
  quotes      Quote[]
  invoices    Invoice[]
  contracts   Contract[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

---

## PRIORITY ORDER (Recommended)

### Critical (Blocking core functionality):
1. Fix #11 - Save/Send buttons not working
2. Fix #6 - Quotes 404 error
3. Fix #10 - Data persistence (localStorage)
4. Fix #15 - Broken block types

### High (Major UX issues):
5. Fix #3 - Editor redesign (Bloom-like)
6. Fix #4 - Client linking
7. Fix #1 - Padding issues
8. 1.1 - Application Shell update

### Medium (Polish & consistency):
9. 1.2 - Theme update
10. Fix #8 - Branding presets
11. Fix #5 - Theme toggle
12. Fix #13 - Address validation error

### Low (Nice to have):
13. Fix #2 - Notification button
14. Fix #9 - Help page
15. Fix #12 - Scroll issue
16. Fix #7 - Email setup

### Future (Architecture planning):
17. 3.4 - Project hierarchy
18. 3.1 - Dynamic workflows
19. 3.2 - Contracts
20. 3.3 - Module selection

---

## NOTES

1. All fixes should be tested on both desktop and mobile viewports
2. The theme CSS variables provided should be used exactly as specified
3. The Bloom-like editor is the biggest UX change - may need wireframing first
4. Consider feature flags for gradual rollout of major changes
