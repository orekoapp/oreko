# Regression Test Cases: Phase 1 Functionality

**Generated:** 2026-02-13
**Purpose:** Ensure Phase 1 functionality continues working after Phase 2 implementation
**Total Test Cases:** 68
**Priority:** All P0 (Critical - Must Pass Before Release)

---

## Executive Summary

This document defines comprehensive regression tests for Phase 1 functionality that must continue working after Phase 2 implementation. All tests are classified as P0 (Critical) because regression in any existing feature is unacceptable.

### Test Distribution by Risk Area

| Risk Area | Test Count | Impact Level |
|-----------|------------|--------------|
| Database Operations | 16 | HIGH |
| Navigation | 8 | MEDIUM |
| UI Components | 12 | MEDIUM |
| Business Logic | 18 | HIGH |
| API Endpoints | 14 | HIGH |
| **TOTAL** | **68** | |

### Key Regression Concerns

From the Compatibility Assessment, the following Phase 2 changes pose regression risks:

1. **Database Schema Change (HIGH):** Adding `projectId` to Quote, Invoice, ContractInstance
2. **Navigation Restructure (MEDIUM):** Flat to nested sidebar navigation
3. **Status Badge Styling (MEDIUM):** New badge variants being added
4. **Analytics Enhancements (LOW):** New endpoints and data formats

---

## Regression Test Matrix

### Phase 1 Feature to Regression Test Mapping

| Phase 1 Feature | Impact Level | Regression Tests | Risk from Phase 2 |
|-----------------|--------------|------------------|-------------------|
| Quote CRUD Operations | HIGH | TC-REG-001 to TC-REG-008 | projectId addition |
| Invoice CRUD Operations | HIGH | TC-REG-009 to TC-REG-016 | projectId addition |
| Client Management | MEDIUM | TC-REG-017 to TC-REG-022 | Project relations |
| Quote-to-Invoice Conversion | HIGH | TC-REG-023 to TC-REG-027 | Schema changes |
| E-Signature Functionality | HIGH | TC-REG-028 to TC-REG-032 | Portal changes |
| PDF Generation | HIGH | TC-REG-033 to TC-REG-038 | Template changes |
| Payment Processing | HIGH | TC-REG-039 to TC-REG-044 | Invoice changes |
| Sidebar Navigation | MEDIUM | TC-REG-045 to TC-REG-049 | Nav restructure |
| Badge Rendering | MEDIUM | TC-REG-050 to TC-REG-054 | New variants |
| Dashboard & Analytics | MEDIUM | TC-REG-055 to TC-REG-060 | New reports |
| API Endpoints | HIGH | TC-REG-061 to TC-REG-068 | Response changes |

---

## Test Cases by Risk Area

---

## 1. Database Operations (HIGH Impact)

These tests verify that existing data operations continue to work when `projectId` is nullable and quotes/invoices can exist without project assignment.

---

### TC-REG-001: Create Quote Without Project (Backward Compatibility)

**Related Phase 1 Feature:** Quote Creation
**Title:** Quotes can be created without specifying a projectId
**Priority:** P0

**Preconditions:**
- User is authenticated with valid workspace
- At least one client exists in the workspace
- Database has been migrated to include projectId column (nullable)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `createQuote` server action with clientId but NO projectId | Action should execute without error |
| 2 | Verify returned quote object | Quote should have valid id, clientId, and status='draft' |
| 3 | Verify quote.projectId value | Should be null (not undefined or error) |
| 4 | Query database directly for the quote | Quote record exists with project_id = NULL |
| 5 | Call `getQuoteById` with the new quote id | Quote is retrievable with all fields intact |

**Expected Results:**
- Quote creation succeeds without projectId
- Quote is saved to database with project_id = NULL
- Quote is fully functional (can be edited, sent, converted)

**Backward Compatibility Check:**
- Existing code paths that do not pass projectId must continue working
- No changes to required parameters in createQuote schema

---

### TC-REG-002: Retrieve Quote Without Project

**Related Phase 1 Feature:** Quote Retrieval
**Title:** Quotes without projectId are retrievable and display correctly
**Priority:** P0

**Preconditions:**
- Quote exists in database with projectId = NULL
- User has access to the workspace containing the quote

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `getQuotes()` with no project filter | All quotes returned including those with null projectId |
| 2 | Verify quote list contains null-project quote | Quote appears in list without errors |
| 3 | Call `getQuoteById(id)` for quote with null projectId | Quote object returned successfully |
| 4 | Verify quote object structure | All fields present, projectId is null |
| 5 | Render quote in QuoteList component | Quote displays correctly with no project column errors |

**Expected Results:**
- Quotes with null projectId appear in all query results
- No null reference errors when displaying quotes without projects
- Filter functionality works correctly with mixed null/non-null projectIds

**Backward Compatibility Check:**
- Quote listing pages must handle null projectId gracefully
- No UI errors or blank displays for legacy quotes

---

### TC-REG-003: Update Quote Without Changing ProjectId

**Related Phase 1 Feature:** Quote Update
**Title:** Updating a quote preserves null projectId if not explicitly changed
**Priority:** P0

**Preconditions:**
- Quote exists with projectId = NULL
- Quote is in draft status

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `updateQuote` with title change, NO projectId in payload | Update succeeds |
| 2 | Verify updated quote | Title is changed |
| 3 | Verify projectId | Still NULL (not changed to undefined or default) |
| 4 | Update quote notes and terms | Updates succeed |
| 5 | Verify projectId remains NULL | No automatic project assignment |

**Expected Results:**
- Quote updates preserve null projectId
- Partial updates do not affect unspecified fields
- No forced project assignment during updates

**Backward Compatibility Check:**
- Update operations must not require projectId
- Existing update flows continue without modification

---

### TC-REG-004: Delete Quote Without Project

**Related Phase 1 Feature:** Quote Deletion (Soft Delete)
**Title:** Quotes without projectId can be soft deleted
**Priority:** P0

**Preconditions:**
- Quote exists with projectId = NULL
- User has delete permissions

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `deleteQuote(id)` for quote with null projectId | Delete succeeds |
| 2 | Verify quote.deletedAt | Has timestamp value |
| 3 | Call `getQuotes()` without showing deleted | Quote not in results |
| 4 | Query database directly | Quote exists with deletedAt set |
| 5 | Verify no cascade deletion errors | No orphan cleanup errors |

