# UI/UX Specification: Visual Quote & Invoice Management Software

**Document Version:** 1.0
**Last Updated:** January 2026
**Status:** Ready for Development
**UI Framework:** Shadcn UI
**Design System:** Minimals Design Tokens

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design System](#2-design-system)
3. [Component Library](#3-component-library)
4. [Page Layouts](#4-page-layouts)
5. [Key Screens Specifications](#5-key-screens-specifications)
6. [Responsive Design](#6-responsive-design)
7. [Interaction Patterns](#7-interaction-patterns)
8. [Client-Facing Branding](#8-client-facing-branding)
9. [Accessibility Requirements](#9-accessibility-requirements)
10. [Animation Guidelines](#10-animation-guidelines)

---

## 1. Design Philosophy

### Core Principles

**Beautiful by Default, NOT Spreadsheet-Like**

Our software creates documents that users are proud to send to clients. Every quote and invoice should feel like a professionally designed piece, not a utilitarian form.

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Visual Builder Experience** | Drag-and-drop, WYSIWYG, block-based editing | Canvas-based quote editor with real-time preview |
| **Professional Documents** | Client-facing quotes/invoices that look impressive | Premium templates, typography, and spacing |
| **Clean, Modern UI** | Minimalist but functional | Shadcn UI components with Minimals styling |
| **Mobile-First Responsive** | Works beautifully on all devices | Adaptive layouts, touch-optimized interactions |
| **Accessible by Design** | WCAG 2.1 AA compliant | Color contrast, keyboard navigation, screen readers |

### Visual Language

```
NOT THIS (Spreadsheet-like):          THIS (Visual Builder):
+---------------------------+         +---------------------------+
| Item      | Qty  | Price  |         |  [LOGO]                   |
|-----------|------|--------|         |  +-----------------------+ |
| Service A |  1   | $500   |         |  |  Brand Identity       | |
| Service B |  2   | $300   |         |  |  Package              | |
| Service C |  1   | $200   |         |  |  ~~~~~~~~~~~~~~~~~~~  | |
+-----------|------|--------+         |  |  $2,500               | |
| Total:    |      | $1,300 |         |  +-----------------------+ |
+---------------------------+         |  [+ Add Block]            |
                                      +---------------------------+
```

### Design Inspiration

- **UX Reference:** Bloom's visual quote builder flow (NOT copying, but learning from the experience patterns)
- **Visual Language:** Completely distinct using Shadcn UI + Minimals
- **Editor Experience:** Notion-like block editing for documents

---

## 2. Design System

### 2.1 Color Palette

#### Brand Colors

```css
/* Primary - Deep Blue */
--color-primary-50: #EFF6FF;
--color-primary-100: #DBEAFE;
--color-primary-200: #BFDBFE;
--color-primary-300: #93C5FD;
--color-primary-400: #60A5FA;
--color-primary-500: #3B82F6;  /* Main primary */
--color-primary-600: #2563EB;
--color-primary-700: #1D4ED8;
--color-primary-800: #1E40AF;
--color-primary-900: #1E3A8A;
--color-primary-950: #172554;

/* Secondary - Violet */
--color-secondary-50: #F5F3FF;
--color-secondary-100: #EDE9FE;
--color-secondary-200: #DDD6FE;
--color-secondary-300: #C4B5FD;
--color-secondary-400: #A78BFA;
--color-secondary-500: #8B5CF6;  /* Main secondary */
--color-secondary-600: #7C3AED;
--color-secondary-700: #6D28D9;
--color-secondary-800: #5B21B6;
--color-secondary-900: #4C1D95;
--color-secondary-950: #2E1065;

/* Accent - Amber */
--color-accent-50: #FFFBEB;
--color-accent-100: #FEF3C7;
--color-accent-200: #FDE68A;
--color-accent-300: #FCD34D;
--color-accent-400: #FBBF24;
--color-accent-500: #F59E0B;  /* Main accent */
--color-accent-600: #D97706;
--color-accent-700: #B45309;
--color-accent-800: #92400E;
--color-accent-900: #78350F;
```

#### Neutral Colors

```css
/* Neutral - Slate */
--color-neutral-0: #FFFFFF;
--color-neutral-50: #F8FAFC;
--color-neutral-100: #F1F5F9;
--color-neutral-200: #E2E8F0;
--color-neutral-300: #CBD5E1;
--color-neutral-400: #94A3B8;
--color-neutral-500: #64748B;
--color-neutral-600: #475569;
--color-neutral-700: #334155;
--color-neutral-800: #1E293B;
--color-neutral-900: #0F172A;
--color-neutral-950: #020617;
```

#### Semantic Colors

```css
/* Success - Green */
--color-success-50: #F0FDF4;
--color-success-100: #DCFCE7;
--color-success-500: #22C55E;
--color-success-600: #16A34A;
--color-success-700: #15803D;

/* Warning - Amber */
--color-warning-50: #FFFBEB;
--color-warning-100: #FEF3C7;
--color-warning-500: #F59E0B;
--color-warning-600: #D97706;
--color-warning-700: #B45309;

/* Error - Red */
--color-error-50: #FEF2F2;
--color-error-100: #FEE2E2;
--color-error-500: #EF4444;
--color-error-600: #DC2626;
--color-error-700: #B91C1C;

/* Info - Blue */
--color-info-50: #EFF6FF;
--color-info-100: #DBEAFE;
--color-info-500: #3B82F6;
--color-info-600: #2563EB;
--color-info-700: #1D4ED8;
```

#### Application Colors

```css
/* Background */
--bg-default: var(--color-neutral-0);
--bg-subtle: var(--color-neutral-50);
--bg-muted: var(--color-neutral-100);
--bg-emphasis: var(--color-neutral-900);
--bg-canvas: var(--color-neutral-100);  /* Document canvas background */

/* Foreground/Text */
--fg-default: var(--color-neutral-900);
--fg-muted: var(--color-neutral-600);
--fg-subtle: var(--color-neutral-500);
--fg-on-emphasis: var(--color-neutral-0);

/* Border */
--border-default: var(--color-neutral-200);
--border-muted: var(--color-neutral-100);
--border-emphasis: var(--color-neutral-300);
```

### 2.2 Typography Scale

#### Font Families

```css
/* Primary - Inter for UI */
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Secondary - For headings (optional) */
--font-family-display: 'Inter', var(--font-family-sans);

/* Monospace - For code/numbers */
--font-family-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
```

#### Font Sizes

```css
/* Font Size Scale (rem based, 1rem = 16px) */
--font-size-xs: 0.75rem;     /* 12px - Labels, badges */
--font-size-sm: 0.875rem;    /* 14px - Secondary text */
--font-size-base: 1rem;      /* 16px - Body text */
--font-size-lg: 1.125rem;    /* 18px - Lead text */
--font-size-xl: 1.25rem;     /* 20px - Subheadings */
--font-size-2xl: 1.5rem;     /* 24px - Section headings */
--font-size-3xl: 1.875rem;   /* 30px - Page titles */
--font-size-4xl: 2.25rem;    /* 36px - Hero headings */
--font-size-5xl: 3rem;       /* 48px - Display */
--font-size-6xl: 3.75rem;    /* 60px - Large display */
```

#### Font Weights

```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

#### Line Heights

```css
--line-height-none: 1;
--line-height-tight: 1.25;
--line-height-snug: 1.375;
--line-height-normal: 1.5;
--line-height-relaxed: 1.625;
--line-height-loose: 2;
```

#### Typography Tokens

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display-lg` | 3.75rem | 700 | 1 | Hero sections |
| `display-md` | 3rem | 700 | 1.1 | Marketing headings |
| `heading-1` | 2.25rem | 700 | 1.25 | Page titles |
| `heading-2` | 1.875rem | 600 | 1.25 | Section headings |
| `heading-3` | 1.5rem | 600 | 1.3 | Card titles |
| `heading-4` | 1.25rem | 600 | 1.4 | Subsection headings |
| `heading-5` | 1.125rem | 600 | 1.4 | List headings |
| `body-lg` | 1.125rem | 400 | 1.5 | Lead paragraphs |
| `body-md` | 1rem | 400 | 1.5 | Default body text |
| `body-sm` | 0.875rem | 400 | 1.5 | Secondary text |
| `label-lg` | 0.875rem | 500 | 1.4 | Form labels |
| `label-md` | 0.75rem | 500 | 1.4 | Small labels |
| `caption` | 0.75rem | 400 | 1.4 | Captions, metadata |
| `overline` | 0.75rem | 600 | 1.4 | Overline text (uppercase) |

### 2.3 Spacing System

Based on 4px grid with primary increments at 8px.

```css
/* Spacing Scale */
--space-0: 0;
--space-0.5: 0.125rem;   /* 2px */
--space-1: 0.25rem;      /* 4px */
--space-1.5: 0.375rem;   /* 6px */
--space-2: 0.5rem;       /* 8px */
--space-2.5: 0.625rem;   /* 10px */
--space-3: 0.75rem;      /* 12px */
--space-3.5: 0.875rem;   /* 14px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-7: 1.75rem;      /* 28px */
--space-8: 2rem;         /* 32px */
--space-9: 2.25rem;      /* 36px */
--space-10: 2.5rem;      /* 40px */
--space-11: 2.75rem;     /* 44px */
--space-12: 3rem;        /* 48px */
--space-14: 3.5rem;      /* 56px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
--space-28: 7rem;        /* 112px */
--space-32: 8rem;        /* 128px */
```

#### Spacing Usage Guidelines

| Context | Token | Value | Example |
|---------|-------|-------|---------|
| Inline spacing (icons) | `space-1` to `space-2` | 4-8px | Icon + text gap |
| Component internal | `space-2` to `space-4` | 8-16px | Button padding |
| Component gap | `space-3` to `space-4` | 12-16px | Form field gap |
| Section gap | `space-6` to `space-8` | 24-32px | Card sections |
| Layout gap | `space-8` to `space-12` | 32-48px | Page sections |
| Page padding | `space-4` to `space-8` | 16-32px | Container padding |

### 2.4 Border Radius Tokens

```css
--radius-none: 0;
--radius-sm: 0.25rem;    /* 4px - Subtle rounding */
--radius-md: 0.375rem;   /* 6px - Default inputs/buttons */
--radius-lg: 0.5rem;     /* 8px - Cards, modals */
--radius-xl: 0.75rem;    /* 12px - Large cards */
--radius-2xl: 1rem;      /* 16px - Hero sections */
--radius-3xl: 1.5rem;    /* 24px - Emphasis cards */
--radius-full: 9999px;   /* Fully rounded (pills, avatars) */
```

#### Border Radius Usage

| Component | Token |
|-----------|-------|
| Buttons | `radius-md` |
| Input fields | `radius-md` |
| Cards | `radius-lg` |
| Modals/Dialogs | `radius-xl` |
| Tooltips | `radius-md` |
| Badges | `radius-full` |
| Avatars | `radius-full` |
| Document preview | `radius-lg` |

### 2.5 Shadow Tokens

```css
/* Elevation shadows */
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

/* Colored shadows for emphasis */
--shadow-primary: 0 4px 14px 0 rgb(59 130 246 / 0.25);
--shadow-success: 0 4px 14px 0 rgb(34 197 94 / 0.25);
--shadow-error: 0 4px 14px 0 rgb(239 68 68 / 0.25);
```

#### Shadow Usage

| Context | Token | Usage |
|---------|-------|-------|
| Subtle lift | `shadow-xs` | Table rows on hover |
| Cards | `shadow-sm` | Default card elevation |
| Dropdowns | `shadow-md` | Dropdown menus, popovers |
| Modals | `shadow-lg` | Modal dialogs |
| Hero elements | `shadow-xl` | Featured cards, CTAs |
| Document preview | `shadow-lg` | Quote/Invoice preview |
| Primary button hover | `shadow-primary` | CTA emphasis |

### 2.6 Animation/Transition Tokens

```css
/* Duration */
--duration-instant: 0ms;
--duration-fast: 100ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 400ms;
--duration-slowest: 500ms;

/* Easing */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Transition presets */
--transition-colors: color, background-color, border-color, fill, stroke var(--duration-normal) var(--ease-in-out);
--transition-opacity: opacity var(--duration-normal) var(--ease-in-out);
--transition-shadow: box-shadow var(--duration-normal) var(--ease-in-out);
--transition-transform: transform var(--duration-normal) var(--ease-out);
--transition-all: all var(--duration-normal) var(--ease-in-out);
```

---

## 3. Component Library

All components are built on Shadcn UI with Minimals design tokens applied.

### 3.1 Buttons

#### Button Variants

```
PRIMARY          SECONDARY        OUTLINE          GHOST            DESTRUCTIVE
+----------+     +----------+     +----------+     +----------+     +----------+
|  Label   |     |  Label   |     |  Label   |     |  Label   |     |  Delete  |
+----------+     +----------+     +----------+     +----------+     +----------+
 Blue BG          Gray BG          Border only     No border        Red BG
 White text       Dark text        Primary text    Muted text       White text
```

#### Button Sizes

| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| `xs` | 28px | 8px 12px | 12px | 14px |
| `sm` | 32px | 8px 14px | 13px | 16px |
| `md` | 40px | 10px 16px | 14px | 18px |
| `lg` | 48px | 12px 20px | 16px | 20px |
| `xl` | 56px | 14px 24px | 18px | 24px |

#### Button States

```
DEFAULT          HOVER            ACTIVE           DISABLED         LOADING
+----------+     +----------+     +----------+     +----------+     +----------+
|  Label   |     |  Label   |     |  Label   |     |  Label   |     | [..]     |
+----------+     +----------+     +----------+     +----------+     +----------+
 Base color       Darker           Darkest          50% opacity      Spinner
                  Shadow lift      Slight scale     No pointer       Disabled
```

#### Button Specifications

```css
/* Primary Button */
.btn-primary {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-all);
}
.btn-primary:hover {
  background: var(--color-primary-600);
  box-shadow: var(--shadow-primary);
}
.btn-primary:active {
  background: var(--color-primary-700);
  transform: scale(0.98);
}
```

### 3.2 Input Fields

#### Text Input

```
LABEL (Optional)
+----------------------------------------+
| Placeholder text                       |
+----------------------------------------+
Helper text or error message

STATES:
Default:    Gray border (#E2E8F0)
Focused:    Primary border + ring
Error:      Red border + error message
Disabled:   Gray bg, muted text
```

#### Input Specifications

| Property | Value |
|----------|-------|
| Height | 40px (md), 36px (sm), 48px (lg) |
| Border | 1px solid var(--border-default) |
| Border radius | var(--radius-md) |
| Padding | 12px 14px |
| Font size | 14px |
| Focus ring | 2px primary-200 |

#### Select/Dropdown

```
+----------------------------------------+
| Selected option                      v |
+----------------------------------------+
| Option 1                               |
| Option 2 (selected)              [*]   |
| Option 3                               |
+----------------------------------------+
```

#### Checkbox & Radio

```
CHECKBOX                    RADIO
[ ] Unchecked               ( ) Unselected
[x] Checked                 (*) Selected
[-] Indeterminate
```

#### Switch/Toggle

```
OFF                         ON
+-------+                   +-------+
| O     |                   |     O |
+-------+                   +-------+
 Gray bg                     Primary bg
```

### 3.3 Cards

#### Card Anatomy

```
+--------------------------------------------------+
|                                                  |
|  [Header Area]                                   |
|  Title                              [Actions]    |
|  Subtitle/Description                            |
|                                                  |
|  ------------------------------------------------|
|                                                  |
|  [Content Area]                                  |
|  Main card content goes here                     |
|                                                  |
|  ------------------------------------------------|
|                                                  |
|  [Footer Area]                   [Actions]       |
|                                                  |
+--------------------------------------------------+
```

#### Card Specifications

```css
.card {
  background: var(--bg-default);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-6);
}

.card-hover:hover {
  border-color: var(--border-emphasis);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

#### Card Variants

| Variant | Border | Shadow | Use Case |
|---------|--------|--------|----------|
| Default | Yes | sm | Standard content |
| Elevated | No | md | Featured items |
| Interactive | Yes | sm -> md on hover | Clickable items |
| Outlined | Yes (emphasis) | none | Form groups |

### 3.4 Modals/Dialogs

#### Modal Anatomy

```
+--------------------------------------------------+
|  [X]                                             |
|                                                  |
|  Modal Title                                     |
|  Description text explaining the modal purpose   |
|                                                  |
|  ------------------------------------------------|
|                                                  |
|  [Content Area]                                  |
|                                                  |
|  ------------------------------------------------|
|                                                  |
|                         [Cancel]   [Confirm]     |
|                                                  |
+--------------------------------------------------+

Overlay: rgba(0, 0, 0, 0.5)
```

#### Modal Sizes

| Size | Width | Use Case |
|------|-------|----------|
| `sm` | 400px | Confirmations |
| `md` | 500px | Forms, standard |
| `lg` | 640px | Complex forms |
| `xl` | 800px | Multi-step wizards |
| `full` | 90vw | Rich content |

### 3.5 Tables

#### Table Anatomy

```
+------------------------------------------------------------------+
| [ ] | Name           | Amount    | Status    | Date     | ...   |
+------------------------------------------------------------------+
| [ ] | Quote #1001    | $2,500    | [Sent]    | Jan 15   | [...] |
| [ ] | Quote #1002    | $4,200    | [Accepted]| Jan 18   | [...] |
| [ ] | Quote #1003    | $1,800    | [Draft]   | Jan 20   | [...] |
+------------------------------------------------------------------+
                                              [< 1 2 3 4 5 ... >]
```

#### Table Features

- **Sortable columns:** Click header to sort
- **Filterable:** Filter by status, date range, amount
- **Selectable rows:** Checkbox for bulk actions
- **Row actions:** Contextual menu on each row
- **Pagination:** Bottom pagination with page size selector
- **Empty state:** Illustrated empty state when no data

#### Table Row States

| State | Background | Border |
|-------|------------|--------|
| Default | transparent | bottom border |
| Hover | neutral-50 | bottom border |
| Selected | primary-50 | primary-200 left border |
| Expanded | neutral-50 | none (merged with detail) |

### 3.6 Tabs

```
+-------+----------+----------+----------+
| Tab 1 |  Tab 2   |  Tab 3   |  Tab 4   |
+-------+----------+----------+----------+
| [Active panel content]                 |
|                                        |
+----------------------------------------+

Active tab: Primary color underline, bold text
Inactive tab: Muted text, no underline
```

### 3.7 Badges/Status Indicators

```
STATUS BADGES:
+--------+  +----------+  +--------+  +---------+  +----------+
| Draft  |  |   Sent   |  | Viewed |  | Accepted|  |   Paid   |
+--------+  +----------+  +--------+  +---------+  +----------+
 Gray        Blue          Purple      Green        Green dark

+---------+  +----------+
| Overdue |  | Declined |
+---------+  +----------+
 Orange       Red
```

#### Badge Specifications

| Status | Background | Text Color | Icon |
|--------|------------|------------|------|
| Draft | neutral-100 | neutral-600 | Circle |
| Sent | info-100 | info-700 | Send |
| Viewed | secondary-100 | secondary-700 | Eye |
| Accepted | success-100 | success-700 | Check |
| Paid | success-500 | white | Check-circle |
| Overdue | warning-100 | warning-700 | Alert |
| Declined | error-100 | error-700 | X-circle |

### 3.8 Toast Notifications

```
SUCCESS                              ERROR
+-----------------------------------+ +-----------------------------------+
| [Check] Quote sent successfully   | | [X] Failed to save changes       |
|         [Dismiss]                 | |     [Retry]  [Dismiss]           |
+-----------------------------------+ +-----------------------------------+
 Green left border                    Red left border

Position: Bottom-right
Duration: 5 seconds (auto-dismiss)
Max visible: 3 stacked
```

### 3.9 Dropdown Menus

```
+---------------------------+
| Edit                      |
| Duplicate                 |
| Send                      |
|---------------------------|
| Convert to Invoice        |
|---------------------------|
| Archive              [->] |
| Delete               [!]  |
+---------------------------+
```

### 3.10 Navigation Components

#### Sidebar Navigation

```
+---------------------------+
|  [Logo]                   |
+---------------------------+
|                           |
|  [D] Dashboard            |  <- Active: primary bg
|  [Q] Quotes               |
|  [I] Invoices             |
|  [C] Clients              |
|  [R] Rate Cards           |
|                           |
+---------------------------+
|                           |
|  SETTINGS                 |
|  [G] General              |
|  [P] Payments             |
|  [B] Branding             |
|  [T] Templates            |
|                           |
+---------------------------+
|                           |
|  [Avatar] User Name       |
|  account@email.com        |
|                           |
+---------------------------+

Width: 240px (expanded), 64px (collapsed)
```

#### Top Navigation Bar

```
+------------------------------------------------------------------+
| [Hamburger]  [Breadcrumb: Dashboard / Quotes / #1001]   [Search] |
|                                                                  |
|                     [Notifications]  [Help]  [Avatar v]          |
+------------------------------------------------------------------+
```

---

## 4. Page Layouts

### 4.1 Dashboard Layout

```
+------------------------------------------------------------------+
|  [Logo]  [Nav Items...]                    [Search] [Bell] [User] |
+----------+---------------------------------------------------------+
|          |                                                         |
|  [Nav]   |  Page Title                              [Actions...]   |
|          |  Description text                                       |
|          |                                                         |
|          |  +-------------+ +-------------+ +-------------+        |
|          |  | Stats Card  | | Stats Card  | | Stats Card  |        |
|          |  +-------------+ +-------------+ +-------------+        |
|          |                                                         |
|          |  +-------------------------------------------+          |
|          |  |                                           |          |
|          |  |  Main Content Area                        |          |
|          |  |                                           |          |
|          |  +-------------------------------------------+          |
|          |                                                         |
+----------+---------------------------------------------------------+
```

### 4.2 List Page Layout

```
+------------------------------------------------------------------+
|  Header Bar                                                       |
+----------+---------------------------------------------------------+
|          |                                                         |
|  [Nav]   |  Quotes                                [+ New Quote]    |
|          |                                                         |
|          |  +---------------------------------------------------+  |
|          |  | [Search...]  [Status v] [Date v] [Amount v] [...]|  |
|          |  +---------------------------------------------------+  |
|          |                                                         |
|          |  +---------------------------------------------------+  |
|          |  |  [Table Header]                                   |  |
|          |  |----------------------------------------------------|  |
|          |  |  [Table Rows...]                                  |  |
|          |  |                                                   |  |
|          |  |                                                   |  |
|          |  |                                                   |  |
|          |  +---------------------------------------------------+  |
|          |                                                         |
|          |  [Pagination]                                           |
|          |                                                         |
+----------+---------------------------------------------------------+
```

### 4.3 Editor Layout (Quote/Invoice Builder)

**CRITICAL: This is the visual builder experience**

```
+------------------------------------------------------------------+
|  [< Back] Quote #1001 - Acme Corp          [Preview] [Save] [Send]|
+----------+---------+-----------------------------+-----------------+
|          |         |                             |                 |
|  [Nav]   |  BLOCKS |     DOCUMENT CANVAS         |   PROPERTIES    |
|          |         |                             |                 |
|          | +-----+ |  +------------------------+ |  Client         |
|          | |Head | |  |                        | |  +-----------+  |
|          | +-----+ |  |   [Company Logo]       | |  | Acme Corp |  |
|          | |Text | |  |                        | |  +-----------+  |
|          | +-----+ |  |   QUOTE               | |                 |
|          | |Line | |  |   #1001               | |  Expiration     |
|          | |Items| |  |                        | |  [Feb 15, 2026] |
|          | +-----+ |  |   +------------------+ | |                 |
|          | |Image| |  |   | Line Item        | | |  Deposit        |
|          | +-----+ |  |   | $2,500           | | |  [30%]          |
|          | |Div  | |  |   +------------------+ | |                 |
|          | +-----+ |  |                        | |  Terms          |
|          |         |  |   [+ Add Block]        | |  [Net 30]       |
|          | RATE    |  |                        | |                 |
|          | CARDS   |  |   -------------------  | |  Style          |
|          | +-----+ |  |                        | |  [Template v]   |
|          | |Svc A| |  |   TOTAL: $2,500        | |                 |
|          | +-----+ |  |                        | |                 |
|          | |Svc B| |  +------------------------+ |                 |
|          | +-----+ |  |                          |                 |
|          |         |  |      Document Shadow     |                 |
+----------+---------+-----------------------------+-----------------+

Left Panel: 200px (collapsible)
Canvas: Flexible (centered document)
Right Panel: 280px (collapsible)
```

### 4.4 Settings Layout

```
+------------------------------------------------------------------+
|  Header Bar                                                       |
+----------+---------------------------------------------------------+
|          |                                                         |
|  [Nav]   |  Settings                                              |
|          |                                                         |
|          |  +---------------+  +--------------------------------+  |
|          |  | Business      |  |                                |  |
|          |  | Payments      |  |  [Settings Content]            |  |
|          |  | Email         |  |                                |  |
|          |  | Branding   <- |  |  Form fields, toggles, etc.    |  |
|          |  | Templates     |  |                                |  |
|          |  | Modules       |  |                                |  |
|          |  | Team          |  |                                |  |
|          |  +---------------+  +--------------------------------+  |
|          |                                                         |
+----------+---------------------------------------------------------+

Settings nav: 200px
Content area: Flexible (max-width: 680px for forms)
```

### 4.5 Client-Facing Layout (Accept/Pay)

**No sidebar navigation - clean, branded experience**

```
+------------------------------------------------------------------+
|  [User's Company Logo]                                           |
+------------------------------------------------------------------+
|                                                                  |
|     +------------------------------------------------------+     |
|     |                                                      |     |
|     |  QUOTE FROM                                          |     |
|     |  Company Name                                        |     |
|     |                                                      |     |
|     |  FOR: Client Name                                    |     |
|     |  DATE: January 15, 2026                              |     |
|     |                                                      |     |
|     |  -------------------------------------------------- |     |
|     |                                                      |     |
|     |  [Line Items...]                                     |     |
|     |                                                      |     |
|     |  -------------------------------------------------- |     |
|     |                                                      |     |
|     |  TOTAL: $2,500.00                                    |     |
|     |  DEPOSIT DUE: $750.00                                |     |
|     |                                                      |     |
|     |  +----------------------------------------------+    |     |
|     |  | [x] I agree to the terms and conditions     |    |     |
|     |  |                                              |    |     |
|     |  | Signature: [___________________________]     |    |     |
|     |  |                                              |    |     |
|     |  | [      Accept & Pay $750.00 Deposit      ]  |    |     |
|     |  +----------------------------------------------+    |     |
|     |                                                      |     |
|     +------------------------------------------------------+     |
|                                                                  |
|  Powered by [Product Logo]                                       |
+------------------------------------------------------------------+

Max-width: 720px centered
Background: User's brand color (subtle) or neutral
```

---

## 5. Key Screens Specifications

### 5.1 Dashboard

```
+------------------------------------------------------------------+
|  Good morning, Claire                           [+ New Quote]     |
|  Here's your business overview                                    |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------+ +------------------+ +------------------+   |
|  |   OUTSTANDING    | |  PENDING QUOTES  | |   THIS MONTH     |   |
|  |   INVOICES       | |                  | |   REVENUE        |   |
|  |                  | |                  | |                  |   |
|  |   $12,450        | |      5           | |   $8,200         |   |
|  |   3 invoices     | |   $15,200 total  | |   +23% vs last   |   |
|  |                  | |                  | |                  |   |
|  +------------------+ +------------------+ +------------------+   |
|                                                                   |
|  +-----------------------------------+ +------------------------+ |
|  |  RECENT ACTIVITY                  | |  QUICK ACTIONS         | |
|  |  ----------------------------     | |  --------------------  | |
|  |  [*] Quote #1005 was viewed       | |  [+] Create Quote      | |
|  |      Acme Corp - 2 hours ago      | |  [+] Create Invoice    | |
|  |                                   | |  [->] Send Reminder    | |
|  |  [$] Invoice #2001 was paid       | |  [#] View Rate Cards   | |
|  |      Beta Inc - 5 hours ago       | |                        | |
|  |                                   | |                        | |
|  |  [!] Quote #1003 expires tomorrow | |                        | |
|  |      Client XYZ                   | |                        | |
|  |                                   | |                        | |
|  +-----------------------------------+ +------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  |  UPCOMING PAYMENTS                                           | |
|  |  ----------------------------------------------------------- | |
|  |  Invoice #2003   |  Acme Corp    | $2,500  | Due Jan 25      | |
|  |  Invoice #2005   |  Beta Inc     | $1,200  | Due Jan 28      | |
|  |  Milestone       |  Client XYZ   | $4,500  | Due Feb 1       | |
|  +--------------------------------------------------------------+ |
|                                                                   |
+-------------------------------------------------------------------+
```

**Stats Card Specifications:**

| Stat | Color | Icon |
|------|-------|------|
| Outstanding | Warning (orange) | DollarSign |
| Pending Quotes | Primary (blue) | FileText |
| Revenue | Success (green) | TrendingUp |

### 5.2 Quotes/Invoices List

```
+------------------------------------------------------------------+
|  Quotes                                           [+ New Quote]   |
|  Manage all your quotes in one place                             |
+------------------------------------------------------------------+
|                                                                   |
|  +--------------------------------------------------------------+ |
|  | [Search quotes...]          [Status: All v] [Sort: Newest v] | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  +--------------------------------------------------------------+ |
|  | [ ] | QUOTE       | CLIENT      | AMOUNT  | STATUS  | DATE  | |
|  |-----|-------------|-------------|---------|---------|-------| |
|  | [ ] | #1005       | Acme Corp   | $2,500  | [Sent]  | Jan20 | |
|  |     | Website...  |             |         |         | [...] | |
|  |-----|-------------|-------------|---------|---------|-------| |
|  | [ ] | #1004       | Beta Inc    | $4,200  |[Accept] | Jan18 | |
|  |     | Brand Id... |             |         |         | [...] | |
|  |-----|-------------|-------------|---------|---------|-------| |
|  | [ ] | #1003       | Client XYZ  | $1,800  | [Draft] | Jan15 | |
|  |     | Logo Des... |             |         |         | [...] | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  Showing 1-10 of 24 quotes      [< Prev]  1  2  3  [Next >]      |
|                                                                   |
+-------------------------------------------------------------------+

EMPTY STATE:
+--------------------------------------------------------------+
|                                                              |
|                    [Illustration]                            |
|                                                              |
|            No quotes yet                                     |
|            Create your first quote to get started            |
|                                                              |
|                   [+ Create Quote]                           |
|                                                              |
+--------------------------------------------------------------+
```

**List Row Actions (on hover/click):**
- Edit
- Duplicate
- Send/Resend
- Convert to Invoice (if accepted)
- Archive
- Delete

### 5.3 Visual Quote/Invoice Builder (CRITICAL)

**This is the core differentiating feature.**

```
+------------------------------------------------------------------+
|  [< Back to Quotes]  Quote #1005            [Preview] [Save] [Send]|
+------------------------------------------------------------------+
|         |                                          |               |
| BLOCKS  |            DOCUMENT CANVAS               |  SETTINGS     |
|         |                                          |               |
| +-----+ |   +----------------------------------+   |  CLIENT       |
| |[H]  | |   |                                  |   |  -----------  |
| |Head | |   |   [LOGO]     THOMPSON            |   |  Acme Corp    |
| |er   | |   |              RENOVATIONS         |   |  john@acme.co |
| +-----+ |   |                                  |   |  [Change]     |
|         |   |   ----------------------------   |   |               |
| +-----+ |   |                                  |   |  QUOTE INFO   |
| |[T]  | |   |   QUOTE                          |   |  -----------  |
| |Text | |   |   For: John Smith                |   |  Number       |
| |     | |   |   Date: January 20, 2026         |   |  [1005]       |
| +-----+ |   |   Valid until: Feb 20, 2026      |   |               |
|         |   |                                  |   |  Date         |
| +-----+ |   |   ----------------------------   |   |  [Jan 20]     |
| |[L]  | |   |                                  |   |               |
| |Line | |   |   +----------------------------+ |   |  Expiration   |
| |Items| |   |   | Website Redesign           | |   |  [Feb 20]     |
| +-----+ |   |   | Complete redesign of...    | |   |               |
|         |   |   | Qty: 1    Rate: $2,500     | |   |  PAYMENT      |
| +-----+ |   |   |            Total: $2,500   | |   |  -----------  |
| |[I]  | |   |   +----------------------------+ |   |  Deposit      |
| |Image| |   |                                  |   |  [x] Required |
| +-----+ |   |   [+ Add Line Item]              |   |  [30] %       |
|         |   |                                  |   |               |
| +-----+ |   |   ----------------------------   |   |  Terms        |
| |[D]  | |   |                                  |   |  [Net 30 v]   |
| |Div  | |   |   SUBTOTAL:          $2,500.00  |   |               |
| |ider | |   |   TAX (8%):            $200.00  |   |  STYLE        |
| +-----+ |   |   ----------------------------  |   |  -----------  |
|         |   |   TOTAL:             $2,700.00  |   |  Template     |
| ------  |   |                                  |   |  [Modern v]   |
|         |   |   DEPOSIT DUE:         $810.00  |   |               |
| RATE    |   |                                  |   |  Accent Color |
| CARDS   |   +----------------------------------+   |  [#3B82F6]    |
| +-----+ |                                          |               |
| |Web  | |   [Document has shadow and looks like   |  CONTRACT     |
| |Dsn  | |    a real document on a canvas]         |  -----------  |
| +-----+ |                                          |  [x] Attach   |
| +-----+ |                                          |  [Select...]  |
| |Logo | |                                          |               |
| +-----+ |                                          |               |
| +-----+ |                                          |               |
| |Brand| |                                          |               |
| +-----+ |                                          |               |
|         |                                          |               |
+---------+------------------------------------------+---------------+

Left Panel: 200px, collapsible
Canvas: Flexible, document max-width 680px centered
Right Panel: 280px, collapsible
```

**Block Types:**

| Block | Icon | Description |
|-------|------|-------------|
| Header | H | Company info, logo, document title |
| Text | T | Rich text content (description, terms) |
| Line Items | L | Table of services/products with pricing |
| Image | I | Upload images (portfolio, diagrams) |
| Divider | D | Visual separator |
| Signature | S | Signature capture area |
| Payment Schedule | P | Milestone/deposit breakdown |

**Block Interaction:**

```
+----------------------------------+
| [Drag Handle]  Line Items   [X]  |  <- Block header on hover
+----------------------------------+
| +------------------------------+ |
| | Service Name        $X,XXX  | |
| | Description text...         | |
| +------------------------------+ |
| | [+ Add Item]                 | |
+----------------------------------+

Drag to reorder
Click X to delete (confirm)
Click block to select and show properties
```

**Rate Card Quick-Add:**

```
Drag rate card item to canvas
       |
       v
+------------------+
| Web Design       |
| $2,500           |
+------------------+
       |
       v
[Adds pre-configured line item]
```

### 5.4 Client Portal - Quote Accept

```
+------------------------------------------------------------------+
|  [THOMPSON RENOVATIONS LOGO]                                      |
+------------------------------------------------------------------+
|                                                                   |
|     +--------------------------------------------------------+   |
|     |                                                        |   |
|     |  QUOTE #1005                                           |   |
|     |                                                        |   |
|     |  From: Thompson Renovations                            |   |
|     |  For:  John Smith, Acme Corp                           |   |
|     |  Date: January 20, 2026                                |   |
|     |  Valid until: February 20, 2026                        |   |
|     |                                                        |   |
|     |  ----------------------------------------------------  |   |
|     |                                                        |   |
|     |  PROJECT DESCRIPTION                                   |   |
|     |                                                        |   |
|     |  Complete website redesign including homepage,         |   |
|     |  5 interior pages, mobile responsive design,           |   |
|     |  and content management system integration.            |   |
|     |                                                        |   |
|     |  ----------------------------------------------------  |   |
|     |                                                        |   |
|     |  LINE ITEMS                                            |   |
|     |                                                        |   |
|     |  Website Redesign                          $2,000.00   |   |
|     |  Complete redesign with modern UI                      |   |
|     |                                                        |   |
|     |  CMS Integration                             $500.00   |   |
|     |  WordPress setup and training                          |   |
|     |                                                        |   |
|     |  ----------------------------------------------------  |   |
|     |  SUBTOTAL                                  $2,500.00   |   |
|     |  TAX (8%)                                    $200.00   |   |
|     |  ----------------------------------------------------  |   |
|     |  TOTAL                                     $2,700.00   |   |
|     |                                                        |   |
|     |  +--------------------------------------------------+  |   |
|     |  |  PAYMENT SCHEDULE                                |  |   |
|     |  |                                                  |  |   |
|     |  |  [========30%========|----70%----]               |  |   |
|     |  |                                                  |  |   |
|     |  |  Deposit (30%): $810.00 - Due on acceptance     |  |   |
|     |  |  Final (70%): $1,890.00 - Due on completion     |  |   |
|     |  +--------------------------------------------------+  |   |
|     |                                                        |   |
|     |  [View Terms & Conditions]                             |   |
|     |                                                        |   |
|     |  ----------------------------------------------------  |   |
|     |                                                        |   |
|     |  +--------------------------------------------------+  |   |
|     |  |  ACCEPT THIS QUOTE                               |  |   |
|     |  |                                                  |  |   |
|     |  |  [x] I have read and agree to the terms and     |  |   |
|     |  |      conditions                                  |  |   |
|     |  |                                                  |  |   |
|     |  |  Your Signature                                  |  |   |
|     |  |  +--------------------------------------------+ |  |   |
|     |  |  |                                            | |  |   |
|     |  |  |  [Sign with finger/mouse]                  | |  |   |
|     |  |  |                                            | |  |   |
|     |  |  +--------------------------------------------+ |  |   |
|     |  |  [Clear]                    [Type instead]     |  |   |
|     |  |                                                  |  |   |
|     |  |  +--------------------------------------------+ |  |   |
|     |  |  |     Accept & Pay Deposit ($810.00)         | |  |   |
|     |  |  +--------------------------------------------+ |  |   |
|     |  |                                                  |  |   |
|     |  +--------------------------------------------------+  |   |
|     |                                                        |   |
|     |  [Download PDF]                                        |   |
|     |                                                        |   |
|     +--------------------------------------------------------+   |
|                                                                   |
|  Questions? Contact: chris@thompsonreno.com                       |
|                                                                   |
|  Powered by [Product Name]                                        |
+-------------------------------------------------------------------+
```

**Signature Component:**

```
TYPE SIGNATURE:
+--------------------------------------------+
| Type your name:                            |
| [John Smith_______________________________]|
|                                            |
| Preview:                                   |
| +----------------------------------------+ |
| |                                        | |
| |   John Smith  (cursive font)           | |
| |                                        | |
| +----------------------------------------+ |
+--------------------------------------------+

DRAW SIGNATURE:
+--------------------------------------------+
| Draw your signature:                       |
| +----------------------------------------+ |
| |                                        | |
| |   ~~~~~signature~~~~~                  | |
| |                                        | |
| +----------------------------------------+ |
| [Clear]                                    |
+--------------------------------------------+
```

### 5.5 Client Portal - Invoice Pay

```
+------------------------------------------------------------------+
|  [COMPANY LOGO]                                                   |
+------------------------------------------------------------------+
|                                                                   |
|     +--------------------------------------------------------+   |
|     |                                                        |   |
|     |  INVOICE #INV-2026-0045                                |   |
|     |                                                        |   |
|     |  From: Thompson Renovations                            |   |
|     |  For:  John Smith, Acme Corp                           |   |
|     |                                                        |   |
|     |  +--------------------------------------------------+  |   |
|     |  |  STATUS: Due                      DUE: Jan 30    |  |   |
|     |  +--------------------------------------------------+  |   |
|     |                                                        |   |
|     |  Website Redesign - Final Payment                      |   |
|     |  Reference: Quote #1005                                |   |
|     |                                                        |   |
|     |  ----------------------------------------------------  |   |
|     |                                                        |   |
|     |  AMOUNT DUE                             $1,890.00      |   |
|     |                                                        |   |
|     |  ----------------------------------------------------  |   |
|     |                                                        |   |
|     |  +--------------------------------------------------+  |   |
|     |  |  PAYMENT                                         |  |   |
|     |  |                                                  |  |   |
|     |  |  Amount to Pay                                   |  |   |
|     |  |  (*) Full amount: $1,890.00                     |  |   |
|     |  |  ( ) Partial amount: [$________]                |  |   |
|     |  |                                                  |  |   |
|     |  |  Payment Method                                  |  |   |
|     |  |  +----------------------------------------------+|  |   |
|     |  |  | (*) Credit Card                              ||  |   |
|     |  |  |     Visa, Mastercard, Amex                   ||  |   |
|     |  |  |     Processing fee: 2.9% + $0.30             ||  |   |
|     |  |  +----------------------------------------------+|  |   |
|     |  |  +----------------------------------------------+|  |   |
|     |  |  | ( ) Bank Transfer (ACH)         RECOMMENDED  ||  |   |
|     |  |  |     No processing fee                        ||  |   |
|     |  |  |     Clears in 3-5 business days              ||  |   |
|     |  |  +----------------------------------------------+|  |   |
|     |  |                                                  |  |   |
|     |  |  Card Details                                    |  |   |
|     |  |  +--------------------------------------------+ |  |   |
|     |  |  | Card Number                                | |  |   |
|     |  |  | [________________________] [VISA]          | |  |   |
|     |  |  +--------------------------------------------+ |  |   |
|     |  |  +--------------------+ +---------------------+ |  |   |
|     |  |  | Expiry             | | CVV                 | |  |   |
|     |  |  | [MM/YY]            | | [***]               | |  |   |
|     |  |  +--------------------+ +---------------------+ |  |   |
|     |  |                                                  |  |   |
|     |  |  [ ] Save this card for future payments          |  |   |
|     |  |                                                  |  |   |
|     |  |  +--------------------------------------------+ |  |   |
|     |  |  |          Pay $1,890.00                     | |  |   |
|     |  |  +--------------------------------------------+ |  |   |
|     |  |                                                  |  |   |
|     |  |  [Lock Icon] Secure payment powered by Stripe    |  |   |
|     |  |                                                  |  |   |
|     |  +--------------------------------------------------+  |   |
|     |                                                        |   |
|     |  [Download PDF]  [View Original Quote]                 |   |
|     |                                                        |   |
|     +--------------------------------------------------------+   |
|                                                                   |
|  Questions? Contact: chris@thompsonreno.com                       |
|                                                                   |
+-------------------------------------------------------------------+
```

### 5.6 Settings Pages

#### Business Profile Settings

```
+------------------------------------------------------------------+
|  Settings > Business Profile                                      |
+------------------------------------------------------------------+
|                                                                   |
|  +-------------------+  +-------------------------------------+   |
|  | Business          |  |                                     |   |
|  | Payments       <- |  |  BUSINESS INFORMATION               |   |
|  | Email Templates   |  |                                     |   |
|  | Branding          |  |  Business Name                      |   |
|  | Templates         |  |  [Thompson Renovations_____________]|   |
|  | Modules           |  |                                     |   |
|  | Team              |  |  Business Email                     |   |
|  +-------------------+  |  [chris@thompsonreno.com___________]|   |
|                         |                                     |   |
|                         |  Phone Number                       |   |
|                         |  [(555) 123-4567__________________]|   |
|                         |                                     |   |
|                         |  Website                            |   |
|                         |  [https://thompsonreno.com_________]|   |
|                         |                                     |   |
|                         |  ---------------------------------- |   |
|                         |                                     |   |
|                         |  BUSINESS ADDRESS                   |   |
|                         |                                     |   |
|                         |  Street Address                     |   |
|                         |  [123 Main Street_________________]|   |
|                         |                                     |   |
|                         |  City           State      Zip      |   |
|                         |  [Denver___]    [CO__]    [80202_] |   |
|                         |                                     |   |
|                         |  Country                            |   |
|                         |  [United States_________________ v]|   |
|                         |                                     |   |
|                         |           [Save Changes]            |   |
|                         |                                     |   |
|                         +-------------------------------------+   |
|                                                                   |
+-------------------------------------------------------------------+
```

#### Payment Setup Settings

```
+------------------------------------------------------------------+
|  Settings > Payment Setup                                         |
+------------------------------------------------------------------+
|                                                                   |
|  +-------------------+  +-------------------------------------+   |
|  | Business          |  |                                     |   |
|  | Payments       <- |  |  STRIPE ACCOUNT                     |   |
|  | Email Templates   |  |                                     |   |
|  | Branding          |  |  +-------------------------------+  |   |
|  | Templates         |  |  | [Stripe Logo]                 |  |   |
|  | Modules           |  |  |                               |  |   |
|  | Team              |  |  | Status: Connected             |  |   |
|  +-------------------+  |  | Account: acct_1234...         |  |   |
|  |                      |  |                               |  |   |
|  |                      |  | [Manage in Stripe Dashboard]  |  |   |
|  |                      |  +-------------------------------+  |   |
|  |                      |                                     |   |
|  |                      |  ---------------------------------- |   |
|  |                      |                                     |   |
|  |                      |  PAYMENT METHODS                    |   |
|  |                      |                                     |   |
|  |                      |  [x] Credit/Debit Cards            |   |
|  |                      |      Fee: 2.9% + $0.30             |   |
|  |                      |                                     |   |
|  |                      |  [x] ACH Bank Transfer              |   |
|  |                      |      Fee: 0.8% (capped at $5)       |   |
|  |                      |                                     |   |
|  |                      |  ---------------------------------- |   |
|  |                      |                                     |   |
|  |                      |  DEFAULT TERMS                      |   |
|  |                      |                                     |   |
|  |                      |  Payment Terms                      |   |
|  |                      |  [Net 30________________________ v]|   |
|  |                      |                                     |   |
|  |                      |  Late Payment Fee                   |   |
|  |                      |  [_] Enable late fees               |   |
|  |                      |                                     |   |
|  |                      |           [Save Changes]            |   |
|  |                      |                                     |   |
|  |                      +-------------------------------------+   |
|                                                                   |
+-------------------------------------------------------------------+
```

#### Branding Settings

```
+------------------------------------------------------------------+
|  Settings > Branding                                              |
+------------------------------------------------------------------+
|                                                                   |
|  +-------------------+  +-------------------------------------+   |
|  | Business          |  |                                     |   |
|  | Payments          |  |  LOGO                               |   |
|  | Email Templates   |  |                                     |   |
|  | Branding       <- |  |  +-------------+                    |   |
|  | Templates         |  |  |             |  [Upload New]      |   |
|  | Modules           |  |  |   [LOGO]    |  [Remove]          |   |
|  | Team              |  |  |             |                    |   |
|  +-------------------+  |  +-------------+                    |   |
|                         |  Recommended: 400x100px, PNG/SVG    |   |
|                         |                                     |   |
|                         |  ---------------------------------- |   |
|                         |                                     |   |
|                         |  BRAND COLORS                       |   |
|                         |                                     |   |
|                         |  Primary Color                      |   |
|                         |  +-------+                          |   |
|                         |  |[####]_| #3B82F6                 |   |
|                         |  +-------+                          |   |
|                         |                                     |   |
|                         |  Accent Color                       |   |
|                         |  +-------+                          |   |
|                         |  |[####]_| #22C55E                 |   |
|                         |  +-------+                          |   |
|                         |                                     |   |
|                         |  ---------------------------------- |   |
|                         |                                     |   |
|                         |  PREVIEW                            |   |
|                         |                                     |   |
|                         |  +-----------------------------+    |   |
|                         |  |  [Mini quote preview with   |    |   |
|                         |  |   brand colors applied]     |    |   |
|                         |  +-----------------------------+    |   |
|                         |                                     |   |
|                         |           [Save Changes]            |   |
|                         |                                     |   |
|                         +-------------------------------------+   |
|                                                                   |
+-------------------------------------------------------------------+
```

---

## 6. Responsive Design

### 6.1 Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small tablets, large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small desktops, landscape tablets */
--breakpoint-xl: 1280px;  /* Standard desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

### 6.2 Layout Adaptations

#### Mobile (< 640px)

```
+------------------+
| [=] Logo         |
+------------------+
|                  |
|  Page Content    |
|  (Full Width)    |
|                  |
|                  |
+------------------+
| [Nav] [Nav] [Nav]|  <- Bottom navigation
+------------------+

- Sidebar hidden, hamburger menu
- Single column layout
- Bottom navigation for main actions
- Cards stack vertically
- Tables become cards
```

#### Tablet (640px - 1024px)

```
+--------------------------------+
| Logo              [Nav Icons]  |
+--------------------------------+
|        |                       |
| [Mini  |    Page Content       |
|  Nav]  |    (Two columns       |
|        |     where needed)     |
|        |                       |
+--------------------------------+

- Collapsed sidebar (icons only)
- Two-column layouts where appropriate
- Touch-optimized spacing
```

#### Desktop (> 1024px)

```
+--------------------------------------------------+
| Logo  [Nav Items]              [Search] [Profile] |
+--------+-----------------------------------------+
|        |                                         |
| Full   |         Page Content                    |
| Side   |         (Multi-column layouts)          |
| bar    |                                         |
|        |                                         |
+--------+-----------------------------------------+

- Full sidebar visible
- Multi-column layouts
- Hover states active
```

### 6.3 Component Responsive Behavior

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Navigation | Bottom tabs + hamburger | Icon sidebar | Full sidebar |
| Data Tables | Card view | Condensed table | Full table |
| Forms | Single column | Single column | Two column |
| Modals | Full screen | 90% width | Fixed width |
| Cards | Full width, stacked | 2-column grid | 3-4 column grid |
| Quote Editor | Full width canvas, panels hidden | Canvas + collapsible panels | Three-panel layout |

### 6.4 Touch Considerations

```css
/* Minimum touch target size */
--touch-target-min: 44px;

/* Touch-friendly spacing */
--touch-spacing: 8px;

/* Mobile button sizing */
.btn-mobile {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}
```

---

## 7. Interaction Patterns

### 7.1 Loading States

#### Page Loading

```
+----------------------------------+
|                                  |
|  +----------------------------+  |
|  |  [=======       ]  Loading |  |
|  +----------------------------+  |
|                                  |
|   OR                             |
|                                  |
|  [Skeleton screens showing       |
|   anticipated content layout]    |
|                                  |
+----------------------------------+
```

#### Button Loading

```
DEFAULT              LOADING              DISABLED
+----------+        +----------+        +----------+
|  Submit  |   ->   | [Spin]   |   ->   | Submitted|
+----------+        +----------+        +----------+
```

#### Inline Loading

```
Saving changes...  [Spinner]
```

#### Skeleton Screens

```
+----------------------------------+
| +-----+  [==============]       |
| |     |  [========]              |
| +-----+                          |
|        [==================]      |
|        [==============]          |
+----------------------------------+

Use for:
- Initial page loads
- Data fetching
- Image loading
```

### 7.2 Error States

#### Form Validation Errors

```
Email Address *
+----------------------------------+
| invalid-email                    |  <- Red border
+----------------------------------+
[!] Please enter a valid email address  <- Red text
```

#### Page-Level Errors

```
+----------------------------------+
|  [!]                             |
|                                  |
|  Something went wrong            |
|  We couldn't load your quotes.   |
|                                  |
|  [Try Again]  [Contact Support]  |
|                                  |
+----------------------------------+
```

#### Inline Errors (Toast)

```
+-----------------------------------+
| [X] Failed to save changes        |
|     [Retry]  [Dismiss]           |
+-----------------------------------+
```

### 7.3 Empty States

```
+----------------------------------+
|                                  |
|        [Illustration]            |
|                                  |
|   No quotes yet                  |
|   Create your first quote to     |
|   start winning clients          |
|                                  |
|      [+ Create Quote]            |
|                                  |
+----------------------------------+

Empty state should always have:
1. Relevant illustration
2. Friendly message
3. Clear call-to-action
```

### 7.4 Success Feedback

#### Toast Notification

```
+-----------------------------------+
| [Check] Quote sent successfully!  |
|         [View]  [Dismiss]        |
+-----------------------------------+
```

#### Celebration Moment (First Quote Sent)

```
+----------------------------------+
|                                  |
|    [Confetti Animation]          |
|                                  |
|    Congratulations!              |
|    Your first quote is on        |
|    its way to the client!        |
|                                  |
|    [View Quote] [Create Another] |
|                                  |
+----------------------------------+
```

#### Inline Success

```
Changes saved [Check]
```

### 7.5 Form Validation

#### Real-Time Validation

```
As user types:
- Check format (email, phone)
- Show inline feedback
- Don't show errors until blur

On blur:
- Validate required fields
- Show error messages

On submit:
- Validate all fields
- Focus first error
- Scroll to error if needed
```

#### Validation Message Placement

```
FIELD LABEL *
+----------------------------------+
| User input                       |
+----------------------------------+
[!] Error message directly below field

NEVER:
- Place errors above field
- Use only color (add icon + text)
- Block submission without explanation
```

### 7.6 Confirmation Dialogs

#### Destructive Actions

```
+------------------------------------------+
|                                          |
|  Delete this quote?                      |
|                                          |
|  This action cannot be undone. The       |
|  quote and all associated data will      |
|  be permanently removed.                 |
|                                          |
|          [Cancel]  [Delete Quote]        |
|                    ^^ Red/destructive    |
+------------------------------------------+
```

#### Important Actions

```
+------------------------------------------+
|                                          |
|  Send quote to client?                   |
|                                          |
|  This will email the quote to            |
|  john@acme.com and they'll be able       |
|  to view and accept it.                  |
|                                          |
|          [Cancel]  [Send Quote]          |
|                    ^^ Primary            |
+------------------------------------------+
```

---

## 8. Client-Facing Branding

### 8.1 Customization Options

Users can customize the appearance of client-facing pages (quote accept, invoice pay):

| Element | Customizable | Options |
|---------|--------------|---------|
| Logo | Yes | Upload custom logo |
| Primary Color | Yes | Color picker, hex input |
| Accent Color | Yes | Color picker, hex input |
| Company Name | Yes | Text input |
| Contact Info | Yes | Email, phone |
| Footer Text | Yes (Premium) | Custom message |
| Custom Domain | Future | subdomain.app.com |

### 8.2 Brand Application

```
CLIENT PORTAL WITH CUSTOM BRANDING:

+------------------------------------------------------------------+
|  [USER'S LOGO]                                                   |
|  Background uses user's primary color at 5% opacity              |
+------------------------------------------------------------------+
|                                                                  |
|  +----------------------------------------------------------+   |
|  |                                                          |   |
|  |  Quote card with user's accent color on:                 |   |
|  |  - CTA buttons                                           |   |
|  |  - Links                                                 |   |
|  |  - Progress indicators                                   |   |
|  |  - Status badges                                         |   |
|  |                                                          |   |
|  |  [Accept & Pay]  <- User's primary color                 |   |
|  |                                                          |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  Contact: {user's email}                                         |
|                                                                  |
|  Powered by [Product Name]  <- Can be removed on premium        |
+------------------------------------------------------------------+
```

### 8.3 Default Branding (New Users)

If user hasn't set branding:
- Logo: User's company name in elegant typography
- Primary: Product's primary blue (#3B82F6)
- Accent: Product's success green (#22C55E)

### 8.4 Brand Preview

In settings, show live preview:

```
+-----------------------------+
|  PREVIEW                    |
|  +------------------------+ |
|  |                        | |
|  |  [Logo Preview]        | |
|  |                        | |
|  |  Quote #1001           | |
|  |  Amount: $2,500        | |
|  |                        | |
|  |  [Accept Quote]        | |
|  |  ^^ Shows in selected  | |
|  |     primary color      | |
|  +------------------------+ |
+-----------------------------+
```

---

## 9. Accessibility Requirements

### 9.1 WCAG 2.1 AA Compliance

#### Color Contrast

```
Text Contrast Requirements:
- Normal text (< 18pt): 4.5:1 minimum
- Large text (>= 18pt or 14pt bold): 3:1 minimum
- UI components and graphics: 3:1 minimum

Our palette achieves:
- Body text (#1E293B) on white: 12.63:1 [PASS]
- Muted text (#64748B) on white: 4.98:1 [PASS]
- Primary button text (white) on #3B82F6: 4.51:1 [PASS]
- Link text (#3B82F6) on white: 4.51:1 [PASS]
```

#### Color Independence

```
DO:
- Use icons alongside color (e.g., [X] red + error icon)
- Use patterns/textures in charts
- Provide text labels

DON'T:
- Rely on color alone to convey meaning
- Use red/green as only differentiator
```

### 9.2 Keyboard Navigation

#### Focus Order

```
Tab order follows visual hierarchy:
1. Skip link (hidden until focused)
2. Main navigation
3. Page content (top to bottom, left to right)
4. Actions/CTAs
5. Footer

Tab through page should feel logical and predictable.
```

#### Focus Indicators

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Never remove focus indicators */
:focus {
  outline: none;  /* DON'T DO THIS */
}
```

#### Keyboard Shortcuts (Power Users)

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard shortcuts |
| `n` | New quote |
| `i` | New invoice |
| `/` | Focus search |
| `Esc` | Close modal/panel |
| `Cmd/Ctrl + S` | Save |
| `Cmd/Ctrl + Enter` | Submit/Send |

### 9.3 Screen Reader Support

#### ARIA Labels

```html
<!-- Buttons with icons only -->
<button aria-label="Delete quote">
  <DeleteIcon />
</button>

<!-- Status badges -->
<span role="status" aria-label="Quote status: Sent">
  Sent
</span>

<!-- Loading states -->
<div aria-live="polite" aria-busy="true">
  Loading quotes...
</div>

<!-- Form errors -->
<input aria-invalid="true" aria-describedby="email-error" />
<span id="email-error" role="alert">
  Please enter a valid email
</span>
```

#### Semantic HTML

```html
<!-- Use proper heading hierarchy -->
<h1>Quotes</h1>
  <h2>Recent Quotes</h2>
  <h2>Draft Quotes</h2>

<!-- Use landmark regions -->
<nav aria-label="Main navigation">
<main>
<aside aria-label="Quote properties">
<footer>

<!-- Use proper form labels -->
<label for="client-name">Client Name</label>
<input id="client-name" type="text" />
```

### 9.4 Motion & Animation

```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 9.5 Touch & Motor Accessibility

```
Touch targets:
- Minimum 44x44px for all interactive elements
- Adequate spacing between targets (8px minimum)
- Large click/tap areas for important actions

Timeouts:
- No time-limited interactions without user control
- Extend or disable timeouts when needed
```

---

## 10. Animation Guidelines

### 10.1 Animation Principles

| Principle | Description |
|-----------|-------------|
| **Purposeful** | Every animation should serve a function |
| **Quick** | Keep animations under 300ms |
| **Subtle** | Don't distract from content |
| **Consistent** | Same type of action = same animation |
| **Respectful** | Honor prefers-reduced-motion |

### 10.2 Page Transitions

```css
/* Page enter */
.page-enter {
  opacity: 0;
  transform: translateY(8px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

/* Page exit */
.page-exit {
  opacity: 1;
}
.page-exit-active {
  opacity: 0;
  transition: opacity 150ms ease-in;
}
```

### 10.3 Micro-Interactions

#### Button Press

```css
.button:active {
  transform: scale(0.98);
  transition: transform 100ms ease-in-out;
}
```

#### Checkbox Toggle

```css
.checkbox-indicator {
  transform: scale(0);
}
.checkbox:checked .checkbox-indicator {
  transform: scale(1);
  transition: transform 150ms ease-bounce;
}
```

#### Dropdown Open

```css
.dropdown-content {
  opacity: 0;
  transform: translateY(-4px);
}
.dropdown-content[data-state="open"] {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 150ms ease-out, transform 150ms ease-out;
}
```

### 10.4 Loading Animations

#### Spinner

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

#### Skeleton Pulse

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 2s ease-in-out infinite;
  background: var(--color-neutral-200);
  border-radius: var(--radius-md);
}
```

#### Progress Bar

```css
@keyframes progress {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.progress-indeterminate::after {
  animation: progress 1.5s ease-in-out infinite;
}
```

### 10.5 Celebration Animation (First Quote Sent)

```
+----------------------------------+
|   *    *        *      *         |
|     *       *      *             |
|  *      *              *    *    |
|      [Confetti particles         |
|       falling gently]            |
|                                  |
|     Congratulations!             |
|     [Check mark scales in]       |
|                                  |
+----------------------------------+

Duration: 2 seconds
Particles: 30-50
Colors: Primary, secondary, accent
```

### 10.6 Drag-and-Drop Feedback

```
DRAGGING:
+---------------------------+
| [Block being dragged]     |  <- Slight shadow, 95% opacity
+---------------------------+
      |
      v
+---------------------------+
| [Drop zone indicator]     |  <- Dashed border, highlighted
+---------------------------+

DROPPED:
+---------------------------+
| [Block settles into       |  <- Spring animation
|  position]                |
+---------------------------+
```

---

## Appendix A: Design Token Reference

### Complete Token Export (CSS Variables)

```css
:root {
  /* Colors - Primary */
  --color-primary-50: #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  --color-primary-300: #93C5FD;
  --color-primary-400: #60A5FA;
  --color-primary-500: #3B82F6;
  --color-primary-600: #2563EB;
  --color-primary-700: #1D4ED8;
  --color-primary-800: #1E40AF;
  --color-primary-900: #1E3A8A;

  /* Colors - Secondary */
  --color-secondary-50: #F5F3FF;
  --color-secondary-500: #8B5CF6;
  --color-secondary-600: #7C3AED;
  --color-secondary-700: #6D28D9;

  /* Colors - Semantic */
  --color-success-500: #22C55E;
  --color-warning-500: #F59E0B;
  --color-error-500: #EF4444;
  --color-info-500: #3B82F6;

  /* Colors - Neutral */
  --color-neutral-0: #FFFFFF;
  --color-neutral-50: #F8FAFC;
  --color-neutral-100: #F1F5F9;
  --color-neutral-200: #E2E8F0;
  --color-neutral-300: #CBD5E1;
  --color-neutral-400: #94A3B8;
  --color-neutral-500: #64748B;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1E293B;
  --color-neutral-900: #0F172A;

  /* Typography */
  --font-family-sans: 'Inter', sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Animation */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Appendix B: Component Checklist

### For Every Component, Ensure:

- [ ] Works with keyboard navigation
- [ ] Has proper ARIA labels
- [ ] Meets color contrast requirements
- [ ] Has loading state
- [ ] Has error state
- [ ] Has empty state (if applicable)
- [ ] Works on mobile (touch targets, spacing)
- [ ] Respects reduced motion
- [ ] Has hover/focus/active states
- [ ] Matches design tokens exactly
- [ ] Is documented with usage examples

---

## Appendix C: Screen Checklist

### For Every Screen, Ensure:

- [ ] Has clear page title
- [ ] Has logical heading hierarchy
- [ ] Has skip link for screen readers
- [ ] Has breadcrumb (if nested)
- [ ] Works at all breakpoints
- [ ] Has appropriate loading states
- [ ] Has appropriate error handling
- [ ] Has empty state (if applicable)
- [ ] CTAs are clear and accessible
- [ ] Forms have proper validation
- [ ] Success feedback is provided

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | UI/UX Team | Initial specification |

---

*This UI/UX Specification serves as the definitive design reference for the Visual Quote & Invoice Management software. All implementation should adhere to these specifications to ensure a consistent, beautiful, and accessible user experience.*
