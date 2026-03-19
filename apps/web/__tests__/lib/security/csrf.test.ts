import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateRequestOrigin } from '@/lib/csrf';

describe('CSRF Origin Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows requests with matching Origin header', () => {
    const request = {
      headers: { get: (name: string) => name === 'origin' ? 'http://localhost:3000' : null },
    };
    expect(validateRequestOrigin(request)).toBe(true);
  });

  it('rejects requests with non-matching Origin header', () => {
    const request = {
      headers: { get: (name: string) => name === 'origin' ? 'https://evil.com' : null },
    };
    expect(validateRequestOrigin(request)).toBe(false);
  });

  it('falls back to Referer header when Origin is absent', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'origin') return null;
          if (name === 'referer') return 'http://localhost:3000/some-page';
          return null;
        },
      },
    };
    expect(validateRequestOrigin(request)).toBe(true);
  });

  it('rejects requests with non-matching Referer header', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'origin') return null;
          if (name === 'referer') return 'https://evil.com/attack';
          return null;
        },
      },
    };
    expect(validateRequestOrigin(request)).toBe(false);
  });

  it('rejects requests with no Origin/Referer', () => {
    const request = {
      headers: { get: () => null },
    };
    expect(validateRequestOrigin(request)).toBe(false);
  });

  it('handles malformed Origin header gracefully', () => {
    const request = {
      headers: { get: (name: string) => name === 'origin' ? 'not-a-valid-url' : null },
    };
    expect(validateRequestOrigin(request)).toBe(false);
  });

  it('handles malformed Referer header gracefully', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'origin') return null;
          if (name === 'referer') return 'not-a-valid-url';
          return null;
        },
      },
    };
    expect(validateRequestOrigin(request)).toBe(false);
  });
});
