import { auth } from '@/lib/auth';
import { prisma } from '@quotecraft/database';
import { DEMO_CONFIG } from './constants';

/**
 * Custom error for demo mode restrictions
 */
export class DemoModeError extends Error {
  constructor(message: string = 'This action is not available in demo mode') {
    super(message);
    this.name = 'DemoModeError';
  }
}

/**
 * Check if the current session is a demo session
 * @returns true if the current user is the demo user
 *
 * Uses email match first, then falls back to checking
 * if the user's workspace has the demo slug. This ensures
 * demo guard works even if DEMO_USER_EMAIL env var is misconfigured.
 */
export async function isDemoSession(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  // Primary check: email match
  if (session.user.email === DEMO_CONFIG.email) return true;

  // Fallback: check if the user's current workspace is the demo workspace
  if (session.user.id) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: {
        workspace: {
          select: { slug: true },
        },
      },
    });
    if (membership?.workspace?.slug === DEMO_CONFIG.workspaceSlug) return true;
  }

  return false;
}

/**
 * Get demo session info if in demo mode
 * @returns Demo session info or null if not in demo mode
 */
export async function getDemoSessionInfo(): Promise<{
  isDemo: boolean;
  message?: string;
} | null> {
  const isDemo = await isDemoSession();

  if (!isDemo) {
    return null;
  }

  return {
    isDemo: true,
    message: 'You are using a demo account. Changes will not be saved.',
  };
}

/**
 * Assert that the current session is NOT a demo session
 * Throws DemoModeError if in demo mode
 *
 * Use this at the start of mutation server actions:
 * ```typescript
 * export async function createQuote(data: CreateQuoteInput) {
 *   await assertNotDemo();
 *   // ... rest of the function
 * }
 * ```
 */
export async function assertNotDemo(): Promise<void> {
  const isDemo = await isDemoSession();

  if (isDemo) {
    throw new DemoModeError(
      'This action is not available in demo mode. Create an account to save your changes.'
    );
  }
}

/**
 * Wrap a server action to block demo users
 * Returns a user-friendly error instead of throwing
 *
 * @param action The server action function to wrap
 * @returns Wrapped function that checks demo mode first
 */
export function withDemoGuard<T extends (...args: unknown[]) => Promise<unknown>>(
  action: T
): (...args: Parameters<T>) => Promise<ReturnType<T> | { error: string; isDemo: true }> {
  return async (...args: Parameters<T>) => {
    const isDemo = await isDemoSession();

    if (isDemo) {
      return {
        error: 'This action is not available in demo mode. Create an account to save your changes.',
        isDemo: true as const,
      };
    }

    return action(...args) as Promise<ReturnType<T>>;
  };
}

/**
 * Check if an action is allowed in demo mode
 * Read-only actions are allowed, mutations are blocked
 */
export function isDemoAllowedAction(actionName: string): boolean {
  const readOnlyPrefixes = ['get', 'list', 'fetch', 'load', 'search', 'find', 'check', 'validate'];

  const lowerAction = actionName.toLowerCase();
  return readOnlyPrefixes.some((prefix) => lowerAction.startsWith(prefix));
}
