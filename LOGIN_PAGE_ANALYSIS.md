# Login Page UI Analysis and Fix Suggestions

**Date:** February 15, 2026
**Production URL:** https://quote-software-gamma.vercel.app/login

---

## Current Issues Identified

### 1. Missing Branding/Logo
- **Problem:** The login page has no QuoteCraft logo or branding
- **Impact:** Users arriving at the login page may not recognize they're on the right site
- **Location:** `apps/web/app/(auth)/layout.tsx` and `apps/web/app/(auth)/login/page.tsx`

### 2. Missing Navigation to Homepage
- **Problem:** There is no link or navigation to return to the marketing homepage
- **Impact:** Users cannot easily navigate back to learn more about the product
- **Comparison:** The marketing site has a full header with navigation (Features, Pricing, Docs, GitHub, Sign In)

### 3. Inconsistent Styling
- **Problem:** The login page uses a plain `bg-muted/50` background with no visual interest
- **Impact:** Creates a jarring experience when navigating between the polished marketing site and the minimal auth pages
- **Marketing Site:** Uses gradient accents, clean typography, and branded elements

### 4. Demo Button Color Mismatch
- **Problem:** The "Try Demo" button uses `bg-amber-100 text-amber-900` (yellow/amber)
- **Impact:** Doesn't match the app's primary blue/violet color scheme
- **Location:** `apps/web/app/(auth)/login/login-form.tsx:224`

---

## Current Code Structure

### Auth Layout (`apps/web/app/(auth)/layout.tsx`)
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
```
**Issues:**
- No header/navigation
- No logo
- Minimal styling

### Marketing Header Reference (`apps/web/components/landing/marketing-header.tsx`)
The marketing header includes:
- QuoteCraft logo (gradient blue-violet square with "Q")
- Navigation links (Features, Pricing, Docs, GitHub)
- Sign In / Get Started buttons
- Mobile responsive menu

---

## Recommended Fixes

### Fix 1: Add Logo and Homepage Link to Auth Layout (Priority: High)

Update `apps/web/app/(auth)/layout.tsx`:

```tsx
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/50">
      {/* Header with logo */}
      <header className="w-full py-6">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">
              QuoteCraft
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-md px-4">{children}</div>
      </div>
    </div>
  );
}
```

### Fix 2: Create Shared Logo Component (Priority: Medium)

Create `apps/web/components/shared/logo.tsx`:

```tsx
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  href?: string;
  showText?: boolean;
  className?: string;
}

export function Logo({ href = '/', showText = true, className }: LogoProps) {
  const content = (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
        <span className="text-white font-bold text-lg">Q</span>
      </div>
      {showText && (
        <span className="font-bold text-xl text-slate-900 dark:text-white">
          QuoteCraft
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
```

Then use this in both the marketing header and auth layout for consistency.

### Fix 3: Update Demo Button Color (Priority: Low)

Update `apps/web/app/(auth)/login/login-form.tsx` line 224:

**Current:**
```tsx
className="w-full bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-100 dark:hover:bg-amber-900/30"
```

**Suggested (Option A - Use Primary Blue):**
```tsx
className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-100 dark:hover:bg-blue-900/30 dark:border-blue-800"
```

**Suggested (Option B - Keep Amber but Softer):**
Keep the amber for visual distinction but make it more subtle - this is acceptable since it draws attention to the demo feature.

### Fix 4: Enhanced Auth Layout (Priority: Optional)

For a more polished look, consider a split-pane design:

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-violet-600 text-white p-12 flex-col justify-between">
        <Logo showText href="/" />

        <div>
          <h2 className="text-3xl font-bold mb-4">
            Beautiful Invoices. No Expensive Subscription.
          </h2>
          <p className="text-blue-100">
            The open-source alternative to Bloom and Bonsai.
          </p>
        </div>

        <p className="text-sm text-blue-200">
          Self-hosted or cloud - your choice.
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 flex-col bg-muted/50">
        <header className="lg:hidden w-full py-6">
          <div className="container mx-auto px-4">
            <Logo href="/" />
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-md px-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
```

---

## Implementation Priority

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 1 | Add logo + homepage link to auth layout | Low | High |
| 2 | Create shared Logo component | Low | Medium |
| 3 | Update demo button color (optional) | Very Low | Low |
| 4 | Split-pane auth layout design | Medium | Medium |

---

## Visual Comparison

### Current Login Page
- Plain gray background
- No branding
- No navigation
- Yellow demo button
- Centered card only

### Marketing Homepage (Reference)
- Clean header with logo
- Navigation links
- Gradient blue accent colors
- Consistent branding
- Professional polish

### Proposed Login Page
- Header with clickable QuoteCraft logo (links to homepage)
- Consistent with app branding
- Optional: Split-pane design on desktop
- Blue-themed demo button (optional)

---

## Files to Modify

1. `apps/web/app/(auth)/layout.tsx` - Add header with logo
2. `apps/web/components/shared/logo.tsx` - Create shared logo component (new file)
3. `apps/web/components/landing/marketing-header.tsx` - Use shared Logo component
4. `apps/web/app/(auth)/login/login-form.tsx` - Update demo button color (optional)

---

*Report generated on February 15, 2026*
