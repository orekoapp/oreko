# QuoteCraft UI Implementation Plan

**Date:** February 2026
**Status:** In Progress
**Last Updated:** February 6, 2026
**Sources:** BLOOM_UX_ANALYSIS.md, UI_COMPONENT_RECOMMENDATIONS.md, Fixes.pdf

---

## Executive Summary

This plan addresses the implementation of UI recommendations while resolving contradictions and avoiding paid license dependencies. Key finding: **We can implement all recommendations using existing free resources**.

### Progress Overview

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | Pending | Critical Bug Fixes |
| Phase 2 | **COMPLETED** | Layout & Navigation Overhaul |
| Phase 3 | Pending | Form-Based Quote Editor |
| Phase 4 | Pending | Polish & Validation |

---

## Part 1: Contradiction Analysis

### Contradiction #1: Block Builder vs Form-Based Editor

| Source | Recommendation |
|--------|----------------|
| BLOOM_UX_ANALYSIS.md | Keep visual block builder as QuoteCraft's differentiator |
| Fixes.pdf | "It should feel like data entry to them" (Bloom-style form) |
| UI_COMPONENT_RECOMMENDATIONS.md | Recommends form-based split-view like Bloom |

**Resolution:** **Form-based editor wins** (per Fixes.pdf explicit user feedback)

**Rationale:**
- Fixes.pdf represents actual user testing feedback from February 2026
- Users explicitly stated they want "data entry" feel, not "design tool" feel
- Bloom's market success validates the form-based approach
- The current block builder can remain as an "Advanced Editor" option for power users

**Implementation:**
- Create new form-based editor as default (`/quotes/new`)
- Keep existing block builder at `/quotes/new/builder` as "Visual Builder (Advanced)"
- Add toggle in quote editor toolbar: "Switch to Visual Builder"

---

### Contradiction #2: Application Shell 10 vs Existing Sidebar

| Source | Recommendation |
|--------|----------------|
| UI_COMPONENT_RECOMMENDATIONS.md | Use Application Shell 10 from shadcnstudio |
| Current Codebase | Already has full shadcn/ui sidebar primitives (774 lines) |

**Resolution:** **IMPLEMENTED** - Used Application Shell 01 (free) + existing sidebar primitives

**What Was Done:**
- Installed Application Shell 01 from shadcnstudio (free alternative to Shell 10)
- Created new `AppSidebar` component using sidebar.tsx primitives
- Created new `AppHeader` component with breadcrumbs, search, notifications
- Implemented `collapsible="icon"` mode for sidebar collapse to icons
- Added `SidebarProvider` pattern with cookie-based state persistence

**Files Created/Modified:**
- `apps/web/components/dashboard/app-sidebar.tsx` (new)
- `apps/web/components/dashboard/app-header.tsx` (new)
- `apps/web/app/(dashboard)/layout.tsx` (modified)
- `apps/web/components/ui/sidebar.tsx` (installed)
- `apps/web/components/ui/tooltip.tsx` (installed)
- `apps/web/hooks/use-mobile.tsx` (installed)

**Commit:** `2303b26` - feat: replace dashboard layout with shadcn sidebar application shell

---

### Contradiction #3: Theme Variables Format

| Source | Format |
|--------|--------|
| Current globals.css | HSL format: `--sidebar: 245 245 245;` |
| Fixes.pdf theme | RGB format: `--sidebar: 245 245 245;` |

**Resolution:** **Formats are compatible** - both use space-separated values

The current theme already uses the same format. We just need to update the values to match the Fixes.pdf specification.

---

## Part 2: Licensing Analysis

### shadcnstudio Pricing Structure

| Tier | Price | Includes |
|------|-------|----------|
| Free | $0 | 46 free blocks including Application Shell 01 |
| Pro | $99 | Application shells 5, 10, 18, advanced blocks |
| Team | $249 | Multi-seat, priority support |
| Enterprise | $849 | White-label, custom components |

### Final Licensing Decision

