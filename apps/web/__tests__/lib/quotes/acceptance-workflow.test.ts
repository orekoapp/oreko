import { describe, it, expect } from 'vitest';

// Quote Acceptance Workflow (Bug #339)
// Standalone implementation for testing client quote acceptance

type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired' | 'converted';

interface AcceptanceRecord {
  signerName: string;
  signerEmail: string;
  timestamp: string;
  ipAddress: string;
}

interface DeclineRecord {
  reason: string;
  timestamp: string;
}

interface Quote {
  id: string;
  status: QuoteStatus;
  expiresAt: string | null;
  acceptance: AcceptanceRecord | null;
  decline: DeclineRecord | null;
}

interface AcceptResult {
  success: boolean;
  error?: string;
  quote?: Quote;
}

const ACCEPTEABLE_STATUSES: QuoteStatus[] = ['sent', 'viewed'];

function acceptQuote(
  quote: Quote,
  signerName: string,
  signerEmail: string,
  ipAddress: string,
  now: Date = new Date()
): AcceptResult {
  if (!ACCEPTEABLE_STATUSES.includes(quote.status)) {
    return { success: false, error: `Cannot accept a quote with status: ${quote.status}` };
  }

  if (quote.expiresAt && new Date(quote.expiresAt) < now) {
    return { success: false, error: 'Quote has expired' };
  }

  if (!signerName.trim()) {
    return { success: false, error: 'Signer name is required' };
  }

  if (!signerEmail.trim()) {
    return { success: false, error: 'Signer email is required' };
  }

  return {
    success: true,
    quote: {
      ...quote,
      status: 'accepted',
      acceptance: {
        signerName,
        signerEmail,
        timestamp: now.toISOString(),
        ipAddress,
      },
    },
  };
}

function declineQuote(quote: Quote, reason: string, now: Date = new Date()): AcceptResult {
  if (!['sent', 'viewed'].includes(quote.status)) {
    return { success: false, error: `Cannot decline a quote with status: ${quote.status}` };
  }

  return {
    success: true,
    quote: {
      ...quote,
      status: 'declined',
      decline: {
        reason,
        timestamp: now.toISOString(),
      },
    },
  };
}

function canModifyQuote(quote: Quote): boolean {
  return quote.status === 'draft';
}

function canConvertToInvoice(quote: Quote): boolean {
  return quote.status === 'accepted';
}

