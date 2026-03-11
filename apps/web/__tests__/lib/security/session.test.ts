import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Session Configuration', () => {
  const authConfigPath = resolve(process.cwd(), 'lib/auth/index.ts');
  let authContent: string;

  try {
    authContent = readFileSync(authConfigPath, 'utf-8');
  } catch {
    authContent = '';
  }

  it('uses JWT session strategy', () => {
    expect(authContent).toContain("strategy: 'jwt'");
  });

  it('has maxAge configured for sessions', () => {
    expect(authContent).toContain('maxAge');
  });

  it('has session block defined', () => {
    expect(authContent).toContain('session:');
  });

  it('auth config is non-trivial', () => {
    expect(authContent.length).toBeGreaterThan(100);
  });
});
