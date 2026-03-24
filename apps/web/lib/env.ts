/**
 * Trim whitespace/newlines from all environment variables.
 * Fixes Vercel env vars that have trailing \n characters.
 * Import this file early in the app lifecycle.
 */
if (typeof process !== 'undefined' && process.env) {
  for (const key of Object.keys(process.env)) {
    const value = process.env[key];
    if (typeof value === 'string' && value !== value.trim()) {
      process.env[key] = value.trim();
    }
  }
}
