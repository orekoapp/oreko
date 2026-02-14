# QuoteCraft Design System Discovery Report

**Generated:** 2026-02-13
**Analyzed Codebase:** `/home/arunesh/projects/work/quote-software`

---

## 1. Color Palette

### 1.1 CSS Custom Properties (HSL Format)

The design system uses HSL-based CSS custom properties with dark mode support.

#### Light Mode (`:root`)

| Token | HSL Value | Computed Color | Usage |
|-------|-----------|----------------|-------|
| `--background` | `0 0% 100%` | `#ffffff` (White) | Page background |
| `--foreground` | `0 0% 3.9%` | `#0a0a0a` (Near black) | Primary text |
| `--card` | `0 0% 100%` | `#ffffff` | Card backgrounds |
| `--card-foreground` | `0 0% 3.9%` | `#0a0a0a` | Card text |
| `--popover` | `0 0% 100%` | `#ffffff` | Popover backgrounds |
| `--popover-foreground` | `0 0% 3.9%` | `#0a0a0a` | Popover text |
| `--primary` | `0 0% 9%` | `#171717` (Near black) | Primary actions |
| `--primary-foreground` | `0 0% 98%` | `#fafafa` | Text on primary |
| `--secondary` | `0 0% 96.1%` | `#f5f5f5` (Light gray) | Secondary elements |
| `--secondary-foreground` | `0 0% 9%` | `#171717` | Text on secondary |
| `--muted` | `0 0% 96.1%` | `#f5f5f5` | Muted backgrounds |
| `--muted-foreground` | `0 0% 45.1%` | `#737373` | Muted text |
| `--accent` | `0 0% 96.1%` | `#f5f5f5` | Accent backgrounds |
| `--accent-foreground` | `0 0% 9%` | `#171717` | Accent text |
| `--destructive` | `0 84.2% 60.2%` | `#ef4444` (Red) | Destructive actions |
| `--destructive-foreground` | `0 0% 98%` | `#fafafa` | Text on destructive |
| `--border` | `0 0% 89.8%` | `#e5e5e5` | Borders |
| `--input` | `0 0% 89.8%` | `#e5e5e5` | Input borders |
| `--ring` | `0 0% 3.9%` | `#0a0a0a` | Focus rings |

#### Dark Mode (`.dark`)

| Token | HSL Value | Computed Color | Usage |
|-------|-----------|----------------|-------|
| `--background` | `0 0% 3.9%` | `#0a0a0a` | Page background |
| `--foreground` | `0 0% 98%` | `#fafafa` | Primary text |
| `--primary` | `0 0% 98%` | `#fafafa` | Primary actions |
| `--primary-foreground` | `0 0% 9%` | `#171717` | Text on primary |
| `--secondary` | `0 0% 14.9%` | `#262626` | Secondary elements |
| `--muted` | `0 0% 14.9%` | `#262626` | Muted backgrounds |
| `--muted-foreground` | `0 0% 63.9%` | `#a3a3a3` | Muted text |
| `--destructive` | `0 62.8% 30.6%` | `#7f1d1d` | Destructive (darker) |
| `--border` | `0 0% 14.9%` | `#262626` | Borders |
| `--ring` | `0 0% 83.1%` | `#d4d4d4` | Focus rings |

### 1.2 Semantic Colors (RGB Format)

| Token | RGB Value | Hex Equivalent | Usage |
|-------|-----------|----------------|-------|
| `--success` | `34 197 94` | `#22c55e` (Green 500) | Success states |
| `--success-foreground` | `255 255 255` | `#ffffff` | Text on success |
| `--warning` | `245 158 11` | `#f59e0b` (Amber 500) | Warning states |
| `--warning-foreground` | `255 255 255` | `#ffffff` | Text on warning |

### 1.3 Sidebar Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--sidebar-background` | `0 0% 98%` | `240 5.9% 10%` |
| `--sidebar-foreground` | `240 5.3% 26.1%` | `240 4.8% 95.9%` |
| `--sidebar-primary` | `240 5.9% 10%` | `224.3 76.3% 48%` |
| `--sidebar-accent` | `240 4.8% 95.9%` | `240 3.7% 15.9%` |
| `--sidebar-border` | `220 13% 91%` | `240 3.7% 15.9%` |
| `--sidebar-ring` | `217.2 91.2% 59.8%` | `217.2 91.2% 59.8%` |