**Used:** Application Shell 01 (FREE) from shadcnstudio
- Aesthetically comparable to Application Shell 10
- Includes icon collapse mode
- Same component library for consistency
- **$0 licensing cost**

See `research/APPLICATION_SHELL_ALTERNATIVES.md` for full analysis of free alternatives.

---

## Part 3: Implementation Roadmap

### Phase 1: Critical Bug Fixes (P0) - Pending

Focus on blocking issues before UI overhaul.

#### 1.1 Missing Pages
- [ ] Create `/app/(dashboard)/invoices/new/page.tsx` (BUG-001)
- [ ] Fix `/quotes/[id]` dynamic route (BUG-004)
- [ ] Create `/app/(dashboard)/help/page.tsx` (BUG-010)

#### 1.2 Save/Send Functionality
- [ ] Connect Save button to API endpoint (BUG-002)
- [ ] Connect Send button to email action (BUG-002)
- [ ] Implement localStorage autosave with debounce (BUG-003)

#### 1.3 Block Renderers
- [ ] Implement Service Group block renderer (BUG-005)
- [ ] Implement Columns block renderer (BUG-005)
- [ ] Implement Table block renderer (BUG-005)

**Files to modify:**
- `apps/web/app/(dashboard)/invoices/new/page.tsx` (create)
- `apps/web/app/(dashboard)/quotes/[id]/page.tsx` (fix)
- `apps/web/components/quotes/builder/block-renderers/` (implement missing)
- `apps/web/lib/actions/quotes.ts` (connect save/send)

---

### Phase 2: Layout & Navigation Overhaul - COMPLETED

#### 2.1 Dashboard Layout Refactor
- [x] Create `AppSidebar` component using sidebar.tsx primitives
- [x] Create `AppHeader` component with breadcrumbs, search, notifications, user menu
- [x] Implement `SidebarProvider` pattern in dashboard layout
- [x] Add `collapsible="icon"` mode for sidebar toggle
- [x] Install Application Shell 01 demo page for reference

#### 2.2 Utility Functions
- [x] Add `formatCurrency()` function
- [x] Add `formatDate()` function
- [x] Add `formatRelativeTime()` function

#### 2.3 Components Installed
- [x] `sidebar.tsx` - Full sidebar primitives
- [x] `tooltip.tsx` - For sidebar icon tooltips
- [x] `use-mobile.tsx` - Mobile detection hook
- [x] shadcn-studio dropdown blocks (profile, language)

**Completion Date:** February 6, 2026
**Commit:** `2303b26`

---

### Phase 3: Form-Based Quote Editor - Pending

This is the major feature change based on Fixes.pdf feedback.

#### 3.1 Create New Editor Architecture

```
apps/web/app/(dashboard)/quotes/new/
├── page.tsx                    # Client selection (FEAT-003)
├── editor/
│   └── page.tsx               # Form-based editor (default)
└── builder/
    └── page.tsx               # Visual builder (advanced, existing)
```

#### 3.2 Form-Based Editor Components

Create new components for Bloom-style editing:

```
apps/web/components/quotes/editor/
├── QuoteEditor.tsx            # Main container (split-view)
├── EditorSidebar.tsx          # Form sections navigation
├── sections/
│   ├── ClientSection.tsx      # Client info form
│   ├── ItemsSection.tsx       # Line items with templates
│   ├── TermsSection.tsx       # Terms & conditions
│   ├── PaymentSection.tsx     # Payment settings
│   └── NotesSection.tsx       # Internal/client notes
├── preview/
│   ├── QuotePreview.tsx       # Live preview panel
│   └── PreviewTabs.tsx        # Payment Page | Email | PDF tabs
└── toolbar/
    └── EditorToolbar.tsx      # Save, Send, Switch to Visual Builder
```

#### 3.3 Split-View Layout