**Expected Results:**
- Soft delete works regardless of projectId value
- No foreign key constraint violations
- Quote can be restored if needed

**Backward Compatibility Check:**
- Deletion logic must not check for projectId
- No cascading project-related cleanup for null projectId

---

### TC-REG-005: Duplicate Quote Without Project

**Related Phase 1 Feature:** Quote Duplication
**Title:** Quotes without projectId can be duplicated
**Priority:** P0

**Preconditions:**
- Quote exists with projectId = NULL
- Quote has line items and blocks

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `duplicateQuote(id)` for quote with null projectId | Duplicate created |
| 2 | Verify new quote exists | Has new id, same clientId |
| 3 | Verify new quote projectId | Also NULL (not assigned) |
| 4 | Verify line items duplicated | Same items, new ids |
| 5 | Verify blocks duplicated | Same blocks, new ids |

**Expected Results:**
- Duplication preserves null projectId
- All related data (line items, blocks) duplicated correctly
- No project assignment during duplication

**Backward Compatibility Check:**
- Duplication must not require source quote to have projectId
- Duplicated quote inherits same projectId (including null)

---

### TC-REG-006: Create Invoice Without Project (Backward Compatibility)

**Related Phase 1 Feature:** Invoice Creation
**Title:** Invoices can be created without specifying a projectId
**Priority:** P0

**Preconditions:**
- User is authenticated with valid workspace
- At least one client exists
- Database has projectId column (nullable)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `createInvoice` with clientId but NO projectId | Action succeeds |
| 2 | Verify returned invoice object | Has valid id, clientId, status='draft' |
| 3 | Verify invoice.projectId | Should be null |
| 4 | Query database directly | Invoice exists with project_id = NULL |
| 5 | Call `getInvoiceById` | Invoice retrievable |

**Expected Results:**
- Invoice creation succeeds without projectId
- Invoice saved with project_id = NULL
- Invoice is fully functional

**Backward Compatibility Check:**
- createInvoice must not require projectId parameter
- Existing invoice creation flows work unchanged

---

### TC-REG-007: Retrieve Invoice Without Project

**Related Phase 1 Feature:** Invoice Retrieval
**Title:** Invoices without projectId are retrievable
**Priority:** P0

**Preconditions:**
- Invoice exists with projectId = NULL
- User has workspace access

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `getInvoices()` with no project filter | All invoices returned |
| 2 | Verify invoice list includes null-project invoice | No errors |
| 3 | Call `getInvoiceById(id)` | Invoice returned |
| 4 | Verify invoice structure | All fields present |
| 5 | Render in InvoiceList | Displays correctly |

**Expected Results:**
- Invoices with null projectId included in queries
- No display errors for legacy invoices

**Backward Compatibility Check:**
- Invoice listing handles null projectId
- Filtering works with mixed values

---

### TC-REG-008: Update Invoice Without Changing ProjectId

**Related Phase 1 Feature:** Invoice Update
**Title:** Invoice updates preserve null projectId
**Priority:** P0

**Preconditions:**
- Invoice exists with projectId = NULL
- Invoice is in draft status

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `updateInvoice` with amount change | Update succeeds |
| 2 | Verify projectId | Still NULL |
| 3 | Update invoice due date | Succeeds |
| 4 | Verify projectId unchanged | Still NULL |

**Expected Results:**
- Invoice updates preserve null projectId
- No forced project assignment

**Backward Compatibility Check:**
- updateInvoice does not require projectId
- Partial updates work correctly

---

### TC-REG-009: Send Invoice Without Project

**Related Phase 1 Feature:** Invoice Sending
**Title:** Invoices without projectId can be sent to clients
**Priority:** P0

**Preconditions:**
- Invoice exists with projectId = NULL
- Invoice has valid client with email
- Invoice has line items

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `sendInvoice(id)` | Succeeds |
| 2 | Verify invoice status | Changed to 'sent' |
| 3 | Verify sentAt timestamp | Set |
| 4 | Verify email sent | Email triggered |
| 5 | Verify projectId unchanged | Still NULL |

**Expected Results:**
- Sending works regardless of projectId
- All email templates render without project data

**Backward Compatibility Check:**
- Email templates must handle null project gracefully
- No project-related fields in client-facing emails (unless explicitly added)

---

### TC-REG-010: Void Invoice Without Project

**Related Phase 1 Feature:** Invoice Voiding
**Title:** Invoices without projectId can be voided
**Priority:** P0

**Preconditions:**
- Invoice exists with projectId = NULL
- Invoice is in sent status

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `voidInvoice(id)` | Succeeds |
| 2 | Verify invoice status | Changed to 'void' |
| 3 | Verify projectId | Still NULL |
| 4 | Verify no cascade errors | No related cleanup issues |

**Expected Results:**
- Voiding works for invoices without project
- Status change is recorded

**Backward Compatibility Check:**
- Void action does not check projectId
- Audit trail works correctly

---

### TC-REG-011: Query Quotes by Client (Includes Null ProjectId)

**Related Phase 1 Feature:** Client Quote Listing
**Title:** Client detail page shows all quotes including those without projects
**Priority:** P0

**Preconditions:**
- Client has multiple quotes
- Some quotes have projectId = NULL
- Some quotes have valid projectId

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `getClientQuotes(clientId)` | All quotes returned |
| 2 | Count quotes with null projectId | Included in results |
| 3 | Count quotes with valid projectId | Included in results |
| 4 | Render client detail page | All quotes display |
| 5 | Verify no filtering by project | Both types visible |

**Expected Results:**
- Client quotes include all regardless of projectId
- No accidental filtering of legacy quotes

**Backward Compatibility Check:**
- Client detail page shows complete history
- No data loss in client views

---

### TC-REG-012: Query Invoices by Client (Includes Null ProjectId)

**Related Phase 1 Feature:** Client Invoice Listing
**Title:** Client detail page shows all invoices including those without projects
**Priority:** P0

