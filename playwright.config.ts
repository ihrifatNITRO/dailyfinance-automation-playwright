import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests serially */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Enforce 1 worker for sequential (file/numeric) execution order */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all tests */
  use: {
    /* Run browser in headless mode on CI (no display/X server), headed locally */
    headless: !!process.env.CI,
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'https://dailyfinance.roadtocareer.net/',
    // 1. Force the internal webpage canvas area to be small
    viewport: { width: 800, height: 700 },

    launchOptions: {
      // 2. Force the actual outer Chrome OS window application container to be small
      args: [
        '--window-size=900,800',
        '--no-sandbox'
      ]
    },
    /* Default authenticated session for dashboard and profile tests */
    storageState: 'playwright/.auth/user.json',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
});
