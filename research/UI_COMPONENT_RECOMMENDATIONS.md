# Oreko UI/UX Component Recommendations

**Date:** February 2026
**Author:** Frontend Architecture Review
**Objective:** Establish consistent UI patterns using shadcn/ui ecosystem

---

## 1. Executive Summary

Oreko currently suffers from **inconsistent UI patterns** across different pages. This document provides actionable recommendations to create a polished, uniform experience using the shadcn/ui ecosystem and shadcnstudio blocks.

### Key Changes Required:
1. Adopt **Application Shell 10** as the base layout
2. Implement the **provided CSS theme variables**
3. Replace current quote/invoice editor with **Bloom-style split-view form**
4. Fix **15+ identified bugs** from user testing
5. Prepare architecture for **future features** (Projects, Contracts, Workflows)

---

## 2. Application Shell

### 2.1 Recommended: Application Shell 10

**Source:** https://shadcnstudio.com/blocks/dashboard-and-application/application-shell

**Installation:**
```bash
npx shadcn add application-shell-10
```

**Why Application Shell 10:**
- Collapsible sidebar (easier access throughout app)
- Clean header with search, notifications, user menu
- Responsive design (desktop + mobile)
- Consistent navigation pattern

### 2.2 Shell Structure

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Logo]  │  🔍 Type to search...                    │  🔔  👤 User  │
├──────────┼───────────────────────────────────────────────────────────┤
│ 🔍 Search│                                                           │
│          │                                                           │
│ Dashboard│              MAIN CONTENT AREA                            │
│          │                                                           │
│ ─────────│              (Pages render here)                          │
│ Useful   │                                                           │
│ Pages    │                                                           │
│  Quotes  │                                                           │
│  Invoices│                                                           │
│  Clients │                                                           │
│  ─────── │                                                           │
│ Rate Crds│                                                           │
│ Templates│                                                           │
│ Settings │                                                           │
│          │                                                           │
│ [Collpse]│                                                           │
└──────────┴───────────────────────────────────────────────────────────┘
```

### 2.3 Implementation Files

Create these components in `apps/web/components/layout/`:

```
components/layout/
├── app-shell.tsx           # Main shell wrapper
├── app-sidebar.tsx         # Collapsible sidebar
├── app-header.tsx          # Top header bar
├── sidebar-nav.tsx         # Navigation items
├── sidebar-user.tsx        # User profile section
├── search-command.tsx      # Command palette (⌘K)
└── notifications-popover.tsx # Notifications dropdown
```

---

## 3. Theme System

### 3.1 CSS Variables (Provided by Client)

Replace `apps/web/styles/globals.css` theme section with:

```css
:root {
  --background: rgb(248 248 248);
  --foreground: rgb(29 41 61);
  --card: rgb(255 255 255);
  --card-foreground: rgb(29 41 61);
  --popover: rgb(255 255 255);
  --popover-foreground: rgb(29 41 61);
  --primary: rgb(100 104 240);
  --primary-foreground: rgb(255 255 255);
  --secondary: rgb(228 232 239);
  --secondary-foreground: rgb(54 64 80);
  --muted: rgb(245 245 245);
  --muted-foreground: rgb(108 114 126);
  --accent: rgb(225 231 253);
  --accent-foreground: rgb(54 64 80);
  --destructive: rgb(241 68 68);
  --border: rgb(208 212 219);
  --input: rgb(208 212 219);
  --ring: rgb(100 104 240);

  /* Chart colors */
  --chart-1: rgb(100 104 240);
  --chart-2: rgb(79 70 229);
  --chart-3: rgb(68 59 201);
  --chart-4: rgb(55 48 165);
  --chart-5: rgb(49 45 132);

  /* Sidebar specific */
  --sidebar: rgb(245 245 245);
  --sidebar-foreground: rgb(29 41 61);
  --sidebar-primary: rgb(100 104 240);
  --sidebar-primary-foreground: rgb(255 255 255);
  --sidebar-accent: rgb(225 231 253);
  --sidebar-accent-foreground: rgb(54 64 80);
  --sidebar-border: rgb(208 212 219);
  --sidebar-ring: rgb(100 104 240);

  /* Typography */
  --font-sans: Inter, sans-serif;
  --font-serif: Merriweather, serif;
  --font-mono: JetBrains Mono, monospace;

  /* Spacing & Radius */
  --radius: 0.5rem;

  /* Shadows */
  --shadow-2xs: 0px 4px 8px -1px rgb(0 0 0 / 0.05);
  --shadow-xs: 0px 4px 8px -1px rgb(0 0 0 / 0.05);
  --shadow-sm: 0px 4px 8px -1px rgb(0 0 0 / 0.10), 0px 1px 2px -2px rgb(0 0 0 / 0.10);
  --shadow: 0px 4px 8px -1px rgb(0 0 0 / 0.10), 0px 1px 2px -2px rgb(0 0 0 / 0.10);
  --shadow-md: 0px 4px 8px -1px rgb(0 0 0 / 0.10), 0px 2px 4px -2px rgb(0 0 0 / 0.10);
  --shadow-lg: 0px 4px 8px -1px rgb(0 0 0 / 0.10), 0px 4px 6px -2px rgb(0 0 0 / 0.10);
  --shadow-xl: 0px 4px 8px -1px rgb(0 0 0 / 0.10), 0px 8px 10px -2px rgb(0 0 0 / 0.10);
  --shadow-2xl: 0px 4px 8px -1px rgb(0 0 0 / 0.25);
}

