/**
 * Clean environment variables — removes trailing literal \n and whitespace.
 * Fixes Vercel env vars that were pasted with trailing \n characters.
 * Import this file early in the app lifecycle.
 */
if (typeof process !== 'undefined' && process.env) {
  for (const key of Object.keys(process.env)) {
    const value = process.env[key];
    if (typeof value === 'string') {
      // Remove trailing literal \n (backslash + n) and actual whitespace/newlines
      const cleaned = value.replace(/\\n$/g, '').replace(/\n$/g, '').trim();
      if (cleaned !== value) {
        process.env[key] = cleaned;
      }
    }
  }
}
