/**
 * Sanitize HTML to prevent XSS attacks.
 * Allows safe formatting tags but strips scripts, event handlers, etc.
 *
 * - Client (browser): uses DOMPurify (best-in-class client-side sanitizer)
 * - Server (Node.js):  uses sanitize-html (Node-native, no DOM/jsdom needed)
 *
 * NEVER returns raw unsanitized HTML.
 */

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'blockquote', 'pre', 'code',
  'img', 'hr',
  'sub', 'sup',
];

// Bug #46: 'style' removed to prevent CSS-based data exfiltration
const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'src', 'alt', 'width', 'height',
  'class', 'id',
  'colspan', 'rowspan',
];

// ---------------------------------------------------------------------------
// Client-side: DOMPurify
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let purify: any = null;

if (typeof window !== 'undefined') {
  // Dynamic require only runs in the browser bundle
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  purify = require('dompurify').default ?? require('dompurify');
}

const PURIFY_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
};

// ---------------------------------------------------------------------------
// Server-side: sanitize-html
// ---------------------------------------------------------------------------

// Build the allowedAttributes map that sanitize-html expects:
//   { '*': ['class', 'style', 'id'], a: ['href', 'target', 'rel'], img: ['src', 'alt', 'width', 'height'], ... }
function buildServerConfig() {
  // Attributes that apply to any tag (Bug #46: 'style' removed)
  const globalAttrs = ['class', 'id'];

  // Tag-specific attributes
  const tagAttrs: Record<string, string[]> = {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
  };

  return {
    allowedTags: [...ALLOWED_TAGS],
    allowedAttributes: {
      '*': globalAttrs,
      ...tagAttrs,
    },
    // Don't allow data-* attributes (matches DOMPurify ALLOW_DATA_ATTR: false)
    allowedClasses: undefined,
  };
}

// Lazy-loaded so we don't pay the import cost on the client bundle
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverSanitize: ((html: string, options: any) => string) | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverConfig: any = null;

function getServerSanitizer() {
  if (!serverSanitize) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    serverSanitize = require('sanitize-html');
    serverConfig = buildServerConfig();
  }
  return { sanitize: serverSanitize!, config: serverConfig };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Client-side: use DOMPurify
  if (purify) {
    return purify.sanitize(html, PURIFY_CONFIG);
  }

  // Server-side: use sanitize-html (Node-native)
  const { sanitize, config } = getServerSanitizer();
  return sanitize(html, config);
}