```tsx
// QuoteEditor.tsx structure
<div className="flex h-[calc(100vh-64px)]">
  {/* Left: Form Panel (50%) */}
  <div className="w-1/2 overflow-auto border-r">
    <EditorSidebar />
    <div className="p-6">
      {activeSection === 'client' && <ClientSection />}
      {activeSection === 'items' && <ItemsSection />}
      {/* ... other sections */}
    </div>
  </div>

  {/* Right: Preview Panel (50%) */}
  <div className="w-1/2 bg-muted/30">
    <PreviewTabs />
    <QuotePreview />
  </div>
</div>
```

#### 3.4 Preserve Existing Block Builder

Keep the visual builder accessible:
- Add "Switch to Visual Builder" button in EditorToolbar
- Route: `/quotes/new/builder` (existing)
- Share state between editors via Zustand store

**Files to create:**
- `apps/web/app/(dashboard)/quotes/new/page.tsx` (client selection)
- `apps/web/app/(dashboard)/quotes/new/editor/page.tsx` (form editor)
- `apps/web/components/quotes/editor/` (new directory)

**Files to modify:**
- `apps/web/stores/quote-builder-store.ts` (extend for form mode)

---

### Phase 4: Polish & Validation - Pending

#### 4.1 Form Validation
- [ ] Add Zod schema for client form (BUG-009)
- [ ] Display validation errors inline
- [ ] Add required field indicators

#### 4.2 Settings Page Fixes
- [ ] Fix branding modal layout (BUG-013)
- [ ] Implement theme presets instead of color pickers (BUG-014)
- [ ] Replace theme dropdown with toggle (BUG-011)

#### 4.3 Scroll & Layout Fixes
- [ ] Fix client page scroll issue (BUG-012)
- [ ] Review all modal z-index values
- [ ] Test responsive layouts

---

## Part 4: Technical Decisions

### Decision 1: State Management for Dual Editors

**Question:** How to share state between form-based editor and visual builder?

**Solution:** Extend existing Zustand store with mode awareness:

```typescript
// stores/quote-editor-store.ts
interface QuoteEditorState {
  mode: 'form' | 'visual';
  quoteData: QuoteData;
  activeSection: string;
  // ... existing builder state

  // Actions
  setMode: (mode: 'form' | 'visual') => void;
  updateSection: (section: string, data: any) => void;
  // ... existing actions
}
```

### Decision 2: Autosave Strategy

**Implementation:**
```typescript
// hooks/useAutosave.ts
const AUTOSAVE_KEY = 'quotecraft_draft_quote';
const DEBOUNCE_MS = 1000;

export function useAutosave(quoteData: QuoteData) {
  // Load on mount
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate and restore
    }
  }, []);

  // Save on change (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(quoteData));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [quoteData]);
}
```

### Decision 3: Preview Rendering

**Options:**
1. Real-time React component rendering (faster, less accurate)
2. Server-side PDF generation on each change (accurate, slow)
3. Hybrid: React preview + PDF on-demand

**Chosen:** Option 3 (Hybrid)
- Default preview uses React components for speed
- "Generate PDF" button for accurate preview
- Email/Payment Page tabs show respective formats

---

## Part 5: Risk Assessment

### Low Risk
- ~~Theme variable updates (CSS only)~~
- Bug fixes for missing pages
- Padding/spacing consistency

### Medium Risk
- ~~Sidebar refactor to use primitives~~ **COMPLETED**
- Notification popover implementation (new component)
- Validation error display (form changes)

### High Risk
- Form-based editor (major new feature)
- State sharing between editors (architectural change)
- Block renderer implementations (complex rendering logic)

### Mitigation Strategies

1. **Feature flag for new editor:**
   ```typescript
   const ENABLE_FORM_EDITOR = process.env.NEXT_PUBLIC_FORM_EDITOR === 'true';
   ```

2. **Parallel development:**
   - Keep existing builder 100% functional
   - New editor in separate route
   - User can switch between modes

3. **Incremental rollout:**
   - ~~Phase 1-2: Bug fixes + layout (low risk)~~ Phase 2 DONE
   - Phase 3: New editor (high risk) - behind feature flag
   - Phase 4: Polish and remove flag

