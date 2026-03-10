# QuoteCraft - Design Patterns

> Recovered from codebase analysis (Phase 2.5 Fit-Quality Assessment)
> Date: 2026-02-24

---

## 1. Design System Foundation

### Technology Stack
- **Component Library:** Shadcn UI (38 primitives registered)
- **Underlying Primitives:** Radix UI (accessible headless components)
- **Styling:** Tailwind CSS v3.4+ with CSS custom properties for theming
- **Color Space:** OKLCH (perceptually uniform, modern)
- **Variant System:** CVA (class-variance-authority) for component variants
- **Icons:** Lucide React
- **Animation:** tailwindcss-animate plugin + custom keyframes

### Configuration Files
- `apps/web/tailwind.config.ts` -- Tailwind theme extensions, color mappings, shadows, animations
- `apps/web/styles/globals.css` -- CSS custom properties, base styles, gradient utilities, sidebar styles
- `components/providers/theme-provider.tsx` -- next-themes ThemeProvider wrapper

---

## 2. Color System

### Architecture
All colors use a two-layer token system:
1. **Palette layer** -- Raw OKLCH color scales (`--base-50` through `--base-1000`, `--primary-50` through `--primary-1000`)
2. **Semantic layer** -- Purpose-driven aliases (`--background`, `--foreground`, `--primary`, etc.) that reference the palette

This separation allows the palette to be swapped (via StyleGlide or branding settings) without touching component code.

### Light/Dark Mode
- Dark mode uses the `class` strategy (`.dark` class on root element)
- Managed by `next-themes` with system preference detection
- Every semantic token has explicit light and dark definitions in `globals.css`
- Destructive, success, and warning colors are standalone OKLCH values (same in both themes)

### Semantic Token Map

| Token | Light | Dark |
|-------|-------|------|
| `background` | base-50 | base-950 |
| `foreground` | base-950 | base-50 |
| `card` | base-50 | base-900 |
| `primary` | primary-600 | primary-500 |
| `secondary` | base-100 | base-800 |
| `muted` | base-100 | base-800 |
| `accent` | primary-100 | primary-900 |
| `border` | base-200 | base-800 |
| `ring` | primary-500 | primary-400 |

### Chart Colors (5 series)
Dedicated chart tokens (`--chart-1` through `--chart-5`) ensure data visualizations remain readable in both themes.

### Sidebar Variants
- **Default:** Flat sidebar using standard tokens
- **Elevated:** Custom `[data-sidebar-style="elevated"]` CSS with box-shadow separation, distinct background, and active state styling

### Gradients
Five pre-defined gradient utilities in CSS: `gradient-primary`, `gradient-primary-subtle`, `gradient-primary-text`, `gradient-accent`, `gradient-card-border`.

---

## 3. Typography System

### Font Families
| Role | Font | Tailwind Class | CSS Variable |
|------|------|---------------|--------------|
| Display / Headings | Lexend (500 weight) | `font-display` | `--display-family` |
| Body / UI | Funnel Sans (400 weight) | `font-sans` | `--text-family` |
| Code / Monospace | JetBrains Mono | `font-mono` | -- |
| Formal / Serif | Merriweather | `font-serif` | -- |

### Automatic Heading Treatment
All `h1`-`h6` elements receive `font-family: var(--display-family)` and `font-weight: var(--display-weight)` via the base layer.

### Font Size Scale
The root font size is user-adjustable via `--font-size-scale`:
```css
html { font-size: calc(16px * var(--font-size-scale, 1)); }
```
This is controlled from the Appearance settings page, allowing users to scale the entire UI proportionally.

### Font Features
OpenType features enabled: `rlig` (required ligatures), `calt` (contextual alternates).

---

## 4. Component Patterns

### 4.1 Shadcn UI Primitives (38 registered)
accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, chart, checkbox, collapsible, color-picker, command, date-picker, dialog, dropdown-menu, file-upload, form, input, label, pagination, popover, progress, scroll-area, select, separator, sheet, sidebar, skeleton, slider, switch, table, tabs, textarea, toast, tooltip, data-table

