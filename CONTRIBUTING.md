# Contributing to Oreko

Welcome to Oreko! We're thrilled that you're interested in contributing to the open-source alternative to Bloom and Bonsai. Whether you're fixing bugs, adding features, improving documentation, or helping with translations, every contribution makes a difference.

Oreko is an open-source, self-hosted visual quote and invoice management tool designed for small businesses, freelancers, and agencies. Our goal is to provide a beautiful, block-based visual builder for creating professional quotes that convert to invoices with zero data re-entry.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Report Bugs](#how-to-report-bugs)
- [How to Suggest Features](#how-to-suggest-features)
- [Development Workflow](#development-workflow)
- [Code Style Guide](#code-style-guide)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Review Process](#review-process)
- [Getting Help](#getting-help)
- [Recognition](#recognition)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inclusive environment for everyone. Please be respectful, considerate, and constructive in all interactions.

Key principles:

- Be welcoming and inclusive
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## How to Report Bugs

Found a bug? Help us improve Oreko by reporting it! Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Test on the latest version** to ensure the bug hasn't been fixed
3. **Gather relevant information** about your environment

### Bug Report Template

When creating a bug report, please use the following template:

```markdown
## Bug Description

A clear and concise description of what the bug is.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

A clear description of what you expected to happen.

## Actual Behavior

What actually happened instead.

## Screenshots

If applicable, add screenshots to help explain the problem.

## Environment

- OS: [e.g., macOS 14.0, Ubuntu 22.04, Windows 11]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node.js version: [e.g., 20.10.0]
- pnpm version: [e.g., 8.12.0]
- Oreko version/commit: [e.g., v1.0.0 or commit hash]

## Additional Context

Add any other context about the problem here, including error logs from the console or server.
```

## How to Suggest Features

Have an idea for a new feature? We'd love to hear it! Before suggesting a feature:

1. **Check the roadmap** in `specs/PRODUCT_SPEC.md` to see if it's already planned
2. **Search existing issues** for similar suggestions
3. **Consider the scope** - does it align with Oreko's mission?

### Feature Request Template

```markdown
## Feature Summary

A brief, one-line description of the feature.

## Problem Statement

What problem does this feature solve? Who would benefit from it?

## Proposed Solution

Describe your proposed solution in detail.

## Alternative Solutions

Have you considered any alternative approaches? What are their pros and cons?

## Additional Context

- Mock-ups or wireframes (if applicable)
- Examples from other applications
- Any technical considerations

## Priority Suggestion

Where do you think this fits?

- [ ] P0 - Critical for MVP
- [ ] P1 - Should have for v1.1
- [ ] P2 - Nice to have for future versions
```

## Development Workflow

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 20+
- pnpm 8+
- Docker and Docker Compose (recommended for PostgreSQL and Mailpit)
- PostgreSQL 15+ (or use Docker)
- Git

### Getting Started

#### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/oreko.git
cd oreko

# Add the upstream remote
git remote add upstream https://github.com/orekoapp/oreko.git
```

#### 2. Install Dependencies

```bash
# Install all dependencies
pnpm install
```

#### 3. Set Up Environment

```bash
# Copy the environment file for the web app
cp apps/web/.env.example apps/web/.env.local

# Edit apps/web/.env.local with your local configuration
# Required variables:
# - DATABASE_URL
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
```

#### 4. Start Development Services

```bash
# Using Docker (recommended)
docker-compose up -d

# Run database migrations
pnpm db:migrate

# Seed development data (optional)
pnpm db:seed

# Start the development server
pnpm dev
```

### Branch Naming Convention

Use descriptive branch names with the appropriate prefix:

| Prefix      | Use Case             | Example                         |
| ----------- | -------------------- | ------------------------------- |
| `feature/`  | New features         | `feature/quote-pdf-export`      |
| `fix/`      | Bug fixes            | `fix/invoice-calculation-error` |
| `chore/`    | Maintenance tasks    | `chore/update-dependencies`     |
| `docs/`     | Documentation only   | `docs/api-reference`            |
| `refactor/` | Code refactoring     | `refactor/quote-builder-hooks`  |
| `test/`     | Test additions/fixes | `test/stripe-integration`       |

### Creating a Branch

```bash
# Ensure you're on the latest main
git checkout main
git pull upstream main

# Create your branch
git checkout -b feature/your-feature-name
```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear and consistent commit history.

#### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types

| Type       | Description                                         |
| ---------- | --------------------------------------------------- |
| `feat`     | A new feature                                       |
| `fix`      | A bug fix                                           |
| `docs`     | Documentation changes only                          |
| `style`    | Code style changes (formatting, semicolons, etc.)   |
| `refactor` | Code changes that neither fix bugs nor add features |
| `perf`     | Performance improvements                            |
| `test`     | Adding or updating tests                            |
| `build`    | Build system or dependency changes                  |
| `ci`       | CI/CD configuration changes                         |
| `chore`    | Other changes that don't modify src or test files   |
| `revert`   | Reverts a previous commit                           |

#### Scopes (optional)

Common scopes include: `quotes`, `invoices`, `clients`, `rate-cards`, `auth`, `api`, `ui`, `db`, `pdf`, `email`

#### Examples

```bash
# Feature
feat(quotes): add drag-and-drop reordering for line items

# Bug fix
fix(invoices): correct tax calculation for multi-currency

# Documentation
docs(api): add authentication endpoints documentation

# Breaking change (add ! after type)
feat(api)!: change quote response format

# With body and footer
fix(clients): resolve duplicate client creation issue

The client creation form was allowing submissions while a previous
request was still pending, resulting in duplicate entries.

Added loading state and disabled submit button during pending requests.

Closes #123
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream main into your branch
git checkout your-branch
git merge upstream/main

# Or rebase (preferred for cleaner history)
git rebase upstream/main
```

## Code Style Guide

### TypeScript

- **Strict mode enabled** - No `any` types unless absolutely necessary (with justification in comments)
- Use explicit return types for functions
- Prefer interfaces over type aliases for object shapes
- Use `readonly` where applicable

### React Components

- **Functional components only** - No class components
- **Server Components by default** - Only use `'use client'` when necessary for:
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs (localStorage, window, etc.)
  - React hooks (useState, useEffect, etc.)
  - Third-party client-only libraries

### Naming Conventions

| Element         | Convention             | Example                         |
| --------------- | ---------------------- | ------------------------------- |
| Components      | PascalCase             | `QuoteBuilder.tsx`              |
| Utilities       | camelCase              | `formatCurrency.ts`             |
| Constants       | UPPER_SNAKE_CASE       | `API_ENDPOINTS`                 |
| CSS classes     | Tailwind utility-first | `className="flex items-center"` |
| Database tables | snake_case             | `quote_line_items`              |

### File Organization

```
components/
  quotes/
    QuoteBuilder/
      QuoteBuilder.tsx      # Component
      QuoteBuilder.test.tsx # Tests
      index.ts              # Re-export
```

- Co-locate related files (component + tests)
- One component per file
- Use index files for clean imports

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface QuoteCardProps {
  quote: Quote;
  onEdit?: (id: string) => void;
}

// 3. Component
export function QuoteCard({ quote, onEdit }: QuoteCardProps) {
  // Hooks
  const [isEditing, setIsEditing] = useState(false);

  // Event handlers
  const handleEdit = () => {
    onEdit?.(quote.id);
  };

  // Render
  return (
    <div className="rounded-md border p-4">
      {/* Component content */}
    </div>
  );
}
```

### Form Handling

- Use `react-hook-form` with Zod schemas
- Define validation schemas in `lib/validations/`
- Always validate on both client and server

### API Routes

- Follow RESTful conventions
- Validate all input with Zod
- Return consistent response shapes
- Handle errors gracefully

## Testing Requirements

All contributions must include appropriate tests. Our testing strategy:

### Test Types

| Type      | Tool                  | Location        | Purpose                          |
| --------- | --------------------- | --------------- | -------------------------------- |
| Unit      | Vitest                | `*.test.ts`     | Utilities, hooks, pure functions |
| Component | React Testing Library | `*.test.tsx`    | Component behavior               |
| E2E       | Playwright            | `e2e/*.spec.ts` | Critical user flows              |

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage
```

### Testing Checklist

Before submitting a PR, ensure:

- [ ] All existing tests pass (`pnpm test`)
- [ ] New features include unit tests
- [ ] Bug fixes include regression tests
- [ ] Critical flows have E2E coverage
- [ ] Test coverage doesn't decrease
- [ ] Tests follow naming convention (`*.test.ts` or `*.spec.ts`)

### Writing Good Tests

```typescript
import { describe, it, expect } from 'vitest';
import { calculateQuoteTotal } from './calculateQuoteTotal';

describe('calculateQuoteTotal', () => {
  it('should calculate total with tax', () => {
    const lineItems = [
      { quantity: 2, unitPrice: 100 },
      { quantity: 1, unitPrice: 50 },
    ];
    const taxRate = 0.1;

    const result = calculateQuoteTotal(lineItems, taxRate);

    expect(result).toEqual({
      subtotal: 250,
      tax: 25,
      total: 275,
    });
  });

  it('should handle empty line items', () => {
    const result = calculateQuoteTotal([], 0.1);

    expect(result.total).toBe(0);
  });
});
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with the latest upstream changes
2. **Run the full test suite** - `pnpm test`
3. **Run linting** - `pnpm lint`
4. **Build successfully** - `pnpm build`
5. **Test locally** - Verify your changes work as expected

### Creating the Pull Request

1. Push your branch to your fork
2. Open a PR against the `main` branch
3. Fill out the PR template completely

### Pull Request Template

```markdown
## Description

Brief description of changes and motivation.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Related Issues

Fixes #(issue number)

## How Has This Been Tested?

Describe the tests you ran to verify your changes.

- [ ] Unit tests
- [ ] Component tests
- [ ] E2E tests
- [ ] Manual testing

## Screenshots (if applicable)

Add screenshots for UI changes.

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] All tests pass locally
- [ ] Any dependent changes have been merged
```

### PR Guidelines

- Keep PRs focused - one feature or fix per PR
- Write descriptive titles using conventional commit format
- Link related issues using `Fixes #123` or `Closes #123`
- Respond to review feedback promptly
- Keep the PR updated with the main branch

## Review Process

### What to Expect

1. **Automated Checks** - CI will run tests, linting, and build verification
2. **Code Review** - A maintainer will review your code within 3-5 business days
3. **Feedback** - You may receive requests for changes or clarification
4. **Approval** - Once approved, a maintainer will merge your PR

### Review Criteria

Reviewers will evaluate:

- **Functionality** - Does it work as intended?
- **Code Quality** - Is the code clean, readable, and maintainable?
- **Testing** - Are there adequate tests?
- **Documentation** - Are changes documented?
- **Performance** - Are there any performance concerns?
- **Security** - Are there any security implications?

### Responding to Reviews

- Address all review comments
- Mark conversations as resolved when addressed
- Ask for clarification if feedback is unclear
- Be open to suggestions and alternative approaches

## Getting Help

- **GitHub Issues** — For bug reports and feature requests
- **Email** — support@oreko.app for general questions

### When to Use Each Channel

| Need              | Channel                                    |
| ----------------- | ------------------------------------------ |
| Bug reports       | GitHub Issues                              |
| Feature requests  | GitHub Issues                              |
| General questions | Email support@oreko.app                    |
| Code review help  | Pull Request comments                      |
| Security issues   | Email security@oreko.app (see SECURITY.md) |

## Recognition

We believe in recognizing the valuable contributions of our community members.

### Contributors List

All contributors are recognized in our [Contributors](../../graphs/contributors) page and in the project README.

### Types of Contributions We Value

- Code contributions (features, bug fixes)
- Documentation improvements
- Bug reports and testing
- Design and UX feedback
- Community support and mentoring
- Translations and localization

### Becoming a Maintainer

Active contributors who demonstrate:

- Consistent, high-quality contributions
- Understanding of the codebase and architecture
- Constructive participation in discussions
- Ability to review others' code

May be invited to become maintainers with additional responsibilities and privileges.

---

## Quick Reference

### Common Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm lint         # Lint codebase
pnpm db:migrate   # Run database migrations
pnpm db:seed      # Seed development data
pnpm db:studio    # Open Prisma Studio
```

### Useful Links

- [Project Documentation](docs/)
- [Product Specification](specs/PRODUCT_SPEC.md)
- [Technical Specification](specs/TECHNICAL_SPEC.md)
- [UI/UX Specification](specs/UI_UX_SPEC.md)
- [Database Schema](specs/DATABASE_SCHEMA.md)

---

Thank you for contributing to Oreko! Your efforts help make quote and invoice management better for small businesses everywhere.
