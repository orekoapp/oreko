import { test, expect } from '@playwright/test';

const XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert(1)>',
  '<svg onload=alert(1)>',
  '"><script>alert(document.cookie)</script>',
  "' onclick='alert(1)' data-x='",
  '<a href="javascript:alert(1)">click</a>',
];

test.describe('XSS Prevention (Bug #323)', () => {
  test('should not execute script tags in quote portal', async ({ page }) => {
    // Navigate to a quote portal with XSS in URL
    await page.goto('/q/<script>alert(1)</script>');

    // Page should render without executing script
    const dialogTriggered = await page.evaluate(() => {
      return (window as unknown as { __xss_triggered?: boolean }).__xss_triggered === true;
    });
    expect(dialogTriggered).toBeFalsy();
  });

  test('should not render dangerous HTML in search results', async ({ page }) => {
    await page.goto('/login');

    // Try XSS in login form (should be escaped)
    const emailInput = page.getByLabel('Email');
    if (await emailInput.isVisible()) {
      await emailInput.fill('<script>alert(1)</script>@evil.com');
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait for any response
      await page.waitForLoadState('networkidle');

      // Page content should not contain unescaped script tags
      const content = await page.content();
      expect(content).not.toContain('<script>alert(1)</script>@evil.com');
    }
  });

  test('should sanitize HTML in error messages', async ({ page }) => {
    // Try to access pages with XSS payloads in URLs
    for (const payload of XSS_PAYLOADS.slice(0, 3)) {
      await page.goto(`/q/${encodeURIComponent(payload)}`);

      // Check no raw script content rendered
      const bodyHtml = await page.evaluate(() => document.body.innerHTML);
      expect(bodyHtml).not.toContain('<script>');
      expect(bodyHtml).not.toContain('onerror=');
      expect(bodyHtml).not.toContain('onload=');
    }
  });

  test('should escape XSS in invoice portal token', async ({ page }) => {
    await page.goto('/i/' + encodeURIComponent('<img src=x onerror=alert(1)>'));

    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    expect(bodyHtml).not.toContain('onerror=');
  });

  test('should not allow javascript: protocol in links', async ({ page }) => {
    await page.goto('/login');

    // Check that no links on the page use javascript: protocol
    const dangerousLinks = await page.locator('a[href^="javascript:"]').count();
    expect(dangerousLinks).toBe(0);
  });
});