### 1.4 Chart Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--chart-1` | `12 76% 61%` (Orange) | `220 70% 50%` (Blue) |
| `--chart-2` | `173 58% 39%` (Teal) | `160 60% 45%` (Green) |
| `--chart-3` | `197 37% 24%` (Dark Teal) | `30 80% 55%` (Orange) |
| `--chart-4` | `43 74% 66%` (Yellow) | `280 65% 60%` (Purple) |
| `--chart-5` | `27 87% 67%` (Orange) | `340 75% 55%` (Pink) |

### 1.5 Direct Color Usage (Tailwind)

Colors used directly in components (outside the token system):

| Color Class | Usage Context | Component |
|-------------|---------------|-----------|
| `bg-green-100/500/900` | Success states | Badge, Alert, Toast |
| `text-green-500/600/800` | Success text | StatsCards, Badge |
| `bg-yellow-100/900` | Warning states | Badge, Alert |
| `text-yellow-500/600/800` | Warning text | Badge, Alert |
| `bg-blue-100/500/900` | Info states | Badge, Alert, Landing |
| `text-blue-500/600/700` | Info/Link text | StatsCards, Landing |
| `bg-red-400/500` | Error/Destructive | Browser chrome dots |
| `text-red-300/500` | Error text | Toast close |
| `bg-violet-500` | Accent purple | StatsCards icon |
| `text-violet-500/600` | Accent text | Hero gradient |
| `bg-teal-500` | Accent teal | StatsCards icon |
| `text-teal-500` | Accent text | StatsCards |
| `bg-emerald-500` | Success variant | StatsCards icon |
| `text-emerald-500` | Success text | StatsCards |
| `bg-slate-*` | Landing page | Hero, Cards |

---

## 2. Typography System

### 2.1 Font Families

```typescript
fontFamily: {
  sans: ['var(--font-geist-sans)', 'Inter', 'sans-serif'],
  mono: ['var(--font-geist-mono)', 'JetBrains Mono', 'monospace'],
  serif: ['Merriweather', 'serif']
}
```

**Primary Font:** Geist Sans (loaded via Next.js `geist/font/sans`)
**Fallback:** Inter
**Monospace:** Geist Mono / JetBrains Mono
**Serif:** Merriweather (defined but not observed in active use)

### 2.2 Font Sizes in Use

| Element | Size Classes | Weight | Line Height |
|---------|--------------|--------|-------------|
| Page Title (h1) | `text-2xl` | `font-bold` | `tracking-tight` |
| Landing Hero | `text-4xl md:text-5xl lg:text-6xl` | `font-bold` | `tracking-tight` |
| Section Headers | `text-lg` | `font-semibold` | `tracking-tight` |
| Card Title | `text-sm` | `font-medium` / `font-semibold` | Default |
| Body Text | `text-sm` | `font-normal` | Default |
| Small Text | `text-xs` | Various | Default |
| Form Labels | `text-sm` | `font-medium` | Default |
| Input Text | `text-base` (mobile) `md:text-sm` | Default | Default |
| Badge | `text-xs` | `font-semibold` | Default |
| Button | `text-sm` | `font-medium` | Default |
| Button (sm) | `text-xs` | `font-medium` | Default |
| Muted Description | `text-sm` / `text-xs` | Default | Default |

### 2.3 Text Colors

| Purpose | Class |
|---------|-------|
| Primary text | `text-foreground` |
| Muted/secondary | `text-muted-foreground` |
| On primary bg | `text-primary-foreground` |
| On accent bg | `text-accent-foreground` |
| Sidebar muted | `text-sidebar-foreground/70` |

---

## 3. Spacing Patterns

### 3.1 Border Radius

```typescript
borderRadius: {
  lg: 'var(--radius)',           // 0.5rem (8px)
  md: 'calc(var(--radius) - 2px)', // 6px
  sm: 'calc(var(--radius) - 4px)', // 4px
  xl: 'calc(var(--radius) + 4px)'  // 12px
}
```

**Base Radius:** `--radius: 0.5rem` (8px)

| Usage | Radius |
|-------|--------|
| Cards | `rounded-xl` (12px) |
| Buttons | `rounded-md` (6px) |
| Inputs | `rounded-md` (6px) |
| Badges | `rounded-md` (6px) |
| Dropdown items | `rounded-sm` (4px) |
| Avatar | `rounded-full` |
| Checkbox | `rounded-sm` (4px) |

