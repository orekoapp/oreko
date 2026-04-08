/**
 * Demo Mode Constants
 *
 * These constants define the demo account configuration.
 * The demo account lets visitors try the full app; data resets daily via cron.
 *
 * MEDIUM #42: DEMO_USER_PASSWORD is intentionally hardcoded and visible in the client bundle.
 * This is a public demo account — the password is displayed on the login page so visitors
 * can try the app. The demo workspace data resets daily via cron, so exposure is by design.
 */

export const DEMO_USER_EMAIL = (process.env.DEMO_USER_EMAIL || 'demo@oreko.demo').trim();
export const DEMO_USER_PASSWORD = 'DemoPassword123!';
export const DEMO_WORKSPACE_SLUG = 'demo-workspace';

/**
 * Demo mode configuration
 */
export const DEMO_CONFIG = {
  /** Email address for the demo user */
  email: DEMO_USER_EMAIL,
  /** Password for the demo user */
  password: DEMO_USER_PASSWORD,
  /** Workspace slug for demo data isolation */
  workspaceSlug: DEMO_WORKSPACE_SLUG,
  /** Display name for the demo user */
  displayName: 'Demo User',
  /** Session duration for demo users (4 hours) */
  sessionDurationMs: 4 * 60 * 60 * 1000,
} as const;
