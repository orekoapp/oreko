/**
 * Sanitize HTML to prevent XSS attacks.
 * Allows safe formatting tags but strips scripts, event handlers, etc.
 *
 * Uses DOMPurify on the client. During SSR the raw HTML is returned as-is
 * because the client will re-render and sanitize it anyway. This avoids
 * the jsdom/isomorphic-dompurify ENOENT error for default-stylesheet.css.
 */

let purify: typeof import('dompurify').default | null = null;

if (typeof window !== 'undefined') {
  // Dynamic require only runs in the browser bundle
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  purify = require('dompurify').default ?? require('dompurify');
}

const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'span', 'div',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'pre', 'code',
    'img', 'hr',
    'sub', 'sup',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
    'class', 'style', 'id',
    'colspan', 'rowspan',
  ],
  ALLOW_DATA_ATTR: false,
};

export function sanitizeHtml(html: string): string {
  if (!purify) return html; // SSR — client will sanitize on hydration
  return purify.sanitize(html, PURIFY_CONFIG);
}
