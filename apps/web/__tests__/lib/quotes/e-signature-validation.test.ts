import { describe, it, expect } from 'vitest';

// E-Signature Data Validation (Bug #337)
// Validates e-signature payloads before storing them.

interface SignatureData {
  signatureImage: string;
  signerName: string;
  signerEmail: string;
  timestamp: string;
  ipAddress: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isValidEmail(email: string): boolean {
  // Basic email format check: must have @ and a dot after @
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidIpAddress(ip: string): boolean {
  // IPv4 format: 4 groups of 0-255 separated by dots
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Regex);
  if (!match) return false;
  return match.slice(1).every((octet) => {
    const num = parseInt(octet!, 10);
    return num >= 0 && num <= 255;
  });
}

function isValidTimestamp(ts: string): boolean {
  const date = new Date(ts);
  return !isNaN(date.getTime());
}

function validateSignature(data: Partial<SignatureData>): ValidationResult {
  const errors: string[] = [];

  if (!data.signatureImage || data.signatureImage.trim() === '') {
    errors.push('Signature image data is required');
  }

  if (!data.signerName || data.signerName.trim() === '') {
    errors.push('Signer name is required');
  }

  if (!data.signerEmail || data.signerEmail.trim() === '') {
    errors.push('Signer email is required');
  } else if (!isValidEmail(data.signerEmail)) {
    errors.push('Invalid email format');
  }

  if (!data.timestamp || data.timestamp.trim() === '') {
    errors.push('Timestamp is required');
  } else if (!isValidTimestamp(data.timestamp)) {
    errors.push('Invalid timestamp format');
  }

  if (!data.ipAddress || data.ipAddress.trim() === '') {
    errors.push('IP address is required');
  } else if (!isValidIpAddress(data.ipAddress)) {
    errors.push('Invalid IP address format');
  }

  return { valid: errors.length === 0, errors };
}

describe('E-Signature Validation (Bug #337)', () => {
  const validSignature: SignatureData = {
    signatureImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAE=',
    signerName: 'Jane Doe',
    signerEmail: 'jane@example.com',
    timestamp: '2026-03-08T12:00:00Z',
    ipAddress: '192.168.1.1',
  };

  describe('valid signatures', () => {
    it('accepts a complete valid signature', () => {
      const result = validateSignature(validSignature);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts signature with various valid email formats', () => {
      const emails = [
        'user@example.com',
        'first.last@domain.co.uk',
        'user+tag@example.org',
        'user123@sub.domain.com',
      ];
      for (const email of emails) {
        const result = validateSignature({ ...validSignature, signerEmail: email });
        expect(result.valid).toBe(true);
      }
    });

    it('accepts various valid IPv4 addresses', () => {
      const ips = ['0.0.0.0', '127.0.0.1', '192.168.1.1', '255.255.255.255', '10.0.0.1'];
      for (const ip of ips) {
        const result = validateSignature({ ...validSignature, ipAddress: ip });
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('missing required fields', () => {
    it('rejects empty signature image data', () => {
      const result = validateSignature({ ...validSignature, signatureImage: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Signature image data is required');
    });

    it('rejects missing signature image', () => {
      const { signatureImage, ...rest } = validSignature;
      const result = validateSignature(rest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Signature image data is required');
    });

    it('rejects empty signer name', () => {
      const result = validateSignature({ ...validSignature, signerName: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Signer name is required');
    });

    it('rejects missing signer name', () => {
      const { signerName, ...rest } = validSignature;
      const result = validateSignature(rest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Signer name is required');
    });

    it('rejects empty signer email', () => {
      const result = validateSignature({ ...validSignature, signerEmail: '' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Signer email is required');
    });

    it('rejects missing timestamp', () => {
      const { timestamp, ...rest } = validSignature;
      const result = validateSignature(rest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Timestamp is required');
    });

    it('rejects missing IP address', () => {
      const { ipAddress, ...rest } = validSignature;
      const result = validateSignature(rest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('IP address is required');
    });

    it('reports all missing fields at once', () => {
      const result = validateSignature({});
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(5);
    });
  });

  describe('email format validation', () => {
    it('rejects email without @', () => {
      const result = validateSignature({ ...validSignature, signerEmail: 'notanemail' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('rejects email without domain', () => {
      const result = validateSignature({ ...validSignature, signerEmail: 'user@' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('rejects email without TLD', () => {
      const result = validateSignature({ ...validSignature, signerEmail: 'user@domain' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('rejects email with spaces', () => {
      const result = validateSignature({ ...validSignature, signerEmail: 'user @example.com' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });
  });

  describe('IP address format validation', () => {
    it('rejects IP with too few octets', () => {
      const result = validateSignature({ ...validSignature, ipAddress: '192.168.1' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid IP address format');
    });

    it('rejects IP with too many octets', () => {
      const result = validateSignature({ ...validSignature, ipAddress: '192.168.1.1.1' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid IP address format');
    });

    it('rejects IP with octet > 255', () => {
      const result = validateSignature({ ...validSignature, ipAddress: '256.0.0.1' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid IP address format');
    });

    it('rejects non-numeric IP', () => {
      const result = validateSignature({ ...validSignature, ipAddress: 'abc.def.ghi.jkl' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid IP address format');
    });
  });

  describe('timestamp validation', () => {
    it('rejects invalid timestamp string', () => {
      const result = validateSignature({ ...validSignature, timestamp: 'not-a-date' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid timestamp format');
    });

    it('accepts ISO 8601 timestamp', () => {
      const result = validateSignature({ ...validSignature, timestamp: '2026-03-08T12:00:00.000Z' });
      expect(result.valid).toBe(true);
    });

    it('accepts date-only string', () => {
      const result = validateSignature({ ...validSignature, timestamp: '2026-03-08' });
      expect(result.valid).toBe(true);
    });
  });

  describe('whitespace-only fields', () => {
    it('rejects whitespace-only signer name', () => {
      const result = validateSignature({ ...validSignature, signerName: '   ' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Signer name is required');
    });

    it('rejects whitespace-only signature data', () => {
      const result = validateSignature({ ...validSignature, signatureImage: '  ' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Signature image data is required');
    });
  });
});
