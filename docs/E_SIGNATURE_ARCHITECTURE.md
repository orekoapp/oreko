# E-Signature Architecture

**Last updated:** March 9, 2026
**System type:** Custom-built (zero third-party e-signing dependencies)

---

## 1. Signer Identity Verification

**Flow:** Email OTP gate → Signature pad

When a client clicks "Accept Quote" or opens a contract signing page:

1. The **signature pad is hidden** until identity is verified
2. A `SigningOtpGate` component shows, displaying the client's masked email (`a***@example.com`)
3. Client clicks "Send Verification Code" → server generates a 6-digit OTP via `crypto.randomInt()`, stores it in memory (keyed by `quote:{id}` or `contract:{id}`), and emails it
4. Client enters the code → server verifies it matches, marks the session as verified
5. Only then does the signature pad + name field + terms checkbox appear

**Rate limiting:** 5 OTP sends per 10 min per IP, 10 verify attempts per 10 min per IP, max 5 wrong codes per OTP. All enforced server-side.

**What this proves:** The person signing had access to the email the document was sent to. This creates the chain: *email invite → email OTP → signature*.

**Files:** `lib/signing/otp.ts`, `lib/signing/actions.ts`, `components/client-portal/signing-otp-gate.tsx`

---

## 2. Document Tamper-Proofing

**Method:** SHA-256 hash computed at the exact moment of signing

**For quotes** (`portal-actions.ts:acceptQuote`):
```
SHA-256(JSON.stringify({
  quoteId, lineItems[{name, description, qty, rate, amount}],
  terms, notes, subtotal, total, signerName, signedAt
}))
```

**For contracts** (`contracts/actions.ts:signContract`):
```
SHA-256(JSON.stringify({
  contractInstanceId, content, signerName, signedAt
}))
```

The hash is stored in two places:
- `signatureData.documentHash` — on the quote/contract record itself
- `QuoteEvent.metadata.documentHash` — in the immutable audit trail

**Verification:** To check if a document was modified after signing, recompute the hash from current data and compare against the stored hash. If they differ, the document was tampered with. Uses Node's built-in `crypto` module — no dependencies.

**Files:** `lib/signing/document-hash.ts`

---

## 3. Audit Trail

### What's captured and where

| Event | Table | Data Captured |
|-------|-------|---------------|
| Quote viewed | `QuoteEvent` | IP, user agent, timestamp, first-view flag |
| Quote accepted/signed | `QuoteEvent` | IP, user agent, signer name, terms snapshot, notes snapshot, document hash |
| Quote declined | `QuoteEvent` | IP, user agent, reason, comment |
| Quote PDF downloaded | `QuoteEvent` | IP, user agent, actor ID, filename |
| Invoice PDF downloaded | `InvoiceEvent` | IP, user agent, actor ID, filename |
| Contract viewed | `ContractInstance.viewedAt` | Timestamp (first view) |
| Contract signed | `ContractInstance` | IP (`signerIpAddress`), user agent (`signerUserAgent`), signature data, document hash |

### Signing Certificate PDF

Both quotes and contracts have downloadable signing certificate endpoints:
- `GET /api/download/signing-certificate/quote/[quoteId]`
- `GET /api/download/signing-certificate/contract/[contractId]`

These generate a PDF containing:
- Document details (number, title, business, client)
- Signer details (name, email, signed-at, IP, user agent)
- Signature image (if drawn)
- SHA-256 document hash
- Full chronological audit trail table (every event with timestamp + IP)

This certificate is the legally defensible artifact — it proves *who* signed, *when*, *from where*, and that the *document hasn't changed*.

**Files:** `lib/signing/certificate-template.ts`, `app/api/download/signing-certificate/`

---

## 4. Legal Standing

This approach satisfies **ESIGN Act** (US) and **eIDAS simple electronic signatures** (EU) requirements:

| Requirement | How We Meet It |
|-------------|----------------|
| Intent to sign | Explicit "Accept Quote" / "Sign Contract" button click |
| Consent to do business electronically | Terms checkbox required before signing |
| Association of signature with record | Signature stored in same DB record, linked by document hash |
| Record retention | All events stored in DB with timestamps, downloadable as PDF certificate |
| Identity of signer | Email OTP verification + IP + user agent |
| Integrity of record | SHA-256 hash proves document unchanged post-signature |

**Disclaimer:** QuoteCraft's e-signatures comply with the intent of ESIGN Act and eIDAS simple electronic signatures. For regulated industries requiring advanced/qualified electronic signatures, integrate a certified provider.

---

## 5. Signature Capture

Two capture methods are supported:

### Quote Signing (`components/client-portal/signature-pad.tsx`)
- Uses `react-signature-canvas` library
- HTML5 Canvas → PNG → Base64 data URL
- Stored in `Quote.signatureData` JSON field

### Contract Signing (`components/contracts/signature-pad.tsx`)
- Custom canvas implementation (no external dependency)
- Supports both **typed** (cursive font) and **drawn** (canvas) signatures
- Stored in `ContractInstance.signatureData` JSON field

### Signature Data Shape

**Quote signature:**
```json
{
  "type": "drawn",
  "encrypted": false,
  "data": "data:image/png;base64,...",
  "signerName": "John Doe",
  "signedAt": "2026-03-09T12:00:00.000Z",
  "ipAddress": "203.0.113.50",
  "userAgent": "Mozilla/5.0...",
  "documentHash": "a1b2c3d4e5f6..."
}
```

**Contract signature:**
```json
{
  "type": "typed" | "drawn",
  "value": "John Doe" | "data:image/png;base64,...",
  "name": "John Doe",
  "date": "2026-03-09T12:00:00.000Z",
  "documentHash": "a1b2c3d4e5f6..."
}
```

---

## 6. Known Limitations

| Area | Detail | Mitigation |
|------|--------|------------|
| OTP storage | In-memory (per-instance) | For multi-instance deployments, replace with Redis. The `lib/signing/otp.ts` module is designed for easy swap. |
| Signature encryption | Base64 stored without encryption at rest | Database-level access controls apply. Users can enable PostgreSQL TDE or use encrypted hosting. |
| No PKI/certificates | No X.509 certificate-based signing | Not practical for self-hosted OSS. SHA-256 hash provides equivalent tamper detection. |
| No SMS verification | Email OTP only | SMS requires paid services (Twilio). Defeats self-hosted goal. |
| Contract audit trail | No dedicated `ContractEvent` table | Uses `ContractInstance` timestamps + `signerIpAddress`/`signerUserAgent` fields. Quote-level events use `QuoteEvent` table. |
