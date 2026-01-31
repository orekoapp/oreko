import { FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_DIR = path.join(__dirname, '.auth');

/**
 * Global teardown for E2E tests
 * This runs once after all tests complete to:
 * 1. Clean up authentication state files
 * 2. Clean up any temporary test data
 * 3. Generate test summary if needed
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Global Teardown - Cleaning up...');

  try {
    // Clean up auth state file if it exists
    const authFile = path.join(AUTH_DIR, 'user.json');
    if (fs.existsSync(authFile)) {
      fs.unlinkSync(authFile);
      console.log('✓ Removed auth state file');
    }

    // Clean up any screenshot files from setup failures
    const screenshotFiles = ['setup-failure.png', 'setup-error.png'];
    for (const file of screenshotFiles) {
      const filePath = path.join(AUTH_DIR, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✓ Removed ${file}`);
      }
    }

    // Clean up any other temporary files
    const tempPattern = /^temp-.*\.json$/;
    if (fs.existsSync(AUTH_DIR)) {
      const files = fs.readdirSync(AUTH_DIR);
      for (const file of files) {
        if (tempPattern.test(file)) {
          fs.unlinkSync(path.join(AUTH_DIR, file));
          console.log(`✓ Removed temp file: ${file}`);
        }
      }
    }

    console.log('✓ Global teardown completed\n');
  } catch (error) {
    console.warn('⚠ Global teardown encountered errors:', error);
    // Don't throw - teardown errors shouldn't fail the test run
  }
}

export default globalTeardown;
