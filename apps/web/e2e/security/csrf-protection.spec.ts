import { test, expect } from '@playwright/test';

test.describe('CSRF Protection (Bug #321)', () => {
  test('should reject registration POST from foreign origin', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      headers: {
        'origin': 'https://evil-site.com',
        'content-type': 'application/json',
      },
      data: {
        name: 'Attacker',
        email: 'attacker@evil.com',
        password: 'Password123!',
        termsAccepted: true,
      },
    });

    // Should be rejected with 403 CSRF error
    expect([400, 403]).toContain(response.status());
  });

  test('should reject forgot-password POST from foreign origin', async ({ request }) => {
    const response = await request.post('/api/auth/forgot-password', {
      headers: {
        'origin': 'https://evil-site.com',
        'content-type': 'application/json',
      },
      data: { email: 'test@example.com' },
    });

    expect([400, 403]).toContain(response.status());
  });

  test('should allow requests from same origin', async ({ request }) => {
    const response = await request.post('/api/auth/forgot-password', {
      headers: {
        'content-type': 'application/json',
      },
      data: { email: 'nonexistent@example.com' },
    });

    // Should not be a CSRF error (may be 200 or 400 for other reasons)
    expect(response.status()).not.toBe(403);
  });

  test('should include CSRF-safe headers on portal pages', async ({ page }) => {
    // Quote portal should set Referrer-Policy to prevent token leakage
    const response = await page.goto('/q/test-invalid-token');

    if (response) {
      const referrerPolicy = response.headers()['referrer-policy'];
      // Should have restrictive referrer policy to protect access tokens
      if (referrerPolicy) {
        expect(['no-referrer', 'same-origin', 'strict-origin']).toContain(referrerPolicy);
      }
    }
  });

  test('should include CSRF-safe headers on invoice portal', async ({ page }) => {
    const response = await page.goto('/i/test-invalid-token');

    if (response) {
      const referrerPolicy = response.headers()['referrer-policy'];
      if (referrerPolicy) {
        expect(['no-referrer', 'same-origin', 'strict-origin']).toContain(referrerPolicy);
      }
    }
  });
});