describe('Quote Acceptance Workflow (Bug #339)', () => {
  const baseQuote: Quote = {
    id: 'quote-1',
    status: 'sent',
    expiresAt: '2026-12-31T23:59:59Z',
    acceptance: null,
    decline: null,
  };

  const now = new Date('2026-06-15T12:00:00Z');

  describe('accepting quotes', () => {
    it('client can accept a sent quote', () => {
      const result = acceptQuote(baseQuote, 'John Doe', 'john@example.com', '192.168.1.1', now);
      expect(result.success).toBe(true);
      expect(result.quote!.status).toBe('accepted');
    });

    it('client can accept a viewed quote', () => {
      const viewedQuote = { ...baseQuote, status: 'viewed' as QuoteStatus };
      const result = acceptQuote(viewedQuote, 'Jane Doe', 'jane@example.com', '10.0.0.1', now);
      expect(result.success).toBe(true);
      expect(result.quote!.status).toBe('accepted');
    });

    it('acceptance records signerName, signerEmail, timestamp, IP', () => {
      const result = acceptQuote(baseQuote, 'Alice Smith', 'alice@corp.com', '203.0.113.42', now);
      expect(result.success).toBe(true);
      const acceptance = result.quote!.acceptance!;
      expect(acceptance.signerName).toBe('Alice Smith');
      expect(acceptance.signerEmail).toBe('alice@corp.com');
      expect(acceptance.timestamp).toBe('2026-06-15T12:00:00.000Z');
      expect(acceptance.ipAddress).toBe('203.0.113.42');
    });
  });

  describe('rejecting invalid acceptance', () => {
    it('cannot accept a draft quote', () => {
      const draftQuote = { ...baseQuote, status: 'draft' as QuoteStatus };
      const result = acceptQuote(draftQuote, 'John', 'john@test.com', '1.2.3.4', now);
      expect(result.success).toBe(false);
      expect(result.error).toContain('draft');
    });

    it('cannot accept an expired quote', () => {
      const expiredQuote = { ...baseQuote, expiresAt: '2026-01-01T00:00:00Z' };
      const result = acceptQuote(expiredQuote, 'John', 'john@test.com', '1.2.3.4', now);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Quote has expired');
    });

    it('cannot accept an already accepted quote', () => {
      const acceptedQuote = { ...baseQuote, status: 'accepted' as QuoteStatus };
      const result = acceptQuote(acceptedQuote, 'John', 'john@test.com', '1.2.3.4', now);
      expect(result.success).toBe(false);
      expect(result.error).toContain('accepted');
    });

    it('cannot accept a declined quote', () => {
      const declinedQuote = { ...baseQuote, status: 'declined' as QuoteStatus };
      const result = acceptQuote(declinedQuote, 'John', 'john@test.com', '1.2.3.4', now);
      expect(result.success).toBe(false);
      expect(result.error).toContain('declined');
    });

    it('requires signer name', () => {
      const result = acceptQuote(baseQuote, '', 'john@test.com', '1.2.3.4', now);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Signer name is required');
    });

    it('requires signer email', () => {
      const result = acceptQuote(baseQuote, 'John', '', '1.2.3.4', now);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Signer email is required');
    });
  });

  describe('modification rules', () => {
    it('accepted quote cannot be modified', () => {
      const accepted = { ...baseQuote, status: 'accepted' as QuoteStatus };
      expect(canModifyQuote(accepted)).toBe(false);
    });

    it('only draft quotes can be modified', () => {
      const draft = { ...baseQuote, status: 'draft' as QuoteStatus };
      expect(canModifyQuote(draft)).toBe(true);
    });

    it('sent quotes cannot be modified', () => {
      expect(canModifyQuote(baseQuote)).toBe(false);
    });
  });

  describe('conversion to invoice', () => {
    it('accepted quote can be converted to invoice', () => {
      const accepted = { ...baseQuote, status: 'accepted' as QuoteStatus };
      expect(canConvertToInvoice(accepted)).toBe(true);
    });

    it('draft quote cannot be converted to invoice', () => {
      const draft = { ...baseQuote, status: 'draft' as QuoteStatus };
      expect(canConvertToInvoice(draft)).toBe(false);
    });

    it('sent quote cannot be converted to invoice', () => {
      expect(canConvertToInvoice(baseQuote)).toBe(false);
    });
  });

  describe('declining quotes', () => {
    it('declined quote records reason', () => {
      const result = declineQuote(baseQuote, 'Too expensive', now);
      expect(result.success).toBe(true);
      expect(result.quote!.status).toBe('declined');
      expect(result.quote!.decline!.reason).toBe('Too expensive');
      expect(result.quote!.decline!.timestamp).toBe('2026-06-15T12:00:00.000Z');
    });

    it('cannot decline a draft quote', () => {
      const draft = { ...baseQuote, status: 'draft' as QuoteStatus };
      const result = declineQuote(draft, 'Not needed');
      expect(result.success).toBe(false);
      expect(result.error).toContain('draft');
    });

    it('cannot decline an already accepted quote', () => {
      const accepted = { ...baseQuote, status: 'accepted' as QuoteStatus };
      const result = declineQuote(accepted, 'Changed mind');
      expect(result.success).toBe(false);
    });
  });

  describe('expiration', () => {
    it('expired quote cannot be accepted', () => {
      const pastDate = new Date('2027-01-15T00:00:00Z');
      const result = acceptQuote(baseQuote, 'John', 'john@test.com', '1.2.3.4', pastDate);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Quote has expired');
    });

    it('quote without expiration can always be accepted', () => {
      const noExpiry = { ...baseQuote, expiresAt: null };
      const farFuture = new Date('2099-12-31T23:59:59Z');
      const result = acceptQuote(noExpiry, 'John', 'john@test.com', '1.2.3.4', farFuture);
      expect(result.success).toBe(true);
    });
  });
});