**Preconditions:**
- Client has multiple invoices
- Some invoices have projectId = NULL

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `getClientInvoices(clientId)` | All invoices returned |
| 2 | Verify null-project invoices included | Present in results |
| 3 | Render client detail page | All invoices display |

**Expected Results:**
- All client invoices visible regardless of project

**Backward Compatibility Check:**
- Client invoice history is complete
- Revenue calculations include all invoices

---

### TC-REG-013: Dashboard Stats Include Null-Project Quotes

**Related Phase 1 Feature:** Dashboard Statistics
**Title:** Dashboard quote counts include quotes without projects
**Priority:** P0

**Preconditions:**
- Workspace has quotes with and without projectId

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `getDashboardStats()` | Returns stats |
| 2 | Verify totalQuotes | Includes all quotes |
| 3 | Compare with direct count | Numbers match |
| 4 | Verify conversion rate | Calculated correctly |

**Expected Results:**
- Dashboard stats aggregate all quotes
- No exclusion of legacy data

**Backward Compatibility Check:**
- Stats remain accurate after migration
- No data loss in reporting

---

### TC-REG-014: Dashboard Stats Include Null-Project Invoices

**Related Phase 1 Feature:** Dashboard Statistics
**Title:** Dashboard invoice counts include invoices without projects
**Priority:** P0

**Preconditions:**
- Workspace has invoices with and without projectId

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `getDashboardStats()` | Returns stats |
| 2 | Verify totalInvoices | Includes all invoices |
| 3 | Verify totalRevenue | Calculated from all |
| 4 | Verify overdue count | Includes null-project |

**Expected Results:**
- All invoice metrics include legacy data
- Revenue reporting accurate

**Backward Compatibility Check:**
- Financial reports unchanged
- No revenue loss in metrics

---

### TC-REG-015: Quote Status Counts Include Null-Project Quotes

**Related Phase 1 Feature:** Quote Status Analytics
**Title:** Quote status breakdown includes quotes without projects
**Priority:** P0

**Preconditions:**
- Quotes exist in various statuses, some with null projectId

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `getQuoteStatusCounts()` | Returns counts |
| 2 | Sum all status counts | Equals total quotes |
| 3 | Verify draft count | Includes null-project drafts |
| 4 | Verify accepted count | Includes null-project accepted |

**Expected Results:**
- All status counts accurate
- No filtering by project

**Backward Compatibility Check:**
- Analytics accurate after migration
- Historical data preserved

---

### TC-REG-016: Invoice Status Counts Include Null-Project Invoices

**Related Phase 1 Feature:** Invoice Status Analytics
**Title:** Invoice status breakdown includes invoices without projects
**Priority:** P0

**Preconditions:**
- Invoices exist in various statuses

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `getInvoiceStatusCounts()` | Returns counts |
| 2 | Sum all status counts | Equals total invoices |
| 3 | Verify paid count | Includes null-project paid |

**Expected Results:**
- All invoice statuses counted correctly

**Backward Compatibility Check:**
- Payment analytics accurate
- AR reporting correct

---

## 2. Client Management (MEDIUM Impact)

These tests verify client management continues working as projects are added as a new layer between clients and quotes/invoices.

---

### TC-REG-017: Create Client (Unchanged)

**Related Phase 1 Feature:** Client Creation
**Title:** Client creation works unchanged
**Priority:** P0

**Preconditions:**
- User is authenticated
- Has workspace access

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `createClient` with valid data | Client created |
| 2 | Verify client object | All fields saved |
| 3 | Verify no project auto-created | No default project |

**Expected Results:**
- Client creation unchanged
- No automatic project generation (unless explicitly designed)

**Backward Compatibility Check:**
- createClient API unchanged
- Client form works as before

---

### TC-REG-018: Update Client (Unchanged)

**Related Phase 1 Feature:** Client Update
**Title:** Client updates work unchanged
**Priority:** P0

**Preconditions:**
- Client exists

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `updateClient` with changes | Update succeeds |
| 2 | Verify changes saved | Fields updated |
| 3 | Verify related quotes/invoices | Unchanged |

**Expected Results:**
- Client updates isolated
- No cascade to quotes/invoices

**Backward Compatibility Check:**
- Client form unchanged
- No new required fields

---

### TC-REG-019: Delete Client (Soft Delete)

**Related Phase 1 Feature:** Client Deletion
**Title:** Client soft deletion works and handles related data
**Priority:** P0

**Preconditions:**
- Client exists with quotes and invoices
- Quotes/invoices have null projectId

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `deleteClient(id)` | Soft delete succeeds |
| 2 | Verify client.deletedAt | Timestamp set |
| 3 | Verify related quotes | Still exist (orphaned) |
| 4 | Verify related invoices | Still exist |

**Expected Results:**
- Client deletion unchanged
- Related data handling unchanged

**Backward Compatibility Check:**
- Deletion behavior consistent
- No new cascade rules

---

### TC-REG-020: Client List with Quote/Invoice Counts

**Related Phase 1 Feature:** Client Listing
**Title:** Client list shows correct quote/invoice counts including legacy
**Priority:** P0

**Preconditions:**
- Clients have quotes/invoices with various projectId values

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `getClients()` | Returns clients |
| 2 | Verify quote count per client | Includes null-project quotes |
| 3 | Verify invoice count per client | Includes all invoices |

**Expected Results:**
- Counts accurate including legacy data

**Backward Compatibility Check:**
- Client list displays unchanged
- Counts not filtered by project

---

### TC-REG-021: Client Detail Page

**Related Phase 1 Feature:** Client Detail View
**Title:** Client detail page displays all related data
**Priority:** P0

