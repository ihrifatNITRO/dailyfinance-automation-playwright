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
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Always launch browsers in headed mode */
    headless: false,
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
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects */
  projects: [
    // 1. Auth Setup: Runs login and saves session to playwright/.auth/user.json
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // 2. Guest/Unauthenticated tests: Registration & Login UI (NO setup dependency)
    {
      name: 'guest',
      testMatch: [/1_Registration\.spec\.ts/, /2_Login\.spec\.ts/, /4_ResetPassword\.spec\.ts/],
      use: {
        storageState: { cookies: [], origins: [] },
      },
    },

    // 3. Authenticated tests: Feature & POM tests (Depends on setup & auto-logged in)
    {
      name: 'authenticated',
      testIgnore: [/1_Registration\.spec\.ts/, /2_Login\.spec\.ts/, /4_ResetPassword\.spec\.ts/, /.*\.setup\.ts/],
      use: {
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