---

## Part 6: File Manifest

### Files Created (Phase 2 - COMPLETED)

| Path | Purpose | Status |
|------|---------|--------|
| `apps/web/components/dashboard/app-sidebar.tsx` | New sidebar component | Done |
| `apps/web/components/dashboard/app-header.tsx` | New header component | Done |
| `apps/web/components/ui/sidebar.tsx` | Sidebar primitives | Done |
| `apps/web/components/ui/tooltip.tsx` | Tooltip component | Done |
| `apps/web/hooks/use-mobile.tsx` | Mobile detection | Done |
| `apps/web/app/application-shell-01/page.tsx` | Demo page | Done |
| `research/APPLICATION_SHELL_ALTERNATIVES.md` | Research doc | Done |

### Files to Create (Remaining)

| Path | Purpose | Phase |
|------|---------|-------|
| `apps/web/app/(dashboard)/invoices/new/page.tsx` | Invoice creation page | 1 |
| `apps/web/app/(dashboard)/help/page.tsx` | Help page | 1 |
| `apps/web/app/(dashboard)/quotes/new/page.tsx` | Client selection | 3 |
| `apps/web/app/(dashboard)/quotes/new/editor/page.tsx` | Form editor | 3 |
| `apps/web/components/quotes/editor/QuoteEditor.tsx` | Editor container | 3 |
| `apps/web/components/quotes/editor/EditorSidebar.tsx` | Form navigation | 3 |
| `apps/web/components/quotes/editor/sections/*.tsx` | Form sections | 3 |
| `apps/web/components/quotes/editor/preview/*.tsx` | Preview components | 3 |
| `apps/web/components/shared/NotificationPopover.tsx` | Notifications | 2 |
| `apps/web/hooks/useAutosave.ts` | Autosave hook | 1 |

### Files Modified (Phase 2 - COMPLETED)

| Path | Changes | Status |
|------|---------|--------|
| `apps/web/app/(dashboard)/layout.tsx` | Use SidebarProvider pattern | Done |
| `apps/web/lib/utils.ts` | Added utility functions | Done |
| `apps/web/styles/globals.css` | Updated for sidebar | Done |

### Files to Modify (Remaining)

| Path | Changes | Phase |
|------|---------|-------|
| `apps/web/app/not-found.tsx` | Fix Go Back button | 2 |
| `apps/web/stores/quote-builder-store.ts` | Add mode support | 3 |
| `apps/web/components/quotes/builder/block-renderers/*` | Fix missing blocks | 1 |

---

## Conclusion

### Feasibility: YES

All recommendations can be implemented without paid licenses:
- ~~Existing sidebar.tsx primitives replace need for Application Shell 10~~ **DONE**
- Free shadcn/ui components cover all other needs
- No contradictions that block implementation

### Key Accomplishments

1. **Application Shell:** Implemented using free Application Shell 01 + existing primitives
2. **Icon Collapse Mode:** Working correctly with `collapsible="icon"`
3. **Utility Functions:** Added formatCurrency, formatDate, formatRelativeTime

### Key Compromises

1. **Editor approach:** Form-based wins (per user feedback), but visual builder preserved as advanced option
2. **Application Shell:** Used free Application Shell 01 instead of paid Shell 10
3. **Theme format:** Keep existing HSL format (compatible with Fixes.pdf values)

### Updated Effort Estimate

| Phase | Effort | Risk | Status |
|-------|--------|------|--------|
| Phase 1: Bug Fixes | 1-2 weeks | Low | Pending |
| Phase 2: Layout | ~~1 week~~ | ~~Medium~~ | **COMPLETED** |
| Phase 3: New Editor | 2 weeks | High | Pending |
| Phase 4: Polish | 1 week | Low | Pending |
| **Remaining** | **4-5 weeks** | Medium | |

---

*Plan Created: February 2026*
*Last Updated: February 6, 2026*