**Preconditions:**
- Client has quotes, invoices, contracts

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/clients/[id]` | Page loads |
| 2 | Verify quotes section | All quotes shown |
| 3 | Verify invoices section | All invoices shown |
| 4 | Verify total revenue | Calculated correctly |

**Expected Results:**
- Complete client history visible

**Backward Compatibility Check:**
- No data hidden by project filtering
- Revenue calculations accurate

---

### TC-REG-022: Client Search and Filter

**Related Phase 1 Feature:** Client Search
**Title:** Client search works unchanged
**Priority:** P0

**Preconditions:**
- Multiple clients exist

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Search by client name | Results filtered |
| 2 | Search by email | Results filtered |
| 3 | Filter by status | Works correctly |

**Expected Results:**
- Search functionality unchanged

**Backward Compatibility Check:**
- No new search parameters required
- Results include all matching clients

---

## 3. Business Logic (HIGH Impact)

These tests verify critical business workflows continue functioning.

---

### TC-REG-023: Quote-to-Invoice Conversion (Core Flow)

**Related Phase 1 Feature:** Quote to Invoice Conversion
**Title:** Converting accepted quote to invoice works unchanged
**Priority:** P0

**Preconditions:**
- Quote exists in 'accepted' status
- Quote has line items
- Quote has projectId = NULL

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `convertQuoteToInvoice(quoteId)` | Invoice created |
| 2 | Verify invoice has quoteId link | Set to source quote |
| 3 | Verify quote has convertedToInvoiceId | Set to new invoice |
| 4 | Verify invoice line items | Copied from quote |
| 5 | Verify invoice projectId | Matches quote (NULL) |
| 6 | Verify invoice clientId | Matches quote |

**Expected Results:**
- Conversion works for quotes without projects
- Bidirectional link established
- All data transferred correctly

**Backward Compatibility Check:**
- convertQuoteToInvoice API unchanged
- No required projectId for conversion

---

### TC-REG-024: Quote-to-Invoice Conversion Preserves Data

**Related Phase 1 Feature:** Data Preservation in Conversion
**Title:** All quote data is preserved during conversion
**Priority:** P0

**Preconditions:**
- Quote has rich content (multiple line items, blocks, notes, terms)
- Quote has signature data

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Document quote totals before conversion | Subtotal, tax, total |
| 2 | Convert quote to invoice | Succeeds |
| 3 | Compare invoice totals | Match quote totals |
| 4 | Verify line item details | Quantities, prices match |
| 5 | Verify notes/terms | Copied correctly |
| 6 | Verify signature reference | Linked or copied |

**Expected Results:**
- Zero data loss in conversion
- Financial accuracy maintained

**Backward Compatibility Check:**
- Conversion logic unchanged
- All fields mapped correctly

---

### TC-REG-025: Quote Status Transitions

**Related Phase 1 Feature:** Quote State Machine
**Title:** Quote status transitions work correctly
**Priority:** P0

**Preconditions:**
- Quote in draft status

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send quote (draft -> sent) | Status = 'sent', sentAt set |
| 2 | Mark viewed (sent -> viewed) | Status = 'viewed', viewedAt set |
| 3 | Accept quote (viewed -> accepted) | Status = 'accepted', acceptedAt set |
| 4 | Verify status cannot go backward | draft -> accepted blocked |

**Expected Results:**
- Status transitions work as defined
- Timestamps recorded correctly

**Backward Compatibility Check:**
- State machine unchanged
- No new statuses required

---

### TC-REG-026: Quote Decline Flow

**Related Phase 1 Feature:** Quote Decline
**Title:** Quote decline workflow works
**Priority:** P0

**Preconditions:**
- Quote has been sent and viewed

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `declineQuote(token, reason)` | Quote declined |
| 2 | Verify status | 'declined' |
| 3 | Verify decline reason saved | Stored correctly |
| 4 | Verify declinedAt timestamp | Set |

**Expected Results:**
- Decline flow works unchanged

**Backward Compatibility Check:**
- declineQuote API unchanged
- Reason field handling consistent

---

### TC-REG-027: Quote Expiration Handling

**Related Phase 1 Feature:** Quote Expiration
**Title:** Expired quotes handled correctly
**Priority:** P0

**Preconditions:**
- Quote has validUntil date in the past

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Query quote | Status shows 'expired' or computed |
| 2 | Attempt to accept expired quote | Blocked |
| 3 | Client portal shows expiration | Message displayed |

**Expected Results:**
- Expiration logic unchanged

**Backward Compatibility Check:**
- Expiration calculation consistent
- Portal behavior unchanged

---

### TC-REG-028: E-Signature Capture on Quote

**Related Phase 1 Feature:** E-Signature
**Title:** Signature capture works in client portal
**Priority:** P0

**Preconditions:**
- Quote sent to client
- Client has valid token

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/q/[token]` | Portal loads |
| 2 | Click accept button | Signature dialog opens |
| 3 | Draw signature on pad | Signature captured |
| 4 | Submit signature | Quote accepted |
| 5 | Verify signature data saved | Data stored correctly |
| 6 | Verify audit trail | IP, timestamp, user agent |

**Expected Results:**
- Signature capture works unchanged
- Audit data recorded correctly

**Backward Compatibility Check:**
- SignaturePad component unchanged
- Data format consistent

---

### TC-REG-029: E-Signature Display on Quote

**Related Phase 1 Feature:** Signature Display
**Title:** Captured signature displays correctly
**Priority:** P0

**Preconditions:**
- Quote has been accepted with signature

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View quote in admin dashboard | Signature visible |
| 2 | View quote in client portal | Signature visible |
| 3 | Generate PDF | Signature included |

**Expected Results:**
- Signature renders correctly in all views

**Backward Compatibility Check:**
- Signature rendering unchanged
- PDF includes signature

---

### TC-REG-030: E-Signature Audit Trail

**Related Phase 1 Feature:** Signature Audit
**Title:** Signature audit data is complete and accessible
**Priority:** P0

**Preconditions:**
- Quote accepted with signature

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View quote events | Signature event present |
| 2 | Verify event data | IP address, timestamp, user agent |
| 3 | Verify immutability | Cannot be modified |

**Expected Results:**
- Complete audit trail preserved

**Backward Compatibility Check:**
- Audit data structure unchanged
- Legal compliance maintained

---

### TC-REG-031: Contract Signature Capture

**Related Phase 1 Feature:** Contract E-Signature
**Title:** Contract signing works unchanged
**Priority:** P0