### 4.2 CVA Variant Pattern
Used in: button, badge, alert, toast, sidebar, sheet, label (7 components).
```typescript
// Example: button variants with CVA
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", destructive: "...", outline: "...", ghost: "..." },
    size: { default: "...", sm: "...", lg: "...", icon: "..." }
  },
  defaultVariants: { variant: "default", size: "default" }
});
```

### 4.3 Form Pattern
- **Library:** React Hook Form + Zod validation + Shadcn Form component
- **Used in:** 16 form components across auth, settings, clients, contracts, rate-cards, projects
- **Validation schemas:** Defined in `lib/validations/` (7 schema files)
- **Pattern:** `useForm` with `zodResolver`, controlled inputs via `FormField`, server-side re-validation in Server Actions

### 4.4 Data Table Pattern
- **Library:** TanStack Table (React Table v8)
- **Components:** `data-table.tsx`, `data-table-toolbar.tsx`, `data-table-pagination.tsx`, `data-table-checkbox.tsx`
- **Features:** Sorting, filtering, column visibility, row selection, bulk actions, custom empty state, loading spinner
- **Used in:** quotes, invoices, clients, contracts (5 data tables)

### 4.5 Composition / Compound Component Pattern
Used extensively in Shadcn components:
```typescript
// Card compound component
<Card>
  <CardHeader>
    <CardTitle>...</CardTitle>
    <CardDescription>...</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```
Applied to: Card, Dialog, Sheet, DropdownMenu, Command, Sidebar, Alert, Form, Table, Tabs, Accordion, Toast, Popover.

---

## 5. Layout Patterns

### 5.1 Route Group Layouts
| Group | Purpose | Layout Features |
|-------|---------|----------------|
| `(auth)` | Login, register, password reset | Centered card, minimal chrome |
| `(dashboard)` | Protected app routes | Sidebar + header + main content |
| `(public)` | Client portals (quote/invoice/contract) | Branded, no auth required |
| `(marketing)` | Landing, about, docs, legal | Marketing header/footer |

### 5.2 Dashboard Layout
```
+-----+---------------------------+
| S   | Header (breadcrumb, search, |
| i   | notifications, user menu)  |
| d   +---------------------------+
| e   | Main Content              |
| b   | max-w-7xl, bg-muted/30    |
| a   | p-4 md:p-6 lg:p-8        |
| r   |                           |
+-----+---------------------------+
```
- **Sidebar:** Collapsible (`SidebarProvider`), with mobile sheet variant
- **Header:** Breadcrumbs, global search (Command+K), notifications, user dropdown
- **Main:** `id="main-content"` for skip-to-content accessibility

### 5.3 Split-View Editor Pattern
Used in the Quote Editor (`QuoteEditor.tsx`):
- Left panel: Block-based builder with drag-and-drop
- Right panel: Live document preview
- Responsive: Stacks vertically on smaller screens

### 5.4 Page Container Pattern
```typescript
<div className="mx-auto max-w-7xl">
  <PageHeader title="..." description="..." />
  {/* Page content */}
</div>
```
Consistent max-width (1400px via container, 80rem via max-w-7xl) with responsive padding.

---

## 6. Responsive Strategy

### Breakpoints (Tailwind defaults)
| Breakpoint | Width | Usage |
|-----------|-------|-------|
| `sm:` | 640px | Minor adjustments (grid columns, text sizing) |
| `md:` | 768px | Tablet layout (sidebar shows, grid expands) |
| `lg:` | 1024px | Desktop layout (full sidebar, more columns) |
| `xl:` | 1280px | Wide desktop (extra spacing) |
| `2xl:` | 1400px | Container max-width |

### Coverage Statistics
- **Components with responsive classes:** 47 component files (using `md:` / `lg:` / `xl:`)
- **Page-level responsive classes:** 26 page/layout files
- **`sm:` usage:** 30 component files
- **`hidden md:block` / `block md:hidden` patterns:** 8 components (show/hide per breakpoint)