### 3.2 Shadow System

```typescript
boxShadow: {
  '2xs': '0px 4px 8px -1px rgb(0 0 0 / 0.05)',
  'xs': '0px 4px 8px -1px rgb(0 0 0 / 0.05)',
  'sm': '0px 4px 8px -1px rgb(0 0 0 / 0.10), 0px 1px 2px -2px rgb(0 0 0 / 0.10)',
  DEFAULT: '0px 4px 8px -1px rgb(0 0 0 / 0.10), 0px 1px 2px -2px rgb(0 0 0 / 0.10)',
  'md': '0px 4px 8px -1px rgb(0 0 0 / 0.10), 0px 2px 4px -2px rgb(0 0 0 / 0.10)',
  'lg': '0px 4px 8px -1px rgb(0 0 0 / 0.10), 0px 4px 6px -2px rgb(0 0 0 / 0.10)',
  'xl': '0px 4px 8px -1px rgb(0 0 0 / 0.10), 0px 8px 10px -2px rgb(0 0 0 / 0.10)',
  '2xl': '0px 4px 8px -1px rgb(0 0 0 / 0.25)'
}
```

### 3.3 Common Spacing Values

| Pattern | Values Used |
|---------|-------------|
| **Card Padding** | `p-6` (24px) |
| **Card Header** | `p-6 pb-2` |
| **Card Content** | `p-6 pt-0` |
| **Card Footer** | `p-6 pt-0` |
| **Sidebar Padding** | `p-2` (8px) |
| **Main Content** | `p-4 md:p-6 lg:p-8` (responsive) |
| **Container Padding** | `padding: 2rem` (32px) |
| **Button Horizontal** | `px-3` (sm), `px-4` (default), `px-8` (lg) |
| **Button Vertical** | `py-2` (default) |
| **Input Padding** | `px-3 py-1` / `px-3 py-2` |
| **Gap - Small** | `gap-1` (4px), `gap-1.5` (6px) |
| **Gap - Medium** | `gap-2` (8px), `gap-3` (12px) |
| **Gap - Large** | `gap-4` (16px), `gap-6` (24px) |
| **Stack Spacing** | `space-y-1` (4px), `space-y-1.5` (6px) |
| **Page Header Gap** | `gap-4` (16px) |
| **Icon Size** | `h-4 w-4` (16px), `h-5 w-5` (20px), `h-6 w-6` (24px) |

### 3.4 Container Settings

```typescript
container: {
  center: true,
  padding: '2rem',
  screens: {
    '2xl': '1400px'
  }
}
```

**Max Content Width:** `max-w-7xl` (1280px) in dashboard layout

---

## 4. Component Inventory

### 4.1 Core UI Components (Shadcn-based)

| Component | File | Variants | Status |
|-----------|------|----------|--------|
| **Button** | `button.tsx` | default, destructive, outline, secondary, ghost, link | Complete |
| **Card** | `card.tsx` | - | Complete |
| **Badge** | `badge.tsx` | default, secondary, destructive, outline, success, warning, info | Complete |
| **Input** | `input.tsx` | - | Complete |
| **Textarea** | `textarea.tsx` | - | Complete |
| **Select** | `select.tsx` | - | Complete |
| **Checkbox** | `checkbox.tsx` | - | Complete |
| **Switch** | `switch.tsx` | - | Complete |
| **Slider** | `slider.tsx` | - | Present |
| **Label** | `label.tsx` | - | Present |
| **Alert** | `alert.tsx` | default, destructive, success, warning, info | Complete |
| **Dialog** | `dialog.tsx` | - | Complete |
| **AlertDialog** | `alert-dialog.tsx` | - | Present |
| **Sheet** | `sheet.tsx` | - | Present |
| **DropdownMenu** | `dropdown-menu.tsx` | - | Complete |
| **Popover** | `popover.tsx` | - | Present |
| **Tooltip** | `tooltip.tsx` | - | Complete |
| **Tabs** | `tabs.tsx` | - | Complete |
| **Table** | `table.tsx` | - | Complete |
| **Accordion** | `accordion.tsx` | - | Present |
| **Avatar** | `avatar.tsx` | - | Complete |
| **Progress** | `progress.tsx` | - | Complete |
| **Skeleton** | `skeleton.tsx` | - | Complete |
| **Separator** | `separator.tsx` | horizontal, vertical | Complete |
| **ScrollArea** | `scroll-area.tsx` | - | Present |
| **Breadcrumb** | `breadcrumb.tsx` | - | Present |
| **Pagination** | `pagination.tsx` | - | Complete |
| **Toast** | `toast.tsx` | default, destructive, success | Complete |
| **Calendar** | `calendar.tsx` | - | Present |
| **DatePicker** | `date-picker.tsx` | - | Present |
| **ColorPicker** | `color-picker.tsx` | - | Present |
| **FileUpload** | `file-upload.tsx` | - | Present |
| **Sidebar** | `sidebar.tsx` | sidebar, floating, inset | Complete |

