# Changelog

All notable changes to QuoteCraft will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-02-14

### Added

#### Projects Module (Phase 2)

A comprehensive project management system to organize quotes, invoices, and contracts by client projects.

**Features:**
- **Project CRUD Operations** - Create, read, update, and delete projects with full workspace isolation
- **Client Association** - Projects are linked to clients for better organization
- **Project Statistics Dashboard** - Summary cards showing total projects, active projects, quotes, and invoices
- **Project Detail View** - Tabbed interface with Overview, Quotes, Invoices, and Settings tabs
- **Project List with Filtering** - Search, filter by status (active/inactive), and pagination support
- **Hierarchical Navigation** - Sidebar updated with Projects as parent of Quotes, Invoices, and Contracts

**Components:**
- `ProjectList` - DataTable with search, filters, bulk actions, and pagination
- `ProjectDetail` - Comprehensive detail view with tabs and action buttons
- `ProjectForm` - Reusable form for create/edit with Zod validation
- `ProjectSelector` - Dropdown selector for use in other forms (quotes, invoices)

**Server Actions:**
- `createProject` - Create new project with client validation
- `getProjects` - List projects with filtering, search, and pagination
- `getProject` - Get single project with related data (quotes, invoices)
- `updateProject` - Update project details
- `deleteProject` - Soft delete project
- `deactivateProject` / `reactivateProject` - Toggle project active status
- `getClientProjects` - Get projects for a specific client
- `getProjectStats` - Get detailed statistics for a project
- `getProjectSummaryStats` - Optimized aggregate stats for dashboard

**API Design:**
- All operations use Server Actions (no REST API endpoints needed)
- Workspace isolation enforced on all queries
- Soft deletes with `deletedAt` field
- Demo mode protection with `assertNotDemo()`

**Database:**
- Uses existing `Project` model in Prisma schema
- Relations: Project belongs to Client, has many Quotes, Invoices, ContractInstances

### Changed

- **Sidebar Navigation** - Projects now serves as a collapsible parent menu item containing Quotes, Invoices, and Contracts
- **Navigation Structure** - Updated from flat navigation to hierarchical structure for better UX

### Fixed

- Fixed dead link in user profile dropdown (`/settings/profile` to `/settings/account`)
- Fixed DropdownMenuItem component removing unsupported `variant` prop

### Performance

- Optimized `getProjectSummaryStats()` to use Prisma aggregate queries instead of fetching all projects
- Added `DEFAULT_PAGE_SIZE` constant to eliminate magic numbers in pagination

### Security

- All server actions validate user session via `getActiveWorkspace()`
- Client ownership verified before project creation
- Workspace isolation prevents cross-tenant data access
- Input validation with Zod schemas on all mutations

### Testing

- **E2E Tests:** 13 comprehensive Playwright tests covering all project operations
- **Regression Tests:** 11 tests ensuring sidebar navigation and existing functionality preserved
- **Test Coverage:** 100% of P0 and P1 test cases covered

---

## [1.0.0] - 2026-01-15

### Added

- Initial release of QuoteCraft
- Visual Quote Builder with drag-and-drop blocks
- Client Management system
- Rate Card system for predefined pricing
- Quote-to-Invoice conversion
- Client Portal for viewing and signing
- E-Signature capture
- Stripe payment integration
- PDF generation
- Email notifications
- Dashboard with key metrics
- User authentication (NextAuth.js)
- Workspace management
- Shadcn UI component library (43 components)

[Unreleased]: https://github.com/WisdmLabs/quote-software/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/WisdmLabs/quote-software/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/WisdmLabs/quote-software/releases/tag/v1.0.0
