# QuoteCraft

**The open-source alternative to Bloom and Bonsai**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/WisdmLabs/quote-software/releases)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/WisdmLabs/quote-software/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)

QuoteCraft is an open-source, self-hosted visual quote and invoice management tool for small businesses, freelancers, and agencies. It provides a beautiful, block-based visual builder for creating professional quotes that convert to invoices with zero data re-entry.

<!-- Screenshot: Dashboard (coming soon) -->

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
  - [Docker (Recommended)](#docker-recommended)
  - [Manual Installation](#manual-installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Development Commands](#development-commands)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Visual Quote Builder

Create stunning, professional quotes with a drag-and-drop block-based editor. No more spreadsheet-like interfaces.

<!-- Screenshot: Quote Builder (coming soon) -->

### One-Click Quote-to-Invoice Conversion

Convert accepted quotes to invoices instantly with zero data re-entry. All line items, pricing, and client information transfer automatically.

<!-- Screenshot: Quote to Invoice (coming soon) -->

### Client Portal

Beautiful, mobile-responsive client-facing pages for viewing, signing, and paying quotes and invoices. No account required for clients.

<!-- Screenshot: Client Portal (coming soon) -->

### Rate Card System

Advanced rate card management for quick quote creation with predefined services and pricing tiers. A key differentiator from competitors.

<!-- Screenshot: Rate Cards (coming soon) -->

### Additional Features

| Feature | Description |
|---------|-------------|
| **Project Management** | Organize quotes, invoices, and contracts by client projects |
| **E-Signature Capture** | Legally compliant electronic signatures (E-SIGN, UETA) |
| **Stripe Payment Integration** | Accept credit cards and ACH payments via Stripe Connect |
| **PDF Generation** | Professional PDF exports for quotes and invoices |
| **Email Notifications** | Automated email workflows for quotes, invoices, and reminders |
| **Dashboard Analytics** | Key metrics including revenue, outstanding invoices, and conversion rates |
| **Client Management** | Centralized client database with full history and lifetime value tracking |
| **Contract Templates** | Attach contracts with merge fields to quotes |
| **Milestone Payments** | Support for deposits, milestones, and recurring payments |
| **Modular Workspace** | Enable only the modules you need (Quotes, Invoices, Contracts, Rate Cards) |
| **Self-Hosted** | Full control over your data with Docker deployment |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript 5.x |
| **UI Library** | Shadcn UI |
| **CSS** | Tailwind CSS 3.4+ |
| **Database** | PostgreSQL 15+ |
| **ORM** | Prisma 5.x |
| **Cache/Queue** | Redis + BullMQ |
| **Authentication** | NextAuth.js 5.x |
| **Payments** | Stripe Connect |
| **Rich Text** | Tiptap |
| **Drag & Drop** | dnd-kit |
| **PDF Generation** | Puppeteer / react-pdf |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **Package Manager** | pnpm 8+ |
| **Monorepo** | Turborepo |
| **Containerization** | Docker + Docker Compose |
| **Reverse Proxy** | Traefik v3 |

---

## Quick Start

### Docker (Recommended)

The fastest way to get QuoteCraft running is with Docker Compose.

**Prerequisites:**
- Docker 20.10+
- Docker Compose 2.0+

**Steps:**

1. Clone the repository:

```bash
git clone https://github.com/WisdmLabs/quote-software.git
cd quote-software
```

2. Copy the environment file and configure it:

```bash
cp .env.example .env
```

3. Start all services:

```bash
docker-compose up -d
```

4. Run database migrations:

```bash
docker-compose exec web pnpm db:migrate
```

5. (Optional) Seed development data:

```bash
docker-compose exec web pnpm db:seed
```

6. Access the application at `http://localhost:3000`

**Docker Commands:**

```bash
docker-compose up -d          # Start all services in background
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
docker-compose restart web    # Restart the web service
```

---

### Manual Installation

For development or custom deployment scenarios.

**Prerequisites:**
- Node.js 18 LTS or later
- pnpm 8+
- PostgreSQL 15+
- Redis 7+

**Steps:**

1. Clone the repository:

```bash
git clone https://github.com/WisdmLabs/quote-software.git
cd quote-software
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy and configure environment variables:

```bash
cp .env.example .env
```

4. Set up the database:

```bash
# Start PostgreSQL and Redis (if not already running)
# Then run migrations
pnpm db:migrate
```

5. (Optional) Seed development data:

```bash
pnpm db:seed
```

6. Start the development server:

```bash
pnpm dev
```

7. Access the application at `http://localhost:3000`

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/quotecraft` |
| `REDIS_URL` | Yes | Redis connection string | `redis://localhost:6379` |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth.js session encryption | `your-secret-key-here` |
| `NEXTAUTH_URL` | Yes | Application URL | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Yes | Stripe API secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret | `whsec_...` |
| `SMTP_HOST` | No | SMTP server host | `smtp.sendgrid.net` |
| `SMTP_PORT` | No | SMTP server port | `587` |
| `SMTP_USER` | No | SMTP username | `apikey` |
| `SMTP_PASS` | No | SMTP password | `your-smtp-password` |
| `SMTP_FROM` | No | Default sender email | `noreply@yourdomain.com` |

See `.env.example` for a complete template with all available options.

---

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
│       │   ├── ui/              # Shadcn UI components (43)
│       │   ├── projects/        # Project management components
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
└── research/                    # Research and analysis docs
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `apps/web/app` | Next.js 14 App Router pages and layouts |
| `apps/web/components` | 55+ domain components + 43 Shadcn UI components |
| `apps/web/components/projects` | Project management (list, detail, form, selector) |
| `apps/web/lib` | 85+ server actions, hooks, and utilities |
| `apps/web/lib/projects` | Project server actions and types |
| `packages/database` | Prisma schema with 18 models |
| `packages/types` | Shared TypeScript type definitions |
| `packages/utils` | Shared utility functions |

---

## Development Commands

### Development

```bash
pnpm dev              # Start development server with hot reload
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript type checking
```

### Database

```bash
pnpm db:migrate       # Run database migrations
pnpm db:migrate:dev   # Create and run migrations (development)
pnpm db:push          # Push schema changes directly (development)
pnpm db:seed          # Seed development data
pnpm db:studio        # Open Prisma Studio (database GUI)
pnpm db:reset         # Reset database (WARNING: deletes all data)
```

### Testing

```bash
pnpm test             # Run all tests
pnpm test:e2e         # Run E2E tests (Playwright)
```

### Docker

```bash
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose logs -f    # View logs
docker-compose build      # Rebuild containers
```

### Monorepo

```bash
pnpm turbo run build      # Build all packages
pnpm turbo run lint       # Lint all packages
pnpm turbo run test       # Test all packages
```

---

## Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following our coding standards
4. Write tests for new functionality
5. Run linting and tests: `pnpm lint && pnpm test`
6. Commit using conventional commits: `git commit -m "feat: add new feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

### Code Style

- TypeScript strict mode required
- Functional React components with hooks
- Server Components by default, `'use client'` only when needed
- Tailwind CSS for styling
- Zod for validation
- Conventional commits

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates

---

## License

QuoteCraft is open-source software licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2026 QuoteCraft Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/WisdmLabs/quote-software/issues)
- **Discussions:** [GitHub Discussions](https://github.com/WisdmLabs/quote-software/discussions)

---

Built with care by the QuoteCraft community.