### 4.2 Shared Application Components

| Component | File | Purpose |
|-----------|------|---------|
| **PageHeader** | `shared/page-header.tsx` | Consistent page titles with optional actions |
| **PageContainer** | `shared/page-container.tsx` | Page wrapper |
| **EmptyState** | `shared/empty-state.tsx` | Zero-state display with icon, title, description, CTA |
| **LoadingSkeletons** | `shared/loading-skeletons.tsx` | Loading states |
| **ErrorBoundary** | `shared/error-boundary.tsx` | Error handling |
| **SkipToContent** | `shared/skip-to-content.tsx` | Accessibility skip link |

### 4.3 Button Variants Detail

```typescript
buttonVariants = cva({
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline'
    },
    size: {
      default: 'h-9 px-4 py-2',    // 36px height
      sm: 'h-8 rounded-md px-3 text-xs',  // 32px height
      lg: 'h-10 rounded-md px-8',   // 40px height
      icon: 'h-9 w-9'              // 36px square
    }
  }
})
```

### 4.4 Sidebar Menu Button Variants

```typescript
sidebarMenuButtonVariants = cva({
  variants: {
    variant: {
      default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      outline: 'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent...'
    },
    size: {
      default: 'h-8 text-sm',  // 32px
      sm: 'h-7 text-xs',       // 28px
      lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0'  // 48px
    }
  }
})
```

---

## 5. State Coverage Analysis

### 5.1 Interactive State Matrix

| Component | Default | Hover | Focus | Active | Disabled | Loading | Error | Success |
|-----------|---------|-------|-------|--------|----------|---------|-------|---------|
| Button | Yes | Yes | Yes | - | Yes | - | - | - |
| Input | Yes | - | Yes | - | Yes | - | - | - |
| Textarea | Yes | - | Yes | - | Yes | - | - | - |
| Select | Yes | - | Yes | - | Yes | - | - | - |
| Checkbox | Yes | - | Yes | - | Yes | Yes | - | - |
| Switch | Yes | - | Yes | - | Yes | Yes | - | - |
| Tabs | Yes | - | Yes | - | Yes | Yes | - | - |
| DropdownMenuItem | Yes | Yes | Yes | - | Yes | - | - | - |
| SidebarMenuButton | Yes | Yes | Yes | Yes | Yes | - | - | - |
| Toast | Yes | - | - | - | - | - | Yes | Yes |
| Alert | Yes | - | - | - | - | - | Yes | Yes |
| Badge | Yes | Yes | - | - | - | - | - | Yes |
| TableRow | Yes | Yes | - | - | - | Yes | - | - |
| Dialog | Yes | - | - | - | - | - | - | - |

### 5.2 State Implementation Details

**Focus States:**
- Most components use `focus-visible:ring-*` pattern
- Ring color: `ring-ring` (maps to `--ring`)
- Ring width: `ring-1` or `ring-2`
- Ring offset: `ring-offset-2` with `ring-offset-background`

**Disabled States:**
- Pattern: `disabled:pointer-events-none disabled:opacity-50`
- Cursor: `disabled:cursor-not-allowed`

**Hover States:**
- Primary: `hover:bg-primary/90`
- Ghost: `hover:bg-accent hover:text-accent-foreground`
- Muted: `hover:bg-muted/50`

### 5.3 Missing States

| Component | Missing States | Impact |
|-----------|----------------|--------|
| Button | Loading state | Medium - common pattern needed |
| Input | Error state styling | Medium - only disabled handled |
| Select | Error state styling | Medium |
| Card | Hover/interactive states | Low - usually static |
| Progress | Indeterminate | Low |

---

## 6. Animation System

### 6.1 Defined Keyframes

