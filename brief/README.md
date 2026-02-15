# QuoteCraft UI Enhancement Brief

## Overview

This brief contains specifications for enhancing the QuoteCraft application UI/UX based on stakeholder feedback. The goal is to implement a professional, polished application shell with comprehensive analytics and streamlined workflows.

## Brief Contents

### Documents
| File | Description |
|------|-------------|
| `suggestions.pdf` | Original stakeholder feedback document with UI mockups |
| `REQUIREMENTS.md` | Structured functional and non-functional requirements |
| `UI_REFERENCES.md` | External UI component references and specifications |
| `DATA_MODEL.md` | Database schema requirements for new features |
| `ANALYTICS_SPEC.md` | Detailed analytics dashboard specifications |
| `WORKFLOWS.md` | User flow diagrams and process documentation |
| `ACCEPTANCE_CRITERIA.md` | Testable acceptance criteria for QA |
| `IMAGE_ANNOTATIONS.md` | Descriptions of all screenshot references |

### Screenshots
| File | Shows |
|------|-------|
| `Screenshot 2026-02-10 at 8.35.10 PM.png` | Sidebar navigation (expanded view) |
| `Screenshot 2026-02-10 at 8.38.09 PM.png` | Invoice list with expanded sidebar |
| `Screenshot 2026-02-10 at 8.38.21 PM.png` | Invoice list with collapsed sidebar (icon mode) |
| `Screenshot 2026-02-10 at 8.38.45 PM.png` | Quote list data table |
| `Screenshot 2026-02-10 at 8.39.09 PM.png` | Financial Health analytics charts |
| `Screenshot 2026-02-10 at 8.40.00 PM.png` | Client Insights analytics charts |
| `Screenshot 2026-02-10 at 9.18.06 PM.png` | Invoice Builder with live preview |

## Key Objectives

1. **Application Shell Redesign** - Implement collapsible sidebar matching Shadcn Studio Application Shell 10
2. **Data Tables** - Consistent list views for Clients, Quotes, Invoices, Contracts
3. **Analytics Dashboard** - Four comprehensive report categories
4. **Quote-to-Invoice Workflow** - Seamless conversion with status tracking
5. **Visual Builder** - Split-pane editor with live preview

## Priority Order

1. P0: Application Shell (sidebar navigation)
2. P0: Data Tables (list views)
3. P1: Analytics Dashboard
4. P1: Quote-to-Invoice workflow
5. P2: Visual Quote/Invoice Builder enhancements

## Tech Stack Alignment

All implementations should use:
- Next.js 14+ (App Router)
- Shadcn UI components
- Tailwind CSS
- TypeScript (strict mode)
- Recharts for visualizations

## Related Specs

- `/specs/PRODUCT_SPEC.md` - Full product specification
- `/specs/TECHNICAL_SPEC.md` - Technical architecture
- `/specs/UI_UX_SPEC.md` - Design system details
- `/specs/DATABASE_SCHEMA.md` - Current Prisma schema