.dark {
  --background: rgb(15 24 43);
  --foreground: rgb(227 232 239);
  --card: rgb(29 41 61);
  --card-foreground: rgb(227 232 239);
  --popover: rgb(29 41 61);
  --popover-foreground: rgb(227 232 239);
  --primary: rgb(129 140 249);
  --primary-foreground: rgb(15 24 43);
  --secondary: rgb(47 56 72);
  --secondary-foreground: rgb(208 212 219);
  --muted: rgb(29 41 61);
  --muted-foreground: rgb(155 162 174);
  --accent: rgb(54 64 80);
  --accent-foreground: rgb(208 212 219);
  --destructive: rgb(241 68 68);
  --border: rgb(75 86 102);
  --input: rgb(75 86 102);
  --ring: rgb(129 140 249);

  /* Chart colors - dark */
  --chart-1: rgb(129 140 249);
  --chart-2: rgb(100 104 240);
  --chart-3: rgb(79 70 229);
  --chart-4: rgb(68 59 201);
  --chart-5: rgb(55 48 165);

  /* Sidebar - dark */
  --sidebar: rgb(29 41 61);
  --sidebar-foreground: rgb(227 232 239);
  --sidebar-primary: rgb(129 140 249);
  --sidebar-primary-foreground: rgb(15 24 43);
  --sidebar-accent: rgb(54 64 80);
  --sidebar-accent-foreground: rgb(208 212 219);
  --sidebar-border: rgb(75 86 102);
  --sidebar-ring: rgb(129 140 249);

  /* Shadows - dark (softer) */
  --shadow-2xs: 0 1px 3px 0px rgb(0 0 0 / 0.05);
  --shadow-xs: 0 1px 3px 0px rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0px rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10);
  --shadow: 0 1px 3px 0px rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10);
  --shadow-md: 0 1px 3px 0px rgb(0 0 0 / 0.10), 0 2px 4px -1px rgb(0 0 0 / 0.10);
  --shadow-lg: 0 1px 3px 0px rgb(0 0 0 / 0.10), 0 4px 6px -1px rgb(0 0 0 / 0.10);
  --shadow-xl: 0 1px 3px 0px rgb(0 0 0 / 0.10), 0 8px 10px -1px rgb(0 0 0 / 0.10);
  --shadow-2xl: 0 1px 3px 0px rgb(0 0 0 / 0.25);
}
```

### 3.2 Theme Toggle

**Current:** Dropdown (adds extra click)
**Recommended:** Toggle button (single click)

```tsx
// components/theme-toggle.tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

---

## 4. Quote/Invoice Editor Redesign

### 4.1 Current vs. Recommended

| Aspect | Current | Recommended |
|--------|---------|-------------|
| **Layout** | Visual block builder | Form-based split view |
| **UX Feel** | Design tool | Data entry |
| **Preview** | Toggle button | Always visible |
| **Complexity** | High (drag-drop) | Low (fill form) |

