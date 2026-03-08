import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Simulate account lockout logic (Bug #327)
// This is a standalone implementation to verify the concept
// before it's implemented in the actual codebase.

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface AccountState {
  failedAttempts: number;
  lockedUntil: Date | null;
}

function createInitialState(): AccountState {
  return { failedAttempts: 0, lockedUntil: null };
}

function recordFailedAttempt(state: AccountState): AccountState {
  const attempts = state.failedAttempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    return {
      failedAttempts: attempts,
      lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
    };
  }
  return { ...state, failedAttempts: attempts };
}

function isLocked(state: AccountState): boolean {
  if (!state.lockedUntil) return false;
  return state.lockedUntil.getTime() > Date.now();
}

function resetOnSuccess(): AccountState {
  return createInitialState();
}

function attemptLogin(
  state: AccountState,
  credentialsValid: boolean
): { state: AccountState; allowed: boolean } {
  if (isLocked(state)) {
    return { state, allowed: false };
  }
  if (credentialsValid) {
    return { state: resetOnSuccess(), allowed: true };
  }
  return { state: recordFailedAttempt(state), allowed: false };
}

describe('Account Lockout Logic (Bug #327)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with zero failed attempts and no lockout', () => {
    const state = createInitialState();
    expect(state.failedAttempts).toBe(0);
    expect(state.lockedUntil).toBeNull();
    expect(isLocked(state)).toBe(false);
  });

  it('increments failed attempts on each failed login', () => {
    let state = createInitialState();
    state = recordFailedAttempt(state);
    expect(state.failedAttempts).toBe(1);
    expect(state.lockedUntil).toBeNull();

    state = recordFailedAttempt(state);
    expect(state.failedAttempts).toBe(2);
    expect(state.lockedUntil).toBeNull();
  });

  it('does not lock account before reaching MAX_ATTEMPTS', () => {
    let state = createInitialState();
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) {
      state = recordFailedAttempt(state);
    }
    expect(state.failedAttempts).toBe(MAX_ATTEMPTS - 1);
    expect(isLocked(state)).toBe(false);
  });

  it('locks account after MAX_ATTEMPTS failed logins', () => {
    let state = createInitialState();
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      state = recordFailedAttempt(state);
    }
    expect(state.failedAttempts).toBe(MAX_ATTEMPTS);
    expect(state.lockedUntil).not.toBeNull();
    expect(isLocked(state)).toBe(true);
  });

  it('rejects valid credentials when account is locked', () => {
    let state = createInitialState();
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      state = recordFailedAttempt(state);
    }
    expect(isLocked(state)).toBe(true);

    const result = attemptLogin(state, true);
    expect(result.allowed).toBe(false);
    // State should remain locked (not reset)
    expect(isLocked(result.state)).toBe(true);
  });

  it('unlocks account after lockout duration expires', () => {
    let state = createInitialState();
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      state = recordFailedAttempt(state);
    }
    expect(isLocked(state)).toBe(true);

    // Advance time past the lockout duration
    vi.advanceTimersByTime(LOCKOUT_DURATION_MS + 1);
    expect(isLocked(state)).toBe(false);
  });

  it('allows login after lockout expires', () => {
    let state = createInitialState();
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      state = recordFailedAttempt(state);
    }

    // Advance time past lockout
    vi.advanceTimersByTime(LOCKOUT_DURATION_MS + 1);

    const result = attemptLogin(state, true);
    expect(result.allowed).toBe(true);
    expect(result.state.failedAttempts).toBe(0);
    expect(result.state.lockedUntil).toBeNull();
  });

  it('resets counter on successful login', () => {
    let state = createInitialState();
    state = recordFailedAttempt(state);
    state = recordFailedAttempt(state);
    expect(state.failedAttempts).toBe(2);

    const result = attemptLogin(state, true);
    expect(result.allowed).toBe(true);
    expect(result.state.failedAttempts).toBe(0);
    expect(result.state.lockedUntil).toBeNull();
  });
});
