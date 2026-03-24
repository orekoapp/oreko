/**
 * Playwright script to record a hero demo video of the invoice creation flow.
 * Run from apps/web: node scripts/record-hero-video.mjs
 *
 * Flow: Invoices list → New Invoice → Select client → Load template → Show preview → Back to list
 */
import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEOS_DIR = path.resolve(__dirname, '../public/videos');
const BASE_URL = 'http://localhost:3001';

async function removeDevOverlay(page) {
  await page.evaluate(() => {
    document.querySelectorAll('nextjs-portal').forEach((el) => el.remove());
  });
}

async function smoothPause(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log('Launching browser with video recording...');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: VIDEOS_DIR,
      size: { width: 1280, height: 800 },
    },
  });

  const page = await context.newPage();

  // Set elevated theme + 103% font before navigating
  await page.addInitScript(() => {
    localStorage.setItem('quotecraft-sidebar-style', 'elevated');
    localStorage.setItem('quotecraft-font-size', 'md');
  });

  // ── Scene 1: Invoices list ──────────────────────────────
  console.log('Scene 1: Navigating to invoices list...');
  await page.goto(`${BASE_URL}/invoices`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await removeDevOverlay(page);
  await smoothPause(2500); // Let viewer see the list

  // ── Scene 2: Click "New Invoice" ────────────────────────
  console.log('Scene 2: Clicking New Invoice...');
  const newInvoiceBtn = page.locator('a:has-text("New Invoice")').first();
  await newInvoiceBtn.click();
  await page.waitForURL('**/invoices/new', { timeout: 10000 });
  await page.waitForTimeout(1500);
  await removeDevOverlay(page);
  await smoothPause(1500);

  // ── Scene 3: Select a client ────────────────────────────
  console.log('Scene 3: Selecting client...');
  const customerSelect = page.locator('button').filter({ hasText: 'Select a customer' }).first();
  await customerSelect.click();
  await smoothPause(600);

  // Pick "James Rodriguez" from the dropdown
  const clientOption = page.getByRole('option').filter({ hasText: 'James' }).first();
  await clientOption.click();
  await smoothPause(1200);

  // ── Scene 4: Load a template ────────────────────────────
  console.log('Scene 4: Loading Photography Session template...');
  // Click "Templates" popover trigger in the Items section
  const templatesBtn = page.locator('button:has-text("Templates")').first();
  await templatesBtn.click();
  await smoothPause(800);

  // Click "Photography Session" template
  const photoTemplate = page.locator('button').filter({ hasText: 'Photography Session' }).first();
  await photoTemplate.click();
  await smoothPause(2000); // Let items populate

  // ── Scene 5: Scroll down to show totals ─────────────────
  console.log('Scene 5: Scrolling to show line items and totals...');
  // Scroll the main content area
  await page.evaluate(() => {
    const main = document.querySelector('main') || document.documentElement;
    main.scrollTo({ top: 400, behavior: 'smooth' });
  });
  await smoothPause(2500);

  // ── Scene 6: Scroll down more to show preview ───────────
  console.log('Scene 6: Scrolling to preview area...');
  await page.evaluate(() => {
    const main = document.querySelector('main') || document.documentElement;
    main.scrollTo({ top: 800, behavior: 'smooth' });
  });
  await smoothPause(2500);

  // ── Scene 7: Scroll back to top ─────────────────────────
  console.log('Scene 7: Scrolling back to top...');
  await page.evaluate(() => {
    const main = document.querySelector('main') || document.documentElement;
    main.scrollTo({ top: 0, behavior: 'smooth' });
  });
  await smoothPause(1500);

  // ── Scene 8: Navigate back to invoices list ─────────────
  console.log('Scene 8: Navigating back to invoices list...');
  await page.goto(`${BASE_URL}/invoices`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await removeDevOverlay(page);
  await smoothPause(2500);

  // ── Done ────────────────────────────────────────────────
  console.log('Closing browser and saving video...');
  await page.close();
  await context.close();
  await browser.close();

  console.log(`\nVideo saved to: ${VIDEOS_DIR}/`);
  console.log('Look for the .webm file with the most recent timestamp.');
  console.log('\nNext steps:');
  console.log('1. Rename the recorded file to hero-demo-raw.webm');
  console.log('2. Run ffmpeg to optimize (see below)');
  console.log('');
  console.log('ffmpeg commands:');
  console.log(`  ffmpeg -i ${VIDEOS_DIR}/hero-demo-raw.webm -vf "fps=24" -c:v libx264 -crf 28 -preset slow -an ${VIDEOS_DIR}/hero-demo.mp4`);
  console.log(`  ffmpeg -i ${VIDEOS_DIR}/hero-demo-raw.webm -vf "fps=24" -c:v libvpx-vp9 -crf 35 -b:v 0 -an ${VIDEOS_DIR}/hero-demo.webm`);
}

main().catch((err) => {
  console.error('Recording failed:', err);
  process.exit(1);
});