### 4.2 New Editor Layout (Bloom-Style)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  New Invoice                                                          [X]  │
├────────────────────────────────────────┬───────────────────────────────────┤
│                                        │  [Payment Page] [Email] [PDF]     │
│  Invoice Details              Options  │  ┌─────────────────────────────┐  │
│  ─────────────────────────────────────│  │                             │  │
│  Customer                              │  │     INVOICE PREVIEW         │  │
│  [Mckenzie Penner] mackenzie@email.com│  │                             │  │
│                                        │  │   DFrf24           DFrf24   │  │
│  Due Date        Invoice #    Tax Rate │  │              $0.00          │  │
│  [Feb 16, 2026]  [0004]      [0%-Def] │  │   Due on Feb 18, 2026       │  │
│                                        │  │                             │  │
│  Add Enhancements ▾                    │  │   Mckenzie Penner           │  │
│  ─────────────────────────────────────│  │   Palmer Enterprises        │  │
│                                        │  │                             │  │
│  Items                      Templates  │  │   Invoice #0004             │  │
│  ┌────────────────────────────────────┐│  │                             │  │
│  │ ITEMS          │ RATE    │ QTY    ││  │   Subtotal        $0.00     │  │
│  ├────────────────┼─────────┼────────┤│  │   Total           $0.00     │  │
│  │ .............. │ ....... │ ...... ││  │   Balance Due     $0.00     │  │
│  │        + Add Items                 ││  │                             │  │
│  └────────────────────────────────────┘│  └─────────────────────────────┘  │
│                                        │                                   │
│  Payment Settings             Options  │                                   │
│  Payment methods are setup in settings │                                   │
│                                        │                                   │
│  Memo                                  │                                   │
│  [Thank you for your business!      ]  │                                   │
│                                        │                                   │
│              [Save Draft] [Create]     │                                   │
└────────────────────────────────────────┴───────────────────────────────────┘
```

### 4.3 Key Components for Editor

```typescript
// File structure for new editor
components/
├── quotes/
│   ├── quote-editor/
│   │   ├── index.tsx                 // Main editor container
│   │   ├── quote-form.tsx            // Left panel - form inputs
│   │   ├── quote-preview.tsx         // Right panel - live preview
│   │   ├── preview-tabs.tsx          // Payment Page | Email | PDF tabs
│   │   ├── items-section.tsx         // Line items table
│   │   ├── templates-dropdown.tsx    // Import from rate cards
│   │   ├── customer-selector.tsx     // Client/customer picker
│   │   └── memo-input.tsx            // Thank you message
│   └── invoices/
│       └── invoice-editor/
│           └── ... (same structure)
```

### 4.4 Preview Format Toggle

Always-visible preview with format tabs:

```tsx
// components/quotes/quote-editor/preview-tabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PreviewTabs({ quote }: { quote: Quote }) {
  return (
    <Tabs defaultValue="payment" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="payment">Payment Page</TabsTrigger>
        <TabsTrigger value="email">Email Preview</TabsTrigger>
        <TabsTrigger value="pdf">Invoice PDF</TabsTrigger>
      </TabsList>
      <TabsContent value="payment">
        <PaymentPagePreview quote={quote} />
      </TabsContent>
      <TabsContent value="email">
        <EmailPreview quote={quote} />
      </TabsContent>
      <TabsContent value="pdf">
        <PDFPreview quote={quote} />
      </TabsContent>
    </Tabs>
  )
}
```

---

## 5. Component Library Recommendations

### 5.1 Required shadcn/ui Components

Install all needed components:

```bash
# Core UI components
npx shadcn@latest add button card dialog dropdown-menu input label \
  select separator sheet sidebar skeleton tabs textarea tooltip avatar \
  badge breadcrumb calendar checkbox collapsible command context-menu \
  form hover-card menubar navigation-menu popover progress radio-group \
  resizable scroll-area slider sonner switch table toggle toggle-group

