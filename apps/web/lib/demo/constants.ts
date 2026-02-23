/**
 * Demo Mode Constants
 *
 * These constants define the demo account configuration.
 * The demo account provides read-only access to a pre-populated workspace.
 */

export const DEMO_USER_EMAIL = (process.env.DEMO_USER_EMAIL || 'demo@quotecraft.demo').trim();
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

/**
 * Actions that are blocked in demo mode
 * These are mutation operations that would modify data
 */
export const BLOCKED_DEMO_ACTIONS = [
  // Quote mutations
  'createQuote',
  'updateQuote',
  'deleteQuote',
  'duplicateQuote',
  'sendQuote',
  // Invoice mutations
  'createInvoice',
  'updateInvoice',
  'deleteInvoice',
  'sendInvoice',
  'recordPayment',
  'voidInvoice',
  // Client mutations
  'createClient',
  'updateClient',
  'deleteClient',
  // Rate card mutations
  'createRateCard',
  'updateRateCard',
  'deleteRateCard',
  'createRateCardCategory',
  'updateRateCardCategory',
  'deleteRateCardCategory',
  // Settings mutations
  'updateBusinessProfile',
  'updateBranding',
  'updateWorkspace',
  // Contract mutations
  'createContract',
  'updateContract',
  'deleteContract',
] as const;

export type BlockedDemoAction = (typeof BLOCKED_DEMO_ACTIONS)[number];
