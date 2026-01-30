# QuoteCraft - AI Development Guidelines

## Project Overview

**QuoteCraft** is an open-source, self-hosted visual quote and invoice management tool for small businesses, freelancers, and agencies. It provides a beautiful, block-based visual builder for creating professional quotes that convert to invoices with zero data re-entry.

**Tagline:** "The open-source alternative to Bloom and Bonsai"

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 14+ |
| Language | TypeScript | 5.x |
| UI Library | Shadcn UI | Latest |
| CSS | Tailwind CSS | 3.4+ |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | 5.x |
| Cache/Queue | Redis + BullMQ | 7+ |
| Authentication | NextAuth.js | 5.x |
| Payments | Stripe Connect | Latest |
| Rich Text | Tiptap | Latest |
| Drag & Drop | dnd-kit | Latest |
| PDF Generation | Puppeteer/react-pdf | Latest |
| Testing | Vitest (unit), Playwright (E2E) | Latest |
| Package Manager | pnpm | 8+ |
| Monorepo | Turborepo | Latest |
| Containerization | Docker + Docker Compose | Latest |
| Reverse Proxy | Traefik | v3 |

## Project Structure

```
quote-software/
├── apps/
│   └── web/                     # Next.js application
│       ├── app/                 # App Router pages
│       │   ├── (auth)/          # Auth routes (login, register, etc.)
│       │   ├── (dashboard)/     # Protected dashboard routes
│       │   ├── (public)/        # Public client-facing pages
│       │   └── api/             # API routes
│       ├── components/          # React components
│       │   ├── ui/              # Shadcn UI components
│       │   ├── quotes/          # Quote-specific components
│       │   ├── invoices/        # Invoice-specific components
│       │   ├── clients/         # Client management components
│       │   ├── rate-cards/      # Rate card components
│       │   └── shared/          # Shared components
│       ├── lib/                 # Utilities and helpers
│       │   ├── actions/         # Server actions
│       │   ├── hooks/           # Custom React hooks
│       │   ├── utils/           # Utility functions
│       │   └── validations/     # Zod schemas
│       └── styles/              # Global styles
├── packages/
│   ├── database/                # Prisma schema and client
│   ├── ui/                      # Shared UI components
│   ├── email-templates/         # Email templates (React Email)
│   ├── pdf-templates/           # PDF generation templates
│   └── shared/                  # Shared utilities and types
├── docker/                      # Docker configuration
│   ├── development/
│   └── production/
├── docs/                        # Documentation
├── specs/                       # Specification documents
├── research/                    # Research and analysis docs
└── .github/                     # GitHub workflows and templates
```

## Development Guidelines

### Code Style

1. **TypeScript Strict Mode** - Always use strict TypeScript. No `any` types unless absolutely necessary with justification.

2. **Functional Components** - Use functional React components with hooks. No class components.

3. **Server Components First** - Default to React Server Components. Use `'use client'` only when needed for:
   - Event handlers (onClick, onChange, etc.)
   - Browser APIs (localStorage, etc.)
   - React hooks (useState, useEffect, etc.)
   - Third-party client libraries

4. **Server Actions** - Use Next.js Server Actions for mutations. Define in `lib/actions/` directory.

5. **Naming Conventions:**
   - Components: PascalCase (`QuoteBuilder.tsx`)
   - Utilities: camelCase (`formatCurrency.ts`)
   - Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
   - Database tables: snake_case (via Prisma @@map)
   - CSS classes: Tailwind utility-first

6. **File Organization:**
   - Co-locate related files (component + tests + styles)
   - One component per file
   - Export from index files for clean imports

### Component Patterns

```typescript
// Preferred component structure
interface QuoteCardProps {
  quote: Quote;
  onEdit?: (id: string) => void;
}

export function QuoteCard({ quote, onEdit }: QuoteCardProps) {
  // Implementation
}
```

### Form Handling

- Use `react-hook-form` with Zod schemas for validation
- Define schemas in `lib/validations/`
- Server-side validation is mandatory (never trust client)

### API Design

- RESTful conventions for API routes
- Use tRPC patterns for type-safe API calls (optional)
- Always validate input with Zod
- Return consistent response shapes

### Database

- All queries through Prisma
- Use transactions for related operations
- Soft deletes for important entities (quotes, invoices, clients)
- Audit logging for sensitive operations

### Testing

- Unit tests: Vitest for utilities and hooks
- Component tests: React Testing Library
- E2E tests: Playwright for critical flows
- Test file naming: `*.test.ts` or `*.spec.ts`

### Error Handling

- Use custom error classes for business logic errors
- Never expose internal errors to users
- Log errors with appropriate context (Sentry integration planned)

## Key Features (Priority Order)

### P0 - Must Have (MVP)
1. Visual Quote Builder with drag-and-drop
2. Client Management
3. Rate Card System
4. Quote-to-Invoice Conversion
5. Client Portal (View/Accept/Pay)
6. E-Signature Capture
7. Stripe Payment Integration
8. PDF Generation
9. Email Notifications
10. Dashboard with Key Metrics

### P1 - Should Have (v1.1)
1. Contract Templates
2. Email Template Customization
3. Advanced Branding Settings
4. Milestone Payments
5. Recurring Invoices
6. Export to CSV

### P2 - Nice to Have (v1.2+)
1. Team/Multi-User Support
2. QuickBooks Integration
3. API Access
4. White Label Options

## Design System

- **Primary Color:** #3B82F6 (Blue-500)
- **Secondary Color:** #8B5CF6 (Violet-500)
- **Accent Color:** #F59E0B (Amber-500)
- **Font Family:** Inter (UI), JetBrains Mono (code)
- **Border Radius:** 6px default (radius-md)
- **Shadows:** Use shadow-sm for cards, shadow-lg for modals

## Important Files to Reference

- `specs/PRODUCT_SPEC.md` - Complete feature specifications
- `specs/TECHNICAL_SPEC.md` - Technical architecture details
- `specs/UI_UX_SPEC.md` - Design system and component specs
- `specs/DATABASE_SCHEMA.md` - Prisma schema and data model
- `specs/LANDING_PAGE_SPEC.md` - Marketing landing page specs
- `CONSTITUTION.md` - Development principles and constraints

## Commands

```bash
# Development
pnpm dev                 # Start development server
pnpm build              # Build for production
pnpm test               # Run tests
pnpm lint               # Lint codebase
pnpm db:migrate         # Run database migrations
pnpm db:seed            # Seed development data
pnpm db:studio          # Open Prisma Studio

# Docker
docker-compose up -d    # Start all services
docker-compose down     # Stop all services
docker-compose logs -f  # View logs
```

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Application URL
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `SMTP_*` - Email configuration

## Git Workflow

1. Branch naming: `feature/`, `fix/`, `chore/`
2. Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
3. PR required for main branch
4. CI must pass before merge

## Performance Targets

- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- API response < 500ms (95th percentile)
- PDF generation < 5s

## Security Considerations

- Never store plain-text passwords (bcrypt, cost 12+)
- All API routes protected with authentication
- CSRF protection enabled
- Rate limiting on sensitive endpoints
- PCI compliance via Stripe (no card data stored)
- E-signature audit trail (timestamp, IP, user agent)