**Preconditions:**
- Contract instance sent to client

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/c/[token]` | Contract portal loads |
| 2 | Sign contract | Signature captured |
| 3 | Verify contract status | Updated to signed |

**Expected Results:**
- Contract signing unchanged

**Backward Compatibility Check:**
- Contract workflow preserved
- Signature handling consistent

---

### TC-REG-032: E-Signature Legal Validity Preservation

**Related Phase 1 Feature:** Legal E-Signature
**Title:** All e-signature legal requirements maintained
**Priority:** P0

**Preconditions:**
- Signed documents exist

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Verify signature image stored | Base64 or file reference |
| 2 | Verify timestamp in UTC | Correct format |
| 3 | Verify IP address captured | Valid format |
| 4 | Verify intent recorded | Accept action logged |

**Expected Results:**
- Legal e-signature requirements met

**Backward Compatibility Check:**
- No changes to signature data model
- Audit fields unchanged

---

### TC-REG-033: PDF Generation - Quote (Without Project)

**Related Phase 1 Feature:** Quote PDF Generation
**Title:** PDF generation works for quotes without projects
**Priority:** P0

**Preconditions:**
- Quote exists with projectId = NULL
- Quote has line items and content

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `/api/pdf/quote/[quoteId]` | PDF generated |
| 2 | Verify PDF contains quote data | All fields present |
| 3 | Verify no project field errors | No null reference errors |
| 4 | Verify PDF is valid | Opens in PDF reader |

**Expected Results:**
- PDF generation works for legacy quotes
- No errors from missing project

**Backward Compatibility Check:**
- PDF template handles null project
- No required project fields in output

---

### TC-REG-034: PDF Generation - Invoice (Without Project)

**Related Phase 1 Feature:** Invoice PDF Generation
**Title:** PDF generation works for invoices without projects
**Priority:** P0

**Preconditions:**
- Invoice exists with projectId = NULL

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `/api/pdf/invoice/[invoiceId]` | PDF generated |
| 2 | Verify PDF content | All invoice data present |
| 3 | Verify no errors | Clean PDF output |

**Expected Results:**
- Invoice PDF works without project

**Backward Compatibility Check:**
- PDF template handles null project
- Invoice formatting unchanged

---

### TC-REG-035: PDF Download - Quote

**Related Phase 1 Feature:** Quote PDF Download
**Title:** Quote PDF download endpoint works
**Priority:** P0

**Preconditions:**
- Quote exists

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `/api/download/quote/[quoteId]` | File downloaded |
| 2 | Verify content-disposition header | Correct filename |
| 3 | Verify file size > 0 | Not empty |

**Expected Results:**
- Download works unchanged

**Backward Compatibility Check:**
- API endpoint unchanged
- Headers consistent

---

### TC-REG-036: PDF Download - Invoice

**Related Phase 1 Feature:** Invoice PDF Download
**Title:** Invoice PDF download endpoint works
**Priority:** P0

**Preconditions:**
- Invoice exists

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `/api/download/invoice/[invoiceId]` | File downloaded |
| 2 | Verify correct filename | Contains invoice number |

**Expected Results:**
- Download works unchanged

**Backward Compatibility Check:**
- API unchanged
- File naming consistent

---

### TC-REG-037: PDF Branding Preserved

**Related Phase 1 Feature:** PDF Branding
**Title:** PDF includes workspace branding
**Priority:** P0

**Preconditions:**
- Workspace has branding configured (logo, colors)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Generate quote PDF | Includes logo |
| 2 | Verify brand colors | Applied correctly |
| 3 | Verify business info | Name, address present |

**Expected Results:**
- Branding preserved in PDFs

**Backward Compatibility Check:**
- Branding settings unchanged
- PDF template uses same sources

---

### TC-REG-038: PDF Multi-Page Support

**Related Phase 1 Feature:** Multi-Page PDF
**Title:** Large documents generate multi-page PDFs correctly
**Priority:** P0

**Preconditions:**
- Quote/Invoice has many line items

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Generate PDF for large document | Multiple pages |
| 2 | Verify page breaks | Clean breaks |
| 3 | Verify headers/footers | On each page |

**Expected Results:**
- Multi-page handling unchanged

**Backward Compatibility Check:**
- Page break logic consistent
- No layout issues

---

### TC-REG-039: Payment Recording on Invoice

**Related Phase 1 Feature:** Payment Recording
**Title:** Recording payments works unchanged
**Priority:** P0

**Preconditions:**
- Invoice exists in 'sent' status
- Invoice has projectId = NULL

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `recordPayment(invoiceId, amount, method)` | Payment recorded |
| 2 | Verify payment object created | Has correct data |
| 3 | Verify invoice.amountPaid | Updated correctly |
| 4 | Verify invoice status | Updated if full payment |

**Expected Results:**
- Payment recording unchanged

**Backward Compatibility Check:**
- recordPayment API unchanged
- Payment model unchanged

---

### TC-REG-040: Partial Payment Handling

**Related Phase 1 Feature:** Partial Payments
**Title:** Partial payments update invoice status correctly
**Priority:** P0

**Preconditions:**
- Invoice total = $1000
- No prior payments

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Record payment of $500 | Payment recorded |
| 2 | Verify invoice status | 'partial' |
| 3 | Verify amountPaid | $500 |
| 4 | Record payment of $500 | Second payment |
| 5 | Verify invoice status | 'paid' |

**Expected Results:**
- Partial payment logic unchanged

**Backward Compatibility Check:**
- Status transitions correct
- Amount calculations accurate

---

### TC-REG-041: Stripe Checkout Session Creation

**Related Phase 1 Feature:** Stripe Integration
**Title:** Creating Stripe checkout session works
**Priority:** P0

**Preconditions:**
- Stripe is configured
- Invoice is in valid status for payment

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `/api/checkout/invoice/[invoiceId]` | Session created |
| 2 | Verify checkout URL returned | Valid Stripe URL |
| 3 | Verify session amount | Matches invoice |

**Expected Results:**
- Stripe integration unchanged

**Backward Compatibility Check:**
- Stripe service calls unchanged
- Amount calculations consistent

---

### TC-REG-042: Stripe Webhook - Payment Success

**Related Phase 1 Feature:** Payment Webhook
**Title:** Successful payment webhook updates invoice
**Priority:** P0

**Preconditions:**
- Invoice has pending Stripe session

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Receive webhook checkout.session.completed | Processed |
| 2 | Verify payment recorded | Created automatically |
| 3 | Verify invoice status | Updated to paid/partial |

**Expected Results:**
- Webhook handling unchanged

**Backward Compatibility Check:**
- Webhook signature verification intact
- Payment creation logic consistent

---

### TC-REG-043: Stripe Webhook - Refund

**Related Phase 1 Feature:** Refund Handling
**Title:** Refund webhooks handled correctly
**Priority:** P0

**Preconditions:**
- Payment exists for invoice

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Receive refund webhook | Processed |
| 2 | Verify payment status updated | Refunded |
| 3 | Verify invoice amounts | Recalculated |

**Expected Results:**
- Refund handling unchanged

**Backward Compatibility Check:**
- Refund logic consistent
- Amount recalculation correct

---

### TC-REG-044: Client Portal Payment Flow

**Related Phase 1 Feature:** Portal Payment
**Title:** Client can pay invoice via portal
**Priority:** P0

**Preconditions:**
- Invoice sent to client
- Client has valid token
- Stripe configured

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/i/[token]` | Invoice portal loads |
| 2 | Click pay button | Redirects to Stripe |
| 3 | Complete payment | Returns to portal |
| 4 | Verify payment recorded | Invoice updated |