# For application shell
npx shadcn@latest add sidebar
```

### 5.2 Additional Libraries

| Library | Purpose | Install |
|---------|---------|---------|
| **@tanstack/react-table** | Data tables (quotes list, invoices list) | `pnpm add @tanstack/react-table` |
| **recharts** | Charts for dashboard | `pnpm add recharts` |
| **react-hook-form** | Form management | Already in project |
| **zod** | Validation | Already in project |
| **next-themes** | Theme switching | `pnpm add next-themes` |
| **cmdk** | Command palette | `pnpm add cmdk` |
| **date-fns** | Date formatting | `pnpm add date-fns` |
| **lucide-react** | Icons | Already in project |

### 5.3 Charts Component

**Source:** https://shadcnstudio.com/blocks/dashboard-and-application/charts-component

Use for dashboard metrics:
- Revenue over time (Area chart)
- Quote conversion rate (Bar chart)
- Invoice status breakdown (Pie chart)

---

## 6. Bug Fixes Priority

### 6.1 Critical (P0) - Must Fix

| # | Bug | Location | Fix |
|---|-----|----------|-----|
| 1 | New Invoice page 404 | `/invoices/new` | Create route handler |
| 2 | Save/Send buttons don't work | Quote editor | Connect to API |
| 3 | Data not persistent | Quote editor | Add localStorage autosave |
| 4 | Premade quotes 404 | `/quotes/1` | Fix dynamic routing |
| 5 | Broken block types | Quote builder | Fix Service Group, Columns, Table |

### 6.2 High (P1) - Fix This Sprint

| # | Bug | Location | Fix |
|---|-----|----------|-----|
| 6 | Padding issues | Quotes/Invoices list | Standardize container padding |
| 7 | Back button broken | Error page | Use `router.back()` correctly |
| 8 | Notification button | Header | Implement notifications popover |
| 9 | Client validation | Client form | Show error for required address |
| 10 | Help page broken | `/help` | Create help page |

### 6.3 Medium (P2) - Next Sprint

| # | Bug | Location | Fix |
|---|-----|----------|-----|
| 11 | Theme dropdown → toggle | Header | Replace component |
| 12 | Client page scroll break | `/clients/new` | Fix CSS overflow |
| 13 | Branding UI broken | Settings | Redesign with presets |
| 14 | Color picker → presets | Branding settings | See section 7.1 |

---

## 7. Specific Component Replacements

### 7.1 Branding Settings - Color Presets

**Current:** Individual color pickers (complex, easy to break design)
**Recommended:** Pre-built theme presets

```tsx
// components/settings/branding-presets.tsx
const THEME_PRESETS = [
  {
    name: "Professional Blue",
    primary: "#3B82F6",
    secondary: "#8B5CF6",
    accent: "#F59E0B",
    preview: "/presets/blue.svg"
  },
  {
    name: "Modern Green",
    primary: "#10B981",
    secondary: "#6366F1",
    accent: "#F97316",
    preview: "/presets/green.svg"
  },
  {
    name: "Classic Navy",
    primary: "#1E40AF",
    secondary: "#7C3AED",
    accent: "#FBBF24",
    preview: "/presets/navy.svg"
  },
  // Add 3-6 more presets
]