```typescript
keyframes: {
  'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
  'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
  'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
  'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
  'slide-in-from-top': { from: { transform: 'translateY(-100%)' }, to: { transform: 'translateY(0)' } },
  'slide-in-from-bottom': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
  'slide-in-from-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
  'slide-in-from-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } }
}
```

### 6.2 Animation Utilities

```typescript
animation: {
  'accordion-down': 'accordion-down 0.2s ease-out',
  'accordion-up': 'accordion-up 0.2s ease-out',
  'fade-in': 'fade-in 0.2s ease-out',
  'fade-out': 'fade-out 0.2s ease-out',
  'slide-in-from-top': 'slide-in-from-top 0.2s ease-out',
  'slide-in-from-bottom': 'slide-in-from-bottom 0.2s ease-out',
  'slide-in-from-left': 'slide-in-from-left 0.2s ease-out',
  'slide-in-from-right': 'slide-in-from-right 0.2s ease-out'
}
```

### 6.3 Transition Patterns

- Standard: `transition-colors`
- Transform: `transition-transform`
- All: `transition-all`
- Duration: `duration-200` (200ms default)
- Easing: `ease-out`, `ease-linear`

---

## 7. Inconsistency Report

### 7.1 Color Token Inconsistencies

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Direct Tailwind colors vs tokens | `stats-cards.tsx`, `badge.tsx`, `alert.tsx` | Use semantic tokens: `--success`, `--warning`, `--info` consistently |
| Mixed HSL/RGB formats | `success`, `warning` use RGB; rest use HSL | Standardize to HSL format |
| Hardcoded slate colors | `hero-section.tsx` | Create landing page color tokens |

### 7.2 Typography Inconsistencies

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Inconsistent page title weights | Various pages | Standardize on `font-bold` for h1 |
| Mixed tracking values | Some use `tracking-tight`, others default | Document tracking rules |

### 7.3 Spacing Inconsistencies

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Card padding variations | `p-6` vs `p-4` in different contexts | Standardize card padding |
| Gap values vary | `gap-2` to `gap-6` without clear pattern | Create spacing scale documentation |

### 7.4 Component Pattern Inconsistencies

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Focus ring variations | `ring-1` vs `ring-2` across components | Standardize to `ring-1` for inputs, `ring-2` for buttons |
| Shadow variations | Some cards no shadow, some `shadow`, some `shadow-lg` | Document shadow usage by elevation |
| Icon sizing | Mix of `h-4 w-4`, `h-5 w-5`, `size-4` | Standardize on `size-*` utility |

### 7.5 Missing Design Tokens

| Token Needed | Current Approach | Impact |
|--------------|------------------|--------|
| `--info` | Hardcoded blue values | Medium |
| `--success-muted` | Inline `bg-green-500/10` | Low |
| `--radius-full` | `rounded-full` class | Low |
| Landing page colors | Direct slate usage | Medium |

---

## 8. Recommendations Summary

### 8.1 High Priority

1. **Extend semantic color tokens** - Add `--info`, `--info-foreground` to match success/warning
2. **Standardize color format** - Convert all tokens to HSL for consistency
3. **Add Button loading state** - Common UX pattern currently missing

### 8.2 Medium Priority

1. **Create spacing scale documentation** - Document when to use each gap/padding value
2. **Standardize shadow usage** - Create elevation system (0, 1, 2, 3)
3. **Add input error states** - Border color change, error message styling

### 8.3 Low Priority

1. **Create landing page tokens** - Abstract slate colors to named tokens
2. **Icon size standardization** - Use `size-*` utility consistently
3. **Progress indeterminate state** - Add animation for loading progress

---

## 9. Component State Quick Reference

### Button States
```css
default:  bg-primary text-primary-foreground shadow
hover:    bg-primary/90
focus:    ring-1 ring-ring
disabled: opacity-50 pointer-events-none
```

### Input States
```css
default:  border-input bg-transparent
focus:    ring-1 ring-ring (outline-none)
disabled: opacity-50 cursor-not-allowed
placeholder: text-muted-foreground
```

### Sidebar Navigation States
```css
default:  text-muted-foreground
hover:    bg-muted text-foreground
active:   bg-primary text-primary-foreground
```

### Table Row States
```css
default:  border-b
hover:    bg-muted/50
selected: bg-muted
```

---

*Report generated by analyzing source files in `/home/arunesh/projects/work/quote-software/apps/web`*