**Expected Results:**
- Client payment flow unchanged

**Backward Compatibility Check:**
- Portal UX unchanged
- Payment flow consistent

---

## 4. Navigation (MEDIUM Impact)

These tests verify existing navigation routes continue working after sidebar restructure.

---

### TC-REG-045: Dashboard Route Accessible

**Related Phase 1 Feature:** Dashboard Navigation
**Title:** /dashboard route loads correctly
**Priority:** P0

**Preconditions:**
- User is authenticated

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard` | Page loads |
| 2 | Verify no 404 | Success response |
| 3 | Verify dashboard content | Stats, charts visible |

**Expected Results:**
- Dashboard route unchanged

**Backward Compatibility Check:**
- URL unchanged
- Bookmarks work

---

### TC-REG-046: Quotes Route Accessible

**Related Phase 1 Feature:** Quotes Navigation
**Title:** /quotes route loads correctly
**Priority:** P0

**Preconditions:**
- User authenticated

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/quotes` | Page loads |
| 2 | Verify quote list | Displays quotes |
| 3 | Click new quote | Navigates correctly |

**Expected Results:**
- Quotes route unchanged

**Backward Compatibility Check:**
- URL unchanged
- All sub-routes work

---

### TC-REG-047: Invoices Route Accessible

**Related Phase 1 Feature:** Invoices Navigation
**Title:** /invoices route loads correctly
**Priority:** P0

**Preconditions:**
- User authenticated

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/invoices` | Page loads |
| 2 | Verify invoice list | Displays invoices |

**Expected Results:**
- Invoices route unchanged

**Backward Compatibility Check:**
- URL unchanged

---

### TC-REG-048: Clients Route Accessible

**Related Phase 1 Feature:** Clients Navigation
**Title:** /clients route loads correctly
**Priority:** P0

**Preconditions:**
- User authenticated

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/clients` | Page loads |
| 2 | Verify client list | Displays clients |
| 3 | Navigate to client detail | Works correctly |

**Expected Results:**
- Clients routes unchanged

**Backward Compatibility Check:**
- All client URLs work

---

### TC-REG-049: Settings Route Accessible

**Related Phase 1 Feature:** Settings Navigation
**Title:** All settings routes load correctly
**Priority:** P0

