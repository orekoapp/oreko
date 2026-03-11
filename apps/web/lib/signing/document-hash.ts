import { createHash } from 'crypto';

/**
 * Compute a SHA-256 hash of document content at signing time.
 * This hash can be re-verified later to prove the document
 * has not been tampered with after signing.
 */

interface QuoteHashInput {
  quoteId: string;
  lineItems: Array<{
    name: string;
    description: string | null;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  terms: string;
  notes: string;
  subtotal: number;
  total: number;
  signerName: string;
  signedAt: string;
}

interface ContractHashInput {
  contractInstanceId: string;
  content: string;
  signerName: string;
  signedAt: string;
}

/**
 * Compute SHA-256 hash for a quote at acceptance time.
 * Includes all financially significant fields + signer identity.
 */
export function computeQuoteDocumentHash(input: QuoteHashInput): string {
  const payload = JSON.stringify({
    quoteId: input.quoteId,
    lineItems: input.lineItems.map((item) => ({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
    })),
    terms: input.terms,
    notes: input.notes,
    subtotal: input.subtotal,
    total: input.total,
    signerName: input.signerName,
    signedAt: input.signedAt,
  });

  return createHash('sha256').update(payload).digest('hex');
}

/**
 * Compute SHA-256 hash for a contract at signing time.
 * Includes full contract content + signer identity.
 */
export function computeContractDocumentHash(input: ContractHashInput): string {
  const payload = JSON.stringify({
    contractInstanceId: input.contractInstanceId,
    content: input.content,
    signerName: input.signerName,
    signedAt: input.signedAt,
  });

  return createHash('sha256').update(payload).digest('hex');
}

/**
 * Verify a document hash matches the expected value.
 * Returns true if the hash matches, false if tampered.
 */
export function verifyDocumentHash(computedHash: string, storedHash: string): boolean {
  return computedHash === storedHash;
}
