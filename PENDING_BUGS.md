# Pending Bugs

**Date:** March 9, 2026
**Source:** REMAINING_BUGS_EXECUTION_PLAN_V2.md — verified against actual codebase
**Total in plan:** ~187 | **Fixed:** ~187 | **Remaining:** 0

---

## All Bugs Resolved

### Session 1 Fixes (previous sessions)
- Phases 1-4: All security, rate limiting, payment, and database bugs
- Phase 5: Code quality (@ts-ignore removal, type safety)
- Phase 6: UI/frontend (auto-save, portals, avatars, accessibility)
- Phase 10: Data consistency (RBAC, password consolidation, validations)
- Phase 11: Miscellaneous (route constants, social links, aging calculations)

### Session 2 Fixes (this session, code bugs)
| Bug | Fix Applied |
|-----|-------------|
| #493 | `ROUTES` constants imported and used in `quotes/actions.ts`, `invoices/actions.ts`, `clients/actions.ts`, `settings/actions.ts` — 30+ hardcoded strings replaced |
| #508 | PDF export button in builder-toolbar.tsx now opens `/api/download/quote/{id}` |
| #314-319 | All 9 remaining `waitForTimeout` calls removed from E2E tests — replaced with `waitForLoadState` |
| #409-413 | README placeholder screenshots replaced with live demo link |
| #110, #122, #21 | Known Limitations section added to README.md |

### Session 2 Fixes (this session, E2E test gaps)
| Bug | Fix Applied |
|-----|-------------|
| #321 | Created `e2e/security/csrf-protection.spec.ts` — 5 tests for CSRF origin validation on registration, forgot-password, portal referrer policy |
| #323 | Created `e2e/security/xss-prevention.spec.ts` — 5 tests for XSS in portals, login form, URL injection, javascript: protocol |
| #324-325 | Created `e2e/security/payment-security.spec.ts` — 5 tests for duplicate payment prevention, replay attack rejection, webhook signature validation |
| #326 | Created `e2e/security/session-security.spec.ts` — 4 tests for session redirect, API auth, logout invalidation, cookie security attributes |

### Session 3 Fixes (e-signature hardening)
| Priority | Fix Applied |
|----------|-------------|
| **P0** | Contract signing now captures `signerUserAgent` (was only saving IP) |
| **P0** | SHA-256 document hash computed at signing time for quotes and contracts — stored in `signatureData.documentHash` and `QuoteEvent.metadata.documentHash` |
| **P1** | Email OTP verification gate before signing — 6-digit code sent to client email, required before signature pad is shown (quotes + contracts) |
| **P2** | PDF download audit events — `pdf_downloaded` events logged to `QuoteEvent`/`InvoiceEvent` tables with IP and user agent |
| **P2** | Signing certificate PDF endpoints — `/api/download/signing-certificate/quote/[id]` and `/api/download/signing-certificate/contract/[id]` generate full audit trail PDFs |

### Documented Limitations (acceptable, won't fix)
| Bug | Issue | Reason |
|-----|-------|--------|
| #21 | Signature images not encrypted at rest | Documented in code + README. DB access controls apply. Users can enable PostgreSQL TDE. |
| #110 | No DB CHECK constraints | Prisma limitation. App-level validation covers all cases. |
| #435 | S3/R2 cloud storage not implemented | Future feature. Clear error messages in place. |

---

**Build:** Passes | **Unit Tests:** 984/984 pass | **E2E waitForTimeout:** 0 | **@ts-ignore in source:** 0