**Preconditions:**
- User authenticated with admin role

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/settings` | Overview page |
| 2 | Navigate to `/settings/business` | Business profile |
| 3 | Navigate to `/settings/branding` | Branding settings |
| 4 | Navigate to `/settings/payments` | Payment settings |
| 5 | Navigate to `/settings/team` | Team members |

**Expected Results:**
- All settings routes accessible

**Backward Compatibility Check:**
- No settings URLs changed
- All settings forms work

---

## 5. UI Components (MEDIUM Impact)

These tests verify UI components render correctly with new badge variants and any styling changes.

---

### TC-REG-050: Quote Status Badge Rendering - Draft

**Related Phase 1 Feature:** Quote Status Display
**Title:** Draft quote badge renders correctly
**Priority:** P0

**Preconditions:**
- Quote in draft status

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Render quote list | Draft badge visible |
| 2 | Verify badge text | "Draft" |
| 3 | Verify badge styling | Consistent with design |
| 4 | Verify accessibility | Readable color contrast |

**Expected Results:**
- Draft badge renders correctly

**Backward Compatibility Check:**
- Badge appearance acceptable
- No broken styling

---

### TC-REG-051: Quote Status Badge Rendering - All Statuses

**Related Phase 1 Feature:** Quote Status Display
**Title:** All quote status badges render correctly
**Priority:** P0

**Preconditions:**
- Quotes in various statuses exist

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View draft quote badge | Renders correctly |
| 2 | View sent quote badge | Renders correctly |
| 3 | View viewed quote badge | Renders correctly |
| 4 | View accepted quote badge | Renders correctly |
| 5 | View declined quote badge | Renders correctly |
| 6 | View expired quote badge | Renders correctly |

**Expected Results:**
- All status badges render without errors

**Backward Compatibility Check:**
- Badge variants exist
- No missing styles

---

### TC-REG-052: Invoice Status Badge Rendering - All Statuses

**Related Phase 1 Feature:** Invoice Status Display
**Title:** All invoice status badges render correctly
**Priority:** P0

**Preconditions:**
- Invoices in various statuses

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View draft invoice badge | Renders correctly |
| 2 | View sent invoice badge | Renders correctly |
| 3 | View paid invoice badge | Renders correctly |
| 4 | View partial invoice badge | Renders correctly |
| 5 | View overdue invoice badge | Renders correctly |
| 6 | View void invoice badge | Renders correctly |

**Expected Results:**
- All invoice badges render correctly

**Backward Compatibility Check:**
- Badge styling consistent
- Colors distinguishable

---

### TC-REG-053: Sidebar Renders Without Errors

**Related Phase 1 Feature:** Sidebar Component
**Title:** Sidebar renders correctly after restructure
**Priority:** P0

**Preconditions:**
- User authenticated

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load dashboard | Sidebar visible |
| 2 | Verify Dashboard link | Present and clickable |
| 3 | Verify Quotes link | Present and clickable |
| 4 | Verify Invoices link | Present and clickable |
| 5 | Verify Clients link | Present and clickable |
| 6 | Verify Settings link | Present and clickable |

**Expected Results:**
- All existing nav items accessible

**Backward Compatibility Check:**
- No navigation items removed
- All links functional

---

### TC-REG-054: Sidebar Collapse Functionality

**Related Phase 1 Feature:** Sidebar Collapse
**Title:** Sidebar collapse/expand works correctly
**Priority:** P0

**Preconditions:**
- Sidebar visible

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click collapse toggle | Sidebar collapses |
| 2 | Verify icon mode | Only icons visible |
| 3 | Hover on icon | Tooltip shows label |
| 4 | Click expand toggle | Sidebar expands |
| 5 | Verify full mode | Labels visible |

**Expected Results:**
- Collapse functionality unchanged

**Backward Compatibility Check:**
- Toggle behavior consistent
- Tooltips work in icon mode

---

## 6. API Endpoints (HIGH Impact)

These tests verify API endpoints return expected response formats.

---

### TC-REG-061: GET /api/quotes Returns Expected Format

**Related Phase 1 Feature:** Quotes API
**Title:** Quotes API response format unchanged
**Priority:** P0

**Preconditions:**
- Quotes exist in database

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET /api/quotes | 200 response |
| 2 | Verify response is array | Array of quotes |
| 3 | Verify quote object shape | Has id, title, status, clientId |
| 4 | Verify projectId field | Present (may be null) |

**Expected Results:**
- API response format stable
- New projectId field is additive, not breaking

**Backward Compatibility Check:**
- No removed fields
- Type definitions compatible

---

### TC-REG-062: POST /api/quotes Creates Without ProjectId

**Related Phase 1 Feature:** Quote Creation API
**Title:** Quote creation API works without projectId
**Priority:** P0

**Preconditions:**
- Valid authentication

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST /api/quotes with clientId, title | 201 response |
| 2 | Verify no projectId in request | Not required |
| 3 | Verify quote created | Has id |
| 4 | Verify projectId is null | In response |

**Expected Results:**
- Quote creation without projectId works

**Backward Compatibility Check:**
- projectId not required
- API backward compatible

---

### TC-REG-063: GET /api/invoices Returns Expected Format

**Related Phase 1 Feature:** Invoices API
**Title:** Invoices API response format unchanged
**Priority:** P0

**Preconditions:**
- Invoices exist

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET /api/invoices | 200 response |
| 2 | Verify response array | Contains invoices |
| 3 | Verify invoice shape | Expected fields |

**Expected Results:**
- Invoices API format stable

**Backward Compatibility Check:**
- No breaking changes

---

### TC-REG-064: GET /api/pdf/quote/[id] Works

**Related Phase 1 Feature:** Quote PDF API
**Title:** Quote PDF generation endpoint works
**Priority:** P0

**Preconditions:**
- Quote exists with projectId = NULL

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET /api/pdf/quote/[quoteId] | PDF returned |
| 2 | Verify content-type | application/pdf |
| 3 | Verify PDF valid | Opens correctly |

**Expected Results:**
- PDF endpoint works for legacy quotes

**Backward Compatibility Check:**
- No template errors
- PDF generation unchanged

---

### TC-REG-065: GET /api/pdf/invoice/[id] Works

**Related Phase 1 Feature:** Invoice PDF API
**Title:** Invoice PDF generation endpoint works
**Priority:** P0

**Preconditions:**
- Invoice exists

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET /api/pdf/invoice/[invoiceId] | PDF returned |
| 2 | Verify content-type | application/pdf |

**Expected Results:**
- Invoice PDF endpoint works

**Backward Compatibility Check:**
- PDF generation unchanged

---

### TC-REG-066: POST /api/checkout/invoice/[id] Works

**Related Phase 1 Feature:** Stripe Checkout API
**Title:** Checkout session creation works
**Priority:** P0

**Preconditions:**
- Invoice exists
- Stripe configured

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST /api/checkout/invoice/[id] | Session created |
| 2 | Verify checkout URL | Valid Stripe URL |

**Expected Results:**
- Checkout endpoint unchanged

**Backward Compatibility Check:**
- Stripe integration stable

---

### TC-REG-067: POST /api/webhooks/stripe Processes Events

**Related Phase 1 Feature:** Stripe Webhooks
**Title:** Stripe webhook endpoint processes events
**Priority:** P0

**Preconditions:**
- Valid Stripe webhook secret

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | POST valid webhook event | 200 response |
| 2 | Verify event processed | Database updated |

**Expected Results:**
- Webhook processing unchanged

**Backward Compatibility Check:**
- Event handling consistent

---

### TC-REG-068: GET /api/health Returns OK

**Related Phase 1 Feature:** Health Check
**Title:** Health check endpoint works
**Priority:** P0

**Preconditions:**
- Application running

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET /api/health | 200 response |
| 2 | Verify response body | Status OK |

**Expected Results:**
- Health check works

**Backward Compatibility Check:**
- Endpoint unchanged

---

## Additional Regression Tests: Dashboard & Analytics

---

### TC-REG-055: Dashboard Loads Without Errors

**Related Phase 1 Feature:** Dashboard
**Title:** Dashboard page loads with all widgets
**Priority:** P0

**Preconditions:**
- User authenticated with data

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to /dashboard | Page loads |
| 2 | Verify stats cards | Display correctly |
| 3 | Verify recent quotes | List renders |
| 4 | Verify recent invoices | List renders |
| 5 | Verify activity feed | Renders |

**Expected Results:**
- Dashboard fully functional

**Backward Compatibility Check:**
- All widgets render
- Data accurate

---

### TC-REG-056: Analytics Charts Render

**Related Phase 1 Feature:** Analytics Charts
**Title:** Dashboard analytics charts render correctly
**Priority:** P0

**Preconditions:**
- Historical data exists

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View revenue chart | Renders |
| 2 | View status charts | Render |
| 3 | View conversion funnel | Renders |

**Expected Results:**
- All charts functional

**Backward Compatibility Check:**
- Chart components unchanged
- Data integration stable

---

### TC-REG-057: getDashboardStats Returns Complete Data

**Related Phase 1 Feature:** Dashboard Stats Action
**Title:** Dashboard stats action returns all expected fields
**Priority:** P0

**Preconditions:**
- Workspace has data

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call getDashboardStats() | Returns object |
| 2 | Verify totalQuotes | Present, number |
| 3 | Verify totalInvoices | Present, number |
| 4 | Verify totalRevenue | Present, number |
| 5 | Verify conversionRate | Present, number |

**Expected Results:**
- All stats returned

**Backward Compatibility Check:**
- Response shape unchanged
- No removed fields

---

### TC-REG-058: getConversionFunnelData Works

**Related Phase 1 Feature:** Conversion Funnel
**Title:** Conversion funnel data returns correctly
**Priority:** P0

**Preconditions:**
- Quote data exists

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call getConversionFunnelData() | Returns object |
| 2 | Verify quotesCreated | Present |
| 3 | Verify quotesSent | Present |
| 4 | Verify quotesAccepted | Present |

**Expected Results:**
- Funnel data complete

**Backward Compatibility Check:**
- Existing fields present
- New fields additive only

---

### TC-REG-059: getPaymentAgingData Works

**Related Phase 1 Feature:** Payment Aging
**Title:** Payment aging data returns correctly
**Priority:** P0

**Preconditions:**
- Invoice data with various due dates

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call getPaymentAgingData() | Returns object |
| 2 | Verify aging buckets | All present |
| 3 | Verify totalOutstanding | Calculated |

**Expected Results:**
- Aging data accurate

**Backward Compatibility Check:**
- Bucket definitions unchanged

---

### TC-REG-060: getRevenueData Returns Historical Data

**Related Phase 1 Feature:** Revenue Analytics
**Title:** Revenue data returns correctly
**Priority:** P0

**Preconditions:**
- Payment history exists

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call getRevenueData('monthly') | Returns array |
| 2 | Verify data points | Have date, amount |
| 3 | Verify period filter | Works correctly |

**Expected Results:**
- Revenue data accurate

**Backward Compatibility Check:**
- Data format unchanged

---

## Traceability Matrix

### Requirements to Test Mapping

| Phase 1 Requirement | Test Cases | Coverage |
|---------------------|------------|----------|
| Quote CRUD | TC-REG-001, 002, 003, 004, 005 | Complete |
| Invoice CRUD | TC-REG-006, 007, 008, 009, 010 | Complete |
| Client Management | TC-REG-017, 018, 019, 020, 021, 022 | Complete |
| Quote-to-Invoice | TC-REG-023, 024, 025, 026, 027 | Complete |
| E-Signature | TC-REG-028, 029, 030, 031, 032 | Complete |
| PDF Generation | TC-REG-033, 034, 035, 036, 037, 038 | Complete |
| Payments | TC-REG-039, 040, 041, 042, 043, 044 | Complete |
| Navigation | TC-REG-045, 046, 047, 048, 049 | Complete |
| UI Components | TC-REG-050, 051, 052, 053, 054 | Complete |
| Dashboard/Analytics | TC-REG-055, 056, 057, 058, 059, 060 | Complete |
| API Endpoints | TC-REG-061, 062, 063, 064, 065, 066, 067, 068 | Complete |

### Phase 2 Change to Test Mapping

| Phase 2 Change | Impact Level | Regression Tests |
|----------------|--------------|------------------|
| Project entity (projectId) | HIGH | TC-REG-001-016, 023-024, 033-034 |
| Sidebar restructure | MEDIUM | TC-REG-045-049, 053-054 |
| Badge variant changes | MEDIUM | TC-REG-050-052 |
| Analytics enhancements | LOW | TC-REG-055-060 |
| New API endpoints | LOW | TC-REG-061-068 |

---

## Execution Guidelines

### Pre-Execution Checklist

- [ ] Phase 2 migration has been run on test database
- [ ] Test data includes quotes/invoices with projectId = NULL
- [ ] Test data includes quotes/invoices with valid projectId
- [ ] Stripe test mode is configured
- [ ] Email sending is mocked or using test provider

### Execution Order

1. **Database Operations (TC-REG-001 to TC-REG-016)** - Run first to validate data layer
2. **Client Management (TC-REG-017 to TC-REG-022)** - Depends on database tests
3. **Business Logic (TC-REG-023 to TC-REG-044)** - Core workflow validation
4. **Navigation (TC-REG-045 to TC-REG-049)** - UI route verification
5. **UI Components (TC-REG-050 to TC-REG-054)** - Visual regression
6. **Dashboard (TC-REG-055 to TC-REG-060)** - Analytics verification
7. **API Endpoints (TC-REG-061 to TC-REG-068)** - API contract verification

### Pass/Fail Criteria

**PASS:** All 68 tests pass with no failures
**CONDITIONAL PASS:** All tests pass with documented known issues having workarounds
**FAIL:** Any test failure without documented workaround blocks Phase 2 release

### Regression Test Automation

These manual test cases should be automated using Playwright for E2E tests. Key automation priorities:

1. **Database Operations:** Unit tests with Vitest + Prisma test client
2. **API Endpoints:** Integration tests with Vitest + API client
3. **Navigation:** Playwright E2E tests
4. **UI Components:** Visual regression with Playwright + screenshots
5. **Business Logic:** Combination of unit and E2E tests

---

## Summary

This regression test suite covers 68 critical test cases organized across 6 risk areas. All tests are P0 priority and must pass before Phase 2 can be released to production.

**Key areas of focus:**
1. **Null projectId handling** - Ensuring legacy quotes/invoices work
2. **Navigation stability** - All existing routes accessible
3. **Business workflow continuity** - Quote-to-invoice, payments, signatures
4. **API contract stability** - No breaking changes to existing endpoints

The tests provide comprehensive coverage of Phase 1 functionality that could be affected by Phase 2 changes, with clear backward compatibility checks for each test case.

---

*Generated by Manual Test Generator*
*Last updated: 2026-02-13*