export function BrandingPresets() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Presets</h3>
        <div className="grid grid-cols-3 gap-3">
          {THEME_PRESETS.map((preset) => (
            <PresetCard key={preset.name} preset={preset} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Font</h3>
        <div className="space-y-4">
          <Label>Family</Label>
          <div className="grid grid-cols-4 gap-3">
            <FontOption name="Public Sans" />
            <FontOption name="Inter" />
            <FontOption name="DM Sans" />
            <FontOption name="Nunito Sans" />
          </div>

          <Label>Size</Label>
          <Slider defaultValue={[16]} max={20} min={12} step={1} />
        </div>
      </div>
    </div>
  )
}
```

### 7.2 Client Selection (Quote Creation)

**Current:** No client selection when creating quotes
**Required:** Ask for client BEFORE entering editor

```tsx
// components/quotes/create-quote-dialog.tsx
export function CreateQuoteDialog() {
  const [step, setStep] = useState<'client' | 'template'>('client')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Quote</DialogTitle>
        </DialogHeader>

        {step === 'client' && (
          <div className="space-y-4">
            <Label>Select Client *</Label>
            <ClientCombobox
              onSelect={(client) => {
                setSelectedClient(client)
                setStep('template')
              }}
            />
            <Button variant="outline" onClick={() => router.push('/clients/new')}>
              + Add New Client
            </Button>
          </div>
        )}

        {step === 'template' && (
          <div className="space-y-4">
            <Label>Start From</Label>
            <div className="grid grid-cols-3 gap-3">
              <TemplateOption name="Blank" />
              <TemplateOption name="Last Used" />
              <TemplateOption name="From Template" />
            </div>
            <Button onClick={() => createQuote(selectedClient)}>
              Continue to Editor
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

### 7.3 Items/Templates Import

**Current:** Separate "Rate Cards" panel
**Recommended:** Integrated "Templates" dropdown in items section

```tsx
// components/quotes/quote-editor/items-section.tsx
export function ItemsSection({ items, onAddItem, onUpdateItem }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Items</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Templates <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuLabel>Recent</DropdownMenuLabel>
            {recentRateCards.map(card => (
              <DropdownMenuItem key={card.id} onClick={() => onAddItem(card)}>
                {card.name} - ${card.rate}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>By Category</DropdownMenuLabel>
            {categories.map(cat => (
              <DropdownMenuSub key={cat.id}>
                <DropdownMenuSubTrigger>{cat.name}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {cat.items.map(item => (
                    <DropdownMenuItem key={item.id} onClick={() => onAddItem(item)}>
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Items</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <ItemRow key={item.id} item={item} onUpdate={onUpdateItem} />
            ))}
          </TableBody>
        </Table>
        <Button variant="ghost" className="w-full mt-2" onClick={() => onAddItem({})}>
          + Add Items
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## 8. Architecture for Future Features

### 8.1 Data Model Hierarchy

```
Client
├── Project (NEW - to be added)
│   ├── Quote
│   ├── Invoice
│   └── Contract (FUTURE)
```

### 8.2 Module Selection System

Allow users to enable/disable modules:

```tsx
// types/modules.ts
export type ModuleKey =
  | 'quotes'
  | 'invoices'
  | 'clients'
  | 'rate-cards'
  | 'projects'    // Future
  | 'contracts'   // Future
  | 'workflows'   // Future

// Store in user settings
interface UserSettings {
  enabledModules: ModuleKey[]
  // ...
}
```

### 8.3 Dynamic Workflow System

Prepare for future workflow feature:

```tsx
// types/workflows.ts
interface WorkflowStep {
  id: string
  type: 'data-entry' | 'selection' | 'payment' | 'signature' | 'confirmation'
  config: Record<string, unknown>
  nextStep?: string // Dynamic linking
}

interface Workflow {
  id: string
  name: string
  steps: WorkflowStep[]
  // Steps are NOT hardcoded - fully dynamic
}

// Example: Instant Booking Workflow
const instantBookingWorkflow: Workflow = {
  id: 'instant-booking',
  name: 'Instant Booking Workflow',
  steps: [
    { id: '1', type: 'data-entry', config: { fields: ['name', 'email', 'phone'] }, nextStep: '2' },
    { id: '2', type: 'selection', config: { source: 'packages' }, nextStep: '3' },
    { id: '3', type: 'selection', config: { source: 'payment-plans' }, nextStep: '4' },
    { id: '4', type: 'selection', config: { type: 'date-picker' }, nextStep: '5' },
    { id: '5', type: 'signature', config: { documentType: 'contract' }, nextStep: '6' },
    { id: '6', type: 'payment', config: { processor: 'stripe' }, nextStep: null },
  ]
}
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Install Application Shell 10
- [ ] Apply new CSS theme variables
- [ ] Fix P0 critical bugs
- [ ] Replace theme dropdown with toggle

### Phase 2: Editor Redesign (Week 3-4)
- [ ] Build new quote editor (form-based)
- [ ] Implement split-view with live preview
- [ ] Add preview format tabs (Payment/Email/PDF)
- [ ] Connect Save/Send functionality

### Phase 3: Polish (Week 5-6)
- [ ] Fix P1 bugs
- [ ] Implement branding presets
- [ ] Add localStorage autosave
- [ ] Mobile responsiveness pass

### Phase 4: Future Prep (Week 7+)
- [ ] Add Projects entity
- [ ] Module selection in onboarding
- [ ] Prepare workflow system architecture

---

## 10. File Changes Summary

### New Files to Create:
```
apps/web/components/layout/app-shell.tsx
apps/web/components/layout/app-sidebar.tsx
apps/web/components/layout/app-header.tsx
apps/web/components/quotes/quote-editor/index.tsx
apps/web/components/quotes/quote-editor/quote-form.tsx
apps/web/components/quotes/quote-editor/quote-preview.tsx
apps/web/components/quotes/quote-editor/preview-tabs.tsx
apps/web/components/quotes/create-quote-dialog.tsx
apps/web/components/settings/branding-presets.tsx
apps/web/components/theme-toggle.tsx
```

### Files to Modify:
```
apps/web/styles/globals.css              # New theme variables
apps/web/app/(dashboard)/layout.tsx      # Use new app shell
apps/web/app/(dashboard)/quotes/new/page.tsx
apps/web/app/(dashboard)/invoices/new/page.tsx
apps/web/components/ui/sidebar.tsx       # May need updates
```

### Files to Delete/Archive:
```
# Consider deprecating current block builder
apps/web/components/quotes/quote-builder/  # Archive, don't delete yet
```

---

## Appendix A: Reference Resources

1. **Application Shell 10:** https://shadcnstudio.com/blocks/dashboard-and-application/application-shell
2. **Charts Component:** https://shadcnstudio.com/blocks/dashboard-and-application/charts-component
3. **shadcn/ui Docs:** https://ui.shadcn.com/
4. **Bloom Reference:** Analyzed in `BLOOM_UX_ANALYSIS.md`

---

*Document prepared for Oreko development team. February 2026.*