### Key Responsive Adaptations
- **Sidebar:** Full sidebar on desktop, collapsible icon-only, sheet overlay on mobile
- **Navigation:** Desktop sidebar nav collapses to mobile bottom/sheet nav
- **Data tables:** Pagination simplifies on mobile, columns can be hidden
- **Forms:** Full-width on mobile, multi-column on desktop (business-profile-form uses `md:grid-cols-2`)
- **Quote builder:** Split-view stacks on mobile, side-by-side on desktop
- **Stats cards:** 1 column mobile, 2 column tablet, 4 column desktop

---

## 7. Accessibility Patterns

### Implementation Status

| Pattern | Status | Details |
|---------|--------|---------|
| Skip-to-content | Implemented | `SkipToContent` component in dashboard layout, links to `#main-content` |
| ARIA attributes | Partial | 51 occurrences across 24 files (mostly in UI primitives) |
| Keyboard navigation | Inherited | Via Radix UI primitives (focus trapping, arrow keys, escape) |
| Focus management | Partial | `tabIndex={-1}` on main content, `focus-visible` styles on some components |
| Role attributes | Partial | 29 occurrences across 18 component files |
| Screen reader text | Present | `sr-only` class used in breadcrumb, pagination, sidebar |
| Color contrast | Good | OKLCH palette with sufficient lightness range (0.08-0.98) |
| Reduced motion | Not explicit | No `prefers-reduced-motion` media queries found |

### Radix UI Inherited Accessibility
Radix primitives provide out-of-the-box:
- Focus trapping in modals/dialogs
- Arrow key navigation in menus, dropdowns, tabs
- Escape to close overlays
- ARIA roles and states for interactive widgets
- Screen reader announcements

### Areas for Improvement
- Add `prefers-reduced-motion` support for animations
- Increase ARIA label coverage on custom interactive elements
- Add `aria-live` regions for dynamic content updates (toasts, data loading)
- Form error announcements could be more explicit for screen readers

---

## 8. State Patterns

### 8.1 Server Components First
Default pattern -- pages and layouts are Server Components. Client boundary (`'use client'`) is pushed as deep as possible.

### 8.2 Server Actions
65+ Server Actions handle all mutations. Defined in `lib/actions/` directories per domain (quotes, invoices, clients, dashboard, settings, etc.).

### 8.3 Zustand Store
One store: `quote-builder-store.ts` for complex Quote Builder state:
- Document blocks, selection, panels, dirty state, save state
- History (undo/redo) support
- Middleware: immer (immutable updates), devtools, persist (localStorage)

### 8.4 Context Providers
- `ThemeProvider` (next-themes) -- light/dark mode
- `FontSizeProvider` -- user font size preference
- `DemoModeProvider` -- demo mode detection
- `SidebarProvider` -- sidebar open/collapsed state

### 8.5 URL State
Search params for shareable/bookmarkable state: `clientId`, `projectId`, `filter`, `sort`, `page`.

### 8.6 Component State Handling

| State | Pattern | Coverage |
|-------|---------|----------|
| Loading | Skeleton components + `loading.tsx` route files | 6 loading.tsx files + `loading-skeletons.tsx` shared component |
| Empty | `EmptyState` component with icon, title, description, action | Used in 5+ data tables and list views |
| Error | `error.tsx` dashboard error boundary | 1 error boundary (dashboard level only) |
| Not Found | `not-found.tsx` at app root | 1 file |

---

## 9. Print Styles

Print media query in `globals.css`:
- White background enforced
- `.no-print` class hides navigation/chrome
- `.print-only` class reveals print-specific content

Used for quote and invoice PDF generation workflows.

---

## 10. Custom Scrollbar

WebKit custom scrollbar styling:
- 8px width/height
- Transparent track
- Rounded thumb with muted-foreground color at 30% opacity (50% on hover)
